// js/dodam.js

let currentDodamCategory = 'plant'; // 도감 화면 진입 시 기본으로 보여줄 카테고리 (식물)

/**
 * 도감 화면을 열고 부드럽게 슬라이드 애니메이션을 적용합니다.
 */
function showDodam() {
  // [한글 주석] 뒤로가기 스택에 추가
  if (typeof pushScreen === 'function') pushScreen('dodam-screen');
  const dodamScreen = document.getElementById('dodam-screen');
  dodamScreen.style.display = 'flex';
  setTimeout(() => { dodamScreen.classList.add('slide-in'); }, 10);

  // [한글 주석] 카드 데이터 로드 완료 후 렌더링 (비동기 대기)
  function _renderWhenReady() {
    if (window.allCardsData && window.allCardsData.length > 0) {
      renderDodamTabs();
      renderDodamGrid(currentDodamCategory);
    } else {
      // [한글 주석] 데이터 아직 없으면 로드 트리거 후 재시도
      if (typeof loadCardsData === 'function') loadCardsData();
      setTimeout(_renderWhenReady, 300);
    }
  }
  _renderWhenReady();
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
  // [한글 주석] 조합소 탭이면 별도 렌더링
  if (category === 'workshop') {
    document.querySelectorAll('.dodam-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('[data-category="workshop"]').classList.add('active');
    renderWorkshop();
    return;
  }

  const unlocked = getUnlockedCategories(); // collection.js의 함수 사용

  // 아직 해금되지 않은 카테고리라면 거부
  if (!unlocked.includes(category)) {
    const _T = window.LANG_UI; const _L = window.currentLang || 'ko';
    alert(_T?.dodamLocked?.[_L] || '아직 열리지 않은 도감입니다! 이전 도감을 더 채워주세요.');
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
    const _T = window.LANG_UI; const _L = window.currentLang || 'ko';
    const _t = k => _T?.[k]?.[_L] || _T?.[k]?.ko || '';
    if (unlocked.includes(cat)) {
      tab.classList.remove('locked');
      if (cat === 'plant') tab.textContent = _t('dodamTabPlant');
      if (cat === 'animal') tab.textContent = _t('dodamTabAnimal');
      if (cat === 'artifact') tab.textContent = _t('dodamTabArtifact');
    } else {
      tab.classList.add('locked');
      if (cat === 'animal') tab.textContent = _t('dodamTabAnimalLocked');
      if (cat === 'artifact') tab.textContent = _t('dodamTabArtifactLocked');
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
  const _Ts = window.LANG_UI; const _Ls = window.currentLang || 'ko';
  document.querySelector('.dodam-summary-text').textContent =
    (_Ts?.dodamSummary?.[_Ls] || '{n} / {total} 수집').replace('{n}', collectedCount).replace('{total}', totalCount);
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
      const _Tu = window.LANG_UI; const _Lu = window.currentLang || 'ko';
      cardEl.innerHTML = `
                <div class="dodam-card-icon-unknown">🔒</div>
                <div class="dodam-card-name-unknown">???</div>
                <div class="dodam-card-desc-unknown">${_Tu?.dodamUnknownDesc?.[_Lu] || '미발견'}</div>
            `;
    }
    gridEl.appendChild(cardEl);
  });

  // 2. 100개 기준이므로 남은 빈 칸들(미수집)을 가짜 카드로 채우기
  const emptySlots = totalCount - categoryCards.length;
  for (let i = 0; i < emptySlots; i++) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'dodam-card unknown';
    const _Te = window.LANG_UI; const _Le = window.currentLang || 'ko';
    emptyEl.innerHTML = `
            <div class="dodam-card-icon-unknown">🔒</div>
            <div class="dodam-card-name-unknown">???</div>
            <div class="dodam-card-desc-unknown">${_Te?.dodamUnknownDesc?.[_Le] || '미발견'}</div>
        `;
    gridEl.appendChild(emptyEl);
  }
}

/**
 * 수집한 카드의 상세 정보를 3D 팝업(공통)에 띄웁니다.
 */
function showDodamDetail(card, dateString) {
  // [한글 주석] 팝업 열기 전에 뒷면 상태라면 앞면으로 초기화
  document.getElementById('flip-card-inner').classList.remove('is-flipped');

  // [한글 주석] 도감에서 열 때는 희귀도 이펙트 없이 깔끔하게 표시
  if (typeof clearRarityEffects === 'function') clearRarityEffects();

  // [한글 주석] 카드 이미지 바인딩
  const popupEmojiEl = document.getElementById('popup-emoji');
  popupEmojiEl.style.width = '100%';
  popupEmojiEl.style.height = '100%';
  popupEmojiEl.style.display = 'flex';
  popupEmojiEl.style.alignItems = 'center';
  popupEmojiEl.style.justifyContent = 'center';
  popupEmojiEl.innerHTML = getCardImageHTML(card, 68);

  // [한글 주석] 번역팩에서 즉시 텍스트 가져오기 (API 호출 없음)
  const lang = window.currentLang || 'ko';
  const translated = typeof applyCardTranslation === 'function'
    ? applyCardTranslation(card)
    : { name: card.name, short_desc: card.short_desc, detail_desc: card.detail_desc, habitat: card.habitat };

  // [한글 주석] 번역된 텍스트 폰트 적용
  const langFont = window.LANG_FONTS ? window.LANG_FONTS[lang] : "'Noto Sans KR', sans-serif";

  const nameEl = document.getElementById('popup-name');
  nameEl.textContent = translated.name;
  nameEl.style.fontFamily = langFont;

  const shortDescEl = document.getElementById('popup-short-desc');
  shortDescEl.textContent = translated.short_desc || (lang === 'ko' ? '새로운 발견입니다!' : '...');
  shortDescEl.style.fontFamily = langFont;

  const detailDescEl = document.getElementById('popup-detail-desc');
  detailDescEl.textContent = translated.detail_desc || '';
  detailDescEl.style.fontFamily = langFont;

  // [한글 주석] 서식지 라벨
  const habitatEl = document.getElementById('popup-habitat');
  const h = translated.habitat || '';
  let habitatLabel;
  if (card.category === 'artifact') habitatLabel = `🏛️ ${h}`;
  else if (card.category === 'animal') habitatLabel = `🌿 ${h}`;
  else habitatLabel = `📍 ${h}`;
  habitatEl.textContent = habitatLabel;
  habitatEl.style.fontFamily = langFont;

  // [한글 주석] 수집 날짜
  const _Td = window.LANG_UI; const _Ld = window.currentLang || 'ko';
  document.getElementById('popup-date').textContent = dateString
    ? `📅 ${dateString}`
    : (_Td?.dodamDateDefault?.[_Ld] || '📅 최근 수집');

  // [한글 주석] 희귀도 뱃지 (언어별 텍스트)
  const ui = window.LANG_UI ? window.LANG_UI[lang] : null;
  const rarityBadgeFront = document.getElementById('popup-rarity-badge');
  const rarityBadgeBack = document.getElementById('popup-back-rarity');
  let rarityText = ui ? ui.rarityCommon : '일반';
  let rarityClass = 'badge-common';
  if (card.rarity === 'rare') { rarityText = ui ? ui.rarityRare : '희귀'; rarityClass = 'badge-rare'; }
  else if (card.rarity === 'epic') { rarityText = ui ? ui.rarityEpic : '전설'; rarityClass = 'badge-epic'; }

  rarityBadgeFront.textContent = rarityText;
  rarityBadgeFront.className = `card-badge ${rarityClass}`;
  rarityBadgeBack.textContent = rarityText;
  rarityBadgeBack.className = `card-badge ${rarityClass}`;

  // [한글 주석] 카테고리 뱃지
  const catBadge = document.getElementById('popup-category-badge');
  const catText = ui
    ? { plant: ui.categoryPlant, animal: ui.categoryAnimal, artifact: ui.categoryArtifact }
    : { plant: '🌱 식물', animal: '🦊 동물', artifact: '🏺 유물' };
  if (card.category === 'plant') { catBadge.textContent = catText.plant; catBadge.className = 'badge-category-plant'; }
  else if (card.category === 'animal') { catBadge.textContent = catText.animal; catBadge.className = 'badge-category-animal'; }
  else if (card.category === 'artifact') { catBadge.textContent = catText.artifact; catBadge.className = 'badge-category-artifact'; }

  // [한글 주석] 팝업 버튼 텍스트 언어 적용
  const btnClose = document.querySelector('.btn-close');
  const btnDetail = document.getElementById('btn-detail');
  const btnFlipBack = document.querySelector('.btn-flip-back');
  if (ui) {
    if (btnClose) btnClose.textContent = ui.confirmBtn;
    if (btnDetail) btnDetail.textContent = ui.detailBtn;
    if (btnFlipBack) btnFlipBack.textContent = ui.backBtn;
  }

  // [한글 주석] 카테고리별 버튼 색상
  if (btnDetail) {
    if (card.category === 'plant') btnDetail.style.backgroundColor = '#2d7a2d';
    else if (card.category === 'animal') btnDetail.style.backgroundColor = '#d4870a';
    else if (card.category === 'artifact') btnDetail.style.backgroundColor = '#8B6914';
  }

  // [한글 주석] 도감에서 볼 때는 이모지 반짝임 끄기
  document.getElementById('popup-emoji-container').classList.remove('new-discovery-anim');

  // [한글 주석] 오버레이 표시
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

// [한글 주석] 조합소 렌더링
function renderWorkshop() {
  const gridEl = document.getElementById('dodam-grid');
  gridEl.innerHTML = '';

  // [한글 주석] 수집 현황 요약 업데이트
  const _Tw = window.LANG_UI; const _Lw = window.currentLang || 'ko';
  document.querySelector('.dodam-summary-text').textContent =
    _Tw?.workshopSummary?.[_Lw] || '중복 카드 조합소';
  document.getElementById('dodam-progress').style.width = '0%';

  const workshopCards = typeof getWorkshopCards === 'function' ? getWorkshopCards() : [];
  const allCards = window.allCardsData || [];

  // [한글 주석] 조합소가 비어있을 때
  if (workshopCards.length === 0) {
    const _Twe = window.LANG_UI; const _Lwe = window.currentLang || 'ko';
    const _twe = k => _Twe?.[k]?.[_Lwe] || _Twe?.[k]?.ko || '';
    gridEl.innerHTML = `
      <div style="
        grid-column:1/-1;
        text-align:center;padding:40px 20px;
        color:#888;
      ">
        <div style="font-size:48px;margin-bottom:12px;">⚗️</div>
        <div style="font-size:15px;font-weight:700;color:#aaa;margin-bottom:8px;">
          ${_twe('workshopEmptyTitle')}
        </div>
        <div style="font-size:12px;line-height:1.6;">
          ${_twe('workshopEmptyDesc')}
        </div>
      </div>
    `;
    return;
  }

  // [한글 주석] 선택된 카드 목록 {cardId: 선택장수}
  let selectedForCraft = {};

  // [한글 주석] 선택 현황 업데이트 함수
  function updateWorkshopUI() {
    const totalSelected = Object.values(selectedForCraft).reduce((a, b) => a + b, 0);
    const infoEl = document.getElementById('workshop-selected-info');
    const btnEl = document.getElementById('workshop-craft-btn');
    const _Tsi = window.LANG_UI; const _Lsi = window.currentLang || 'ko';
    if (infoEl) infoEl.textContent = (_Tsi?.workshopSelectedInfo?.[_Lsi] || '선택: {n} / 5장').replace('{n}', totalSelected);
    if (btnEl) btnEl.style.display = totalSelected === 5 ? 'block' : 'none';
  }

  // [한글 주석] 조합 안내 헤더
  const header = document.createElement('div');
  header.style.cssText = `
    grid-column:1/-1;
    background:rgba(255,215,0,0.08);
    border:1px solid rgba(255,215,0,0.3);
    border-radius:12px;
    padding:12px 16px;
    margin-bottom:4px;
  `;
  const _Th = window.LANG_UI; const _Lh = window.currentLang || 'ko';
  const _th = k => _Th?.[k]?.[_Lh] || _Th?.[k]?.ko || '';
  header.innerHTML = `
    <div style="color:#ffd700;font-size:13px;font-weight:700;margin-bottom:4px;">
      ${_th('workshopHeaderTitle')}
    </div>
    <div style="color:#aaa;font-size:11px;line-height:1.5;">
      ${_th('workshopHeaderDesc')}
    </div>
    <div id="workshop-selected-info" style="
      margin-top:8px;
      color:#84ff00;font-size:12px;font-weight:700;
    ">${_th('workshopSelectedInfo').replace('{n}', '0')}</div>
    <button id="workshop-craft-btn" onclick="startCrafting()" style="
      display:none;
      width:100%;margin-top:8px;
      background:linear-gradient(135deg,#ffd700,#ff9500);
      color:#000;border:none;border-radius:10px;
      padding:10px;font-size:14px;font-weight:900;
      cursor:pointer;
    ">${_th('workshopCraftBtn')}</button>
  `;
  gridEl.appendChild(header);

  // [한글 주석] 중복 카드 목록 렌더링
  workshopCards.forEach(({ id, count }) => {
    const card = allCards.find(c => c.id === id);
    if (!card) return;

    const rarityConfig = {
      common: { border: '#84ff00', label: '★ 일반', color: '#84ff00' },
      rare: { border: '#4a9eff', label: '★★ 희귀', color: '#4a9eff' },
      epic: { border: '#ffd700', label: '★★★ 전설', color: '#ffd700' }
    };
    const cfg = rarityConfig[card.rarity] || rarityConfig.common;

    const cardEl = document.createElement('div');
    cardEl.className = 'dodam-card workshop-card';
    cardEl.dataset.cardId = id;
    cardEl.style.cssText = `
      border:2px solid ${cfg.border};
      background:linear-gradient(135deg,#1a1a2e,#16213e);
      border-radius:12px;
      cursor:pointer;
      position:relative;
      transition:transform 0.2s, box-shadow 0.2s;
      overflow:hidden;
    `;

    cardEl.innerHTML = `
      <!-- [한글 주석] 중복 수량 뼓지 -->
      <div style="
        position:absolute;top:4px;right:4px;
        background:#ff4444;color:#fff;
        font-size:10px;font-weight:900;
        border-radius:50%;width:18px;height:18px;
        display:flex;align-items:center;justify-content:center;
        z-index:2;
      ">×${count}</div>

      <!-- [한글 주석] 카드 이름 -->
      <div style="
        background:rgba(0,0,0,0.3);
        color:${cfg.color};font-size:10px;font-weight:700;
        padding:4px;text-align:center;
        border-bottom:1px solid ${cfg.border};
      ">${card.name}</div>

      <!-- [한글 주석] 카드 이미지 -->
      <div style="
        width:100%;aspect-ratio:1;
        display:flex;align-items:center;justify-content:center;
        overflow:hidden;
      ">
        ${typeof getCardImageHTML === 'function'
        ? getCardImageHTML(card, 60)
        : '<div style="font-size:28px;">' + card.emoji + '</div>'}
      </div>

      <!-- [한글 주석] 희귀도 -->
      <div style="
        color:${cfg.color};font-size:9px;font-weight:700;
        text-align:center;padding:3px;
        border-top:1px solid ${cfg.border};
      ">${cfg.label}</div>

      <!-- [한글 주석] 선택 오버레이 -->
      <div class="workshop-select-overlay" style="
        display:none;
        position:absolute;top:0;left:0;right:0;bottom:0;
        background:rgba(255,215,0,0.25);
        border:3px solid #ffd700;
        border-radius:10px;
        z-index:3;
        align-items:center;justify-content:center;
        font-size:24px;
      ">✓</div>
    `;

    // [한글 주석] 카드 선택 클릭 이벤트
    cardEl.addEventListener('click', () => {
      const cardId = cardEl.dataset.cardId;
      const maxSelectable = count; // [한글 주석] 중복 수량만큼만 선택 가능
      const currentSelected = selectedForCraft[cardId] || 0;
      const totalSelected = Object.values(selectedForCraft).reduce((a, b) => a + b, 0);

      if (currentSelected === 0) {
        // [한글 주석] 첫번째 클릭: 1장 선택
        if (totalSelected >= 5) {
          const _Tm = window.LANG_UI; const _Lm = window.currentLang || 'ko';
          if (typeof showSyncToast === 'function') showSyncToast(_Tm?.workshopMaxSelect?.[_Lm] || '5장만 선택할 수 있어요!', 'warning');
          return;
        }
        selectedForCraft[cardId] = 1;
      } else if (currentSelected < maxSelectable && totalSelected < 5) {
        // [한글 주석] 두번째 클릭: 1장 추가 (보유 수량 & 5장 한도 내에서)
        selectedForCraft[cardId] = currentSelected + 1;
      } else {
        // [한글 주석] 마지막 클릭: 선택 취소
        delete selectedForCraft[cardId];
      }

      // [한글 주석] 선택 오버레이 업데이트
      const overlay = cardEl.querySelector('.workshop-select-overlay');
      const selected = selectedForCraft[cardId] || 0;

      if (selected === 0) {
        // [한글 주석] 선택 해제
        overlay.style.display = 'none';
        overlay.textContent = '✓';
        cardEl.style.transform = 'scale(1)';
      } else {
        // [한글 주석] 선택 장수 표시
        overlay.style.display = 'flex';
        overlay.textContent = selected > 1 ? `✓ ×${selected}` : '✓';
        cardEl.style.transform = 'scale(0.95)';
      }

      updateWorkshopUI();
    });

    gridEl.appendChild(cardEl);
  });

  // [한글 주석] 조합 실행 함수 (전역으로 노출)
  window.startCrafting = function () {
    // [한글 주석] 선택된 카드 목록을 장수만큼 펼쳐서 배열로 변환
    const selectedList = [];
    Object.entries(selectedForCraft).forEach(([id, cnt]) => {
      for (let i = 0; i < cnt; i++) selectedList.push(id);
    });

    if (selectedList.length !== 5) return;

    // [한글 주석] 선택된 카드들의 희귀도 분석
    const selectedCards = selectedList.map(id => allCards.find(c => c.id === id)).filter(Boolean);
    const epicCount = selectedCards.filter(c => c.rarity === 'epic').length;
    const rareCount = selectedCards.filter(c => c.rarity === 'rare').length;

    // [한글 주석] 조합 규칙에 따라 결과 희귀도 결정
    let resultRarity;
    const rand = Math.random() * 100;

    if (epicCount >= 1) {
      // [한글 주석] 규칙 1: 전설 1장 이상 → 무조건 전설
      resultRarity = 'epic';
    } else if (rareCount >= 4) {
      // [한글 주석] 규칙 2: 희귀 4~5장 → 전설 50%, 희귀 50%
      resultRarity = rand < 50 ? 'epic' : 'rare';
    } else if (rareCount === 3) {
      // [한글 주석] 규칙 3: 희귀 3장 + 일반 2장 → 희귀 100%
      resultRarity = 'rare';
    } else if (rareCount >= 1) {
      // [한글 주석] 규칙 4: 희귀 1~2장 + 일반 3~4장 → 희귀 60%, 일반 40%
      resultRarity = rand < 60 ? 'rare' : 'common';
    } else {
      // [한글 주석] 규칙 5: 일반 5장 → 일반 75%, 희귀 15%, 전설 10%
      if (rand < 75) resultRarity = 'common';
      else if (rand < 90) resultRarity = 'rare';
      else resultRarity = 'epic';
    }

    // [한글 주석] 해금된 카테고리 확인
    const unlockedCategories = typeof getUnlockedCategories === 'function'
      ? getUnlockedCategories()
      : ['plant'];

    // [한글 주석] 결과 희귀도 + 해금된 카테고리 내 내가 없는 카드 풀
    const collection = getCollection();
    let candidatePool = allCards.filter(c =>
      c.rarity === resultRarity &&
      unlockedCategories.includes(c.category) &&
      !collection.includes(c.id)
    );

    // [한글 주석] 없는 카드가 없으면 중복 허용
    if (candidatePool.length === 0) {
      candidatePool = allCards.filter(c =>
        c.rarity === resultRarity &&
        unlockedCategories.includes(c.category)
      );
    }

    // [한글 주석] 최종 결과 카드 랜덤 선택
    const resultCard = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    if (!resultCard) return;

    // [한글 주석] 사용한 카드 차감
    useDuplicateCards(selectedList);

    // [한글 주석] 결과 카드 획득 처리
    const isNew = !collection.includes(resultCard.id);
    if (isNew) saveCollection(resultCard.id);

    // [한글 주석] 조합 결과 팝업 표시
    showCraftResultPopup(resultCard, isNew, resultRarity);

    // [한글 주석] 조합소 새로고침
    setTimeout(() => {
      renderWorkshop();
      if (typeof window.updateMainScreenData === 'function') window.updateMainScreenData();
      if (typeof updateLevelBadge === 'function') updateLevelBadge();
    }, 2500);
  };
}

// [한글 주석] 조합 결과 팝업
function showCraftResultPopup(card, isNew, resultRarity) {
  const existing = document.getElementById('craft-result-overlay');
  if (existing) existing.remove();

  const rarityConfig = {
    common: { color: '#84ff00', label: '★ 일반', glow: 'rgba(132,255,0,0.4)' },
    rare: { color: '#4a9eff', label: '★★ 희귀', glow: 'rgba(74,158,255,0.4)' },
    epic: { color: '#ffd700', label: '★★★ 전설', glow: 'rgba(255,215,0,0.5)' }
  };
  const cfg = rarityConfig[card.rarity] || rarityConfig.common;

  const overlay = document.createElement('div');
  overlay.id = 'craft-result-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.9);
    z-index:99999;
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    padding:24px;
    animation:fadeIn 0.3s ease;
  `;

  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1a1a2e,#16213e);
      border:3px solid ${cfg.color};
      border-radius:24px;
      padding:28px 24px;
      text-align:center;
      max-width:300px;width:90%;
      box-shadow:0 0 40px ${cfg.glow};
      animation:bounceIn 0.5s ease;
    ">
      <div style="font-size:28px;margin-bottom:4px;">⚗️</div>
      <div style="color:${cfg.color};font-size:16px;font-weight:900;margin-bottom:4px;" id="craft-success-title"></div>
      <div style="color:#aaa;font-size:11px;margin-bottom:16px;" id="craft-success-desc"></div>

      <!-- [한글 주석] 결과 카드 -->
      <div style="
        background:rgba(0,0,0,0.3);
        border:2px solid ${cfg.color};
        border-radius:16px;
        padding:16px;
        margin-bottom:16px;
        box-shadow:0 0 20px ${cfg.glow};
      ">
        <div style="
          width:100px;height:100px;
          margin:0 auto 8px;
          border-radius:12px;overflow:hidden;
          display:flex;align-items:center;justify-content:center;
        ">
          ${typeof getCardImageHTML === 'function'
      ? getCardImageHTML(card, 100)
      : '<div style="font-size:48px;">' + card.emoji + '</div>'}
        </div>
        <div style="color:#fff;font-size:16px;font-weight:700;margin-bottom:4px;">
          ${card.name}
        </div>
        <div style="color:${cfg.color};font-size:12px;margin-bottom:6px;">
          ${cfg.label}
        </div>
        <div style="color:#ccc;font-size:11px;line-height:1.5;">
          ${card.short_desc || ''}
        </div>
      </div>

      <button onclick="document.getElementById('craft-result-overlay').remove()" style="
        background:${cfg.color};
        color:#000;border:none;border-radius:12px;
        padding:12px 40px;
        font-size:15px;font-weight:900;
        cursor:pointer;width:100%;
      " id="craft-confirm-btn"></button>
    </div>
  `;

  document.body.appendChild(overlay);
  const _Tcr = window.LANG_UI; const _Lcr = window.currentLang || 'ko';
  const _tcr = k => _Tcr?.[k]?.[_Lcr] || _Tcr?.[k]?.ko || '';
  const crT = document.getElementById('craft-success-title');
  const crD = document.getElementById('craft-success-desc');
  const crB = document.getElementById('craft-confirm-btn');
  if (crT) crT.textContent = _tcr('craftSuccess');
  if (crD) crD.textContent = isNew ? _tcr('craftNewCard') : _tcr('craftDupCard');
  if (crB) crB.textContent = _tcr('craftConfirm');
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

  // [한글 주석] 새 카드면 NEW! 이펙트 표시
  if (isNew && typeof showNewCardEffect === 'function') {
    setTimeout(() => showNewCardEffect(card), 300);
  }
}

window.renderWorkshop = renderWorkshop;
window.showCraftResultPopup = showCraftResultPopup;
