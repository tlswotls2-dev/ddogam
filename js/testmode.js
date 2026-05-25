// ================================
// 🧪 테스트 모드 (개발용)
// 배포 전 반드시 삭제할 것!
// 삭제 방법:
// 1. 이 파일(testmode.js) 삭제
// 2. index.html에서 아래 줄 삭제:
//    <script src="js/testmode.js"></script>
// ================================

(function() {
    console.log("🧪 개발자 테스트 모드가 활성화 준비되었습니다. 로고를 5번 연속 탭하세요!");

    // 테스트 탭 횟수 카운터 및 타이머
    let tapCount = 0;
    let tapTimer = null;

    // DOM 로드 후 초기화 및 이벤트 리스너 등록
    document.addEventListener('DOMContentLoaded', () => {
        initTestMode();
    });

    /**
     * 테스트 모드 초기화 함수
     */
    function initTestMode() {
        // 스타일 요소 생성 및 추가
        const style = document.createElement('style');
        style.innerHTML = `
            #test-panel {
                position: fixed;
                bottom: -500px;
                left: 50%;
                transform: translateX(-50%);
                width: 100%;
                max-width: 400px;
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(10px);
                border-top-left-radius: 20px;
                border-top-right-radius: 20px;
                box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.6);
                z-index: 999999;
                padding: 20px;
                box-sizing: border-box;
                transition: bottom 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                color: #f8fafc;
                font-family: sans-serif;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-bottom: none;
            }
            #test-panel.show {
                bottom: 0;
            }
            .test-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 10px;
            }
            .test-panel-title {
                font-size: 1.2rem;
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .test-panel-close {
                background: none;
                border: none;
                color: #94a3b8;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }
            .test-panel-close:hover {
                color: #f8fafc;
            }
            .test-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 15px;
            }
            .test-btn {
                background: rgba(30, 41, 59, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #f1f5f9;
                padding: 12px 10px;
                border-radius: 12px;
                font-size: 0.95rem;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.2s ease;
            }
            .test-btn:hover {
                background: rgba(51, 65, 85, 0.9);
                border-color: rgba(255, 255, 255, 0.3);
                transform: translateY(-1px);
            }
            .test-btn:active {
                transform: scale(0.96) translateY(0);
            }
            .test-warning {
                font-size: 0.75rem;
                color: #f43f5e;
                text-align: center;
                margin-top: 15px;
                opacity: 0.9;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);

        // 테스트 패널 HTML 생성 및 추가
        const panel = document.createElement('div');
        panel.id = 'test-panel';
        panel.innerHTML = `
            <div class="test-panel-header">
                <span class="test-panel-title">🧪 테스트 모드 (개발용)</span>
                <button class="test-panel-close" id="test-close-btn">×</button>
            </div>
            <div class="test-grid">
                <button class="test-btn" id="test-draw-btn">🎴 아이템 뽑기</button>
                <button class="test-btn" id="test-levelup-btn">⭐ 레벨업</button>
                <!-- [한글 주석] 레벨 30 강제 설정 버튼 추가 -->
                <button class="test-btn" id="test-maxlevel-btn">🏆 레벨 30</button>
                <button class="test-btn" id="test-plant90-btn">🌱 식물 90개</button>
                <button class="test-btn" id="test-unlock-btn">🔓 전체 해금</button>
                <button class="test-btn" id="test-reset-btn" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">🗑️ 데이터 초기화</button>
            </div>
            <!-- 캐시 완전 삭제 버튼 -->
            <button onclick="clearAllCache()" style="
              width:100%;padding:14px;margin-top:8px;
              background:#ff9500;color:#000;
              border:none;border-radius:12px;
              font-size:15px;font-weight:900;cursor:pointer;
            ">🗑️ 캐시 완전 삭제 + 새로고침</button>
            <div class="test-warning">
                ⚠️ 테스트 모드입니다. 배포 전 삭제하세요.
            </div>
        `;
        document.body.appendChild(panel);

        // 이벤트 바인딩
        bindEvents();
    }

    /**
     * 다양한 탭 및 클릭 이벤트 설정
     */
    function bindEvents() {
        const testPanel = document.getElementById('test-panel');
        const closeBtn = document.getElementById('test-close-btn');

        // 닫기 버튼
        closeBtn.addEventListener('click', () => {
            testPanel.classList.remove('show');
        });

        // 5회 연속 탭 트리거 등록 (로그인 화면 로고 및 메인 화면 로고 둘 다 지원)
        const logos = document.querySelectorAll('.logo, .logo-small');
        logos.forEach(logo => {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                tapCount++;
                clearTimeout(tapTimer);

                // 2초 내에 다시 탭하지 않으면 카운트 리셋
                tapTimer = setTimeout(() => {
                    tapCount = 0;
                }, 2000);

                if (tapCount >= 5) {
                    tapCount = 0;
                    testPanel.classList.add('show');
                    alert("🧪 개발자 테스트 패널이 활성화되었습니다!");
                }
            });
        });

        // 1. [한글 주석] 아이템 뽑기
        document.getElementById('test-draw-btn').addEventListener('click', () => {
            if (typeof drawRandomItem === 'function') {
                drawRandomItem();
            } else {
                alert("아이템 뽑기 함수(drawRandomItem)를 찾을 수 없습니다.");
            }
        });

        // [한글 주석] 레벨업 버튼 - 현재 레벨 +1 강제 적용
        document.getElementById('test-levelup-btn').addEventListener('click', () => {
            // [한글 주석] 현재 확정 레벨 가져오기
            const currentLevel = typeof getCurrentLevel === 'function'
                ? getCurrentLevel() : parseInt(localStorage.getItem('currentLevel') || '1');
            const newLevel = Math.min(30, currentLevel + 1);

            // [한글 주석] 레벨 강제 저장
            localStorage.setItem('currentLevel', String(newLevel));

            // [한글 주석] 아이템/아바타 해금 체크
            if (typeof checkAndUnlockItems === 'function') checkAndUnlockItems();
            if (typeof checkAndUnlockAvatars === 'function') checkAndUnlockAvatars();

            // [한글 주석] UI 업데이트
            if (typeof updateLevelBadge === 'function') updateLevelBadge();
            if (typeof window.updateMainScreenData === 'function') window.updateMainScreenData();

            // [한글 주석] 레벨업 팝업 표시
            if (typeof showLevelUpPopup === 'function') showLevelUpPopup(newLevel);

            console.log(`[테스트] 레벨업: ${currentLevel} → ${newLevel}`);
        });

        // [한글 주석] 레벨 30 강제 설정
        document.getElementById('test-maxlevel-btn').addEventListener('click', () => {
            // [한글 주석] 레벨 30으로 강제 설정
            localStorage.setItem('currentLevel', '30');

            // [한글 주석] 아이템/아바타 해금 체크
            if (typeof checkAndUnlockItems === 'function') checkAndUnlockItems();
            if (typeof checkAndUnlockAvatars === 'function') checkAndUnlockAvatars();

            // [한글 주석] UI 업데이트
            if (typeof updateLevelBadge === 'function') updateLevelBadge();
            if (typeof renderLevelBadge === 'function') renderLevelBadge();
            if (typeof window.updateMainScreenData === 'function') window.updateMainScreenData();

            // [한글 주석] 레벨업 팝업 표시
            if (typeof showLevelUpPopup === 'function') showLevelUpPopup(30);

            console.log('[테스트] 레벨 30 강제 설정');
        });

        // 4. 식물 90개 수집
        document.getElementById('test-plant90-btn').addEventListener('click', () => {
            if (!window.allCardsData || window.allCardsData.length === 0) {
                alert("카드 데이터가 아직 로드되지 않았습니다. 로그인 후 시도해주세요.");
                return;
            }

            const plants = window.allCardsData.filter(c => c.category === 'plant');
            const collection = typeof getCollection === 'function' ? getCollection() : [];
            const dates = typeof getCollectionDates === 'function' ? getCollectionDates() : {};
            const dateString = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

            let currentPlants = collection.filter(id => id.startsWith('plant_'));
            let plantCount = currentPlants.length;
            const targetCount = 90;

            if (plantCount < targetCount) {
                for (let i = 0; i < plants.length; i++) {
                    const id = plants[i].id;
                    if (!collection.includes(id)) {
                        collection.push(id);
                        dates[id] = dateString;
                        plantCount++;
                        if (plantCount >= targetCount) break;
                    }
                }
                localStorage.setItem('userCollection', JSON.stringify(collection));
                localStorage.setItem('collectionDates', JSON.stringify(dates));
                
                if (typeof window.updateMainScreenData === 'function') {
                    window.updateMainScreenData();
                }
                alert(`식물 수집 개수가 ${plantCount}개로 설정되었습니다! (동물 해금 퀴즈 테스트 가능)`);
            } else {
                alert(`이미 식물을 ${plantCount}개 수집한 상태입니다.`);
            }
        });

        // 5. 전체 해금
        document.getElementById('test-unlock-btn').addEventListener('click', () => {
            if (!window.allCardsData || window.allCardsData.length === 0) {
                alert("카드 데이터가 아직 로드되지 않았습니다. 로그인 후 시도해주세요.");
                return;
            }

            const collection = typeof getCollection === 'function' ? getCollection() : [];
            const dates = typeof getCollectionDates === 'function' ? getCollectionDates() : {};
            const dateString = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

            // 1. [한글 주석] 퀴즈 둘 다 강제 패스 설정
            if (typeof setQuizPassed === 'function') {
                setQuizPassed('animal');
                setQuizPassed('artifact');
            } else {
                // 직접 localStorage 주입
                const passed = ['animal', 'artifact'];
                localStorage.setItem('quizPassed', JSON.stringify(passed));
            }

            // [한글 주석] 요청 사항에 따른 추가 퀴즈 통과 및 해금 상태 localStorage 설정
            localStorage.setItem('plantQuizPassed', 'true');
            localStorage.setItem('animalQuizPassed', 'true');
            localStorage.setItem('animalUnlocked', 'true');
            localStorage.setItem('artifactUnlocked', 'true');

            // 2. [한글 주석] 식물 100개 채우기
            const plants = window.allCardsData.filter(c => c.category === 'plant');
            plants.forEach(p => {
                if (!collection.includes(p.id)) {
                    collection.push(p.id);
                    dates[p.id] = dateString;
                }
            });

            // 3. [한글 주석] 동물 100개 채우기
            const animals = window.allCardsData.filter(c => c.category === 'animal');
            animals.forEach(a => {
                if (!collection.includes(a.id)) {
                    collection.push(a.id);
                    dates[a.id] = dateString;
                }
            });

            // 4. [한글 주석] 유물 100개 채우기
            const artifacts = window.allCardsData.filter(c => c.category === 'artifact');
            artifacts.forEach(a => {
                if (!collection.includes(a.id)) {
                    collection.push(a.id);
                    dates[a.id] = dateString;
                }
            });

            // 5. [한글 주석] 스토리지 저장
            localStorage.setItem('userCollection', JSON.stringify(collection));
            localStorage.setItem('collectionDates', JSON.stringify(dates));

            // [한글 주석] 아이템 전체 해금
            const allItemIds = Object.keys(AVATAR_ITEMS);
            localStorage.setItem('unlockedItems', JSON.stringify(allItemIds));

            // [한글 주석] 펫 전체 해금
            const allPetIds = PET_LIST.map(p => p.id);
            localStorage.setItem('unlockedPets', JSON.stringify(allPetIds));

            console.log('[테스트] 아이템 전체 해금:', allItemIds);
            console.log('[테스트] 펫 전체 해금:', allPetIds);

            // 6. 해금 조건 강제 우회를 위한 전역 함수 재정의
            window.getUnlockedCategories = function() {
                return ['plant', 'animal', 'artifact'];
            };

            // 7. UI 업데이트
            if (typeof window.updateMainScreenData === 'function') {
                window.updateMainScreenData();
            }

            // 8. 탭 강제 해금 클래스 조작
            const animalTab = document.querySelector('.tab[data-target="animal"]');
            const artifactTab = document.querySelector('.tab[data-target="artifact"]');
            if (animalTab) {
                animalTab.classList.remove('locked');
                animalTab.textContent = '🦊 동물';
            }
            if (artifactTab) {
                artifactTab.classList.remove('locked');
                artifactTab.textContent = '🏺 유물';
            }

            // 9. 도감 탭 강제 해금
            const dodamAnimalTab = document.querySelector('.dodam-tab[data-category="animal"]');
            const dodamArtifactTab = document.querySelector('.dodam-tab[data-category="artifact"]');
            if (dodamAnimalTab) {
                dodamAnimalTab.classList.remove('locked');
                dodamAnimalTab.textContent = '🦊 동물';
            }
            if (dodamArtifactTab) {
                dodamArtifactTab.classList.remove('locked');
                dodamArtifactTab.textContent = '🏺 유물';
            }

            alert("🔓 모든 카테고리, 퀴즈 및 도감이 강제로 해금되었습니다!");
        });

        // 6. 데이터 초기화
        document.getElementById('test-reset-btn').addEventListener('click', () => {
            if (confirm("⚠️ 정말로 모든 로컬 데이터를 삭제하고 초기화하시겠습니까?\n(사용자 정보, 수집 상태, API 키 등 모든 데이터가 사라집니다.)")) {
                localStorage.clear();
                alert("데이터가 완전히 초기화되었습니다. 앱을 재부팅합니다.");
                location.reload();
            }
        });
    }

    // [한글 주석] Service Worker 캐시 완전 삭제 + 새로고침
    // 배포 후 업데이트가 반영 안 될 때 사용
    async function clearAllCache() {
      if (!confirm('캐시를 완전히 삭제하고 새로고침할까요?\n(이미지도 다시 다운로드됩니다)')) return;
      
      // [한글 주석] Service Worker 등록 해제
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
        console.log('[캐시] Service Worker 해제 완료');
      }
      
      // [한글 주석] 모든 캐시 스토리지 삭제
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      console.log('[캐시] 캐시 스토리지 삭제 완료');
      
      // [한글 주석] 0.5초 후 강제 새로고침
      setTimeout(() => location.reload(true), 500);
    }

    // [한글 주석] 전역 노출
    window.clearAllCache = clearAllCache;
})();
