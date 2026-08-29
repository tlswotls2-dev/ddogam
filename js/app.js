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

    // [한글 주석] 체험 모드 자동 진입 — setTimeout으로 감싸야 proceedToMainScreen 접근 가능
    setTimeout(() => {
        if (localStorage.getItem('demoMode') === 'true' &&
            localStorage.getItem('isTeacher') === 'false') {
            const _demoUserData = localStorage.getItem('userData');
            if (_demoUserData) {
                loginContainer.style.display = 'none';
                if (typeof proceedToMainScreen === 'function') {
                    proceedToMainScreen();
                    setTimeout(() => {
                        if (typeof showDemoBanner === 'function') showDemoBanner();
                    }, 800);
                }
            }
        }
    }, 0);

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
                // [한글 주석] 선생님은 동기화 불필요 (보상 폴링만 시작 안 함)
                // initSync 호출 안 함
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

            // [한글 주석] 학생 비밀번호 고정값 (변경 원하면 이 숫자만 바꾸면 됩니다)
            const STUDENT_PASSWORD = '1234';

            // [한글 주석] 학생 비밀번호 확인
            if (passwordValue !== STUDENT_PASSWORD) {
                messageDisplay.textContent = '비밀번호가 올바르지 않습니다!';
                messageDisplay.classList.add('error');
                return;
            }

            // 5. 사용자 데이터 로컬 저장소에 저장 (storage.js)
            const userData = {
                class: classValue,
                number: numberValue,
                password: passwordValue
            };
            // [한글 주석] 학생 계정 표시 (isTeacher 명시적으로 false 저장)
            localStorage.setItem('isTeacher', 'false');
            saveUserData(userData);

            // [한글 주석] 로그인 성공 후 동기화 시스템 초기화
            if (typeof initSync === 'function') {
                initSync();
            }

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
    window.proceedToMainScreen = function () {
        // [한글 주석] 오디오 초기화 + 음소거 상태 복원 + 메인 배경음 시작
        if (typeof initAudio === 'function') initAudio();
        if (typeof loadMuteState === 'function') loadMuteState();
        if (typeof playMainBGM === 'function') setTimeout(() => playMainBGM(), 500);
        if (typeof _updateMuteBtn === 'function') _updateMuteBtn();

        mainContainer.style.display = 'block'; // 메인 컨테이너 표시
        // [한글 주석] 로그인 직후 1초 뒤 선생님 보상 확인
        setTimeout(() => {
          if (typeof checkTeacherReward === 'function') checkTeacherReward();
        }, 1000);

        // [한글 주석] 우측 상단에 반/번호 표시
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userInfoEl = document.getElementById('user-info-display');
        if (userInfoEl && userData.class && userData.number) {
            // [한글 주석] 반/번호 + 탐험가 빨간 하트 표시
            const _TuI = window.LANG_UI; const _LuI = window.currentLang || 'ko';
            const _explorerLabel = _TuI?.[_LuI]?.titleBadgeExplorer || '탐험가';
            const _classLabel = _LuI === 'ko' ? `${userData.class}반 ${userData.number}번 ${_explorerLabel}` :
                                _LuI === 'zh' ? `${userData.class}班 ${userData.number}号 ${_explorerLabel}` :
                                `Class ${userData.class} No.${userData.number} ${_explorerLabel}`;
            userInfoEl.innerHTML = `${_classLabel}<span style="color:#ff4444;">♥</span>`;
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

        // [한글 주석] 최초 로그인 시 튜토리얼 실행
        if (typeof startTutorial === 'function') {
            setTimeout(() => {
                startTutorial();
            }, 500); // UI 안정화 후 실행
        }
    };
    const proceedToMainScreen = window.proceedToMainScreen;
    window.proceedToMainScreen = proceedToMainScreen;

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
            // [한글 주석] 탭 전환 효과음
            if (typeof playSfxTab === 'function') playSfxTab();

            const target = tab.getAttribute('data-target');

            // 잠금 상태인 탭을 누르면 수집 개수를 확인하고 퀴즈를 띄우거나 경고 메시지를 표시합니다.
            if (tab.classList.contains('locked')) {
                // [한글 주석] 레벨 기반 해금 안내 (다국어)
                const currentLevel = typeof getCurrentLevel === 'function' ? getCurrentLevel() : 1;
                const _Tl = window.LANG_UI; const _Ll = window.currentLang || 'ko';
                if (target === 'animal') {
                    const needed = 5 - currentLevel;
                    if (needed > 0) {
                        alert((_Tl?.[_Ll]?.tabAnimalLocked || '레벨 5가 되면 동물 탐험이 열려요!\\n(현재 Lv.{cur}, 레벨업 {needed}번 더 필요해요)')
                            .replace('{cur}', currentLevel).replace('{needed}', needed));
                    }
                } else if (target === 'artifact') {
                    const needed = 10 - currentLevel;
                    if (needed > 0) {
                        alert((_Tl?.[_Ll]?.tabArtifactLocked || '레벨 10이 되면 유물 탐험이 열려요!\\n(현재 Lv.{cur}, 레벨업 {needed}번 더 필요해요)')
                            .replace('{cur}', currentLevel).replace('{needed}', needed));
                    }
                }
                return;
            }

            // 기존 활성화 탭의 active 클래스 제거
            tabs.forEach(t => t.classList.remove('active'));
            // 클릭한 탭에 active 클래스 추가 (강조 표시)
            tab.classList.add('active');

            // [한글 주석] 배지 텍스트 다국어 적용
            const emoji = tab.getAttribute('data-emoji');
            const name = tab.getAttribute('data-name');
            const _Tb = window.LANG_UI; const _Lb = window.currentLang || 'ko';
            const _badgeTpl = _Tb?.[_Lb]?.tabExploringBadge || '{emoji} {name} 탐험 중';
            categoryBadge.textContent = _badgeTpl.replace('{emoji}', emoji).replace('{name}', name);

            // [한글 주석] 현재 카테고리 전역 변수 업데이트 (아이템 뽑기에서 사용)
            window.currentCategory = target;
        });
    });

    // LocalStorage의 데이터를 불러와 진행바를 업데이트하는 함수 (외부 파일에서도 쉽게 호출하도록 전역에 할당)
    window.updateMainScreenData = function () {
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
        document.getElementById('total-text').textContent = `${totalCount} / ${totalMax} (${Math.floor(totalCount / totalMax * 100)}%)`;
        document.getElementById('total-progress').style.width = `${(totalCount / totalMax) * 100}%`;

        // 2. 식물 카테고리 수집 현황 갱신
        document.getElementById('plant-text').textContent = `${plantCount} / ${maxPerCategory}`;
        document.getElementById('plant-progress').style.width = `${(plantCount / maxPerCategory) * 100}%`;

        // 3. 동물 카테고리 수집 현황 갱신
        document.getElementById('animal-text').textContent = `${animalCount} / ${maxPerCategory}`;
        document.getElementById('animal-progress').style.width = `${(animalCount / maxPerCategory) * 100}%`;

        // 4. 유물 카테고리 수집 현황 갱신
        document.getElementById('artifact-text').textContent = `${artifactCount} / ${maxPerCategory}`;
        document.getElementById('artifact-progress').style.width = `${(artifactCount / maxPerCategory) * 100}%`;

        // 5. 탭 해금 로직 처리
        const animalTab = document.querySelector('.tab[data-target="animal"]');
        const artifactTab = document.querySelector('.tab[data-target="artifact"]');

        // [한글 주석] 레벨 기반 탭 해금 (레벨5 → 동물, 레벨10 → 유물)
        const currentLevel = typeof getCurrentLevel === 'function' ? getCurrentLevel() : 1;
        const _Tu = window.LANG_UI; const _Lu = window.currentLang || 'ko';
        if (currentLevel >= 5 && animalTab) {
            animalTab.classList.remove('locked');
            animalTab.textContent = _Tu?.[_Lu]?.dodamTabAnimal || '🦊 동물';
        }
        if (currentLevel >= 10 && artifactTab) {
            artifactTab.classList.remove('locked');
            artifactTab.textContent = _Tu?.[_Lu]?.dodamTabArtifact || '🏺 유물';
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
    window.startExploration = function () {
        // [한글 주석] 탐험 중 뒤로가기 버튼 차단 시작
        function _blockBackButton() {
            history.pushState(null, '', location.href);
        }
        window._explorationBackHandler = function () {
            history.pushState(null, '', location.href);
        };
        window.addEventListener('popstate', window._explorationBackHandler);
        _blockBackButton();

        // [한글 주석] 뒤로가기 스택에 추가
        if (typeof pushScreen === 'function') pushScreen('exploration-overlay');
        // [한글 주석] 탐험 배경음으로 전환
        if (typeof playExploreBGM === 'function') playExploreBGM();

        const overlay = document.getElementById('exploration-overlay');
        const defaultContent = document.getElementById('explore-default-content');
        const discoveryContent = document.getElementById('explore-discovery-content');

        if (overlay) {
            // [한글 주석] 오버레이 크기 강제 고정 (태블릿 scale 대응)
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.maxWidth = '100%';
            overlay.style.boxSizing = 'border-box';
            overlay.style.display = 'flex';
            defaultContent.style.display = 'flex';
            defaultContent.style.width = '100%';
            defaultContent.style.boxSizing = 'border-box';
            discoveryContent.style.display = 'none';
        }

        // 페도미터의 탐험 모드 시작 (걸음 측정 활성화 및 목표 설정)
        if (typeof startPedometerExploration === 'function') {
            startPedometerExploration();
        }

        // [한글 주석] 체험 모드일 때만 시뮬레이션 버튼과 안내문구를 노출 (다국어 텍스트 포함)
        var simBtn = document.getElementById('demo-sim-btn');
        var simNotice = document.getElementById('demo-sim-notice');
        var _uiSim = window.LANG_UI ? window.LANG_UI[window.currentLang || 'ko'] : null;
        if (localStorage.getItem('demoMode') === 'true') {
            if (simBtn) {
                simBtn.style.display = 'block';
                if (!window._demoWalkSimTimer) {
                    simBtn.textContent = (_uiSim && _uiSim.demoSimStart) || '🎬 걷기 시뮬레이션 시작';
                }
            }
            if (simNotice) {
                simNotice.style.display = 'block';
                simNotice.textContent = (_uiSim && _uiSim.demoSimNotice) || '📍 체험 모드에서만 활성화되는 기능이에요 · 실제로 움직일 수 없는 환경을 위한 체험용 기능이에요 (1초에 2걸음씩 자동 이동)';
            }
        } else {
            if (simBtn) simBtn.style.display = 'none';
            if (simNotice) simNotice.style.display = 'none';
        }
    };

    // [한글 주석] 체험 모드 전용 - 실제로 움직이지 않아도 걸음을 자동 발생시키는 시뮬레이션
    // 초당 2걸음(500ms 간격으로 1걸음씩) incrementStep()을 호출해 기존 걸음 감지 파이프라인을 그대로 재사용
    window._demoWalkSimTimer = null;
    window.toggleDemoWalkSimulation = function () {
        var btn = document.getElementById('demo-sim-btn');
        var _uiToggle = window.LANG_UI ? window.LANG_UI[window.currentLang || 'ko'] : null;
        if (window._demoWalkSimTimer) {
            // [한글 주석] 이미 실행 중이면 정지
            clearInterval(window._demoWalkSimTimer);
            window._demoWalkSimTimer = null;
            if (btn) {
                btn.textContent = (_uiToggle && _uiToggle.demoSimStart) || '🎬 걷기 시뮬레이션 시작';
            }
        } else {
            // [한글 주석] 500ms마다 1걸음씩 = 초당 2걸음
            window._demoWalkSimTimer = setInterval(function () {
                if (typeof incrementStep === 'function') {
                    incrementStep();
                }
            }, 500);
            if (btn) {
                btn.textContent = (_uiToggle && _uiToggle.demoSimStop) || '⏸ 시뮬레이션 정지';
            }
        }
    };

    // [한글 주석] 탐험 종료 시 실제 종료 처리 로직 (요약 팝업 이후 실행됨)
    function _actuallyStopExploration() {
        // [한글 주석] 탐험 종료 시 걷기 시뮬레이션도 함께 정지
        if (window._demoWalkSimTimer) {
            clearInterval(window._demoWalkSimTimer);
            window._demoWalkSimTimer = null;
            var simBtn = document.getElementById('demo-sim-btn');
            var _uiStop = window.LANG_UI ? window.LANG_UI[window.currentLang || 'ko'] : null;
            if (simBtn) simBtn.textContent = (_uiStop && _uiStop.demoSimStart) || '🎬 걷기 시뮬레이션 시작';
        }
        // [한글 주석] 탐험 종료 시 뒤로가기 차단 해제
        if (window._explorationBackHandler) {
            window.removeEventListener('popstate', window._explorationBackHandler);
            window._explorationBackHandler = null;
        }
        // [한글 주석] 메인 배경음으로 복귀
        if (typeof stopBGM === 'function') stopBGM();
        setTimeout(() => { if (typeof playMainBGM === 'function') playMainBGM(); }, 300);
        const overlay = document.getElementById('exploration-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        // 페도미터의 탐험 모드 종료 (걸음 측정 중단)
        if (typeof stopPedometerExploration === 'function') {
            stopPedometerExploration();
        }
    }

    // [한글 주석] 탐험 세션 요약 팝업 표시 후 실제 종료
    window.stopExploration = function () {
        const sessionCards = window._explorationSessionCards || [];
        if (sessionCards.length === 0) {
            // [한글 주석] 수집한 카드가 없으면 바로 종료
            _actuallyStopExploration();
            return;
        }

        // [한글 주석] 카드별 개수 집계
        const countMap = {};
        sessionCards.forEach(card => {
            if (!countMap[card.id]) {
                countMap[card.id] = { card: card, count: 0 };
            }
            countMap[card.id].count++;
        });
        const summaryList = Object.values(countMap).sort((a, b) => b.count - a.count);

        const _Ts = window.LANG_UI; const _Ls = window.currentLang || 'ko';
        const _ts = k => _Ts?.[_Ls]?.[k] || _Ts?.ko?.[k] || '';

        const overlay = document.createElement('div');
        overlay.id = 'exploration-summary-overlay';
        overlay.style.cssText = `
            position:fixed;top:0;left:0;right:0;bottom:0;
            background:rgba(0,0,0,0.92);
            z-index:99999;
            display:flex;align-items:center;justify-content:center;
            padding:20px;
        `;

        const _Tsum = window.LANG_UI; const _Lsum = window.currentLang || 'ko';
        const _tsum = k => _Tsum?.[_Lsum]?.[k] || _Tsum?.ko?.[k] || '';
        const _catLabels = {
          plant: '🌱 ' + (_tsum('radarPlant') || '식물'),
          animal: '🦊 ' + (_tsum('radarAnimal') || '동물'),
          artifact: '🏺 ' + (_tsum('radarArtifact') || '유물')
        };
        const _rarityLabels = {
          common: '★ ' + (_tsum('rarityCommon') || '일반'),
          rare: '★★ ' + (_tsum('rarityRare') || '희귀'),
          epic: '★★★ ' + (_tsum('rarityEpic') || '전설')
        };
        const _rarityColors = { common: '#84ff00', rare: '#4a9eff', epic: '#ffd700' };

        const rows = summaryList.map(item => {
            const c = item.card;
            const lang = window.currentLang || 'ko';
            const name = (lang !== 'ko' && c[`name_${lang}`]) ? c[`name_${lang}`] : c.name;
            const imgHTML = typeof getCardImageHTML === 'function'
                ? getCardImageHTML(c, 40)
                : `<div style="font-size:24px;">${c.emoji || ''}</div>`;
            const catLabel = _catLabels[c.category] || '';
            const rarityLabel = _rarityLabels[c.rarity] || '';
            const rarityColor = _rarityColors[c.rarity] || '#8db05c';
            return `
                <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.04);border-radius:10px;padding:8px 12px;margin-bottom:6px;">
                    <div style="width:40px;height:40px;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.2);flex-shrink:0;">${imgHTML}</div>
                    <div style="flex:1;">
                        <div style="color:#f0e6c8;font-size:13px;font-weight:700;">${name}</div>
                        <div style="display:flex;gap:6px;margin-top:2px;">
                            <span style="color:#888;font-size:10px;">${catLabel}</span>
                            <span style="color:${rarityColor};font-size:10px;font-weight:700;">${rarityLabel}</span>
                        </div>
                    </div>
                    <div style="color:#ffd700;font-size:13px;font-weight:900;">×${item.count}</div>
                </div>
            `;
        }).join('');

        overlay.innerHTML = `
            <div style="
                background:linear-gradient(135deg,#1e2e1f,#2c3e2d);
                border:2px solid #6b8e3d;
                border-radius:24px;
                padding:24px 20px;
                max-width:340px;
                width:100%;
                max-height:80vh;
                display:flex;
                flex-direction:column;
            ">
                <div style="text-align:center;margin-bottom:16px;">
                    <div style="font-size:36px;margin-bottom:8px;">🎒</div>
                    <div style="color:#8db05c;font-size:17px;font-weight:900;">${_tsum('explorationSummaryTitle') || '이번 탐험 결과'}</div>
                    <div style="color:#d4c89c;font-size:12px;margin-top:4px;">${(_tsum('explorationSummaryCount') || '총 {n}장 수집!').replace('{n}', sessionCards.length)}</div>
                </div>
                <div style="overflow-y:auto;flex:1;margin-bottom:16px;">
                    ${rows}
                </div>
                ${(function() {
                    const _allStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
                    const _todayKey = (function() {
                        const d = new Date();
                        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                    })();
                    const _today = _allStats[_todayKey] || { steps: 0, kcal: 0, meters: 0, minutes: 0 };
                    const _km = (_today.meters / 1000).toFixed(2);
                    const _badge = typeof getActivityIntensityBadge === 'function' ? getActivityIntensityBadge(_today.minutes) : { label: '', emoji: '', color: '#8db05c' };
                    const _conversionText = typeof getActivityConversionText === 'function' ? getActivityConversionText(_today.kcal) : '';
                    const _Tact = window.LANG_UI; const _Lact = window.currentLang || 'ko';
                    const _tact = k => _Tact?.[_Lact]?.[k] || _Tact?.ko?.[k] || '';
                    return `
                    <div style="background:rgba(132,255,0,0.08);border:1px solid #4a6b3a;border-radius:14px;padding:12px 10px;margin-bottom:16px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                            <div style="color:#a8d878;font-size:12px;">🏃 ${_tact('recordsTodayMovement')}</div>
                            <div style="background:${_badge.color}22;color:${_badge.color};font-size:10px;padding:2px 7px;border-radius:999px;">${_badge.emoji} ${_badge.label}</div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center;">
                            <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:6px 2px;">
                                <div style="color:#d4ffaa;font-size:15px;font-weight:900;">${_today.steps}</div>
                                <div style="color:#a8d878;font-size:9px;">${_tact('recordsUnitSteps')}</div>
                            </div>
                            <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:6px 2px;">
                                <div style="color:#d4ffaa;font-size:15px;font-weight:900;">${_km}</div>
                                <div style="color:#a8d878;font-size:9px;">km</div>
                            </div>
                            <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:6px 2px;">
                                <div style="color:#d4ffaa;font-size:15px;font-weight:900;">${_today.kcal}</div>
                                <div style="color:#a8d878;font-size:9px;">${_tact('recordsUnitKcal')}</div>
                            </div>
                            <div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:6px 2px;">
                                <div style="color:#d4ffaa;font-size:15px;font-weight:900;">${_today.minutes}</div>
                                <div style="color:#a8d878;font-size:9px;">${_tact('recordsUnitActivityMin')}</div>
                            </div>
                        </div>
                        ${_conversionText ? `<div style="text-align:center;color:#d4c89c;font-size:11px;margin-top:8px;">${_conversionText}</div>` : ''}
                    </div>
                    `;
                })()}
                <button id="exploration-summary-close-btn" style="
                    width:100%;
                    background:linear-gradient(135deg,#8db05c,#6b8e3d);
                    color:#1e2e1f;border:none;border-radius:14px;
                    padding:13px;font-size:15px;font-weight:900;cursor:pointer;
                ">${_tsum('battleConfirm') || '확인!'}</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.getElementById('exploration-summary-close-btn').onclick = function () {
            overlay.remove();
            window._explorationSessionCards = [];
            _actuallyStopExploration();
        };
    };

    window.showItemDiscoveryNotification = function () {
        const defaultContent = document.getElementById('explore-default-content');
        const discoveryContent = document.getElementById('explore-discovery-content');

        // 기본 텍스트를 숨기고 깜빡이는 알림 텍스트 표시
        if (defaultContent && discoveryContent) {
            defaultContent.style.display = 'none';
            discoveryContent.style.display = 'block';

            // [한글 주석] 발견 알림 시 배경음 정지
            if (typeof stopBGM === 'function') stopBGM();

            // [한글 주석] 띠링띠링 효과음 3번
            if (typeof playSfxCardAppear === 'function') {
                playSfxCardAppear();
                setTimeout(() => { if (typeof playSfxCardAppear === 'function') playSfxCardAppear(); }, 400);
                setTimeout(() => { if (typeof playSfxCardAppear === 'function') playSfxCardAppear(); }, 800);
            }
            // [한글 주석] 기존 자동수집 타이머 있으면 제거
            if (window._discoveryAutoTapTimer) {
                clearTimeout(window._discoveryAutoTapTimer);
                window._discoveryAutoTapTimer = null;
            }
            // [한글 주석] 10초 안에 탭하지 않으면 자동으로 수집 (3장 선택 이벤트는 발생 안 함)
            window._discoveryAutoTapTimer = setTimeout(() => {
                window._discoveryAutoTapTimer = null;
                if (discoveryContent.style.display === 'block') {
                    defaultContent.style.display = 'flex';
                    discoveryContent.style.display = 'none';
                    // [한글 주석] 자동수집으로 뽑힌 카드임을 표시 (팝업 3초 자동닫힘용)
                    window._isAutoCollectedCard = true;
                    if (typeof drawRandomItem === 'function') {
                        drawRandomItem(true); // [한글 주석] true = 강제 일반모드 (3장선택 스킵)
                    }
                }
            }, 10000);
        }
    };

    window.handleExplorationOverlayClick = function () {
        // [한글 주석] 자동수집 타이머 정리 (사용자가 직접 탭함)
        if (window._discoveryAutoTapTimer) {
            clearTimeout(window._discoveryAutoTapTimer);
            window._discoveryAutoTapTimer = null;
        }
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
                left:${Math.random() * 100}%;
                top:${Math.random() * 60}%;
                opacity:${Math.random() * 0.8 + 0.2};
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
                    // [한글 주석] 진동 알림 (기존 방식 유지)
                    if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
                    // [한글 주석] 안전 오버레이 표시 (기존 디자인 유지, 내용만 변경)
                    safetyOverlay.style.display = 'flex';
                },
                // 3. 안전 경고 해제 시 동작 (빨간 화면 숨김)
                () => {
                    safetyOverlay.style.display = 'none';
                },
                // 4. 아이템 발생 시 동작 (랜덤 아이템 뽑기 로직 호출)
                () => {
                    // [한글 주석] 탐험 세션 배열이 없으면 초기화 (탐험 시작 시점)
                    if (!window._explorationSessionCards) {
                        window._explorationSessionCards = [];
                    }
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

// [한글 주석] 아바타 클릭 시 아바타 선택창으로 이동 (카드 데이터 유지)
function onAvatarClick() {
    if (typeof showGenderSelectScreen === 'function') {
        showGenderSelectScreen();
    }
}
window.onAvatarClick = onAvatarClick;

// ==========================================
// [한글 주석] 안드로이드 뒤로가기 버튼 처리 시스템
// ==========================================

// [한글 주석] 현재 열려있는 화면 스택
const _screenStack = [];

// [한글 주석] 화면이 열릴 때 스택에 추가
function pushScreen(screenId) {
    // [한글 주석] 중복 방지
    if (_screenStack[_screenStack.length - 1] === screenId) return;
    _screenStack.push(screenId);
    // [한글 주석] 브라우저 히스토리에 상태 추가 (뒤로가기 감지용)
    history.pushState({ screenId }, '', location.pathname);
}

// [한글 주석] 현재 열려있는 화면에 따라 뒤로가기 처리
function handleBackButton() {
    // [한글 주석] 스택에서 현재 화면 꺼내기
    const current = _screenStack.pop();

    // [한글 주석] 각 화면별 닫기 함수 매핑
    const closeMap = {
        'dodam-screen': () => { if (typeof hideDodam === 'function') hideDodam(); },
        'map-screen': () => { const ms = document.getElementById('map-screen'); if (ms) ms.style.display = 'none'; },
        'avatar-customize-screen': () => { if (typeof hideCustomizeScreen === 'function') hideCustomizeScreen(); },
        'chatbot-screen': () => { if (typeof hideChatbot === 'function') hideChatbot(); },
        'quiz-screen': () => { if (typeof closeQuiz === 'function') closeQuiz(); },
        'exploration-overlay': () => { if (typeof stopExploration === 'function') stopExploration(); },
        'shared-card-overlay': () => { if (typeof closeCardPopup === 'function') closeCardPopup(); },
        'help-modal': () => { if (typeof hideHelpModal === 'function') hideHelpModal(); },
        'gender-select-screen': () => { const s = document.getElementById('gender-select-screen'); if (s) s.style.display = 'none'; },
    };

    if (current && closeMap[current]) {
        closeMap[current]();
        return;
    }

    // [한글 주석] 스택이 비어있으면 오버레이/모달 순서로 확인 후 닫기
    const overlayOrder = [
        'shared-card-overlay',
        'help-modal',
        'exploration-overlay',
        'avatar-customize-screen',
        'chatbot-screen',
        'quiz-screen',
        'dodam-screen',
        'map-screen',
    ];

    for (const id of overlayOrder) {
        const el = document.getElementById(id);
        if (el && el.style.display !== 'none' && el.style.display !== '') {
            if (closeMap[id]) { closeMap[id](); return; }
        }
    }

    // [한글 주석] 닫을 화면이 없으면 메인화면 → 앱 종료 확인
    if (confirm('앱을 종료하시겠습니까?')) {
        navigator.app?.exitApp?.();
    } else {
        // [한글 주석] 취소 시 히스토리 다시 추가
        history.pushState({}, '', location.pathname);
    }
}

// [한글 주석] popstate 이벤트 감지 (안드로이드 뒤로가기 = history.back())
window.addEventListener('popstate', (e) => {
    handleBackButton();
});

// [한글 주석] 초기 히스토리 상태 추가 (첫 popstate 감지용)
history.pushState({}, '', location.pathname);

// [한글 주석] 전역 노출
window.pushScreen = pushScreen;
window.handleBackButton = handleBackButton;

// PWA 설치 버튼 - 홈 화면 추가 프롬프트 이벤트 저장
let _pwaPrompt = null;

// 설치 가능할 때 이벤트 캐치 (안드로이드 크롬에서 동작)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _pwaPrompt = e;
    // 버튼 보이기
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.style.display = 'block';
});

// 버튼 클릭 시 설치 팝업 띄우기
document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
    if (!_pwaPrompt) return;
    _pwaPrompt.prompt();
    const { outcome } = await _pwaPrompt.userChoice;
    // 설치 완료되면 버튼 숨기기
    if (outcome === 'accepted') {
        document.getElementById('pwa-install-btn').style.display = 'none';
    }
    _pwaPrompt = null;
});
