// js/dodam.js

let currentDodamCategory = 'plant'; // 도감 화면 진입 시 기본으로 보여줄 카테고리 (식물)

/**
 * 도감 화면을 열고 부드럽게 슬라이드 애니메이션을 적용합니다.
 */
function showDodam() {
    const dodamScreen = document.getElementById('dodam-screen');
    
    // 화면에 보이게(flex) 처리한 후
    dodamScreen.style.display = 'flex';
    
    // 아주 짧은 딜레이 뒤에 slide-in 클래스를 추가하여 애니메이션이 동작하게 합니다.
    setTimeout(() => {
        dodamScreen.classList.add('slide-in');
    }, 10);

    // 상단 탭 상태 및 그리드 내용 렌더링
    renderDodamTabs();
    renderDodamGrid(currentDodamCategory);
}

/**
 * 도감 화면을 닫고 메인 화면으로 돌아갑니다.
 */
function hideDodam() {
    const dodamScreen = document.getElementById('dodam-screen');
    
    // 슬라이드 애니메이션 클래스 제거 (오른쪽으로 빠짐)
    dodamScreen.classList.remove('slide-in');
    
    // 애니메이션 시간(0.3초)만큼 대기한 후 화면에서 숨김
    setTimeout(() => {
        dodamScreen.style.display = 'none';
    }, 300);
}

/**
 * 도감 카테고리 탭을 변경합니다.
 * @param {string} category 'plant', 'animal', 'artifact' 중 하나
 */
function switchDodamTab(category) {
    const unlocked = getUnlockedCategories(); // collection.js의 함수 사용
    
    // 아직 해금되지 않은 카테고리라면 거부
    if (!unlocked.includes(category)) {
        alert("아직 열리지 않은 도감입니다! 이전 도감을 더 채워주세요.");
        return;
    }
    
    currentDodamCategory = category;
    renderDodamTabs();
    renderDodamGrid(category);
}

/**
 * 해금 상태에 따라 도감 화면의 상단 탭 디자인(활성화/잠금)을 업데이트합니다.
 */
function renderDodamTabs() {
    const unlocked = getUnlockedCategories();
    const tabs = document.querySelectorAll('.dodam-tab');
    
    tabs.forEach(tab => {
        const cat = tab.getAttribute('data-category');
        
        // 1. 잠금/해금 상태 표시 업데이트
        if (unlocked.includes(cat)) {
            tab.classList.remove('locked');
            if (cat === 'plant') tab.textContent = '🌱 식물';
            if (cat === 'animal') tab.textContent = '🦊 동물';
            if (cat === 'artifact') tab.textContent = '🌰 유물';
        } else {
            tab.classList.add('locked');
            if (cat === 'animal') tab.textContent = '🔒 동물';
            if (cat === 'artifact') tab.textContent = '🔒 유물';
        }
        
        // 2. 현재 선택된 탭 강조(active) 처리
        if (cat === currentDodamCategory) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

/**
 * 선택된 카테고리의 카드 목록과 미수집 카드(물음표)를 그리드에 그립니다.
 * @param {string} category 
 */
function renderDodamGrid(category) {
    const gridEl = document.getElementById('dodam-grid');
    gridEl.innerHTML = ''; // 기존 그리드 내용 비우기
    
    // 데이터가 로드되지 않은 상태 방어
    if (!window.allCardsData || window.allCardsData.length === 0) return;
    
    // [한글 주석] 디버깅을 위해 로드된 전체 카드 수를 브라우저 콘솔에 안전하게 기록합니다.
    console.log('전체 카드 수:', window.allCardsData?.length);
    
    // [한글 주석] 요구사항에 맞춰 도감 렌더링 카드 소스 개수를 브라우저 콘솔에 기록합니다.
    console.log('도감 렌더링 카드 소스:', 
      window.allCardsData?.filter(c => c.category === 'animal').length, 
      '개');
    
    // 전체 카드 중 현재 탭의 카테고리인 것만 필터링
    const categoryCards = window.allCardsData.filter(c => c.category === category);
    
    // 저장소에서 수집 기록 및 수집 날짜 가져오기
    const collection = getCollection();
    const collectionDates = typeof getCollectionDates === 'function' ? getCollectionDates() : {};
    
    // 해당 카테고리에서 수집 완료한 개수 파악
    let collectedCount = 0;
    categoryCards.forEach(card => {
        if (collection.includes(card.id)) collectedCount++;
    });
    
    // 요구사항: 도감 UI 상의 전체 수집 기준은 100개
    const totalCount = 100; 
    document.querySelector('.dodam-summary-text').textContent = `${collectedCount} / ${totalCount} 수집`;
    document.getElementById('dodam-progress').style.width = `${(collectedCount / totalCount) * 100}%`;
    
    // 1. 실제 존재하는 카드들을 그리기
    categoryCards.forEach(card => {
        // [한글 주석] cards.json에 등록되어 있는 실제 카드의 id 목록 기준 슬롯 생성을 완벽 보장합니다.
        // [한글 주석] 수집된 카드도 반드시 window.allCardsData에서 id로 find()해서 원본 데이터를 사용합니다.
        const exactCard = window.allCardsData.find(c => c.id === card.id);
        if (!exactCard) return; // window.allCardsData에 없는 카드는 절대 표시 안 함

        const isCollected = collection.includes(exactCard.id);
        const cardEl = document.createElement('div');
        
        if (isCollected) {
            // 수집한 카드의 디자인 (카테고리별 클래스 추가)
            cardEl.className = `dodam-card dodam-card-${exactCard.category}`;
            // [한글 주석] 카드에 희귀도 클래스 추가 (스타일링 용도)
            cardEl.classList.add(exactCard.rarity || 'common');
            // 카드 클릭 시 상세 팝업 열기 (정확한 카드 데이터를 ID 기반으로 window.allCardsData에서 재조회)
            cardEl.onclick = () => {
                showDodamDetail(exactCard, collectionDates[exactCard.id]);
            };
            
            // [한글 주석] 요약 설명(short_desc)이 없는 경우 서식지(habitat) 정보로 대체 표시하고, 이마저도 없을 경우 빈 문자열로 안전 처리하여 'undefined' 등의 불필요한 텍스트 노출을 방지합니다.
            const descToShow = exactCard.short_desc || exactCard.habitat || "";
            
            cardEl.innerHTML = `
                <div class="dodam-card-top">${exactCard.name}</div>
                <div class="dodam-card-mid">
                    <div class="dodam-card-emoji" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                        ${getCardImageHTML(exactCard)}
                    </div>
                </div>
                <div class="dodam-card-bottom">${descToShow}</div>
            `;
        } else {
            // 미수집 카드의 디자인 (클릭 불가)
            cardEl.className = 'dodam-card unknown';
            cardEl.innerHTML = `
                <div class="dodam-card-icon-unknown">🔒</div>
                <div class="dodam-card-name-unknown">???</div>
                <div class="dodam-card-desc-unknown">미발견</div>
            `;
        }
        gridEl.appendChild(cardEl);
    });
    
    // 2. 100개 기준이므로 남은 빈 칸들(미수집)을 가짜 카드로 채우기
    const emptySlots = totalCount - categoryCards.length;
    for(let i = 0; i < emptySlots; i++) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'dodam-card unknown';
        emptyEl.innerHTML = `
            <div class="dodam-card-icon-unknown">🔒</div>
            <div class="dodam-card-name-unknown">???</div>
            <div class="dodam-card-desc-unknown">미발견</div>
        `;
        gridEl.appendChild(emptyEl);
    }
}

/**
 * 수집한 카드의 상세 정보를 3D 팝업(공통)에 띄웁니다.
 */
function showDodamDetail(card, dateString) {
    // [한글 주석] 팝업이 열릴 때 콘솔에 정밀한 카드 구조화 데이터를 출력합니다.
    console.log('팝업 데이터:', {
        name: card.name,
        short: card.short_desc,
        detail: card.detail_desc,
        habitat: card.habitat
    });

    // [한글 주석] 팝업 열기 전에 뒷면 상태라면 앞면으로 초기화
    document.getElementById('flip-card-inner').classList.remove('is-flipped');
    
    // [한글 주석] 도감에서 열 때는 희귀도 이펙트 없이 깔끔하게 표시 (수집 팝업 전용 효과 제거)
    if (typeof clearRarityEffects === 'function') {
        clearRarityEffects();
    }
    
    // [한글 주석] 앞면 카드 이미지 또는 이모지 바인딩 (실사 이미지 기능 추가)
    const popupEmojiEl = document.getElementById('popup-emoji');
    popupEmojiEl.style.width = '100%';
    popupEmojiEl.style.height = '100%';
    popupEmojiEl.style.display = 'flex';
    popupEmojiEl.style.alignItems = 'center';
    popupEmojiEl.style.justifyContent = 'center';
    popupEmojiEl.innerHTML = getCardImageHTML(card, 68);
    document.getElementById('popup-name').textContent = card.name;
    document.getElementById('popup-short-desc').textContent = card.short_desc || '새로운 발견입니다!';
    document.getElementById('popup-habitat').textContent = `📍 서식지: ${card.habitat || '알 수 없음'}`;
    
    // 뒷면 데이터 바인딩
    document.getElementById('popup-back-name').textContent = card.name;
    document.getElementById('popup-detail-desc').textContent = card.detail_desc || ''; // detail_desc 필드 단일 참조
    
    // 수집 날짜 (만약 예전에 수집하여 날짜가 없다면 '최근 수집'으로 대체)
    document.getElementById('popup-date').textContent = dateString ? `📅 ${dateString} 수집` : '📅 최근 수집';
    
    // 희귀도 뱃지 세팅
    const rarityBadgeFront = document.getElementById('popup-rarity-badge');
    const rarityBadgeBack = document.getElementById('popup-back-rarity');
    let rarityText = '일반', rarityClass = 'badge-common';
    if (card.rarity === 'rare') { rarityText = '희귀'; rarityClass = 'badge-rare'; }
    else if (card.rarity === 'epic') { rarityText = '전설'; rarityClass = 'badge-epic'; }
    
    rarityBadgeFront.textContent = rarityText;
    rarityBadgeFront.className = `card-badge ${rarityClass}`;
    rarityBadgeBack.textContent = rarityText;
    rarityBadgeBack.className = `card-badge ${rarityClass}`;
    
    // 카테고리 뱃지 세팅
    const catBadge = document.getElementById('popup-category-badge');
    if (card.category === 'plant') { catBadge.textContent = '🌱 식물'; catBadge.className = 'badge-category-plant'; }
    else if (card.category === 'animal') { catBadge.textContent = '🦊 동물'; catBadge.className = 'badge-category-animal'; }
    else if (card.category === 'artifact') { catBadge.textContent = '🌰 유물'; catBadge.className = 'badge-category-artifact'; }
    
    // 도감에서 볼 때는 이모지 반짝임 끄기
    document.getElementById('popup-emoji-container').classList.remove('new-discovery-anim');
    
    // 버튼 색상 (카테고리 색상에 맞춤)
    const btnDetail = document.getElementById('btn-detail');
    if (card.category === 'plant') btnDetail.style.backgroundColor = '#2d7a2d';
    else if (card.category === 'animal') btnDetail.style.backgroundColor = '#d4870a';
    else if (card.category === 'artifact') btnDetail.style.backgroundColor = '#8B6914';
    
    // 오버레이 표시
    document.getElementById('shared-card-overlay').style.display = 'flex';
}

/**
 * 도감 상세 팝업창을 닫습니다. (공통 함수 재사용)
 */
function closeDodamDetail() {
    if (typeof closeCardPopup === 'function') {
        closeCardPopup(); // collection.js에 정의된 공통 함수 호출
    } else {
        document.getElementById('shared-card-overlay').style.display = 'none';
    }
}
