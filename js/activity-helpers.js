// ==========================================
// [한글 주석] 신체활동 관련 공용 헬퍼 함수 (activity-helpers.js)
// 기록 화면(records.js)과 탐험 요약 팝업(app.js)에서 공통으로 사용
// ==========================================

// [한글 주석] 분당 소모 칼로리 기준 운동 목록 (3~6학년 평균 체중 기준 어림값)
const ACTIVITY_CONVERSION_LIST = [
    { name: '줄넘기', emoji: '🪢', kcalPerMin: 6 },
    { name: '축구', emoji: '⚽', kcalPerMin: 5 },
    { name: '인라인스케이트', emoji: '🛼', kcalPerMin: 4.5 },
    { name: '배드민턴', emoji: '🏸', kcalPerMin: 4 },
    { name: '자전거 타기', emoji: '🚲', kcalPerMin: 4 },
    { name: '훌라후프', emoji: '🎡', kcalPerMin: 3.5 }
];

// [한글 주석] 오늘 소모 칼로리를 랜덤 운동 1개로 환산한 문구를 반환 (예: "줄넘기 11분과 비슷해요")
function getActivityConversionText(kcal) {
    if (!kcal || kcal <= 0) return '';
    const picked = ACTIVITY_CONVERSION_LIST[Math.floor(Math.random() * ACTIVITY_CONVERSION_LIST.length)];
    const minutes = Math.max(1, Math.round(kcal / picked.kcalPerMin));
    return picked.emoji + ' ' + picked.name + ' ' + minutes + '분과 비슷해요';
}

// [한글 주석] 활동분(minutes) 기준 강도 배지 정보 반환
function getActivityIntensityBadge(minutes) {
    if (minutes >= 40) return { label: '탐험 대장', emoji: '🏆', color: '#ffd700' };
    if (minutes >= 20) return { label: '튼튼 워커', emoji: '💪', color: '#84ff00' };
    return { label: '새싹 워커', emoji: '🌱', color: '#8db05c' };
}
