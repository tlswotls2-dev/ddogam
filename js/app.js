// 앱의 시작점(Entry Point)이 되는 파일입니다.

// 문서의 모든 콘텐츠(DOM)가 로드된 후 실행됩니다.
document.addEventListener('DOMContentLoaded', () => {
    console.log("또감 앱이 초기화되었습니다.");
    
    // 주요 컨테이너 및 폼 요소 가져오기
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('login-container');
    const mainContainer = document.getElementById('main-container');
    const messageDisplay = document.getElementById('message-display');

    // ==========================================
    // 0. API 키 설정 (선생님 전용)
    // ==========================================
    // [한글 주석] Apps Script URL (sync.js와 동일)
    const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHFQhpwzADLC6JHfMdo4aJ6lUwXW4OFwfKOsQsTQjr07QFX3JJE27xrAJHZ1Zj-KI8/exec';

    // [한글 주석] Apps Script에서 API 키 자동으로 가져오기
    async function fetchApiKeyFromServer() {
        // [한글 주석] 이미 로컬에 저장된 키가 있으면 재사용
        const savedKey = localStorage.getItem('gemini_api_key');
        // [한글 주석] 저장된 키가 존재하고 길이가 10자보다 크면 로컬 캐시 적용
        if (savedKey && savedKey.length > 10) {
            console.log('[API키] 로컬 캐시 사용');
            return;
        }
        
        try {
            // [한글 주석] Apps Script 서버에 API 키 요청 전송
            const res = await fetch(`${APP_SCRIPT_URL}?type=getApiKey`);
            // [한글 주석] 응답받은 결과를 JSON 객체로 파싱
            const data = await res.json();
            // [한글 주석] 응답 데이터에 API 키가 포함되어 있을 경우 로컬 스토리지에 저장
            if (data.apiKey) {
                localStorage.setItem('gemini_api_key', data.apiKey);
                console.log('[API키] 서버에서 가져오기 성공');
            }
        } catch (err) {
            // [한글 주석] 에러 발생 시 에러 내용을 콘솔에 로깅
            console.log('[API키] 가져오기 실패:', err);
        }
    }

    // [한글 주석] 앱 시작 시 API 키 자동 로드 실행
    fetchApiKeyFromServer();

    // [한글 주석] 앱 시작 시 자동 동기화 시스템 초기화
    if (typeof initSync === 'function') {
        initSync();
    }

    // ==========================================
    // 1. 로그인 기능 처리
    // ==========================================

    // [한글 주석] 선생님 반별 비밀번호 (번호 0으로 로그인 시 사용)
    const TEACHER_PASSWORDS = {
        '1': 'teacher1',
        '2': 'teacher2',
        '3': 'teacher3',
        '4': 'teacher4',
        '5': 'teacher5',
        '6': 'teacher6'
    };

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            // 1. 기본 제출 동작 방지 (페이지 새로고침 방지)
            e.preventDefault();
            
            // [한글 주석] 이전 계정 잔여 데이터 초기화 (교사↔학생 전환 시 충돌 방지)
            localStorage.removeItem('isTeacher');
            localStorage.removeItem('userData');
            
            // 2. 입력값 가져오기 (학급, 번호, 비밀번호)
            const classValue = document.getElementById('classSelect').value;
            const numberValue = document.getElementById('numberInput').value;
            const passwordValue = document.getElementById('passwordInput').value;
            
            // 3. 메시지 표시 영역 초기화
            messageDisplay.textContent = "";
            messageDisplay.className = "message";

            // 4. 유효성 검사 (빈칸이 있는지 확인)
            if (!classValue || !numberValue || !passwordValue) {
                messageDisplay.textContent = "모든 정보를 입력해주세요!";
                messageDisplay.classList.add("error");
                return;
            }

            // ==========================================
            // [한글 주석] 선생님 로그인 분기: 번호가 0이면 선생님
            // ==========================================
            if (numberValue === '0') {
                // [한글 주석] 선생님 비밀번호 확인
                const correctPassword = TEACHER_PASSWORDS[classValue];
                if (passwordValue !== correctPassword) {
                    messageDisplay.textContent = "선생님 비밀번호가 올바르지 않습니다.";
                    messageDisplay.classList.add("error");
                    return;
                }

                // [한글 주석] 선생님 로그인 성공 처리
                localStorage.setItem('isTeacher', 'true');
                localStorage.setItem('teacherClass', classValue);
                console.log(`선생님 로그인 성공: ${classValue}반`);

                messageDisplay.textContent = "선생님 로그인 성공! 대시보드로 이동합니다...";
                messageDisplay.classList.add("success");

                // [한글 주석] 대시보드 화면으로 전환
                setTimeout(() => {
                    loginContainer.style.display = 'none';
                    const dashboardScreen = document.getElementById('teacher-dashboard-screen');
                    if (dashboardScreen) {
                        dashboardScreen.style.display = 'block';
                    }
                    // [한글 주석] 대시보드 초기화 (teacher.js)
                    if (typeof initDashboard === 'function') {
                        initDashboard();
                    }
                }, 800);
                return; // [한글 주석] 학생 로그인 로직 실행 방지
            }

            // ==========================================
            // [한글 주석] 학생 로그인 처리 (기존 로직)
            // ==========================================
            
            // 5. 사용자 데이터 로컬 저장소에 저장 (storage.js)
            const userData = {
                class: classValue,
                number: numberValue,
                password: passwordValue 
            };
            // [한글 주석] 학생 계정 표시 (isTeacher 명시적으로 false 저장)
            localStorage.setItem('isTeacher', 'false');
            saveUserData(userData);
            
            console.log(`로그인 성공: ${classValue}반-${numberValue}번`);
            
            // 6. 성공 메시지 표시
            messageDisplay.textContent = "로그인 성공! 탐험을 시작합니다...";
            messageDisplay.classList.add("success");

            // 7. 화면 전환 (성별 선택 여부에 따라 분기)
            setTimeout(() => {
                loginContainer.style.display = 'none'; // 로그인 컨테이너 숨김

                // 성별 선택이 아직 안 된 경우 → 성별 선택 화면으로 이동
                if (typeof needsGenderSelection === 'function' && needsGenderSelection()) {
                    if (typeof showGenderSelectScreen === 'function') {
                        showGenderSelectScreen();
                    }
                } else {
                    // 이미 성별이 선택된 경우 → 바로 메인 화면으로 이동
                    proceedToMainScreen();
                }
            }, 800);
        });
    }

    // ==========================================
    // 메인 화면 진입 함수 (성별 선택 완료 후 호출됨)
    // avatar.js의 handleGenderSelect()에서도 호출할 수 있도록 전역 등록
    // ==========================================
    window.proceedToMainScreen = function() {
        mainContainer.style.display = 'block'; // 메인 컨테이너 표시
        
        // [한글 주석] 우측 상단에 반/번호 표시
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userInfoEl = document.getElementById('user-info-display');
        if (userInfoEl && userData.class && userData.number) {
          userInfoEl.textContent = `${userData.class}반 ${userData.number}번`;
        }

        // 메인 화면 데이터 및 기능 초기화
        if (typeof window.updateMainScreenData === 'function') {
            window.updateMainScreenData(); 
        }

        // 도트 아바타 초기화 (선택된 성별에 맞는 SVG로 교체)
        if (typeof initAvatar === 'function') {
            initAvatar();
        }

        // 기존 수집 데이터 기반 아이템 해금 체크
        if (typeof checkAndUnlockItems === 'function') {
            checkAndUnlockItems();
        }
        
        // [펫 시스템] 기존 수집 데이터 기반 펫 해금 체크
        if (typeof checkAndUnlockPets === 'function') {
            checkAndUnlockPets();
        }

        // 메인 화면 밤하늘 별 생성
        createStars();
        
        // 만보기 및 센서 초기화
        initAppPedometer();
    };

    // ==========================================
    // 2. 메인 화면 기능 처리
    // ==========================================
    
    // 현재 선택된 탭 카테고리를 전역변수로 관리 (기본값: 식물)
    window.currentCategory = 'plant';

    // 탭 클릭 이벤트 설정 (카테고리 변경)
    const tabs = document.querySelectorAll('.tab');
    const categoryBadge = document.getElementById('current-category-badge');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');

            // 잠금 상태인 탭을 누르면 수집 개수를 확인하고 퀴즈를 띄우거나 경고 메시지를 표시합니다.
            if (tab.classList.contains('locked')) {
                const collection = getCollection();
                let pCount = 0;
                let aCount = 0;
                
                collection.forEach(id => {
                    if (id.startsWith('plant_')) pCount++;
                    else if (id.startsWith('animal_')) aCount++;
                });

                if (target === 'animal') {
                    if (pCount < 90) {
                        alert(`식물을 90개 이상 모아야 해요! (현재 ${pCount}개)`);
                    } else {
                        // 조건은 달성했지만 퀴즈를 통과하지 못한 경우
                        if (typeof startQuiz === 'function') startQuiz('animal');
                    }
                } else if (target === 'artifact') {
                    if (aCount < 90) {
                        alert(`동물을 90개 이상 모아야 해요! (현재 ${aCount}개)`);
                    } else {
                        if (typeof startQuiz === 'function') startQuiz('artifact');
                    }
                }
                return;
            }

            // 기존 활성화 탭의 active 클래스 제거
            tabs.forEach(t => t.classList.remove('active'));
            // 클릭한 탭에 active 클래스 추가 (강조 표시)
            tab.classList.add('active');

            // 배지 텍스트를 클릭한 탭의 정보로 변경
            const emoji = tab.getAttribute('data-emoji');
            const name = tab.getAttribute('data-name');
            categoryBadge.textContent = `${emoji} ${name} 탐험 중`;

            // 현재 카테고리 전역변수 업데이트
            window.currentCategory = target;
        });
    });

    // LocalStorage의 데이터를 불러와 진행바를 업데이트하는 함수 (외부 파일에서도 쉽게 호출하도록 전역에 할당)
    window.updateMainScreenData = function() {
        // storage.js의 함수를 이용해 수집한 카드 ID 목록을 가져옵니다.
        const collection = getCollection();
        
        // 카테고리별 수집 개수 초기화
        let plantCount = 0;
        let animalCount = 0;
        let artifactCount = 0;

        // ID 접두사를 이용해 카테고리별 개수를 정교하게 파악
        collection.forEach(id => {
            if (id.startsWith('plant_')) plantCount++;
            else if (id.startsWith('animal_')) animalCount++;
            else if (id.startsWith('artifact_')) artifactCount++;
        });

        // 최대 개수 설정 (요구사항: 각 100개, 총 300개)
        const maxPerCategory = 100;
        const totalMax = 300;
        const totalCount = plantCount + animalCount + artifactCount;

        // 1. 전체 완성도 텍스트 및 게이지바 갱신
        document.getElementById('total-text').textContent = `${totalCount} / ${totalMax} (${Math.floor(totalCount/totalMax*100)}%)`;
        document.getElementById('total-progress').style.width = `${(totalCount/totalMax)*100}%`;

        // 2. 식물 카테고리 수집 현황 갱신
        document.getElementById('plant-text').textContent = `${plantCount} / ${maxPerCategory}`;
        document.getElementById('plant-progress').style.width = `${(plantCount/maxPerCategory)*100}%`;

        // 3. 동물 카테고리 수집 현황 갱신
        document.getElementById('animal-text').textContent = `${animalCount} / ${maxPerCategory}`;
        document.getElementById('animal-progress').style.width = `${(animalCount/maxPerCategory)*100}%`;

        // 4. 유물 카테고리 수집 현황 갱신
        document.getElementById('artifact-text').textContent = `${artifactCount} / ${maxPerCategory}`;
        document.getElementById('artifact-progress').style.width = `${(artifactCount/maxPerCategory)*100}%`;

        // 5. 탭 해금 로직 처리
        const animalTab = document.querySelector('.tab[data-target="animal"]');
        const artifactTab = document.querySelector('.tab[data-target="artifact"]');
        
        // 식물 90개 이상이고 동물 퀴즈를 통과했으면 탭 해금 및 텍스트 변경
        if (plantCount >= 90 && isQuizPassed('animal') && animalTab) {
            animalTab.classList.remove('locked');
            animalTab.textContent = '🦊 동물'; 
        }
        // 동물 90개 이상이고 유물 퀴즈를 통과했으면 탭 해금 및 텍스트 변경
        if (animalCount >= 90 && isQuizPassed('artifact') && artifactTab) {
            artifactTab.classList.remove('locked');
            artifactTab.textContent = '🌰 유물';
        }
    };

    // ==========================================
    // 3. 우측 액션 버튼 기능 설정 (도감 등)
    // ==========================================
    const btnBook = document.querySelector('.btn-book');
    if (btnBook) {
        btnBook.addEventListener('click', () => {
            // dodam.js에 정의된 도감 열기 함수 호출
            if (typeof showDodam === 'function') {
                showDodam();
            }
        });
    }

    // 지도 버튼 클릭 시 지도 화면 열기
    const btnMap = document.querySelector('.btn-map');
    if (btnMap) {
        btnMap.addEventListener('click', () => {
            // map.js에 정의된 지도 열기 함수 호출
            if (typeof showMap === 'function') {
                showMap();
            }
        });
    }

    // 지도 뒤로가기 버튼 클릭 시 지도 화면 숨기고 메인으로 복귀
    const btnMapBack = document.getElementById('map-back-btn');
    if (btnMapBack) {
        btnMapBack.addEventListener('click', () => {
            // map.js에 정의된 지도 닫기 함수 호출
            if (typeof hideMap === 'function') {
                hideMap();
            }
        });
    }

    // 🤖 AI 챗봇 버튼 클릭 시 챗봇 화면 열기
    const btnAi = document.querySelector('.btn-ai');
    if (btnAi) {
        btnAi.addEventListener('click', () => {
            // chatbot.js에 정의된 챗봇 열기 함수 호출
            if (typeof showChatbot === 'function') {
                showChatbot();
            }
        });
    }

    // 👟 탐험 버튼 클릭 시 탐험 모드 시작
    const btnExplore = document.querySelector('.btn-explore');
    if (btnExplore) {
        btnExplore.addEventListener('click', () => {
            startExploration();
        });
    }

    // ==========================================
    // 탐험 모드 관련 전역 함수들
    // ==========================================
    window.startExploration = function() {
        const overlay = document.getElementById('exploration-overlay');
        const defaultContent = document.getElementById('explore-default-content');
        const discoveryContent = document.getElementById('explore-discovery-content');
        
        if (overlay) {
            overlay.style.display = 'flex';
            defaultContent.style.display = 'flex';
            discoveryContent.style.display = 'none';
        }
        
        // 페도미터의 탐험 모드 시작 (걸음 측정 활성화 및 목표 설정)
        if (typeof startPedometerExploration === 'function') {
            startPedometerExploration();
        }
    };

    window.stopExploration = function() {
        const overlay = document.getElementById('exploration-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // 페도미터의 탐험 모드 종료 (걸음 측정 중단)
        if (typeof stopPedometerExploration === 'function') {
            stopPedometerExploration();
        }
    };

    window.showItemDiscoveryNotification = function() {
        const defaultContent = document.getElementById('explore-default-content');
        const discoveryContent = document.getElementById('explore-discovery-content');
        
        // 기본 텍스트를 숨기고 깜빡이는 알림 텍스트 표시
        if (defaultContent && discoveryContent) {
            defaultContent.style.display = 'none';
            discoveryContent.style.display = 'block';
        }
    };

    window.handleExplorationOverlayClick = function() {
        const discoveryContent = document.getElementById('explore-discovery-content');
        
        // 발견 알림이 떠있는 상태에서만 클릭 이벤트 처리
        if (discoveryContent && discoveryContent.style.display === 'block') {
            // 알림 텍스트 숨기고 기본 텍스트로 복귀
            const defaultContent = document.getElementById('explore-default-content');
            if (defaultContent) {
                defaultContent.style.display = 'flex';
                discoveryContent.style.display = 'none';
            }
            
            // 실제 아이템 뽑기 로직 실행 (카드 팝업 표시)
            if (typeof drawRandomItem === 'function') {
                drawRandomItem();
            }
        }
    };

    // ==========================================
    // 별 생성 함수 (메인 화면 밤하늘 배경용)
    // ==========================================
    function createStars() {
        const container = document.getElementById('main-container');
        // 기존 별이 있으면 중복 생성 방지
        if (container.querySelector('.pixel-star')) return;
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'pixel-star';
            star.style.cssText = `
                position:absolute;
                width:2px; height:2px;
                background:#fff;
                left:${Math.random()*100}%;
                top:${Math.random()*60}%;
                opacity:${Math.random()*0.8+0.2};
            `;
            container.appendChild(star);
        }
    }

    // ==========================================
    // 4. 만보기(페도미터) 연동 설정
    // ==========================================
    function initAppPedometer() {
        const stepCountDisplay = document.getElementById('step-count-display');
        const safetyOverlay = document.getElementById('safety-overlay');
        const itemPopup = document.getElementById('item-popup');

        // iOS 13+ 등 권한이 필요한 브라우저를 위한 권한 요청 처리
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        startPedometer();
                    } else {
                        alert('탐험(만보기) 기능을 사용하려면 모션 센서 접근 권한이 필요합니다.');
                    }
                })
                .catch(console.error);
        } else {
            // 안드로이드나 권한 요청이 따로 필요 없는 환경
            startPedometer();
        }

        // 권한 확인 후 실제 동작을 지시하는 함수
        function startPedometer() {
            // 앱이 시작될 때 미리 json 데이터를 로드해둡니다 (collection.js, quiz.js 함수)
            if (typeof loadCardsData === 'function') {
                loadCardsData();
            }
            if (typeof loadQuizData === 'function') {
                loadQuizData();
            }

            // pedometer.js 파일에 정의된 초기화 함수 호출
            initPedometer(
                // [한글 주석] 걸음수는 내부적으로만 관리 (화면 표시 안 함)
                (steps) => {
                    // [한글 주석] UI 업데이트 없이 걸음수만 내부 저장
                    console.log('[걸음수]', steps);
                },
                // 2. 안전 경고 발생 시 동작 (빨간 화면 표시)
                () => {
                    safetyOverlay.style.display = 'flex';
                },
                // 3. 안전 경고 해제 시 동작 (빨간 화면 숨김)
                () => {
                    safetyOverlay.style.display = 'none';
                },
                // 4. 아이템 발생 시 동작 (랜덤 아이템 뽑기 로직 호출)
                () => {
                    // 즉시 아이템을 뽑지 않고 오버레이에 발견 알림 표시
                    if (typeof showItemDiscoveryNotification === 'function') {
                        showItemDiscoveryNotification();
                    }
                }
            );
        }
    }
});

// [한글 주석] 기기 초기화 확인 팝업 1단계
function showResetDeviceConfirm() {
  const first = confirm(
    '기기의 사용자가 바뀌었을 때를 위한 초기화 버튼입니다.\n\n' +
    '기존에 모은 기록이 다 날아갑니다.\n\n' +
    '정말 초기화 하시겠습니까?'
  );
  if (!first) return;

  // [한글 주석] 2단계 확인
  const second = confirm(
    '마지막 확인입니다.\n\n' +
    '모든 수집 기록, 걸음수, 아바타 설정이\n' +
    '완전히 삭제됩니다.\n\n' +
    '계속 하시겠습니까?'
  );
  if (!second) return;

  // [한글 주석] localStorage 전체 삭제
  localStorage.clear();

  // [한글 주석] Service Worker 및 캐시 완전 삭제
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(regs => regs.forEach(r => r.unregister()));
  }
  caches.keys().then(keys =>
    keys.forEach(key => caches.delete(key))
  );

  // [한글 주석] 0.5초 후 새로고침
  setTimeout(() => location.reload(true), 500);
}

// [한글 주석] 전역 노출
window.showResetDeviceConfirm = showResetDeviceConfirm;

