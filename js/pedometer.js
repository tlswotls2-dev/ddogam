// js/pedometer.js
// --- 수정 가능한 설정 상수 모음 ---
const GRAVITY = 9.8;
const STEP_THRESHOLD = 2.5;   // 중력 대비 가속도 변화 비율
const STEP_INTERVAL_MS = 500; // 걸음 사이 최소 간격(ms)
const FILTER_FACTOR = 0.15;    // 저주파 필터 계수 (0~1, 낮을수록 부드러움)
const SAFETY_WARNING_TIME_MS = 5000; // 화면이 켜진 상태에서 움직임이 지속될 때 경고를 띄우기까지의 시간 (5초)
const MIN_STEPS = 50; // 아이템 출현 최소 걸음수
const MAX_STEPS = 100; // 아이템 출현 최대 걸음수

// --- 페도미터 상태 변수 ---
let currentSteps = 0; // 오늘 총 걸음 수
let lastStepTime = 0; // 마지막으로 걸음을 감지한 시간
let isWalkingWhileScreenOn = false; // 화면이 켜진 상태에서 걷고 있는지 상태값
let walkWarningTimer = null; // 안전 경고 타이머
let movementTimeout = null; // 움직임 멈춤 감지 타이머
let filteredX = 0; // 저주파 필터 적용된 X축 가속도
let filteredY = 0; // 저주파 필터 적용된 Y축 가속도
let filteredZ = 0; // 저주파 필터 적용된 Z축 가속도
let isSafetyWarningActive = false; // 현재 안전 경고가 화면에 떠있는지 여부
let isCollecting = false; // 기본적으로 걸음 수집 중단 상태 (탐험 모드에서만 활성화)
let isExploring = false; // 현재 탐험 모드인지 여부
let nextItemTargetSteps = 0; // 다음 아이템이 출현할 목표 걸음 수
let recentStepTimes = []; // 최근 3초간의 걸음 감지 시간 (안전 경고 조건용)

// --- [한글 주석] Wake Lock 상태 변수 ---
let wakeLockSentinel = null; // Wake Lock 객체 저장

// --- 외부에서 전달받을 콜백 함수들 ---
let onStepUpdateCallback = null;
let onSafetyWarningCallback = null;
let onSafetyWarningResolvedCallback = null;
let onItemGeneratedCallback = null;

// [한글 주석] 활동시간 측정용 변수 (실제로 걸음이 감지되는 구간만 활동시간으로 인정)
let lastActiveMoment = 0; // 마지막으로 걸음이 감지된 시각
let activityCheckTimer = null; // 60초마다 활동시간을 누적하는 타이머
const ACTIVITY_CHECK_INTERVAL_MS = 60000; // 60초 단위로 활동시간 체크
const ACTIVITY_TIMEOUT_MS = 60000; // 걸음이 이 시간 이상 끊기면 활동 중단으로 판단

// [한글 주석] 학년 평균 체중(32kg) 기준 칼로리 계산 상수
// 걷기 3.5MET, 아동 대사율 보정 1.3 적용 -> 걸음당 약 0.024kcal
const KCAL_PER_STEP = 0.024;
const METERS_PER_STEP = 0.55; // 3~6학년 평균 보폭(m)

// [한글 주석] 오늘 날짜 문자열(YYYY-MM-DD)을 반환합니다.
function getTodayDateKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return yyyy + '-' + mm + '-' + dd;
}

// [한글 주석] localStorage에서 오늘자 dailyStats 객체를 가져오거나 새로 만듭니다.
function getTodayStatsEntry() {
    const all = JSON.parse(localStorage.getItem('dailyStats') || '{}');
    const key = getTodayDateKey();
    if (!all[key]) {
        all[key] = { steps: 0, kcal: 0, meters: 0, minutes: 0, cards: 0, quizCorrect: 0 };
    }
    return { all: all, key: key, entry: all[key] };
}

// [한글 주석] 걸음이 감지될 때마다 활동시간 누적 타이머를 관리합니다.
function registerActivityMoment() {
    lastActiveMoment = Date.now();
    if (activityCheckTimer) return; // 이미 타이머가 돌고 있으면 새로 만들지 않음

    activityCheckTimer = setInterval(() => {
        const idleTime = Date.now() - lastActiveMoment;
        if (idleTime >= ACTIVITY_TIMEOUT_MS) {
            // [한글 주석] 60초 이상 걸음이 없으면 활동 중단으로 보고 타이머 종료
            clearInterval(activityCheckTimer);
            activityCheckTimer = null;
            return;
        }
        // [한글 주석] 60초간 실제 활동이 있었으므로 1분을 활동시간에 누적
        const stats = getTodayStatsEntry();
        stats.entry.minutes += 1;
        localStorage.setItem('dailyStats', JSON.stringify(stats.all));
    }, ACTIVITY_CHECK_INTERVAL_MS);
}

// [한글 주석] 걸음 수 변화에 맞춰 오늘자 칼로리/거리/걸음수를 dailyStats에 반영합니다.
function updateDailyActivityStats(totalStepsToday) {
    const stats = getTodayStatsEntry();
    stats.entry.steps = totalStepsToday;
    stats.entry.kcal = Math.round(totalStepsToday * KCAL_PER_STEP);
    stats.entry.meters = Math.round(totalStepsToday * METERS_PER_STEP);
    localStorage.setItem('dailyStats', JSON.stringify(stats.all));
    updateDebugBadge(stats.entry);
}

// [한글 주석] 개발자 테스트 모드일 때만 화면 우측 상단에 오늘자 활동 데이터를 표시합니다.
// 로고 5번 탭으로 켜지는 testmode.js의 localStorage 'devTestMode' 값을 확인합니다.
function updateDebugBadge(entry) {
    // [한글 주석] 주소창 끝에 ?debug=1 을 붙였을 때만 배지가 보이도록 함 (탐험 로직에는 영향 없음)
    var isDebugMode = new URLSearchParams(window.location.search).get('debug') === '1';
    if (!isDebugMode) return;
    var badge = document.getElementById('activity-debug-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'activity-debug-badge';
        badge.style.cssText = 'position:fixed;top:8px;right:8px;background:rgba(0,0,0,0.75);' +
            'color:#84ff00;font-size:11px;padding:6px 10px;border-radius:8px;z-index:99999;' +
            'font-family:monospace;line-height:1.5;pointer-events:none;white-space:pre;';
        document.body.appendChild(badge);
    }
    badge.textContent = '걸음 ' + entry.steps + ' | ' + entry.kcal + 'kcal | ' + entry.meters + 'm | ' + entry.minutes + '분';
}

/**
 * 만보기(페도미터) 기능을 초기화하고 센서 감지를 시작합니다.
 */
function initPedometer(onStepUpdate, onSafetyWarning, onSafetyWarningResolved, onItemGenerated) {
    onStepUpdateCallback = onStepUpdate;
    onSafetyWarningCallback = onSafetyWarning;
    onSafetyWarningResolvedCallback = onSafetyWarningResolved;
    onItemGeneratedCallback = onItemGenerated;

    loadTodaySteps(); // 로컬 스토리지에서 오늘 걸음수 불러오기

    // iOS 13+ 기기를 위한 센서 권한 요청 및 이벤트 리스너 등록
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleMotionEvent, false);
                } else {
                    console.warn("가속도 센서 권한이 거부되었습니다.");
                }
            })
            .catch(console.error);
    } else {
        // 기존 기기(안드로이드 등) 호환성
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', handleMotionEvent, false);
        } else {
            console.warn("이 브라우저/기기는 가속도 센서(DeviceMotion)를 지원하지 않습니다.");
        }
    }

    // 브라우저 탭(화면) 활성화/비활성화 감지
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // 사용자가 화면을 끄거나 앱을 백그라운드로 내리면 안전 경고 초기화
            clearWarning();
        }
    });

    // 초기 걸음 수 화면에 반영
    if (onStepUpdateCallback) onStepUpdateCallback(currentSteps);
}

/**
 * 가속도 센서 값을 받아 걸음을 판별하는 메인 핸들러
 * (저주파 필터 + 피크 감지 알고리즘 적용)
 */
function handleMotionEvent(event) {
    // 1. DeviceMotionEvent에서 accelerationIncludingGravity 사용 (일부 기기 호환성 향상)
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const rawX = acc.x || 0;
    const rawY = acc.y || 0;
    const rawZ = acc.z || 0;

    // 2. 저주파 필터(Low-pass filter) 적용 (중력 성분 추출용)
    filteredX = filteredX + FILTER_FACTOR * (rawX - filteredX);
    filteredY = filteredY + FILTER_FACTOR * (rawY - filteredY);
    filteredZ = filteredZ + FILTER_FACTOR * (rawZ - filteredZ);

    // 3. 선형가속도 계산 (실제 움직임 성분만 추출, 중력 제거)
    const linearX = rawX - filteredX;
    const linearY = rawY - filteredY;
    const linearZ = rawZ - filteredZ;

    // 4. 크기 계산 (magnitude)
    const magnitude = Math.sqrt(linearX * linearX + linearY * linearY + linearZ * linearZ);

    const currentTime = new Date().getTime();

    // 5. 걸음 인정 조건 (크기가 임계치보다 클 때)
    if (magnitude > STEP_THRESHOLD) {

        // 지속적인 움직임을 감지하여 정지 시 경고를 풀기 위한 타이머 리셋
        clearTimeout(movementTimeout);
        movementTimeout = setTimeout(() => {
            // 2초 동안 임계치 이상의 큰 움직임이 없으면 사용자가 멈춘 것으로 간주
            clearWarning();
        }, 2000);

        // 마지막 걸음으로부터 STEP_INTERVAL_MS 이상 경과했을 때
        if (currentTime - lastStepTime > STEP_INTERVAL_MS) {
            lastStepTime = currentTime; // 쿨타임 갱신

            // 탐험 모드(isExploring)가 켜져 있을 때만 걸음 수 증가
            if (isExploring && isCollecting) {
                incrementStep();
            }

            // [안전 경고 로직] 화면이 켜진 상태(visible)에서 걸음을 감지했을 때
            if (document.visibilityState === 'visible') {
                handleWalkingWithScreenOn();
            }
        }
    }
}

/**
 * 걸음 수를 1 증가시키고 저장 및 알림 처리
 */
function incrementStep() {
    currentSteps++;
    saveTodaySteps();
    // [한글 주석] 실제 걸음이 감지된 순간을 활동시간으로 기록하고 오늘자 칼로리/거리 갱신
    registerActivityMoment();
    updateDailyActivityStats(currentSteps);
    // 화면 업데이트 콜백 호출
    if (onStepUpdateCallback) {
        onStepUpdateCallback(currentSteps);
    }

    // [아이템 발생 로직] 탐험 모드일 때 목표 걸음수에 도달하면 아이템 발생
    if (isExploring && nextItemTargetSteps > 0 && currentSteps >= nextItemTargetSteps) {
        generateItem();
        // 아이템 출현 후 즉시 다음 목표 걸음수 새로 설정
        setNextItemTarget();
    }
}

/**
 * 아이템을 발생시키고 진동을 울림
 */
function generateItem() {
    // 기기 진동 발생 (200ms)
    if (navigator.vibrate) {
        navigator.vibrate(200);
    }

    // 메인 화면 팝업 콜백 호출
    if (onItemGeneratedCallback) {
        onItemGeneratedCallback();
    }
}

/**
 * 화면이 켜진 상태로 걸을 때 안전 경고를 띄울지 판단
 */
function handleWalkingWithScreenOn() {
    if (isExploring) return; // 탐험 모드가 켜져 있을 때는 경고를 띄우지 않음
    if (isSafetyWarningActive) return; // 이미 경고가 떠있으면 무시

    const currentTime = new Date().getTime();
    recentStepTimes.push(currentTime);

    if (!isWalkingWhileScreenOn) {
        isWalkingWhileScreenOn = true;
        // 걷기 시작! 5초 동안 연속으로 움직이면 경고 발동
        walkWarningTimer = setTimeout(() => {
            // 경고 발동 시점에 3초 동안 3걸음 이상 감지되었는지 확인
            const now = new Date().getTime();
            const stepsInLast3Seconds = recentStepTimes.filter(t => now - t <= 3000);
            if (stepsInLast3Seconds.length >= 3) {
                triggerSafetyWarning();
            } else {
                // 조건 충족되지 않으면 경고 상태 해제 (가만히 있을 때 흔들림 방지)
                clearWarning();
            }
        }, SAFETY_WARNING_TIME_MS);
    }
    // 이미 타이머가 돌아가는 중이면(계속 걷고 있으면) 타이머를 놔둠
}

/**
 * 빨간 오버레이와 진동을 동반하는 안전 경고 발동!
 */
function triggerSafetyWarning() {
    isSafetyWarningActive = true;
    isCollecting = false; // 걸음 및 아이템 수집 일시 중단

    // 경고 진동 울리기: 길게-짧게-길게
    if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500]);
    }

    // UI 오버레이 표시 콜백 호출
    if (onSafetyWarningCallback) {
        onSafetyWarningCallback();
    }
}

/**
 * 걸음을 멈추거나 화면을 껐을 때 경고 상태를 해제
 */
function clearWarning() {
    clearTimeout(walkWarningTimer);
    isWalkingWhileScreenOn = false;
    recentStepTimes = []; // 최근 걸음 시간 초기화

    if (isSafetyWarningActive) {
        isSafetyWarningActive = false;
        // 탐험 모드일 때만 수집 재개
        if (isExploring) {
            isCollecting = true;
        }

        // UI 오버레이 숨김 콜백 호출
        if (onSafetyWarningResolvedCallback) {
            onSafetyWarningResolvedCallback();
        }
    }
}

/**
 * [한글 주석] 탐험 모드 시작
 */
function startPedometerExploration() {
    isExploring = true;
    window.isExploring = true; // [한글 주석] Wake Lock 연동용 전역 변수 설정
    isCollecting = true; // 걸음 측정 활성화
    setNextItemTarget(); // 다음 아이템 출현 목표 설정

    // [한글 주석] Wake Lock 활성화 호출 (화면 꺼짐 방지)
    activateWakeLock();

    // [한글 주석] 탐험 시작 안내 토스트 메시지 표시
    const _Tp = window.LANG_UI; const _Lp = window.currentLang || 'ko';
    showToastMessage(_Tp?.[_Lp]?.wakeLockOn || '화면 꺼짐 방지 ON 🔆 탐험을 시작해요!');
}

/**
 * [한글 주석] 탐험 모드 종료
 */
function stopPedometerExploration() {
    isExploring = false;
    window.isExploring = false; // [한글 주석] Wake Lock 연동용 전역 변수 초기화
    isCollecting = false; // 걸음 측정 중단
    nextItemTargetSteps = 0; // 목표 걸음수 초기화

    // [한글 주석] Wake Lock 해제 호출
    deactivateWakeLock();
}

/**
 * 다음 아이템 출현 목표 걸음수 설정 (50~100 사이 랜덤)
 */
function setNextItemTarget() {
    const randomSteps = Math.floor(Math.random() * (MAX_STEPS - MIN_STEPS + 1)) + MIN_STEPS;
    nextItemTargetSteps = currentSteps + randomSteps;
}

/**
 * LocalStorage에서 오늘 걸음수를 불러옴 (날짜가 다르면 0으로 초기화)
 */
function loadTodaySteps() {
    const today = new Date().toDateString(); // 예: "Wed May 15 2026"
    const savedData = localStorage.getItem('pedometerData');

    if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.date === today) {
            currentSteps = parsed.steps;
        } else {
            // 저장된 날짜가 오늘이 아니면 초기화
            currentSteps = 0;
            saveTodaySteps();
        }
    } else {
        currentSteps = 0;
    }
}

/**
 * 오늘 걸음수를 날짜와 함께 LocalStorage에 저장
 */
function saveTodaySteps() {
    const data = {
        date: new Date().toDateString(),
        steps: currentSteps
    };
    localStorage.setItem('pedometerData', JSON.stringify(data));
}

// --- 개발자 테스트를 위한 전역 헬퍼 함수 ---
window.addStepsForTesting = function (amount) {
    currentSteps += amount;
    saveTodaySteps();
    if (onStepUpdateCallback) {
        onStepUpdateCallback(currentSteps);
    }
    // 탐험 중일 때 목표 걸음수에 도달하면 아이템 발생
    if (isExploring && nextItemTargetSteps > 0 && currentSteps >= nextItemTargetSteps) {
        generateItem();
        // 아이템 출현 후 즉시 다음 목표 걸음수 새로 설정
        setNextItemTarget();
    }
};

// ==========================================
// [한글 주석] Wake Lock API 및 탐험 상태 화면 꺼짐 방지 구현
// ==========================================

/**
 * [한글 주석] Wake Lock 활성화 함수: 탐험 모드 중 화면이 꺼지는 것을 방지합니다.
 */
async function activateWakeLock() {
    try {
        // Wake Lock API 지원 여부 확인
        if ('wakeLock' in navigator) {
            wakeLockSentinel = await navigator.wakeLock.request('screen');
            console.log('화면 꺼짐 방지 활성화');

            // Wake Lock이 해제될 때 (전화 수신 등) 자동 재활성화
            wakeLockSentinel.addEventListener('release', () => {
                console.log('Wake Lock 해제됨 - 재활성화 시도');
                if (window.isExploring) {
                    activateWakeLock(); // 탐험 중이면 재활성화
                }
            });
        }
    } catch (err) {
        console.log('Wake Lock 미지원 또는 오류:', err);
        // 지원 안 해도 앱은 정상 동작
    }
}

/**
 * [한글 주석] Wake Lock 해제 함수: 탐험 모드가 종료되면 화면 꺼짐 방지를 해제합니다.
 */
async function deactivateWakeLock() {
    if (wakeLockSentinel) {
        await wakeLockSentinel.release();
        wakeLockSentinel = null;
        console.log('화면 꺼짐 방지 해제');
    }
}

// [한글 주석] 페이지 숨김/보임 시 처리 (화면 다시 켜지면 재활성화)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.isExploring) {
        activateWakeLock(); // 화면 다시 켜지면 재활성화
    }
});

/**
 * [한글 주석] 탐험 모드 안내용 세련된 토스트 메시지를 표시합니다.
 * @param {string} message - 표시할 텍스트
 */
function showToastMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'item-unlock-toast';
    toast.textContent = message;

    // [한글 주석] 탐험에 걸맞은 활기찬 네온그린 테두리로 다이내믹 변경
    toast.style.borderColor = '#84ff00';
    toast.style.color = '#84ff00';
    toast.style.boxShadow = '0 10px 25px rgba(132, 255, 0, 0.25)';

    document.body.appendChild(toast);

    // [한글 주석] 나타남 애니메이션 실행을 위해 딜레이 부여
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // [한글 주석] 2초 후 자동으로 서서히 사라짐
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 2000);
}

