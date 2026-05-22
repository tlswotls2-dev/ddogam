// js/collection.js

// --- 랜덤 수집 확률 및 해금 조건 상수 모음 ---
// [한글 주석] 희귀도별 등장 확률 (합계 100%)
const RARITY_CHANCE = {
    common: 0.65, // [한글 주석] 일반 등급 등장 확률 (65%)
    rare: 0.25,   // [한글 주석] 희귀 등급 등장 확률 (25%)
    epic: 0.10    // [한글 주석] 전설 등급 등장 확률 (10%)
};

// [한글 주석] 희귀도별 가중 랜덤 뽑기
// 일반 65%, 희귀 25%, 전설 10%
function getWeightedRandomCard(cards) {
  const rand = Math.random() * 100;
  let rarityPool;

  if (rand < 65) {
    // [한글 주석] 65% - 일반 카드
    rarityPool = cards.filter(c => c.rarity === 'common');
  } else if (rand < 90) {
    // [한글 주석] 25% - 희귀 카드
    rarityPool = cards.filter(c => c.rarity === 'rare');
  } else {
    // [한글 주석] 10% - 전설 카드
    rarityPool = cards.filter(c => c.rarity === 'epic');
  }

  // [한글 주석] 해당 희귀도 카드 없으면 전체에서 랜덤
  if (!rarityPool || rarityPool.length === 0) {
    rarityPool = cards;
  }

  return rarityPool[Math.floor(Math.random() * rarityPool.length)];
}

const UNLOCK_CONDITION_ANIMAL = 90;   // 식물 90개 이상 수집 시 동물 해금
const UNLOCK_CONDITION_ARTIFACT = 90; // 동물 90개 이상 수집 시 유물 해금

// 카드 데이터를 메모리에 담아둘 전역 배열 (도감에서도 접근 가능하게 window 객체 사용)
window.allCardsData = [];

/**
 * 카드의 이미지 HTML 코드를 생성합니다.
 * 이미지 파일이 존재하면 실사 이미지를 표시하고, 존재하지 않으면 기존 이모지를 폴백으로 표시합니다.
 * @param {Object} card - 카드 데이터 객체
 * @param {number} [fontSize=36] - 폴백 이모지의 폰트 크기 (기본값: 36)
 * @returns {string} 렌더링될 HTML 문자열
 */
function getCardImageHTML(card, fontSize = 36) {
  const imgPath = `images/${card.category}/${card.id}.png`;
  return `
    <img src="${imgPath}" alt="${card.name}"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      style="width:100%;height:100%;object-fit:contain;">
    <span style="display:none;font-size:${fontSize}px;width:100%;height:100%;
      align-items:center;justify-content:center;">${card.emoji}</span>
  `;
}

/**
 * 앱 시작 시 cards.json 파일에서 전체 카드 목록을 불러와 캐싱합니다.
 */
async function loadCardsData() {
    try {
        // [한글 주석] 브라우저가 이전의 cards.json 파일(habitat, short_desc 필드가 누락되었던 버전 등)을 
        // 캐싱하여 새로운 필드가 노출되지 않던 문제를 예방하기 위해, 타임스탬프 기반의 쿼리 매개변수(?v=...)를 추가하여 
        // 항상 서버 또는 파일시스템에서 최신 cards.json 데이터를 무조건 새로 읽어오도록 캐시 버스팅(Cache Busting)을 적용합니다.
        const response = await fetch('data/cards.json?v=' + Date.now());
        const data = await response.json();
        
        // [한글 주석] 각 카테고리별 데이터를 변수에 할당합니다.
        const plantCards = data.plant || [];
        const animalCards = data.animal || [];
        const artifactCards = data.artifact || [];

        // [한글 주석] 브라우저 콘솔에 각 카테고리별 카드 수를 정밀하게 출력합니다.
        console.log('식물 카드 수:', plantCards.length);
        console.log('동물 카드 수:', animalCards.length);
        console.log('유물 카드 수:', artifactCards.length);

        // 개별 카테고리 배열들을 하나의 1차원 배열로 병합하여 저장합니다.
        window.allCardsData = [
            ...plantCards,
            ...animalCards,
            ...artifactCards
        ];
    } catch (error) {
        console.error("카드 데이터를 불러오는 중 오류 발생:", error);
    }
}


/**
 * [한글 주석] 카드 3장 선택 모드 팝업 표시
 * 3장의 카드 중 1장을 골라 도감에 추가하는 인터랙티브 팝업입니다.
 * 실제 이미지와 희귀도별 디자인(일반/희귀/전설)을 적용합니다.
 * @param {Array} cards - 선택지로 보여줄 카드 3장 배열
 * @param {Function} onChoice - 카드 선택 완료 시 호출될 콜백 함수
 */
function showCardChoicePopup(cards, onChoice) {
  // [한글 주석] 기존 팝업 있으면 제거
  const existing = document.getElementById('card-choice-overlay');
  if (existing) existing.remove();

  // [한글 주석] 희귀도별 색상 설정
  const rarityConfig = {
    common: {
      border: '#84ff00',
      glow: 'rgba(132,255,0,0.4)',
      bg: 'linear-gradient(135deg, #1a2e1a, #0f1c0f)',
      label: '★ 일반',
      labelColor: '#84ff00',
      headerBg: '#1a3a1a'
    },
    rare: {
      border: '#4a9eff',
      glow: 'rgba(74,158,255,0.4)',
      bg: 'linear-gradient(135deg, #1a1f3a, #0f1525)',
      label: '★★ 희귀',
      labelColor: '#4a9eff',
      headerBg: '#1a2a4a'
    },
    epic: {
      border: '#ffd700',
      glow: 'rgba(255,215,0,0.5)',
      bg: 'linear-gradient(135deg, #2a1a0a, #1a0f05)',
      label: '★★★ 전설',
      labelColor: '#ffd700',
      headerBg: '#3a2a0a'
    }
  };

  // [한글 주석] 오버레이 생성
  const overlay = document.createElement('div');
  overlay.id = 'card-choice-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.92);
    z-index:99999;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    padding:16px;
    gap:12px;
  `;

  // [한글 주석] 팝업 내부 HTML 구성
  overlay.innerHTML = `
    <div style="
      color:#ffd700;font-size:18px;font-weight:900;
      text-align:center;
      text-shadow:0 0 20px rgba(255,215,0,0.5);
    ">✨ 카드를 선택하세요! ✨</div>
    <div style="color:#aaa;font-size:12px;text-align:center;margin-bottom:4px;">
      1장을 골라 도감에 추가해요
    </div>
    <div id="card-choice-row" style="
      display:flex;gap:10px;
      justify-content:center;
      width:100%;max-width:360px;
    "></div>
  `;

  document.body.appendChild(overlay);
  const row = document.getElementById('card-choice-row');

  // [한글 주석] 카드 3장 생성 (각 카드마다 희귀도별 디자인 적용)
  cards.forEach((card, idx) => {
    const cfg = rarityConfig[card.rarity] || rarityConfig.common;

    const cardEl = document.createElement('div');
    cardEl.className = 'choice-card';
    // [한글 주석] 뒤집기 전 카드는 희귀도 숨기기 위해 모두 동일한 색상으로 통일
    cardEl.style.cssText = `
      flex:1;
      max-width:106px;
      border-radius:14px;
      border:2px solid #4a6fa5;
      background:linear-gradient(135deg, #1a2234, #0f1525);
      box-shadow:0 0 10px rgba(74,111,165,0.3);
      display:flex;flex-direction:column;
      overflow:hidden;
      cursor:pointer;
      transition:transform 0.2s, box-shadow 0.2s;
      position:relative;
    `;

    // [한글 주석] 카드 HTML - 도감 스타일 (이미지 + 희귀도 라벨)
    cardEl.innerHTML = `
      <!-- [한글 주석] 카드 상단 헤더 (카드 이름) -->
      <div class="choice-header" style="
        background:#1a2234;
        color:#4a6fa5;
        font-size:10px;font-weight:700;
        padding:5px 4px;text-align:center;
        border-bottom:1px solid #4a6fa5;
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      ">???</div>

      <!-- [한글 주석] 카드 이미지 영역 -->
      <div class="choice-img-wrap" style="
        width:100%;aspect-ratio:1;
        display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,0.3);
        position:relative;overflow:hidden;
        font-size:36px;
      ">
        <!-- [한글 주석] 물음표 (선택 전) -->
        <div class="choice-question" style="
          font-size:36px;
          animation:choicePulse 1s ease infinite alternate;
        ">❓</div>
        <!-- [한글 주석] 실제 이미지 (선택 후 공개) -->
        <div class="choice-img-front" style="display:none;width:100%;height:100%;">
          ${typeof getCardImageHTML === 'function'
            ? getCardImageHTML(card, 80)
            : '<div style="font-size:36px;">' + card.emoji + '</div>'}
        </div>
      </div>

      <!-- [한글 주석] 카드 하단 (희귀도 + 설명) -->
      <div class="choice-footer" style="
        padding:5px 4px;
        display:flex;flex-direction:column;gap:2px;
      ">
        <!-- [한글 주석] 희귀도 라벨 -->
        <div style="
          color:#4a6fa5;
          font-size:9px;font-weight:700;
          text-align:center;
        ">???</div>
        <!-- [한글 주석] 짧은 설명 -->
        <div class="choice-desc" style="
          color:#999;font-size:9px;
          text-align:center;line-height:1.3;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
        ">탭해서 선택</div>
      </div>
    `;

    // [한글 주석] 카드 선택 이벤트
    cardEl.addEventListener('click', () => {
      // [한글 주석] 이미 선택 중이면 무시
      if (overlay.dataset.choosing) return;
      overlay.dataset.choosing = 'true';

      // [한글 주석] 모든 카드 앞면 공개
      document.querySelectorAll('.choice-card').forEach((el, i) => {
        const question = el.querySelector('.choice-question');
        const imgFront = el.querySelector('.choice-img-front');
        const header = el.querySelector('.choice-header');
        const footer = el.querySelector('.choice-footer');
        const desc = el.querySelector('.choice-desc');
        const c = cards[i];
        const cf = rarityConfig[c.rarity] || rarityConfig.common;

        // [한글 주석] 물음표 숨기고 이미지 공개
        if (question) question.style.display = 'none';
        if (imgFront) imgFront.style.display = 'flex';

        // [한글 주석] 카드 이름/희귀도 공개
        if (header) {
          header.textContent = c.name;
          header.style.color = cf.labelColor;
        }
        if (footer) {
          const rarityLabel = footer.querySelector('div:first-child');
          if (rarityLabel) {
            rarityLabel.textContent = cf.label;
            rarityLabel.style.color = cf.labelColor;
          }
        }
        if (desc) {
          desc.textContent = c.short_desc || c.habitat || '';
        }

        // [한글 주석] 선택 안 된 카드는 흐리게
        if (i !== idx) {
          el.style.opacity = '0.35';
          el.style.filter = 'grayscale(50%)';
          el.style.transform = 'scale(0.95)';
        } else {
          // [한글 주석] 선택된 카드 강조
          el.style.border = '3px solid ' + cf.border;
          el.style.boxShadow = '0 0 30px ' + cf.glow + ', 0 0 60px ' + cf.glow;
          el.style.transform = 'scale(1.06)';
        }
      });

      // [한글 주석] 1.2초 후 팝업 닫고 선택 카드 처리
      setTimeout(() => {
        overlay.remove();
        onChoice(card);
      }, 1200);
    });

    row.appendChild(cardEl);
  });
}

/**
 * [한글 주석] 랜덤으로 아이템 1개를 뽑는 메인 로직입니다. (걸음 수를 달성했을 때 호출됨)
 */
function drawRandomItem() {
    // 데이터가 아직 로드되지 않았다면 무시 (초기화 보장)
    if (!window.allCardsData || window.allCardsData.length === 0) {
        console.warn("아직 카드 데이터가 로드되지 않았습니다.");
        return;
    }

    const unlockedCategories = getUnlockedCategories();
    
    // 현재 선택된 탭 카테고리 가져오기 (기본값: 식물)
    let activeCategory = window.currentCategory || 'plant';
    
    // 만약 해당 카테고리가 아직 해금되지 않았다면 'plant'로 fallback 처리
    if (!unlockedCategories.includes(activeCategory)) {
        activeCategory = 'plant';
    }
    
    // [한글 주석] 1. 현재 카테고리에 속하는 카드들만 필터링하여 뽑기 풀에 포함
    const availableCards = window.allCardsData.filter(card => card.category === activeCategory);
    
    // [한글 주석] 2. 희귀도별 가중 랜덤 뽑기 함수를 사용하여 카드 등급 결정 (common 65%, rare 25%, epic 10%)
    const selectedCard = getWeightedRandomCard(availableCards);
    const selectedRarity = selectedCard.rarity;
    
    // [한글 주석] 3. 선택된 등급에 해당하는 카드 중에서 미수집 카드에 가중치를 부여
    let candidateCards = availableCards.filter(card => card.rarity === selectedRarity);
    
    // [한글 주석] (예외 처리) 만약 해당 등급의 카드가 하나도 없다면 전체 사용가능 카드로 대체
    if (candidateCards.length === 0) {
        candidateCards = availableCards;
    }
    
    // [한글 주석] 4. 수집 여부에 따른 등장 확률 가중치 조절
    const collection = getCollection();
    const weightedCards = [];
    
    candidateCards.forEach(card => {
        // [한글 주석] 이미 수집한 카드는 1개의 제비표, 안 모은 카드는 5개의 제비표를 넣어 확률을 높임
        const weight = collection.includes(card.id) ? 1 : 5;
        for (let i = 0; i < weight; i++) {
            weightedCards.push(card);
        }
    });
    
    // [한글 주석] 5. 최종 랜덤 뽑기
    const randomIndex = Math.floor(Math.random() * weightedCards.length);
    const resultCard = weightedCards[randomIndex];
    
    // [한글 주석] 30% 확률로 카드 3장 선택 모드 발동
    const isChoiceMode = Math.random() < 0.30;

    if (isChoiceMode) {
      // [한글 주석] 카드 3장 뽑기 (각각 독립적으로 가중 랜덤)
      const choiceCards = [];
      const usedIds = new Set();

      for (let i = 0; i < 3; i++) {
        let picked = getWeightedRandomCard(availableCards);
        // [한글 주석] 중복 카드 방지 (최대 10회 시도)
        let attempts = 0;
        while (usedIds.has(picked.id) && attempts < 10) {
          picked = getWeightedRandomCard(availableCards);
          attempts++;
        }
        usedIds.add(picked.id);
        choiceCards.push(picked);
      }

      // [한글 주석] 선택 팝업 표시 - 선택 완료 시 일반 획득 로직 실행
      showCardChoicePopup(choiceCards, (selectedCard) => {
        // [한글 주석] 중복 카드 처리 - 이미 있으면 조합소로
        const cardResult = typeof addCardWithDuplicate === 'function'
          ? addCardWithDuplicate(selectedCard.id)
          : 'new';
        const isNew = cardResult === 'new';
        if (isNew) {
          if (typeof showNewCardEffect === 'function') {
            showNewCardEffect(selectedCard);
          }
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                saveCollectionLocation(selectedCard.id, position.coords.latitude, position.coords.longitude);
                if (typeof addCollectionMarker === 'function') {
                  addCollectionMarker(position.coords.latitude, position.coords.longitude, selectedCard);
                }
              },
              () => console.log('위치 정보 없이 카드 저장'),
              { enableHighAccuracy: true, timeout: 5000 }
            );
          }
        }

        // [한글 주석] 효과음 재생
        if (localStorage.getItem('soundMode') !== 'off') {
          try {
            playItemSound(selectedCard.rarity || 'common');
          } catch(e) {
            console.log('소리 재생 실패:', e);
          }
        }

        // [한글 주석] 기존 카드 팝업 표시
        showCardPopup(selectedCard, isNew);

        // [한글 주석] 해금 조건 체크
        if (isNew && typeof checkAndUnlockItems === 'function') checkAndUnlockItems();
        if (isNew && typeof checkAndUnlockPets === 'function') checkAndUnlockPets();
        if (typeof window.updateMainScreenData === 'function') window.updateMainScreenData();
        if (typeof updateLevelBadge === 'function') updateLevelBadge();
      });

      return; // [한글 주석] 선택 모드면 여기서 종료
    }

    // [한글 주석] 6. 결과 저장 및 팝업 띄우기 (일반 모드)
    // [한글 주석] 중복 카드 처리 - 이미 있으면 조합소로
    const cardResult = typeof addCardWithDuplicate === 'function'
      ? addCardWithDuplicate(resultCard.id)
      : 'new';
    const isNew = cardResult === 'new';
    if (isNew) {
        
        // [한글 주석] 새 카드 수집 시 NEW! 이펙트 호출
        if (typeof showNewCardEffect === 'function') {
            showNewCardEffect(resultCard);
        }
        
        // 수집한 위치(GPS)도 함께 저장 (위치 권한이 없으면 조용히 건너뜀)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    // storage.js 함수로 위치 저장
                    saveCollectionLocation(resultCard.id, lat, lng);
                    // 지도가 열려있다면 마커도 즉시 추가
                    if (typeof addCollectionMarker === 'function') {
                        addCollectionMarker(lat, lng, resultCard);
                    }
                },
                () => {
                    // 위치 권한 거부 또는 오류 시 위치 없이 저장 (오류 발생 안 함)
                    console.log('위치 정보 없이 카드가 저장되었습니다.');
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    }
    
    // [한글 주석] 팝업 표시 직전에 아이템 출현 효과음 및 진동 재생 (소리 모드가 꺼져있지 않은 경우에만)
    if (localStorage.getItem('soundMode') !== 'off') {
        try {
            playItemSound(resultCard.rarity || 'common');
        } catch(e) {
            console.log('소리 재생 실패:', e);
        }
    }
    
    showCardPopup(resultCard, isNew);

    // 새 카드를 수집했을 때 아바타 아이템 해금 조건 체크
    if (isNew && typeof checkAndUnlockItems === 'function') {
        checkAndUnlockItems();
    }
    
    // [펫 시스템] 새 카드를 수집했을 때 펫 해금 조건 체크
    if (isNew && typeof checkAndUnlockPets === 'function') {
        checkAndUnlockPets();
    }
}

/**
 * [한글 주석] 뽑은 카드의 정보를 3D 플립 카드 팝업에 표시합니다.
 * 희귀도에 따라 화려한 이펙트(테두리 색상, 파티클, 플래시, 진동 등)를 동적으로 추가합니다.
 * @param {Object} card - 카드 데이터 객체
 * @param {boolean} isNew - 새로운 발견 여부
 */
function showCardPopup(cardParam, isNew) {
    const overlay = document.getElementById('shared-card-overlay');
    
    // [한글 주석] cardParam이 문자열(ID)인 경우와 객체(cardData)인 경우를 모두 완벽히 대응하여 window.allCardsData 원본 데이터를 우선 참조하도록 보장합니다.
    let card = null;
    if (typeof cardParam === 'string') {
        card = window.allCardsData.find(c => c.id === cardParam);
    } else if (cardParam && typeof cardParam === 'object') {
        card = window.allCardsData.find(c => c.id === cardParam.id) || cardParam;
    }
    
    if (!card) {
        console.error("카드 데이터를 찾을 수 없습니다:", cardParam);
        return;
    }
    
    // [한글 주석] 팝업이 열릴 때 콘솔에 정밀한 카드 구조화 데이터를 출력합니다.
    console.log('팝업 데이터:', {
        name: card.name,
        short: card.short_desc,
        detail: card.detail_desc,
        habitat: card.habitat
    });

    // [한글 주석] 팝업 열기 전에 뒷면 상태라면 앞면으로 초기화
    document.getElementById('flip-card-inner').classList.remove('is-flipped');
    
    // [한글 주석] 이전 희귀도 이펙트 클래스 모두 제거 (초기화)
    clearRarityEffects();
    
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
    // [한글 주석] 카테고리별 서식지 라벨 스마트 교체
    // 유물이면 habitat 내용에 따라 라벨 자동 결정
    window.getHabitatLabel = function(card) {
        if (card.category !== 'artifact') {
            return `📍 서식지: ${card.habitat || '알 수 없음'}`;
        }
        const h = card.habitat || '';
        // [한글 주석] 시대 키워드 포함 여부 확인
        const eraKeywords = ['시대', 'BC', 'AD', '세기', '년대', '왕조', '조선', '고려', '신라', '백제', '가야', '고구려', '조선시대', '고려시대'];
        const placeKeywords = ['도', '시', '군', '구', '읍', '면', '리', '산', '강', '궁', '절', '사', '성', '터'];
        const locationKeywords = ['박물관', '소장', '전시', '국립', '보관'];

        const isEra = eraKeywords.some(k => h.includes(k));
        const isLocation = locationKeywords.some(k => h.includes(k));
        const isPlace = placeKeywords.some(k => h.includes(k));

        if (isEra) return `🏛️ 시대: ${h}`;
        if (isLocation) return `📌 현재위치: ${h}`;
        if (isPlace) return `📍 발견장소: ${h}`;
        return `🏛️ 정보: ${h}`;
    };

    document.getElementById('popup-habitat').textContent = window.getHabitatLabel(card);
    
    // 뒷면 데이터 바인딩
    document.getElementById('popup-back-name').textContent = card.name;
    document.getElementById('popup-detail-desc').textContent = card.detail_desc || ''; // detail_desc 필드 단일 참조
    
    // 탐험 중 새로 발견 시에는 '방금 수집'으로 표시 (수집 날짜 란)
    document.getElementById('popup-date').textContent = '📅 방금 수집';
    
    // 희귀도 뱃지 세팅 (앞/뒷면 공통)
    const rarityBadgeFront = document.getElementById('popup-rarity-badge');
    const rarityBadgeBack = document.getElementById('popup-back-rarity');
    let rarityText = '일반', rarityClass = 'badge-common';
    if (card.rarity === 'rare') { rarityText = '희귀'; rarityClass = 'badge-rare'; }
    else if (card.rarity === 'epic') { rarityText = '전설'; rarityClass = 'badge-epic'; }
    
    rarityBadgeFront.textContent = rarityText;
    rarityBadgeFront.className = `card-badge ${rarityClass}`;
    rarityBadgeBack.textContent = rarityText;
    rarityBadgeBack.className = `card-badge ${rarityClass}`;
    
    // 카테고리 뱃지 세팅 (앞면)
    const catBadge = document.getElementById('popup-category-badge');
    if (card.category === 'plant') { catBadge.textContent = '🌱 식물'; catBadge.className = 'badge-category-plant'; }
    else if (card.category === 'animal') { catBadge.textContent = '🦊 동물'; catBadge.className = 'badge-category-animal'; }
    else if (card.category === 'artifact') { catBadge.textContent = '🏺 유물'; catBadge.className = 'badge-category-artifact'; }
    
    // 새로운 발견 시 이모지 반짝임 애니메이션
    const emojiContainer = document.getElementById('popup-emoji-container');
    emojiContainer.classList.remove('new-discovery-anim');
    if (isNew) {
        // DOM 렌더링 후 애니메이션 적용을 위해 약간의 지연
        setTimeout(() => { emojiContainer.classList.add('new-discovery-anim'); }, 10);
    }
    
    // 버튼 색상 (카테고리 색상에 맞춤)
    const btnDetail = document.getElementById('btn-detail');
    if (card.category === 'plant') btnDetail.style.backgroundColor = '#2d7a2d';
    else if (card.category === 'animal') btnDetail.style.backgroundColor = '#d4870a';
    else if (card.category === 'artifact') btnDetail.style.backgroundColor = '#8B6914';
    
    // ============================================
    // [한글 주석] ★ 희귀도별 이펙트 적용 시작 ★
    // ============================================
    const rarity = card.rarity || 'common';
    
    // [한글 주석] 오버레이에 희귀도 이펙트 클래스 추가 (CSS 애니메이션 연동)
    overlay.classList.add(`rarity-effect-${rarity}`);
    
    // [한글 주석] rare (희귀): 별 파티클 3개 흩날림
    if (rarity === 'rare') {
        spawnParticles(overlay, 3, 'star', '★');
    }
    
    // [한글 주석] epic (전설): 금색 파티클 8개 + 흰색 플래시 + "전설 카드 등장!" 텍스트 + 진동
    if (rarity === 'epic') {
        // 1. 화면 전체 흰색 플래시 효과
        const flash = document.createElement('div');
        flash.className = 'epic-flash-overlay';
        document.body.appendChild(flash);
        // [한글 주석] 플래시 애니메이션 종료 후 DOM에서 자동 제거
        flash.addEventListener('animationend', () => flash.remove());
        
        // 2. 팝업 상단에 "🎊 전설 카드 등장! 🎊" 텍스트
        const legendText = document.createElement('div');
        legendText.className = 'epic-legendary-text';
        legendText.textContent = '🎊 전설 카드 등장! 🎊';
        overlay.appendChild(legendText);
        
        // 3. 금색 파티클 8개 흩날림
        spawnParticles(overlay, 8, 'gold', '✦');
        
        // 4. 진동 효과 (지원하는 기기만)
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
    }
    
    // 팝업 오버레이 표시
    overlay.style.display = 'flex';
}

/**
 * [한글 주석] 희귀도 파티클을 동적으로 생성합니다.
 * @param {HTMLElement} container - 파티클이 추가될 컨테이너 요소
 * @param {number} count - 생성할 파티클 개수
 * @param {string} type - 파티클 종류 ('star' 또는 'gold')
 * @param {string} symbol - 파티클에 표시할 텍스트/이모지
 */
function spawnParticles(container, count, type, symbol) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = `rarity-particle ${type}`;
        particle.textContent = symbol;
        
        // [한글 주석] 파티클을 화면 내 랜덤 위치에 배치
        const randomLeft = 10 + Math.random() * 80; // 가로 10% ~ 90% 사이
        const randomTop = 20 + Math.random() * 60;  // 세로 20% ~ 80% 사이
        particle.style.left = `${randomLeft}%`;
        particle.style.top = `${randomTop}%`;
        
        // [한글 주석] CSS 커스텀 속성으로 좌우 드리프트 방향을 랜덤으로 설정
        const driftX = (Math.random() - 0.5) * 60; // -30px ~ +30px 범위
        particle.style.setProperty('--drift-x', `${driftX}px`);
        
        // [한글 주석] 파티클마다 약간의 등장 딜레이를 줘 연출감 향상
        particle.style.animationDelay = `${i * 0.15}s`;
        
        container.appendChild(particle);
        
        // [한글 주석] 애니메이션 종료 후 DOM에서 자동 제거 (메모리 누수 방지)
        particle.addEventListener('animationend', () => particle.remove());
    }
}

/**
 * [한글 주석] 이전 희귀도 이펙트를 모두 정리하여 초기화합니다.
 * 팝업을 닫거나 새로운 팝업을 열 때 호출합니다.
 */
function clearRarityEffects() {
    const overlay = document.getElementById('shared-card-overlay');
    
    // [한글 주석] 희귀도 이펙트 클래스 일괄 제거
    overlay.classList.remove('rarity-effect-common', 'rarity-effect-rare', 'rarity-effect-epic');
    
    // [한글 주석] 전설 텍스트 요소 제거
    const legendText = overlay.querySelector('.epic-legendary-text');
    if (legendText) legendText.remove();
    
    // [한글 주석] 남아있는 파티클 모두 제거
    overlay.querySelectorAll('.rarity-particle').forEach(p => p.remove());
    
    // [한글 주석] 이모지 회전 애니메이션 초기화
    const emojiEl = document.getElementById('popup-emoji');
    if (emojiEl) emojiEl.style.animation = '';
}

/**
 * [한글 주석] 공통 카드 팝업창을 닫고 메인 화면 데이터를 갱신합니다.
 * 팝업을 닫을 때 남아있는 희귀도 이펙트 요소들도 깔끔하게 정리합니다.
 */
function closeCardPopup() {
    // [한글 주석] 이펙트 정리 (파티클, 전설 텍스트, 클래스 등)
    clearRarityEffects();
    
    document.getElementById('shared-card-overlay').style.display = 'none';
    
    // 수집 현황 갱신
    if (typeof window.updateMainScreenData === 'function') {
        window.updateMainScreenData();
    }
}

/**
 * 카드를 뒷면으로 뒤집는 함수
 */
function flipCard() {
    document.getElementById('flip-card-inner').classList.add('is-flipped');
}

/**
 * 카드를 앞면으로 다시 뒤집는 함수
 */
function unflipCard() {
    document.getElementById('flip-card-inner').classList.remove('is-flipped');
}

/**
 * [한글 주석] 아이템 발견 시 희귀도별 효과음과 진동을 재생합니다.
 * @param {string} rarity - 아이템 희귀도 ('common', 'rare', 'epic')
 */
function playItemSound(rarity) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  
  if (rarity === 'common') {
    // [한글 주석] 경쾌한 2음 멜로디
    const notes = [523, 659]; // C5, E5
    const durations = [0.15, 0.25];
    let time = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + durations[i]);
      osc.start(time);
      osc.stop(time + durations[i]);
      time += durations[i];
    });
    // [한글 주석] 진동 효과
    navigator.vibrate && navigator.vibrate([100, 50, 100]);
    
  } else if (rarity === 'rare') {
    // [한글 주석] 신나는 3음 멜로디
    const notes = [523, 659, 784]; // C5, E5, G5
    const durations = [0.15, 0.15, 0.3];
    let time = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + durations[i]);
      osc.start(time);
      osc.stop(time + durations[i]);
      time += durations[i];
    });
    // [한글 주석] 진동 효과
    navigator.vibrate && navigator.vibrate([100, 50, 100, 50, 200]);
    
  } else if (rarity === 'epic') {
    // [한글 주석] 화려한 5음 팡파레
    const notes = [523, 659, 784, 1047, 1319]; // C5~E6
    const durations = [0.12, 0.12, 0.12, 0.12, 0.4];
    let time = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + durations[i]);
      osc.start(time);
      osc.stop(time + durations[i]);
      time += durations[i];
    });
    // [한글 주석] 진동 효과
    navigator.vibrate && navigator.vibrate([200, 100, 200, 100, 200, 100, 400]);
  }
}

// [한글 주석] 새 카드 수집 시 NEW! 이펙트 표시
function showNewCardEffect(card) {
  // [한글 주석] 기존 이펙트 있으면 제거
  const existing = document.getElementById('new-card-effect');
  if (existing) existing.remove();

  const effect = document.createElement('div');
  effect.id = 'new-card-effect';
  effect.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 99999;
    pointer-events: none;
    text-align: center;
    animation: newCardEffectAnim 2s ease forwards;
  `;

  // [한글 주석] 희귀도별 색상
  const rarityColor = {
    epic:   '#ffd700',
    rare:   '#4a9eff',
    common: '#84ff00'
  }[card.rarity] || '#84ff00';

  // [한글 주석] 희귀도 텍스트 - 별과 등급명 사이 줄바꿈
  const rarityText = {
    epic:   '★★★<br>전설 NEW!',
    rare:   '★★<br>희귀 NEW!',
    common: '★<br>일반 NEW!'
  }[card.rarity] || 'NEW!';

  effect.innerHTML = `
    <div style="
      background: rgba(0,0,0,0.85);
      border: 3px solid ${rarityColor};
      border-radius: 20px;
      padding: 16px 32px;
      box-shadow: 0 0 40px ${rarityColor}88;
    ">
      <div style="
        color: ${rarityColor};
        font-size: 28px;
        font-weight: 900;
        letter-spacing: 4px;
        text-shadow: 0 0 20px ${rarityColor};
      ">${rarityText}</div>
      <div style="
        color: #fff;
        font-size: 16px;
        font-weight: 700;
        margin-top: 6px;
      ">${card.name}</div>
    </div>
  `;

  document.body.appendChild(effect);

  // [한글 주석] 2초 후 자동 제거
  setTimeout(() => {
    const el = document.getElementById('new-card-effect');
    if (el) el.remove();
  }, 2000);
}

// [한글 주석] 전역 노출
window.showNewCardEffect = showNewCardEffect;
