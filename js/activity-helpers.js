// ==========================================
// [한글 주석] 신체활동 관련 공용 헬퍼 함수 (activity-helpers.js)
// 기록 화면(records.js)과 탐험 요약 팝업(app.js)에서 공통으로 사용
// ==========================================

// [한글 주석] 언어별 운동 목록 키 - lang.js의 activityXxx 키와 매칭되는 분당 소모 칼로리 값
const ACTIVITY_CONVERSION_LIST = [
    { key: 'activityJumpRope', emoji: '🪢', kcalPerMin: 6 },
    { key: 'activitySoccer', emoji: '⚽', kcalPerMin: 5 },
    { key: 'activityInlineSkate', emoji: '🛼', kcalPerMin: 4.5 },
    { key: 'activityBadminton', emoji: '🏸', kcalPerMin: 4 },
    { key: 'activityCycling', emoji: '🚲', kcalPerMin: 4 },
    { key: 'activityHulaHoop', emoji: '🎡', kcalPerMin: 3.5 }
];

// [한글 주석] 현재 언어의 텍스트를 가져오는 공용 함수 (없으면 한국어로 폴백)
function getActivityText(key) {
    const T = window.LANG_UI;
    const L = window.currentLang || 'ko';
    return T?.[L]?.[key] || T?.ko?.[key] || '';
}

// [한글 주석] 오늘 소모 칼로리를 랜덤 운동 1개로 환산한 문구를 반환 (예: "줄넘기 11분과 비슷해요")
function getActivityConversionText(kcal) {
    if (!kcal || kcal <= 0) return '';
    const picked = ACTIVITY_CONVERSION_LIST[Math.floor(Math.random() * ACTIVITY_CONVERSION_LIST.length)];
    const minutes = Math.max(1, Math.round(kcal / picked.kcalPerMin));
    const activityName = getActivityText(picked.key);
    const suffix = getActivityText('activitySimilarTo');
    return picked.emoji + ' ' + activityName + ' ' + minutes + suffix;
}

// [한글 주석] 활동분(minutes) 기준 강도 배지 정보 반환
function getActivityIntensityBadge(minutes) {
    if (minutes >= 40) return { label: getActivityText('badgeChampion'), emoji: '🏆', color: '#ffd700' };
    if (minutes >= 20) return { label: getActivityText('badgeStrong'), emoji: '💪', color: '#84ff00' };
    return { label: getActivityText('badgeSprout'), emoji: '🌱', color: '#8db05c' };
}
