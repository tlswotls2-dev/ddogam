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

        // [한글 주석] 레벨업 체크 및 축하 팝업
        const prevTotal = collection.length - 1;
        const newTotal = collection.length;
        const newLevel = checkLevelUp(prevTotal, newTotal);
        if (newLevel) {
          showLevelUpPopup(newLevel);
        }

        // [한글 주석] 메인화면 레벨 뱃지 업데이트
        if (typeof updateLevelBadge === 'function') updateLevelBadge();

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

// [한글 주석] 수집 카드 수로 레벨 계산 (10개당 1레벨, 최대 30레벨)
function calculateLevel(totalCount) {
  return Math.min(30, Math.floor(totalCount / 10) + 1);
}

// [한글 주석] 레벨업 체크 (카드 추가 전후 레벨 비교)
function checkLevelUp(prevTotal, newTotal) {
  const prevLevel = calculateLevel(prevTotal);
  const newLevel = calculateLevel(newTotal);
  return newLevel > prevLevel ? newLevel : null;
}

window.calculateLevel = calculateLevel;
window.checkLevelUp = checkLevelUp;
