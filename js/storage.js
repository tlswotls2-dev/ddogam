// LocalStorage 관리 함수들을 모아둔 파일입니다.

/**
 * 사용자 데이터를 로컬 스토리지에 저장합니다.
 * @param {Object} data - 저장할 사용자 데이터 객체
 */
function saveUserData(data) {
    // 객체를 JSON 문자열로 변환하여 저장
    localStorage.setItem('userData', JSON.stringify(data));
}

/**
 * 로컬 스토리지에서 사용자 데이터를 불러옵니다.
 * @returns {Object|null} 저장된 사용자 데이터 객체 또는 데이터가 없을 경우 null
 */
function loadUserData() {
    // 저장된 JSON 문자열을 가져옴
    const dataString = localStorage.getItem('userData');
    // 문자열이 있으면 객체로 변환하여 반환, 없으면 null 반환
    return dataString ? JSON.parse(dataString) : null;
}

/**
 * 새로 수집한 카드의 ID를 컬렉션에 추가하고 저장합니다.
 * @param {string} cardId - 수집한 카드의 ID
 */
function saveCollection(cardId) {
    // 기존 컬렉션을 불러옴
    const collection = getCollection();
    // 중복 수집 방지: 아직 컬렉션에 없는 카드일 경우만 추가
    if (!collection.includes(cardId)) {
        collection.push(cardId);
        // 업데이트된 컬렉션을 다시 문자열로 변환하여 저장
        localStorage.setItem('userCollection', JSON.stringify(collection));

        // [한글 주석] 대기 중인 레벨업 퀴즈가 있으면 먼저 처리
        const pendingLevel = localStorage.getItem('pendingLevel');
        if (pendingLevel) {
          localStorage.removeItem('pendingLevel');
          if (typeof showLevelUpQuiz === 'function') {
            showLevelUpQuiz(parseInt(pendingLevel), cardId);
          }
          return; // [한글 주석] 대기 퀴즈 처리 후 나머지 로직 skip
        }

        // [한글 주석] 일반 레벨업 체크
        const prevTotal = collection.length - 1;
        const newTotal = collection.length;
        const newLevel = checkLevelUp(prevTotal, newTotal);
        if (newLevel) {
          if (typeof showLevelUpQuiz === 'function') {
            showLevelUpQuiz(newLevel, cardId);
          } else {
            showLevelUpPopup(newLevel);
          }
        }

        // 도감을 위한 수집 날짜 저장
        const dates = getCollectionDates();
        const dateString = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        dates[cardId] = dateString;
        localStorage.setItem('collectionDates', JSON.stringify(dates));

        // [한글 주석] WiFi 연결 시 자동 동기화를 위한 대기열 추가
        if (typeof addToSyncQueue === 'function') {
            const card = window.allCardsData ? window.allCardsData.find(c => c.id === cardId) : null;
            if (card) {
                addToSyncQueue('card_collected', {
                    cardId: card.id,
                    cardName: card.name,
                    category: card.category,
                    rarity: card.rarity
                });
            } else {
                addToSyncQueue('card_collected', {
                    cardId: cardId,
                    cardName: '알 수 없음',
                    category: cardId.split('_')[0] || 'plant',
                    rarity: 'common'
                });
            }
        }
    }
}

/**
 * 사용자가 수집한 카드별 최초 수집 날짜를 불러옵니다.
 * @returns {Object} { "cardId": "2026년 5월 14일" } 형태의 객체
 */
function getCollectionDates() {
    const datesString = localStorage.getItem('collectionDates');
    return datesString ? JSON.parse(datesString) : {};
}

/**
 * 사용자가 수집한 카드 ID 목록을 불러옵니다.
 * @returns {Array<string>} 수집한 카드 ID 배열
 */
function getCollection() {
    // 저장된 컬렉션 문자열을 가져옴
    const collectionString = localStorage.getItem('userCollection');
    // 문자열이 있으면 배열로 변환하여 반환, 없으면 빈 배열 반환
    return collectionString ? JSON.parse(collectionString) : [];
}

/**
 * 카드를 수집한 위치(GPS 좌표)를 저장합니다.
 * @param {string} cardId - 수집한 카드의 ID
 * @param {number} lat - 위도
 * @param {number} lng - 경도
 */
function saveCollectionLocation(cardId, lat, lng) {
    const locations = getCollectionLocations();
    locations[cardId] = { lat: lat, lng: lng };
    localStorage.setItem('collectionLocations', JSON.stringify(locations));
}

/**
 * 저장된 수집 위치 데이터를 모두 불러옵니다.
 * @returns {Object} { "cardId": { lat: 37.56, lng: 126.97 } } 형태의 객체
 */
function getCollectionLocations() {
    const locString = localStorage.getItem('collectionLocations');
    return locString ? JSON.parse(locString) : {};
}

/**
 * 퀴즈를 통과한 카테고리를 저장합니다.
 * @param {string} category - 통과한 카테고리 이름 ('animal' 또는 'artifact')
 */
function setQuizPassed(category) {
    const passed = getQuizPassed();
    if (!passed.includes(category)) {
        passed.push(category);
        localStorage.setItem('quizPassed', JSON.stringify(passed));
    }
}

/**
 * 퀴즈를 통과한 카테고리 목록을 불러옵니다.
 * @returns {Array<string>} 통과한 카테고리 배열
 */
function getQuizPassed() {
    const passedStr = localStorage.getItem('quizPassed');
    return passedStr ? JSON.parse(passedStr) : [];
}

/**
 * 특정 카테고리의 퀴즈를 통과했는지 확인합니다.
 * @param {string} category 
 * @returns {boolean} 통과 여부
 */
function isQuizPassed(category) {
    return getQuizPassed().includes(category);
}

// [한글 주석] 실제 확정된 레벨 가져오기 (퀴즈 통과 후 저장된 값)
function getCurrentLevel() {
  return parseInt(localStorage.getItem('currentLevel') || '1');
}

// [한글 주석] 실제 확정된 레벨 저장
function saveCurrentLevel(level) {
  localStorage.setItem('currentLevel', String(level));
}

// [한글 주석] 카드 수로 도달 가능한 레벨 계산 (10개당 1레벨, 최대 30)
function calculateLevel(totalCount) {
  return Math.min(30, Math.floor(totalCount / 10) + 1);
}

// [한글 주석] 레벨업 체크 - 카드 수 기반 목표 레벨이 현재 확정 레벨보다 높으면 퀴즈 트리거
function checkLevelUp(prevTotal, newTotal) {
  const targetLevel = calculateLevel(newTotal);
  const confirmedLevel = getCurrentLevel();
  // [한글 주석] 목표 레벨이 확정 레벨보다 높으면 레벨업 도전
  if (targetLevel > confirmedLevel) {
    return confirmedLevel + 1; // [한글 주석] 한 단계씩 올라감
  }
  return null;
}

window.getCurrentLevel = getCurrentLevel;
window.saveCurrentLevel = saveCurrentLevel;
window.calculateLevel = calculateLevel;
window.checkLevelUp = checkLevelUp;

// [한글 주석] 레벨별 카테고리 해금 체크
function checkCategoryUnlockByLevel(level) {
  // [한글 주석] 레벨 5 → 동물 해금, 레벨 10 → 유물 해금
  const unlocks = [];
  if (level >= 5)  unlocks.push('animal');
  if (level >= 10) unlocks.push('artifact');

  const current = JSON.parse(localStorage.getItem('unlockedCategories') || '["plant"]');
  let changed = false;

  unlocks.forEach(cat => {
    if (!current.includes(cat)) {
      current.push(cat);
      changed = true;
    }
  });

  if (changed) {
    localStorage.setItem('unlockedCategories', JSON.stringify(current));
    console.log('[레벨] 카테고리 해금:', current);
  }
  return changed;
}

window.checkCategoryUnlockByLevel = checkCategoryUnlockByLevel;

// [한글 주석] 해금된 카테고리 목록 반환 - 확정 레벨 기반
function getUnlockedCategories() {
  const level = typeof getCurrentLevel === 'function'
    ? getCurrentLevel()
    : parseInt(localStorage.getItem('currentLevel') || '1');
  const categories = ['plant'];
  if (level >= 5)  categories.push('animal');
  if (level >= 10) categories.push('artifact');
  return categories;
}

window.getUnlockedCategories = getUnlockedCategories;

// [한글 주석] 중복 카드 저장소 키
const DUPLICATES_KEY = 'cardDuplicates';

// [한글 주석] 중복 카드 목록 가져오기 {cardId: 중복수량}
function getDuplicates() {
  return JSON.parse(localStorage.getItem(DUPLICATES_KEY) || '{}');
}

// [한글 주석] 중복 카드 저장
function saveDuplicates(data) {
  localStorage.setItem(DUPLICATES_KEY, JSON.stringify(data));
}

// [한글 주석] 카드 수집 시 중복 처리
// 이미 있는 카드면 중복 카운트 증가, 없는 카드면 도감에 추가
function addCardWithDuplicate(cardId) {
  const collection = getCollection();
  if (collection.includes(cardId)) {
    // [한글 주석] 이미 있는 카드 → 중복 저장소에 추가
    const dups = getDuplicates();
    dups[cardId] = (dups[cardId] || 0) + 1;
    saveDuplicates(dups);
    return 'duplicate'; // [한글 주석] 중복 카드
  } else {
    // [한글 주석] 없는 카드 → 도감에 추가
    saveCollection(cardId);
    return 'new'; // [한글 주석] 새 카드
  }
}

// [한글 주석] 조합소용 카드 목록 (중복이 1개 이상인 카드들)
function getWorkshopCards() {
  const dups = getDuplicates();
  return Object.entries(dups)
    .filter(([id, count]) => count >= 1)
    .map(([id, count]) => ({ id, count }));
}

// [한글 주석] 중복 카드 사용 (조합 시 차감)
function useDuplicateCards(cardIds) {
  const dups = getDuplicates();
  cardIds.forEach(id => {
    if (dups[id] > 0) {
      dups[id]--;
      if (dups[id] === 0) delete dups[id];
    }
  });
  saveDuplicates(dups);
}

window.getDuplicates = getDuplicates;
window.saveDuplicates = saveDuplicates;
window.addCardWithDuplicate = addCardWithDuplicate;
window.getWorkshopCards = getWorkshopCards;
window.useDuplicateCards = useDuplicateCards;
