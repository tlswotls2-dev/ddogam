// ==========================================
// [한글 주석] 다국어 번역 시스템 (lang.js)
// 지원 언어: 한국어, 영어, 러시아어, 중국어
// Gemini API 실시간 번역 사용 (한국어 제외)
// ==========================================

// [한글 주석] 현재 선택된 언어 (기본값: 한국어)
window.currentLang = localStorage.getItem('selectedLang') || 'ko';

// [한글 주석] 페이지 로드 즉시 해시 감지 (DOMContentLoaded 전에 실행)
(function () {
  const hash = window.location.hash;
  if (hash.startsWith('#restore=')) {
    const encoded = hash.slice('#restore='.length);
    // [한글 주석] 해시 즉시 제거
    window.history.replaceState({}, '', window.location.pathname);
    // [한글 주석] 복원 실행 (LANG_UI 로드 전이므로 직접 처리)
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(encoded))));
      if (data && (data.v === 1 || data.v === 2)) {
        const cards = (data.c || []).map(id => {
          if (id.startsWith('p')) return 'plant_' + String(parseInt(id.slice(1))).padStart(3, '0');
          if (id.startsWith('a')) return 'animal_' + String(parseInt(id.slice(1))).padStart(3, '0');
          if (id.startsWith('r')) return 'artifact_' + String(parseInt(id.slice(1))).padStart(3, '0');
          return id;
        });
        localStorage.setItem('userCollection', JSON.stringify(cards));
        if (data.l) {
          localStorage.setItem('confirmedLevel', data.l);
          localStorage.setItem('currentLevel', data.l);
        }
        localStorage.setItem('_justRestored', '1');
        // [한글 주석] reload는 팝업 확인 버튼에서 처리
        console.log('[복원] 성공:', cards.length, '개 카드, 레벨', data.l);
      }
    } catch (e) {
      console.error('[복원] 실패:', e);
    }
  }
})();

// [한글 주석] 언어별 폰트 설정
const LANG_FONTS = {
  ko: "'Noto Sans KR', sans-serif",
  en: "'Noto Sans', 'Noto Sans KR', sans-serif",
  ru: "'Noto Sans', 'Noto Sans KR', sans-serif",
  zh: "'Noto Sans SC', 'Noto Sans KR', sans-serif"
};

// [한글 주석] 언어별 UI 텍스트 (버튼, 메뉴, 고정 텍스트)
window.LANG_UI = {
  ko: {
    langBtnLabel: '한국어',
    exploreBtn: '탐험!',
    dodamBtn: '도감',
    mapBtn: '지도',
    itemBtn: '아이템',
    battleBtn: '배틀',
    dailyQuizBtn: '일일\n시험',
    helpBtn: '도움말',
    categoryPlant: '🌱 식물',
    categoryAnimal: '🦊 동물',
    categoryArtifact: '🏺 유물',
    exploringBadge: '🌱 식물 탐험 중',
    totalProgress: '전체 완성도',
    confirmBtn: '확인!',
    detailBtn: '자세히 보기 ▶',
    backBtn: '◀ 앞면으로',
    closeBtn: '닫기',
    rarityCommon: '일반',
    rarityRare: '희귀',
    rarityEpic: '전설',
    newDiscovery: '🎉 새로운 발견! 화면을 탭하세요!',
    exploringMsg: '🥾 탐험 중...',
    stopExplore: '탐험 종료',
    // [한글 주석] 배틀 화면 텍스트
    battleTitle: '지식 배틀',
    battleDesc1: '같은 반 친구와 지식 대결!',
    battleDesc2: '1분 공부 후 자동 매칭 → 5문제 승부',
    battleDesc3: '승리 시 복주머니 1개 획득!',
    battleFragments: '🧩 복주머니 조각:',
    battleFragmentHint: '1개 더 모으면 복주머니!',
    battleCountLoading: '오늘 배틀 횟수 확인 중...',
    battleCountMax: '오늘 배틀 3회 완료! 내일 다시 도전해요 😊',
    battleCountToday: '오늘 배틀: {n}/3회',
    battleCountFail: '횟수 확인 실패',
    battleClose: '닫기',
    battleLimitDesc: '하루 3회 제한 (매칭 성공 기준)',
    battleDrawDesc: '무승부 시 복주머니 조각 1개 획득',
    battleStudyTimer: '1분 공부 후 자동 매칭 시작!',
    battleStudyMsg: '카드를 보며 공부해요!',
    battlePrev: '← 이전',
    battleFlip: '🔄 뒤집기',
    battleNext: '다음 →',
    battleGiveUp: '포기',
    battleGiveUpConfirm: '배틀을 포기할까요?',
    battleQuizQuestion: '이 카드의 설명은?',
    battleReadyLabel: '배틀 준비',
    battleFlipHintFront: '🔄 뒤집기로 자세한 정보 확인!',
    battleFlipHintBack: '🔄 뒤집기로 앞면 확인!',
    battleDetailLabel: '상세정보',
    battleMatching: '🔍 매칭 중...',
    battleSearching: '🔍 상대방 찾는 중...',
    battleMatchFail: '매칭 실패',
    battleMatchFailDesc: '상대를 찾지 못했어요.',
    battleMatchFailHint: '친구들과 함께 배틀 모드를 시작해봐요!',
    battleRetry: '다시 시도해보세요!',
    battleMatchSuccess: '매칭 성공!',
    battleMatchDesc: '{n}번 학생과 배틀!',
    battleMatchHint: '5문제 중 더 많이 맞추면 승리!',
    battleMatchReward: '복주머니 1개를 획득해요 🎁',
    battleStart: '⚔️ 배틀 시작!',
    battleQuizLabel: '⚔️ 배틀 퀴즈',
    battleScore: '현재 점수: {my} / {total}',
    battleWaitResult: '상대방 결과 기다리는 중...',
    battleWaitHint: '잠시만 기다려요!',
    battleWin: '🏆 승리!',
    battleLose: '😔 패배',
    battleDraw: '🤝 무승부!',
    battleUnknown: '⚔️ 완료',
    battleRewardWin: '복주머니 1개를 획득했어요!',
    battleRewardLose: '다음엔 더 잘할 수 있어요!',
    battleRewardDraw: '복주머니 조각 1개를 획득했어요!',
    battleRewardUnknown: '상대방 결과를 확인하지 못했어요.',
    battleConfirm: '확인!',
    battleMe: '나',
    battleOpponent: '상대',
    battleOf5: '/ 5',
    battleAITitle: 'AI 또감이의 도전장!',
    battleAIDesc1: '상대를 찾지 못했지만...',
    battleAIDesc2: '🤖 AI 또감이가 도전장을 보냈어요!',
    battleAIDesc3: '잠시 후 배틀이 시작됩니다...',
    battleLoginRequired: '로그인이 필요해요!',
    battleDataLoading: '카드 데이터를 불러오는 중이에요. 잠시 후 다시 시도해줘요!',
    battleTimeout: '⏱ 시간 초과! 패배했어요.',
    // [한글 주석] 퀴즈 화면 텍스트
    quizDataLoading: '퀴즈 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
    quizCorrect: '🎉 정답!',
    quizWrong: '❌ 틀렸어요',
    quizPassTitle: '🎊 해금 성공! 🎊',
    quizPassDescAnimal: '{n}개 정답! 이제 동물 탐험이 가능해요!',
    quizPassDescArtifact: '{n}개 정답! 이제 유물 탐험이 가능해요!',
    quizFailTitle: '조금 더 공부해봐요! 😊',
    quizFailDesc: '{score}개를 맞췄어요. (통과 기준: {pass}개)',
    levelQuizHeader: '🎯 Lv.{n} 달성 퀴즈!',
    levelQuizSubHeader: '맞추면 레벨업! 틀리면 다음 기회에 도전해요',
    levelQuizQuestion: '이 카드의 설명은?',
    levelQuizFailToast: '❌ 아쉽! 다음 카드를 모으면 다시 도전해요!',
    categoryUnlockTitle: '🎉 해금!',
    categoryUnlockAnimal: '🦊 동물 탐험 해금!',
    categoryUnlockArtifact: '🏺 유물 탐험 해금!',
    categoryUnlockDescAnimal: '레벨 5 달성!<br>이제 🦊 동물 카드를 수집할 수 있어요!',
    categoryUnlockDescArtifact: '레벨 10 달성!<br>이제 🏺 유물 카드를 수집할 수 있어요!',
    categoryUnlockBtn: '🚀 탐험하러 가기!',
    dailyQuizDoneLabel: '완료',
    dailyQuizLabel: '일일\n시험',
    dailyQuizNoCard: '카드를 먼저 수집해야 시험을 볼 수 있어요!',
    dailyQuizTitle: '📝 오늘의 일일 시험',
    dailyQuizDesc: '이 설명이 맞으면 ⭕, 틀리면 ❌',
    oxCorrect: '정답!',
    oxCorrectDesc: '훌륭해요! 복주머니 1개를 받았어요!',
    oxCorrectBagLabel: '복주머니 획득!',
    oxCorrectBagHint: '아이템 탭 → 복주머니에서 열어봐요!',
    oxCorrectBtn: '🎁 확인!',
    oxWrong: '아쉽!',
    oxWrongDesc: '내일 다시 도전해봐요!',
    oxWrongHint: '카드 정보를 잘 읽어두면 도움이 돼요 📖',
    oxWrongBtn: '확인',
    dailyDoneTitle: '오늘 시험 완료!',
    dailyDoneDesc: '내일 자정 이후 다시 도전해요!',
    dailyDoneTimer: '{h}시간 {m}분 후 초기화',
    dailyDoneBtn: '확인',
    aiTitle: 'AI 또감이',
    aiAnalysisLabel: 'AI 분석',
    aiAnalyzing: 'ANALYZING...',
    aiComplete: 'COMPLETE ✓',
    aiRadarLabel: '학습 정확도 레이더',
    aiWeakTitle: '⚡ 취약 영역 분석',
    aiWeakDesc: '{cat} 집중 연습 필요!',
    aiWeakRate: '정답률 {n}%',
    aiRecommendLabel: '🎯 오늘의 AI 추천 퀴즈',
    aiStartBtn: '🤖 AI 추천 일일 시험 시작',
    aiClose: '닫기',
    aiNoData: '데이터 없음',
    aiNoHistory: '아직 퀴즈 기록 없음',
    aiScoreDesc: '{c}/{t}문제 정답',
    radarPlant: '식물',
    radarAnimal: '동물',
    radarArtifact: '유물',
    firstTimeTitle: '오늘의 첫 시험이에요!',
    firstTimeDesc: '시험을 풀수록 AI가 학습 데이터를\n모아서 다음번에 분석해줄게요 📊',
    firstTimeStartBtn: '📝 시험 시작하기',
    firstTimeClose: '닫기',
    // [한글 주석] 도감 화면 텍스트
    dodamLocked: '아직 열리지 않은 도감입니다! 이전 도감을 더 채워주세요.',
    dodamTabPlant: '🌱 식물',
    dodamTabAnimal: '🦊 동물',
    dodamTabArtifact: '🏺 유물',
    dodamTabAnimalLocked: '🔒 동물',
    dodamTabArtifactLocked: '🔒 유물',
    dodamSummary: '{n} / {total} 수집',
    dodamUnknownDesc: '미발견',
    dodamDateDefault: '📅 최근 수집',
    workshopSummary: '중복 카드 조합소',
    workshopEmptyTitle: '조합소가 비어있어요',
    workshopEmptyDesc: '이미 가진 카드를 또 수집하면<br>여기에 쌓여요!<br><span style="color:#ffd700;">5장</span>을 모아 새 카드로 조합해봐요 ✨',
    workshopSelectedInfo: '선택: {n} / 5장',
    workshopHeaderTitle: '⚗️ 카드 조합소',
    workshopHeaderDesc: '중복 카드 <span style="color:#ffd700;">5장</span>을 선택해 새 카드로 조합해요!<br>조합 규칙에 따라 다른 희귀도 카드가 나와요 🎲',
    workshopCraftBtn: '✨ 조합하기!',
    workshopMaxSelect: '5장만 선택할 수 있어요!',
    craftSuccess: '조합 성공!',
    craftNewCard: '새로운 카드를 얻었어요!',
    craftDupCard: '이미 있는 카드지만 획득했어요!',
    craftConfirm: '🎉 확인!',
    // [한글 주석] 지도 화면 텍스트
    mapStatusTracking: '📍 현재 위치 추적 중',
    mapStatusNoPermission: '📍 위치 권한 필요 (기본 위치 표시 중)',
    mapStatusNoSupport: '📍 이 브라우저는 위치를 지원하지 않습니다',
    mapMyLocation: '📍 내 위치',
    mapDateUnknown: '날짜 정보 없음',
    mapClusterTitle: '이 장소에서 {n}개 발견!',
    mapRarityCommon: '일반',
    mapRarityRare: '희귀',
    mapRarityEpic: '전설',
    mapCollectedCount: '🎒 수집한 아이템: {n}개',
    // [한글 주석] 아이템/아바타 화면 텍스트
    avatarSelectPrompt: '원하는 아바타를 하나 선택해주세요!',
    avatarSelectedStatus: '✅ 선택 중',
    avatarSelectAvailable: '선택 가능',
    avatarLockCond: '🔒 Lv.{n} 해금',
    outfitEquippedStatus: '✅ 착용 중',
    outfitEquipAvailable: '착용 가능',
    petEquippedStatus: '✅ 장착 중',
    petEquipAvailable: '장착 가능',
    petCondTotal: '전체 {n}개 필요',
    petCondAnimal: '동물 {n}개 필요',
    titleEquippedStatus: '✅ 장착 중 (탭하여 해제)',
    titleEquipAvailable: '탭하여 장착',
    titleLockCond: '🔒 Lv.{n} 달성 시 해금',
    itemEquippedStatus: '✅ 장착 중',
    itemEquipAvailable: '장착 가능',
    itemNone: '아이템 없음',
    bagNone: '아직 받은 복주머니가 없어요 🎁',
    bagLabel: '복주머니 #{n}',
    bagTapToOpen: '탭해서 열기',
    bagOpeningMsg: '열리고 있어요...',
    bagDrumrollMsg: '두구두구두구...',
    bagReceiveBtn: '🎉 받기!',
    bagRarityEpic: '★★★ 전설',
    bagRarityRare: '★★ 희귀',
    bagRarityCommon: '★ 일반',
    levelUpMsg: '축하해요! 레벨이 올랐어요! 🎉',
    levelUpConfirm: '확인!',
    itemUnlockToast: '🎉 새 아이템 해금! {names}',
    petUnlockSuffix: '(펫)',
    battleCatPlant: '🌱 식물 지식 배틀',
    battleCatAnimal: '🦊 동물 지식 배틀',
    battleCatArtifact: '🏺 유물 지식 배틀',
    workshopTab: '⚗️ 조합소',
    exploreTitle: '🥾 탐험 중...',
    exploreSafetyMsg: '두눈은 화면에서 잠시 벗어나<br>두 발로 걸으며 자연을 느껴봐요!',
    exploreSafetyHint: '걷다 보면 신기한 카드가 나타날 거예요 🌿',
    mapScreenTitle: '🗺️ 탐험 지도',
    tabExploringBadge: '{emoji} {name} 탐험 중',
    tabAnimalLocked: '레벨 5가 되면 동물 탐험이 열려요!\\n(현재 Lv.{cur}, 레벨업 {needed}번 더 필요해요)',
    tabArtifactLocked: '레벨 10이 되면 유물 탐험이 열려요!\\n(현재 Lv.{cur}, 레벨업 {needed}번 더 필요해요)',
    titleBadgeExplorer: '탐험가',
    titleBadgePro: 'PRO 탐험가',
    titleBadgeMaster: '마스터',
    dodamScreenTitle: '📖 나의 도감',
    imagesCached: '✅ 이미지 300장 저장 완료! 오프라인에서도 볼 수 있어요',
    wakeLockOn: '화면 꺼짐 방지 ON 🔆 탐험을 시작해요!',
    safetyWarningTitle: '🚨 안 전 주 의!',
    safetyWarningDesc: '탐험 버튼을 누르고 걸어야\n카드가 나타나요 🌿\n안전한 곳에서 화면을 확인해요!',
    itemScreenTitle: '🎒 나의 아이템',
    itemEquipDone: '장착 완료!',
    avatarSelectTitle: '🎮 탐험가를 선택하세요!',
    avatarSelectSubtitle: '또감 세계를 함께 탐험할<br>캐릭터를 골라주세요',
    avatarSelectConfirm: '선택 완료!',
    settingsTitle: '⚙️ 설정',
    settingsLang: '🌐 언어 설정',
    settingsExport: '📤 내 데이터 내보내기',
    settingsExportDesc: 'QR코드를 스캔하면 다른 기기로 데이터를 옮길 수 있어요',
    settingsClose: '닫기',
    exportTitle: '📤 내 데이터 QR코드',
    exportDesc: '다른 기기에서 이 QR코드를 스캔하세요!',
    exportWarning: '⚠️ QR코드는 내 수집 데이터를 담고 있어요.\n다른 사람에게 보여주지 마세요!',
    exportClose: '닫기',
    exportSuccess: '✅ 데이터 복원 완료!',
    exportSuccessDesc: '수집한 카드와 레벨이 복원됐어요!',
    exportCopyBtn: '🔗 URL 복사',
    exportCopied: '✅ 복사됐어요!',
    exportCopyGuide: '이 URL을 새 기기의 크롬 브라우저 주소창에 붙여넣고 열면 데이터가 복원돼요!',
    exportBagWarning: '🎁 복주머니는 전송되지 않아요!\n데이터를 옮기기 전에 복주머니를 모두 열어서 카드로 만들어주세요.',
    helpMainSubtitle: '걷고, 수집하며, 배워요!',
    helpStep1Title: 'STEP 1. 탐험 시작!',
    helpStep1Desc: '주황색 탐험 버튼을 눌러요.',
    helpStep2Title: 'STEP 2. 주변을 걸어요!',
    helpStep2Desc: '화면을 끄지 말고 주머니에 넣고 걸어요. 진동이 울리면 안전한 곳에서 확인!',
    helpStep3Title: 'STEP 3. 카드를 수집해요!',
    helpStep3Desc: '도감을 완성하며 레벨을 올려요!',
    helpStep4Title: 'STEP 4. 레벨업 퀴즈!',
    helpStep4Desc: '퀴즈를 풀고 레벨을 올리면 다음 단계를 해금할 수 있어요!',
    helpMainCloseBtn: '확인',
    helpDetailBtn: '📚 자세히 알아보기',
    helpBackBtn: '← 뒤로',
    helpDetailTitle: '📚 자세한 사용법',
    helpExploreTitle: '👟 탐험 방법',
    helpExploreDesc: '• 주황색 탐험! 버튼을 누르면 탐험 시작\n• ⚠️ 걸을 때는 절대 스마트기기 화면을 보면서 걷지 마세요!\n• 탐험 버튼을 누른 후 화면을 끄지 않고 주머니에 넣고 걸어요\n• 걷다 보면 현재 위치 주변에서 랜덤으로 카드 등장\n• 진동이 울리면 안전한 곳에 멈춰서 화면을 확인해요\n• 30% 확률로 카드 3장 중 1장을 선택하는 이벤트 발생!',
    helpDodamTitle: '📖 도감',
    helpDodamDesc: '• 수집한 카드를 모두 볼 수 있어요\n• 식물 100종, 동물 100종, 유물 100종\n• 카드 희귀도: ★ 일반 / ★★ 희귀 / ★★★ 전설\n• 카드를 탭하면 자세한 정보를 볼 수 있어요\n• ⚗️ 조합소 탭에서 중복 카드를 새 카드로 바꿀 수 있어요',
    helpWorkshopTitle: '⚗️ 조합소',
    helpWorkshopDesc: '• 이미 가진 카드가 또 나오면 조합소에 쌓여요\n• 중복 카드 5장을 선택해 새 카드로 조합!\n• 전설 1장 이상 → 무조건 전설\n• 희귀 4~5장 → 전설 50% / 희귀 50%\n• 희귀 3장 + 일반 2장 → 희귀 100%\n• 희귀 1~2장 + 일반 → 희귀 60% / 일반 40%\n• 일반 5장 → 일반 75% / 희귀 15% / 전설 10%',
    helpLevelTitle: '⭐ 레벨 & 아이템',
    helpLevelDesc: '• 카드 10장마다 레벨업 퀴즈 도전!\n• 퀴즈를 맞춰야 레벨이 올라가요\n• Lv.5 달성 → 동물 탐험 해금\n• Lv.10 달성 → 유물 탐험 해금\n• 레벨에 따라 아바타/옷/아이템/펫/칭호 해금\n• 아바타를 탭하면 꾸미기 화면으로 이동',
    helpQuizTitle: '📝 일일 시험',
    helpQuizDesc: '• 하루에 한 번 OX 퀴즈에 도전해요\n• 내가 수집한 카드의 설명이 맞는지 틀리는지 맞춰요\n• 정답이면 복주머니 1개 획득!\n• AI 또감이가 취약 영역을 분석해줘요\n• 자정이 지나면 다시 도전할 수 있어요',
    helpBattleTitle: '⚔️ 지식 배틀',
    helpBattleDesc: '• 같은 반 친구와 지식 대결!\n• 카테고리 선택 후 1분 공부 → 자동 매칭\n• 매칭 후 5문제(3분 제한)를 풀어 승부!\n• 승리 → 복주머니 1개 / 무승부 → 복주머니 조각 1개\n• 조각 2개를 모으면 복주머니 1개로 변환\n• 하루 3회 제한 / 매칭 실패 시 AI 또감이와 배틀!',
    helpBagTitle: '🎁 복주머니',
    helpBagDesc: '• 일일 시험 정답 / 배틀 승리 시 받아요\n• 선생님이 특별 선물을 보내줄 수도 있어요\n• 아이템 → 복주머니 탭에서 확인·개봉해요\n• 두구두구 애니메이션으로 카드를 뽑아요!',
    helpSettingsTitle: '⚙️ 설정',
    helpSettingsDesc: '• 언어 설정: 한국어/영어/러시아어/중국어 지원\n• 내 데이터 내보내기: QR코드로 다른 기기에 데이터 전송\n• 복주머니는 전송되지 않으니 먼저 열어두세요!',
    helpDetailCloseBtn: '확인!',
    cardChoiceTitle: '카드를 선택하세요!',
    cardChoiceDesc: '1장을 골라 도감에 추가해요',
    cardChoiceTap: '탭해서 선택',
    bagOpenAll: '🎁 전체 열기',
    battleAICorrect: 'AI 또감이 정답! ✓',
    battleAIWrong: 'AI 또감이 오답 ✗',
    aiBattleTitle: '⚔️ AI 배틀',
    aiBattleOpponent: 'AI 또감이',
    aiBattlePlayer: '🤖 AI 플레이어',
    aiBattleSpecial: '🤖 AI와의 특별 배틀!',
    aiBattleDesc: '5문제 중 더 많이 맞히면 이겨요<br>AI 배틀은 일일 횟수에 포함되지 않아요',
    aiBattleStart: '⚔️ 배틀 시작!',
    aiBattleMe: '나',
    aiBattleAI: '🤖 AI',
    aiBattleThinking: 'AI 또감이 생각 중...',
    aiBattleQuestion: '이 카드의 설명은?',
    aiBattleDataLoading: '카드 데이터를 불러오는 중이에요! 잠시 후 다시 시도해주세요.',
    battleQuizOf: '문제 중',
    aiBattleResultWin: '대단해요! AI 또감이를 이겼어요! 🎉<br><span style="color:#ffd700;font-size:11px;">🎁 복주머니 1개 획득!</span>',
    aiBattleResultDraw: 'AI 또감이와 비겼어요! 💪<br><span style="color:#4a9eff;font-size:11px;">🧩 복주머니 조각 1개 획득!</span>',
    aiBattleResultLose: 'AI 또감이가 조금 더 빨랐어요.<br>카드를 더 읽고 다시 도전! 📖',
    aiBattleNoLimit: 'AI 배틀은 일일 횟수 · 제한 없음',
    aiBattleBack: '돌아가기',
    rewardArriveLabel: '선생님의 선물 도착!',
    rewardArriveTitle: '복주머니가 도착했어요!',
    rewardArriveDesc: '아이템 → 복주머니 탭에서<br>열어보세요! 🌟',
    rewardArriveBtn: '확인!',
    settingsCopyright: '📋 오픈소스 및 콘텐츠 안내',
    cardChoiceTimeoutNotice: '⏱ 10초 안에 선택하지 않으면 자동으로 선택돼요',
    explorationSummaryTitle: '이번 탐험 결과',
    explorationSummaryCount: '총 {n}장 수집!',
    discoveryTimeoutNotice: '(10초 안에 탭하지 않으면 자동으로 수집돼요)',
  },
  en: {
    langBtnLabel: 'English',
    exploreBtn: 'Go!',
    dodamBtn: 'Collection',
    mapBtn: 'Map',
    itemBtn: 'Items',
    battleBtn: 'Battle',
    dailyQuizBtn: 'Daily<br>Quiz',
    helpBtn: 'Help',
    categoryPlant: '🌱 Plants',
    categoryAnimal: '🦊 Animals',
    categoryArtifact: '🏺 Artifacts',
    exploringBadge: '🌱 Exploring Plants',
    totalProgress: 'Total Progress',
    confirmBtn: 'Got it!',
    detailBtn: 'Details ▶',
    backBtn: '◀ Back',
    closeBtn: 'Close',
    rarityCommon: 'Common',
    rarityRare: 'Rare',
    rarityEpic: 'Epic',
    newDiscovery: '🎉 New Discovery! Tap the screen!',
    exploringMsg: '🥾 Exploring...',
    stopExplore: 'Stop',
    // [한글 주석] 배틀 화면 텍스트
    battleTitle: 'Knowledge Battle',
    battleDesc1: 'Knowledge battle with classmates!',
    battleDesc2: '1 min study → auto match → 5 questions',
    battleDesc3: 'Win to get a lucky bag!',
    battleFragments: '🧩 Lucky Pieces:',
    battleFragmentHint: '1 more for a lucky bag!',
    battleCountLoading: "Checking today's battles...",
    battleCountMax: 'Done 3 battles today! Try again tomorrow 😊',
    battleCountToday: 'Today: {n}/3',
    battleCountFail: 'Failed to check',
    battleClose: 'Close',
    battleLimitDesc: 'Max 3 battles/day (matched only)',
    battleDrawDesc: 'Draw = 1 lucky piece',
    battleStudyTimer: '1 min study, then auto match!',
    battleStudyMsg: 'Study the cards!',
    battlePrev: '← Prev',
    battleFlip: '🔄 Flip',
    battleNext: 'Next →',
    battleGiveUp: 'Give up',
    battleGiveUpConfirm: 'Give up the battle?',
    battleQuizQuestion: 'What describes this card?',
    battleReadyLabel: 'Battle Ready',
    battleFlipHintFront: '🔄 Flip for details!',
    battleFlipHintBack: '🔄 Flip to front!',
    battleDetailLabel: 'Details',
    battleMatching: '🔍 Matching...',
    battleSearching: '🔍 Finding opponent...',
    battleMatchFail: 'Match Failed',
    battleMatchFailDesc: 'Could not find an opponent.',
    battleMatchFailHint: 'Try battle mode with your friends!',
    battleRetry: 'Try Again!',
    battleMatchSuccess: 'Matched!',
    battleMatchDesc: 'Battle with No.{n}!',
    battleMatchHint: 'Answer more of 5 questions to win!',
    battleMatchReward: 'Win a lucky bag 🎁',
    battleStart: '⚔️ Start Battle!',
    battleQuizLabel: '⚔️ Battle Quiz',
    battleScore: 'Score: {my} / {total}',
    battleWaitResult: 'Waiting for opponent...',
    battleWaitHint: 'Please wait!',
    battleWin: '🏆 Victory!',
    battleLose: '😔 Defeat',
    battleDraw: '🤝 Draw!',
    battleUnknown: '⚔️ Done',
    battleRewardWin: 'You got a lucky bag!',
    battleRewardLose: 'Better luck next time!',
    battleRewardDraw: 'You got a lucky piece!',
    battleRewardUnknown: "Could not get opponent's result.",
    battleConfirm: 'OK!',
    battleMe: 'Me',
    battleOpponent: 'Opponent',
    battleOf5: '/ 5',
    battleAITitle: 'AI Ddogam Challenges You!',
    battleAIDesc1: 'No opponent found, but...',
    battleAIDesc2: '🤖 AI Ddogam sent a challenge!',
    battleAIDesc3: 'Battle starts soon...',
    battleLoginRequired: 'Login required!',
    battleDataLoading: 'Loading card data. Please try again!',
    battleTimeout: "⏱ Time's up! You lost.",
    // [한글 주석] 퀴즈 화면 텍스트
    quizDataLoading: 'Loading quiz data. Please try again shortly.',
    quizCorrect: '🎉 Correct!',
    quizWrong: '❌ Wrong',
    quizPassTitle: '🎊 Unlocked! 🎊',
    quizPassDescAnimal: '{n} correct! Animal exploration unlocked!',
    quizPassDescArtifact: '{n} correct! Artifact exploration unlocked!',
    quizFailTitle: 'Study a bit more! 😊',
    quizFailDesc: '{score} correct. (Need {pass} to pass)',
    levelQuizHeader: '🎯 Lv.{n} Achievement Quiz!',
    levelQuizSubHeader: 'Correct = Level Up! Wrong = try next time',
    levelQuizQuestion: 'What describes this card?',
    levelQuizFailToast: '❌ So close! Try again after collecting more cards!',
    categoryUnlockTitle: '🎉 Unlocked!',
    categoryUnlockAnimal: '🦊 Animal Exploration Unlocked!',
    categoryUnlockArtifact: '🏺 Artifact Exploration Unlocked!',
    categoryUnlockDescAnimal: 'Level 5 reached!<br>Now you can collect 🦊 animal cards!',
    categoryUnlockDescArtifact: 'Level 10 reached!<br>Now you can collect 🏺 artifact cards!',
    categoryUnlockBtn: '🚀 Go Explore!',
    dailyQuizDoneLabel: 'Done',
    dailyQuizLabel: 'Daily\nQuiz',
    dailyQuizNoCard: 'Collect cards first to take the quiz!',
    dailyQuizTitle: "📝 Today's Daily Quiz",
    dailyQuizDesc: '⭕ if correct, ❌ if wrong',
    oxCorrect: 'Correct!',
    oxCorrectDesc: 'Great! You got a lucky bag!',
    oxCorrectBagLabel: 'Lucky Bag Get!',
    oxCorrectBagHint: 'Open it in Items → Lucky Bag!',
    oxCorrectBtn: '🎁 OK!',
    oxWrong: 'Too bad!',
    oxWrongDesc: 'Try again tomorrow!',
    oxWrongHint: 'Reading card info will help 📖',
    oxWrongBtn: 'OK',
    dailyDoneTitle: "Today's Quiz Done!",
    dailyDoneDesc: 'Come back after midnight!',
    dailyDoneTimer: 'Resets in {h}h {m}m',
    dailyDoneBtn: 'OK',
    aiTitle: 'AI Ddogam',
    aiAnalysisLabel: 'AI Analysis',
    aiAnalyzing: 'ANALYZING...',
    aiComplete: 'COMPLETE ✓',
    aiRadarLabel: 'Learning Accuracy Radar',
    aiWeakTitle: '⚡ Weak Area Analysis',
    aiWeakDesc: '{cat} needs more practice!',
    aiWeakRate: 'Accuracy: {n}%',
    aiRecommendLabel: '🎯 AI Recommended Quiz',
    aiStartBtn: '🤖 Start AI Recommended Quiz',
    aiClose: 'Close',
    aiNoData: 'No data',
    aiNoHistory: 'No quiz history yet',
    aiScoreDesc: '{c}/{t} correct',
    radarPlant: 'Plant',
    radarAnimal: 'Animal',
    radarArtifact: 'Artifact',
    firstTimeTitle: 'Your first quiz today!',
    firstTimeDesc: 'The more you quiz, the better AI analyzes you 📊',
    firstTimeStartBtn: '📝 Start Quiz',
    firstTimeClose: 'Close',
    // [한글 주석] 도감 화면 텍스트
    dodamLocked: 'This collection is not unlocked yet! Fill the previous one more.',
    dodamTabPlant: '🌱 Plant',
    dodamTabAnimal: '🦊 Animal',
    dodamTabArtifact: '🏺 Artifact',
    dodamTabAnimalLocked: '🔒 Animal',
    dodamTabArtifactLocked: '🔒 Artifact',
    dodamSummary: '{n} / {total} Collected',
    dodamUnknownDesc: 'Undiscovered',
    dodamDateDefault: '📅 Recently Collected',
    workshopSummary: 'Card Workshop',
    workshopEmptyTitle: 'Workshop is empty',
    workshopEmptyDesc: "Collect duplicate cards and<br>they'll appear here!<br>Combine <span style=\"color:#ffd700;\">5 cards</span> into a new one ✨",
    workshopSelectedInfo: 'Selected: {n} / 5',
    workshopHeaderTitle: '⚗️ Card Workshop',
    workshopHeaderDesc: 'Select <span style="color:#ffd700;">5</span> duplicate cards to craft a new one!<br>Rarity of result depends on your selection 🎲',
    workshopCraftBtn: '✨ Craft!',
    workshopMaxSelect: 'You can only select 5 cards!',
    craftSuccess: 'Craft Success!',
    craftNewCard: 'You got a new card!',
    craftDupCard: 'Got a duplicate, but still yours!',
    craftConfirm: '🎉 OK!',
    // [한글 주석] 지도 화면 텍스트
    mapStatusTracking: '📍 Tracking location',
    mapStatusNoPermission: '📍 Location permission needed (showing default)',
    mapStatusNoSupport: '📍 Location not supported in this browser',
    mapMyLocation: '📍 My Location',
    mapDateUnknown: 'Date unknown',
    mapClusterTitle: '{n} found here!',
    mapRarityCommon: 'Common',
    mapRarityRare: 'Rare',
    mapRarityEpic: 'Legendary',
    mapCollectedCount: '🎒 Collected: {n}',
    // [한글 주석] 아이템/아바타 화면 텍스트
    avatarSelectPrompt: 'Please select an avatar!',
    avatarSelectedStatus: '✅ Selected',
    avatarSelectAvailable: 'Available',
    avatarLockCond: '🔒 Unlocks at Lv.{n}',
    outfitEquippedStatus: '✅ Equipped',
    outfitEquipAvailable: 'Equip',
    petEquippedStatus: '✅ Equipped',
    petEquipAvailable: 'Equip',
    petCondTotal: 'Need {n} total cards',
    petCondAnimal: 'Need {n} animal cards',
    titleEquippedStatus: '✅ Equipped (tap to remove)',
    titleEquipAvailable: 'Tap to equip',
    titleLockCond: '🔒 Reach Lv.{n} to unlock',
    itemEquippedStatus: '✅ Equipped',
    itemEquipAvailable: 'Equip',
    itemNone: 'No items',
    bagNone: 'No lucky bags yet 🎁',
    bagLabel: 'Lucky Bag #{n}',
    bagTapToOpen: 'Tap to open',
    bagOpeningMsg: 'Opening...',
    bagDrumrollMsg: 'Drumroll...',
    bagReceiveBtn: '🎉 Receive!',
    bagRarityEpic: '★★★ Legendary',
    bagRarityRare: '★★ Rare',
    bagRarityCommon: '★ Common',
    levelUpMsg: 'Congrats! You leveled up! 🎉',
    levelUpConfirm: 'OK!',
    itemUnlockToast: '🎉 New item unlocked! {names}',
    petUnlockSuffix: '(Pet)',
    battleCatPlant: '🌱 Plant Knowledge Battle',
    battleCatAnimal: '🦊 Animal Knowledge Battle',
    battleCatArtifact: '🏺 Artifact Knowledge Battle',
    workshopTab: '⚗️ Workshop',
    exploreTitle: '🥾 Exploring...',
    exploreSafetyMsg: 'Look away from the screen<br>and walk around safely!',
    exploreSafetyHint: 'Keep walking and cards will appear 🌿',
    mapScreenTitle: '🗺️ Explorer Map',
    tabExploringBadge: 'Exploring {name} {emoji}',
    tabAnimalLocked: 'Reach Level 5 to unlock Animals!\\n(Current Lv.{cur}, {needed} more level-ups needed)',
    tabArtifactLocked: 'Reach Level 10 to unlock Artifacts!\\n(Current Lv.{cur}, {needed} more level-ups needed)',
    titleBadgeExplorer: 'Explorer',
    titleBadgePro: 'PRO Explorer',
    titleBadgeMaster: 'Master',
    dodamScreenTitle: '📖 My Collection',
    imagesCached: '✅ 300 images saved! Available offline too',
    wakeLockOn: 'Screen Stay-On ON 🔆 Let\'s explore!',
    safetyWarningTitle: '🚨 S A F E T Y!',
    safetyWarningDesc: 'Press Explore button first!\nCards appear while walking 🌿\nCheck screen in a safe place!',
    itemScreenTitle: '🎒 My Items',
    itemEquipDone: 'Done!',
    avatarSelectTitle: '🎮 Choose Your Explorer!',
    avatarSelectSubtitle: 'Pick a character to explore<br>the Ddogam world with you',
    avatarSelectConfirm: 'Confirm!',
    settingsTitle: '⚙️ Settings',
    settingsLang: '🌐 Language',
    settingsExport: '📤 Export My Data',
    settingsExportDesc: 'Scan QR code to transfer data to another device',
    settingsClose: 'Close',
    exportTitle: '📤 My Data QR Code',
    exportDesc: 'Scan this QR code on your other device!',
    exportWarning: '⚠️ This QR contains your collection data.\nDo not show it to others!',
    exportClose: 'Close',
    exportSuccess: '✅ Data Restored!',
    exportSuccessDesc: 'Your cards and level have been restored!',
    exportCopyBtn: '🔗 Copy URL',
    exportCopied: '✅ Copied!',
    exportCopyGuide: 'Paste this URL in Chrome on your new device to restore your data!',
    exportBagWarning: '🎁 Lucky bags are not transferred!\nOpen all your lucky bags before exporting.',
    helpMainSubtitle: 'Walk, collect, and learn!',
    helpStep1Title: 'STEP 1. Start Exploring!',
    helpStep1Desc: 'Tap the orange Explore button.',
    helpStep2Title: 'STEP 2. Walk Around!',
    helpStep2Desc: 'Keep screen on and put in pocket. Check when you feel vibration in a safe place!',
    helpStep3Title: 'STEP 3. Collect Cards!',
    helpStep3Desc: 'Complete your collection and level up!',
    helpStep4Title: 'STEP 4. Level Up Quiz!',
    helpStep4Desc: 'Answer quizzes to unlock the next stage!',
    helpMainCloseBtn: 'OK',
    helpDetailBtn: '📚 Learn More',
    helpBackBtn: '← Back',
    helpDetailTitle: '📚 Detailed Guide',
    helpExploreTitle: '👟 How to Explore',
    helpExploreDesc: '• Tap the orange Explore! button to start\n• ⚠️ Never look at your screen while walking!\n• Keep screen on and put device in your pocket\n• Cards appear randomly around your location\n• Stop safely when you feel vibration to check\n• 30% chance to choose 1 of 3 cards!',
    helpDodamTitle: '📖 Collection',
    helpDodamDesc: '• View all collected cards\n• 100 Plants, 100 Animals, 100 Artifacts\n• Rarity: ★ Common / ★★ Rare / ★★★ Legendary\n• Tap a card to see detailed info\n• Use ⚗️ Workshop to exchange duplicate cards',
    helpWorkshopTitle: '⚗️ Workshop',
    helpWorkshopDesc: '• Duplicate cards go to the Workshop\n• Select 5 cards to craft a new one!\n• 1+ Legendary → Always Legendary\n• 4-5 Rare → 50% Legendary / 50% Rare\n• 3 Rare + 2 Common → 100% Rare\n• 1-2 Rare + Common → 60% Rare / 40% Common\n• 5 Common → 75% Common / 15% Rare / 10% Legendary',
    helpLevelTitle: '⭐ Level & Items',
    helpLevelDesc: '• Level-up quiz every 10 cards!\n• Must answer correctly to level up\n• Lv.5 → Unlock Animal exploration\n• Lv.10 → Unlock Artifact exploration\n• Unlock avatars/outfits/items/pets/titles by level\n• Tap avatar to open customization screen',
    helpQuizTitle: '📝 Daily Quiz',
    helpQuizDesc: '• One OX quiz per day\n• Guess if a card description is correct\n• Correct answer = 1 Lucky Bag!\n• AI Ddogam analyzes your weak areas\n• Resets after midnight',
    helpBattleTitle: '⚔️ Knowledge Battle',
    helpBattleDesc: '• Battle classmates in knowledge!\n• Select category → 1 min study → auto match\n• Answer 5 questions (3 min limit) to win!\n• Win → 1 Lucky Bag / Draw → 1 Lucky Piece\n• 2 pieces = 1 Lucky Bag\n• Max 3 battles/day / AI battle if no match!',
    helpBagTitle: '🎁 Lucky Bag',
    helpBagDesc: '• Earned from daily quiz / battle wins\n• Teachers can send special gifts too\n• Open in Items → Lucky Bag tab\n• Fun drumroll animation when opening!',
    helpSettingsTitle: '⚙️ Settings',
    helpSettingsDesc: '• Language: Korean/English/Russian/Chinese\n• Export Data: Transfer via QR code to new device\n• Open all Lucky Bags before transferring!',
    helpDetailCloseBtn: 'OK!',
    cardChoiceTitle: 'Choose a Card!',
    cardChoiceDesc: 'Pick 1 to add to your collection',
    cardChoiceTap: 'Tap to select',
    bagOpenAll: '🎁 Open All',
    battleAICorrect: 'AI Ddogam Correct! ✓',
    battleAIWrong: 'AI Ddogam Wrong ✗',
    aiBattleTitle: '⚔️ AI Battle',
    aiBattleOpponent: 'AI Ddogam',
    aiBattlePlayer: '🤖 AI Player',
    aiBattleSpecial: '🤖 Special AI Battle!',
    aiBattleDesc: 'Answer more than 5 questions correctly to win!<br>AI battles don\'t count toward daily limit',
    aiBattleStart: '⚔️ Battle Start!',
    aiBattleMe: 'Me',
    aiBattleAI: '🤖 AI',
    aiBattleThinking: 'AI Ddogam is thinking...',
    aiBattleQuestion: 'What describes this card?',
    aiBattleDataLoading: 'Loading card data! Please try again in a moment.',
    battleQuizOf: 'of',
    aiBattleResultWin: 'Amazing! You beat AI Ddogam! 🎉<br><span style="color:#ffd700;font-size:11px;">🎁 1 Lucky Bag earned!</span>',
    aiBattleResultDraw: 'You drew with AI Ddogam! 💪<br><span style="color:#4a9eff;font-size:11px;">🧩 1 Lucky Piece earned!</span>',
    aiBattleResultLose: 'AI Ddogam was a little faster.<br>Read more cards and try again! 📖',
    aiBattleNoLimit: 'AI battles have no daily limit',
    aiBattleBack: 'Back',
    rewardArriveLabel: 'Gift from Teacher!',
    rewardArriveTitle: 'Lucky Bag has arrived!',
    rewardArriveDesc: 'Check Items → Lucky Bag tab<br>to open it! 🌟',
    rewardArriveBtn: 'OK!',
    settingsCopyright: '📋 Open Source & Content Credits',
    cardChoiceTimeoutNotice: '⏱ Auto-selects if you don\'t choose within 10 seconds',
    explorationSummaryTitle: 'Exploration Results',
    explorationSummaryCount: '{n} cards collected!',
    discoveryTimeoutNotice: '(Auto-collects if not tapped within 10s)',
  },
  ru: {
    langBtnLabel: 'Русский',
    exploreBtn: 'Вперёд!',
    dodamBtn: 'Сборник',
    mapBtn: 'Карта',
    itemBtn: 'Вещи',
    battleBtn: 'Бой',
    dailyQuizBtn: 'Тест<br>дня',
    helpBtn: 'Помощь',
    categoryPlant: '🌱 Растения',
    categoryAnimal: '🦊 Животные',
    categoryArtifact: '🏺 Артефакты',
    exploringBadge: '🌱 Исследование',
    totalProgress: 'Прогресс',
    confirmBtn: 'Понятно!',
    detailBtn: 'Подробнее ▶',
    backBtn: '◀ Назад',
    closeBtn: 'Закрыть',
    rarityCommon: 'Обычный',
    rarityRare: 'Редкий',
    rarityEpic: 'Эпический',
    newDiscovery: '🎉 Новая находка! Нажмите экран!',
    exploringMsg: '🥾 Исследование...',
    stopExplore: 'Стоп',
    // [한글 주석] 배틀 화면 텍스트
    battleTitle: 'Битва знаний',
    battleDesc1: 'Соревнование знаний с одноклассниками!',
    battleDesc2: '1 мин учёбы → матч → 5 вопросов',
    battleDesc3: 'Победи и получи мешочек удачи!',
    battleFragments: '🧩 Осколки:',
    battleFragmentHint: 'Ещё 1 — и будет мешочек!',
    battleCountLoading: 'Проверяем количество битв...',
    battleCountMax: '3 битвы завершены! Попробуй завтра 😊',
    battleCountToday: 'Сегодня: {n}/3',
    battleCountFail: 'Ошибка проверки',
    battleClose: 'Закрыть',
    battleLimitDesc: 'Макс. 3 битвы/день (только матч)',
    battleDrawDesc: 'Ничья = 1 осколок удачи',
    battleStudyTimer: '1 мин учёбы, затем матч!',
    battleStudyMsg: 'Изучай карточки!',
    battlePrev: '← Назад',
    battleFlip: '🔄 Перевернуть',
    battleNext: 'Вперёд →',
    battleGiveUp: 'Сдаться',
    battleGiveUpConfirm: 'Сдаться в битве?',
    battleQuizQuestion: 'Что описывает эту карточку?',
    battleReadyLabel: 'Готовность',
    battleFlipHintFront: '🔄 Перевернуть для деталей!',
    battleFlipHintBack: '🔄 Перевернуть на лицо!',
    battleDetailLabel: 'Подробности',
    battleMatching: '🔍 Поиск...',
    battleSearching: '🔍 Ищем соперника...',
    battleMatchFail: 'Матч не найден',
    battleMatchFailDesc: 'Не удалось найти соперника.',
    battleMatchFailHint: 'Попробуй с друзьями!',
    battleRetry: 'Попробуй снова!',
    battleMatchSuccess: 'Матч найден!',
    battleMatchDesc: 'Битва с игроком №{n}!',
    battleMatchHint: 'Ответь на больше из 5 вопросов!',
    battleMatchReward: 'Получи мешочек удачи 🎁',
    battleStart: '⚔️ Начать битву!',
    battleQuizLabel: '⚔️ Квиз битвы',
    battleScore: 'Счёт: {my} / {total}',
    battleWaitResult: 'Ждём соперника...',
    battleWaitHint: 'Подождите!',
    battleWin: '🏆 Победа!',
    battleLose: '😔 Поражение',
    battleDraw: '🤝 Ничья!',
    battleUnknown: '⚔️ Завершено',
    battleRewardWin: 'Ты получил мешочек удачи!',
    battleRewardLose: 'В следующий раз повезёт!',
    battleRewardDraw: 'Ты получил осколок удачи!',
    battleRewardUnknown: 'Не удалось получить результат.',
    battleConfirm: 'ОК!',
    battleMe: 'Я',
    battleOpponent: 'Соперник',
    battleOf5: '/ 5',
    battleAITitle: 'Вызов от ИИ Ттогами!',
    battleAIDesc1: 'Соперник не найден, но...',
    battleAIDesc2: '🤖 ИИ Ттогами бросил вызов!',
    battleAIDesc3: 'Битва начнётся скоро...',
    battleLoginRequired: 'Требуется вход!',
    battleDataLoading: 'Загрузка данных. Попробуй позже!',
    battleTimeout: '⏱ Время вышло! Ты проиграл.',
    // [한글 주석] 퀴즈 화면 텍스트
    quizDataLoading: 'Загрузка данных. Попробуйте позже.',
    quizCorrect: '🎉 Верно!',
    quizWrong: '❌ Неверно',
    quizPassTitle: '🎊 Разблокировано! 🎊',
    quizPassDescAnimal: '{n} верных! Животные разблокированы!',
    quizPassDescArtifact: '{n} верных! Артефакты разблокированы!',
    quizFailTitle: 'Учись больше! 😊',
    quizFailDesc: '{score} верных. (Нужно {pass})',
    levelQuizHeader: '🎯 Квиз Ур.{n}!',
    levelQuizSubHeader: 'Верно = уровень выше! Нет = следующий раз',
    levelQuizQuestion: 'Что описывает эту карточку?',
    levelQuizFailToast: '❌ Почти! Собери ещё карточки и попробуй снова!',
    categoryUnlockTitle: '🎉 Разблокировано!',
    categoryUnlockAnimal: '🦊 Животные разблокированы!',
    categoryUnlockArtifact: '🏺 Артефакты разблокированы!',
    categoryUnlockDescAnimal: 'Уровень 5!<br>Теперь можно собирать 🦊 карточки животных!',
    categoryUnlockDescArtifact: 'Уровень 10!<br>Теперь можно собирать 🏺 карточки артефактов!',
    categoryUnlockBtn: '🚀 На исследование!',
    dailyQuizDoneLabel: 'Готово',
    dailyQuizLabel: 'Ежедн.\nТест',
    dailyQuizNoCard: 'Сначала собери карточки!',
    dailyQuizTitle: '📝 Ежедневный тест',
    dailyQuizDesc: '⭕ если верно, ❌ если нет',
    oxCorrect: 'Верно!',
    oxCorrectDesc: 'Отлично! Ты получил мешочек удачи!',
    oxCorrectBagLabel: 'Мешочек получен!',
    oxCorrectBagHint: 'Открой в Предметы → Мешочек удачи!',
    oxCorrectBtn: '🎁 ОК!',
    oxWrong: 'Жаль!',
    oxWrongDesc: 'Попробуй завтра!',
    oxWrongHint: 'Читай информацию о карточках 📖',
    oxWrongBtn: 'ОК',
    dailyDoneTitle: 'Тест пройден!',
    dailyDoneDesc: 'Возвращайся после полуночи!',
    dailyDoneTimer: 'Сброс через {h}ч {m}мин',
    dailyDoneBtn: 'ОК',
    aiTitle: 'ИИ Ттогами',
    aiAnalysisLabel: 'ИИ Анализ',
    aiAnalyzing: 'АНАЛИЗ...',
    aiComplete: 'ГОТОВО ✓',
    aiRadarLabel: 'Радар точности',
    aiWeakTitle: '⚡ Анализ слабых мест',
    aiWeakDesc: '{cat} требует практики!',
    aiWeakRate: 'Точность: {n}%',
    aiRecommendLabel: '🎯 Рекомендация ИИ',
    aiStartBtn: '🤖 Начать тест от ИИ',
    aiClose: 'Закрыть',
    aiNoData: 'Нет данных',
    aiNoHistory: 'Нет истории квизов',
    aiScoreDesc: '{c}/{t} верных',
    radarPlant: 'Растения',
    radarAnimal: 'Животные',
    radarArtifact: 'Артефакты',
    firstTimeTitle: 'Первый тест сегодня!',
    firstTimeDesc: 'Чем больше тестов, тем лучше анализ ИИ 📊',
    firstTimeStartBtn: '📝 Начать тест',
    firstTimeClose: 'Закрыть',
    // [한글 주석] 도감 화면 텍스트
    dodamLocked: 'Коллекция ещё не открыта! Сначала заполни предыдущую.',
    dodamTabPlant: '🌱 Растения',
    dodamTabAnimal: '🦊 Животные',
    dodamTabArtifact: '🏺 Артефакты',
    dodamTabAnimalLocked: '🔒 Животные',
    dodamTabArtifactLocked: '🔒 Артефакты',
    dodamSummary: '{n} / {total} собрано',
    dodamUnknownDesc: 'Не найдено',
    dodamDateDefault: '📅 Недавно собрано',
    workshopSummary: 'Мастерская карточек',
    workshopEmptyTitle: 'Мастерская пуста',
    workshopEmptyDesc: 'Собирай дублирующиеся карточки,<br>и они появятся здесь!<br>Объедини <span style="color:#ffd700;">5 карточек</span> в новую ✨',
    workshopSelectedInfo: 'Выбрано: {n} / 5',
    workshopHeaderTitle: '⚗️ Мастерская',
    workshopHeaderDesc: 'Выбери <span style="color:#ffd700;">5</span> дублирующихся карточек!<br>Редкость результата зависит от выбора 🎲',
    workshopCraftBtn: '✨ Создать!',
    workshopMaxSelect: 'Можно выбрать только 5 карточек!',
    craftSuccess: 'Успешно создано!',
    craftNewCard: 'Ты получил новую карточку!',
    craftDupCard: 'Карточка уже есть, но ты её получил!',
    craftConfirm: '🎉 ОК!',
    // [한글 주석] 지도 화면 텍스트
    mapStatusTracking: '📍 Отслеживание позиции',
    mapStatusNoPermission: '📍 Нужно разрешение (показана точка по умолчанию)',
    mapStatusNoSupport: '📍 Браузер не поддерживает геолокацию',
    mapMyLocation: '📍 Моё местоположение',
    mapDateUnknown: 'Дата неизвестна',
    mapClusterTitle: 'Здесь найдено: {n}!',
    mapRarityCommon: 'Обычная',
    mapRarityRare: 'Редкая',
    mapRarityEpic: 'Легендарная',
    mapCollectedCount: '🎒 Собрано: {n}',
    // [한글 주석] 아이템/아바타 화면 텍스트
    avatarSelectPrompt: 'Выберите аватар!',
    avatarSelectedStatus: '✅ Выбрано',
    avatarSelectAvailable: 'Доступно',
    avatarLockCond: '🔒 Открывается на ур.{n}',
    outfitEquippedStatus: '✅ Надето',
    outfitEquipAvailable: 'Надеть',
    petEquippedStatus: '✅ Надет',
    petEquipAvailable: 'Надеть',
    petCondTotal: 'Нужно {n} карточек всего',
    petCondAnimal: 'Нужно {n} карточек животных',
    titleEquippedStatus: '✅ Надето (нажми чтобы снять)',
    titleEquipAvailable: 'Нажми чтобы надеть',
    titleLockCond: '🔒 Откроется на ур.{n}',
    itemEquippedStatus: '✅ Надето',
    itemEquipAvailable: 'Надеть',
    itemNone: 'Нет предметов',
    bagNone: 'Мешочков удачи пока нет 🎁',
    bagLabel: 'Мешочек #{n}',
    bagTapToOpen: 'Нажми чтобы открыть',
    bagOpeningMsg: 'Открывается...',
    bagDrumrollMsg: 'Барабанная дробь...',
    bagReceiveBtn: '🎉 Получить!',
    bagRarityEpic: '★★★ Легендарная',
    bagRarityRare: '★★ Редкая',
    bagRarityCommon: '★ Обычная',
    levelUpMsg: 'Поздравляю! Уровень повышен! 🎉',
    levelUpConfirm: 'ОК!',
    itemUnlockToast: '🎉 Новый предмет! {names}',
    petUnlockSuffix: '(Питомец)',
    battleCatPlant: '🌱 Битва: Растения',
    battleCatAnimal: '🦊 Битва: Животные',
    battleCatArtifact: '🏺 Битва: Артефакты',
    workshopTab: '⚗️ Мастерская',
    exploreTitle: '🥾 Исследование...',
    exploreSafetyMsg: 'Отведи взгляд от экрана<br>и безопасно прогуляйся!',
    exploreSafetyHint: 'Иди вперёд — и карточки появятся 🌿',
    mapScreenTitle: '🗺️ Карта',
    tabExploringBadge: 'Исследование {name} {emoji}',
    tabAnimalLocked: 'Достигни уровня 5 для Животных!\\n(Сейчас Ур.{cur}, нужно ещё {needed} уровней)',
    tabArtifactLocked: 'Достигни уровня 10 для Артефактов!\\n(Сейчас Ур.{cur}, нужно ещё {needed} уровней)',
    titleBadgeExplorer: 'Исследователь',
    titleBadgePro: 'PRO Исследователь',
    titleBadgeMaster: 'Мастер',
    dodamScreenTitle: '📖 Мой сборник',
    imagesCached: '✅ 300 изображений сохранено! Доступно офлайн',
    wakeLockOn: 'Экран не гаснет ON 🔆 Начинаем!',
    safetyWarningTitle: '🚨 О С Т О Р О Ж Н О!',
    safetyWarningDesc: 'Нажми кнопку Вперёд!\nКарточки появятся при ходьбе 🌿\nПроверяй экран в безопасном месте!',
    itemScreenTitle: '🎒 Мои вещи',
    itemEquipDone: 'Готово!',
    avatarSelectTitle: '🎮 Выбери исследователя!',
    avatarSelectSubtitle: 'Выбери персонажа для<br>исследования мира Ттогами',
    avatarSelectConfirm: 'Выбрать!',
    settingsTitle: '⚙️ Настройки',
    settingsLang: '🌐 Язык',
    settingsExport: '📤 Экспорт данных',
    settingsExportDesc: 'Сканируй QR-код для переноса данных',
    settingsClose: 'Закрыть',
    exportTitle: '📤 QR-код данных',
    exportDesc: 'Сканируй этот QR-код на другом устройстве!',
    exportWarning: '⚠️ QR содержит твои данные.\nНе показывай его другим!',
    exportClose: 'Закрыть',
    exportSuccess: '✅ Данные восстановлены!',
    exportSuccessDesc: 'Твои карточки и уровень восстановлены!',
    exportCopyBtn: '🔗 Копировать URL',
    exportCopied: '✅ Скопировано!',
    exportCopyGuide: 'Вставь этот URL в Chrome на новом устройстве для восстановления данных!',
    exportBagWarning: '🎁 Мешочки удачи не переносятся!\nОткрой все мешочки перед экспортом.',
    helpMainSubtitle: 'Ходи, собирай и учись!',
    helpStep1Title: 'ШАГ 1. Начни исследование!',
    helpStep1Desc: 'Нажми оранжевую кнопку Вперёд!',
    helpStep2Title: 'ШАГ 2. Прогуляйся!',
    helpStep2Desc: 'Не выключай экран, убери в карман. При вибрации остановись в безопасном месте!',
    helpStep3Title: 'ШАГ 3. Собирай карточки!',
    helpStep3Desc: 'Заполняй коллекцию и повышай уровень!',
    helpStep4Title: 'ШАГ 4. Квиз на уровень!',
    helpStep4Desc: 'Отвечай на вопросы, чтобы открыть следующий этап!',
    helpMainCloseBtn: 'ОК',
    helpDetailBtn: '📚 Подробнее',
    helpBackBtn: '← Назад',
    helpDetailTitle: '📚 Подробное руководство',
    helpExploreTitle: '👟 Как исследовать',
    helpExploreDesc: '• Нажми кнопку Вперёд! для начала\n• ⚠️ Никогда не смотри в экран при ходьбе!\n• Не выключай экран, убери устройство в карман\n• Карточки появляются рядом с твоим местом\n• При вибрации остановись и проверь экран\n• 30% шанс выбрать 1 из 3 карточек!',
    helpDodamTitle: '📖 Коллекция',
    helpDodamDesc: '• Просматривай все собранные карточки\n• 100 Растений, 100 Животных, 100 Артефактов\n• Редкость: ★ Обычная / ★★ Редкая / ★★★ Легендарная\n• Нажми карточку для подробной информации\n• В ⚗️ Мастерской меняй дубликаты на новые',
    helpWorkshopTitle: '⚗️ Мастерская',
    helpWorkshopDesc: '• Дубликаты попадают в Мастерскую\n• Выбери 5 карточек для создания новой!\n• 1+ Легендарная → Всегда Легендарная\n• 4-5 Редких → 50% Легендарная / 50% Редкая\n• 3 Редких + 2 Обычных → 100% Редкая\n• 1-2 Редких + Обычные → 60% Редкая / 40% Обычная\n• 5 Обычных → 75% Обычная / 15% Редкая / 10% Легендарная',
    helpLevelTitle: '⭐ Уровень и предметы',
    helpLevelDesc: '• Квиз на уровень каждые 10 карточек!\n• Нужно ответить верно для повышения\n• Ур.5 → Открываются Животные\n• Ур.10 → Открываются Артефакты\n• По уровню открываются аватары/одежда/предметы/питомцы/звания\n• Нажми аватар для настройки',
    helpQuizTitle: '📝 Ежедневный тест',
    helpQuizDesc: '• Один OX вопрос в день\n• Угадай, верно ли описание карточки\n• Верный ответ = 1 Мешочек удачи!\n• ИИ Ттогами анализирует твои слабые места\n• Сбрасывается после полуночи',
    helpBattleTitle: '⚔️ Битва знаний',
    helpBattleDesc: '• Соревнуйся с одноклассниками!\n• Выбери категорию → 1 мин учёбы → матч\n• Ответь на 5 вопросов (3 мин) для победы!\n• Победа → 1 Мешочек / Ничья → 1 Осколок\n• 2 осколка = 1 Мешочек\n• Макс. 3 битвы/день / При неудаче — бой с ИИ!',
    helpBagTitle: '🎁 Мешочек удачи',
    helpBagDesc: '• Получай за тест / победу в битве\n• Учитель тоже может прислать подарок\n• Открывай в Вещи → Мешочек удачи\n• Барабанная дробь при открытии!',
    helpSettingsTitle: '⚙️ Настройки',
    helpSettingsDesc: '• Язык: Корейский/Английский/Русский/Китайский\n• Экспорт данных: QR-код для переноса на новое устройство\n• Сначала открой все мешочки перед переносом!',
    helpDetailCloseBtn: 'ОК!',
    cardChoiceTitle: 'Выбери карточку!',
    cardChoiceDesc: 'Выбери 1 для коллекции',
    cardChoiceTap: 'Нажми для выбора',
    bagOpenAll: '🎁 Открыть все',
    battleAICorrect: 'ИИ Ттогами верно! ✓',
    battleAIWrong: 'ИИ Ттогами неверно ✗',
    aiBattleTitle: '⚔️ Битва с ИИ',
    aiBattleOpponent: 'ИИ Ттогами',
    aiBattlePlayer: '🤖 ИИ Игрок',
    aiBattleSpecial: '🤖 Особая битва с ИИ!',
    aiBattleDesc: 'Ответь на больше вопросов из 5 чтобы победить!<br>Битвы с ИИ не входят в дневной лимит',
    aiBattleStart: '⚔️ Начать битву!',
    aiBattleMe: 'Я',
    aiBattleAI: '🤖 ИИ',
    aiBattleThinking: 'ИИ Ттогами думает...',
    aiBattleQuestion: 'Что описывает эту карточку?',
    aiBattleDataLoading: 'Загрузка данных! Попробуйте ещё раз.',
    battleQuizOf: 'из',
    aiBattleResultWin: 'Отлично! Ты победил ИИ Ттогами! 🎉<br><span style="color:#ffd700;font-size:11px;">🎁 Получен 1 мешочек удачи!</span>',
    aiBattleResultDraw: 'Ничья с ИИ Ттогами! 💪<br><span style="color:#4a9eff;font-size:11px;">🧩 Получен 1 осколок!</span>',
    aiBattleResultLose: 'ИИ Ттогами был чуть быстрее.<br>Читай карточки и попробуй снова! 📖',
    aiBattleNoLimit: 'Битвы с ИИ без дневного лимита',
    aiBattleBack: 'Назад',
    rewardArriveLabel: 'Подарок от учителя!',
    rewardArriveTitle: 'Мешочек удачи прибыл!',
    rewardArriveDesc: 'Открой вкладку Вещи → Мешочек<br>и посмотри! 🌟',
    rewardArriveBtn: 'ОК!',
    settingsCopyright: '📋 Открытые источники и контент',
    cardChoiceTimeoutNotice: '⏱ Автовыбор через 10 секунд, если не выберешь',
    explorationSummaryTitle: 'Результаты исследования',
    explorationSummaryCount: 'Собрано карточек: {n}!',
    discoveryTimeoutNotice: '(Автосбор через 10 сек, если не нажать)',
  },
  zh: {
    langBtnLabel: '中文',
    exploreBtn: '探索!',
    dodamBtn: '图鉴',
    mapBtn: '地图',
    itemBtn: '道具',
    battleBtn: '对战',
    dailyQuizBtn: '每日<br>测验',
    helpBtn: '帮助',
    categoryPlant: '🌱 植物',
    categoryAnimal: '🦊 动物',
    categoryArtifact: '🏺 文物',
    exploringBadge: '🌱 探索植物中',
    totalProgress: '总进度',
    confirmBtn: '知道了!',
    detailBtn: '详情 ▶',
    backBtn: '◀ 返回',
    closeBtn: '关闭',
    rarityCommon: '普通',
    rarityRare: '稀有',
    rarityEpic: '史诗',
    newDiscovery: '🎉 新发现！点击屏幕！',
    exploringMsg: '🥾 探索中...',
    stopExplore: '停止',
    // [한글 주석] 배틀 화면 텍스트
    battleTitle: '知识对战',
    battleDesc1: '和同班同学比拼知识！',
    battleDesc2: '学习1分钟→自动匹配→5题对决',
    battleDesc3: '获胜可得一个福袋！',
    battleFragments: '🧩 福袋碎片：',
    battleFragmentHint: '再集1个就能得福袋！',
    battleCountLoading: '正在确认今天的对战次数...',
    battleCountMax: '今天已完成3次对战！明天再来挑战吧 😊',
    battleCountToday: '今天对战：{n}/3次',
    battleCountFail: '确认失败',
    battleClose: '关闭',
    battleLimitDesc: '每天限3次（以匹配成功为准）',
    battleDrawDesc: '平局可得1个福袋碎片',
    battleStudyTimer: '学习1分钟后自动匹配！',
    battleStudyMsg: '看着卡片学习吧！',
    battlePrev: '← 上一张',
    battleFlip: '🔄 翻转',
    battleNext: '下一张 →',
    battleGiveUp: '放弃',
    battleGiveUpConfirm: '确定要放弃对战吗？',
    battleQuizQuestion: '这张卡片的描述是？',
    battleReadyLabel: '备战中',
    battleFlipHintFront: '🔄 翻转查看详细信息！',
    battleFlipHintBack: '🔄 翻转回正面！',
    battleDetailLabel: '详细信息',
    battleMatching: '🔍 匹配中...',
    battleSearching: '🔍 正在寻找对手...',
    battleMatchFail: '匹配失败',
    battleMatchFailDesc: '未能找到对手。',
    battleMatchFailHint: '和朋友们一起开始对战模式吧！',
    battleRetry: '请再试一次！',
    battleMatchSuccess: '匹配成功！',
    battleMatchDesc: '与{n}号同学对战！',
    battleMatchHint: '5题中答对更多题即获胜！',
    battleMatchReward: '可获得1个福袋 🎁',
    battleStart: '⚔️ 开始对战！',
    battleQuizLabel: '⚔️ 对战测验',
    battleScore: '当前得分：{my} / {total}',
    battleWaitResult: '等待对手结果中...',
    battleWaitHint: '请稍等！',
    battleWin: '🏆 胜利！',
    battleLose: '😔 失败',
    battleDraw: '🤝 平局！',
    battleUnknown: '⚔️ 完成',
    battleRewardWin: '获得了1个福袋！',
    battleRewardLose: '下次一定会更好的！',
    battleRewardDraw: '获得了1个福袋碎片！',
    battleRewardUnknown: '未能确认对手的结果。',
    battleConfirm: '确认！',
    battleMe: '我',
    battleOpponent: '对手',
    battleOf5: '/ 5',
    battleAITitle: 'AI又感的挑战书！',
    battleAIDesc1: '未找到对手，但是...',
    battleAIDesc2: '🤖 AI又感发来了挑战书！',
    battleAIDesc3: '对战即将开始...',
    battleLoginRequired: '需要登录！',
    battleDataLoading: '正在加载卡片数据，请稍后重试！',
    battleTimeout: '⏱ 时间到！你输了。',
    // [한글 주석] 퀴즈 화면 텍스트
    quizDataLoading: '测验数据加载中，请稍后重试。',
    quizCorrect: '🎉 正确！',
    quizWrong: '❌ 错误',
    quizPassTitle: '🎊 解锁成功！🎊',
    quizPassDescAnimal: '答对{n}题！现在可以探索动物了！',
    quizPassDescArtifact: '答对{n}题！现在可以探索文物了！',
    quizFailTitle: '再多学习一下吧！😊',
    quizFailDesc: '答对了{score}题。（通过标准：{pass}题）',
    levelQuizHeader: '🎯 Lv.{n} 达成测验！',
    levelQuizSubHeader: '答对就升级！答错下次再挑战',
    levelQuizQuestion: '这张卡片的描述是？',
    levelQuizFailToast: '❌ 可惜！收集更多卡片后再来挑战吧！',
    categoryUnlockTitle: '🎉 解锁！',
    categoryUnlockAnimal: '🦊 动物探索解锁！',
    categoryUnlockArtifact: '🏺 文物探索解锁！',
    categoryUnlockDescAnimal: '达到5级！<br>现在可以收集🦊动物卡片了！',
    categoryUnlockDescArtifact: '达到10级！<br>现在可以收集🏺文物卡片了！',
    categoryUnlockBtn: '🚀 去探索！',
    dailyQuizDoneLabel: '完成',
    dailyQuizLabel: '每日\n测验',
    dailyQuizNoCard: '请先收集卡片才能参加测验！',
    dailyQuizTitle: '📝 今日每日测验',
    dailyQuizDesc: '正确选⭕，错误选❌',
    oxCorrect: '正确！',
    oxCorrectDesc: '太棒了！获得了1个福袋！',
    oxCorrectBagLabel: '获得福袋！',
    oxCorrectBagHint: '在道具栏→福袋中打开！',
    oxCorrectBtn: '🎁 确认！',
    oxWrong: '可惜！',
    oxWrongDesc: '明天再来挑战吧！',
    oxWrongHint: '仔细阅读卡片信息会有帮助 📖',
    oxWrongBtn: '确认',
    dailyDoneTitle: '今日测验已完成！',
    dailyDoneDesc: '明天零点后再来挑战！',
    dailyDoneTimer: '{h}小时{m}分钟后重置',
    dailyDoneBtn: '确认',
    aiTitle: 'AI又感',
    aiAnalysisLabel: 'AI分析',
    aiAnalyzing: '分析中...',
    aiComplete: '完成 ✓',
    aiRadarLabel: '学习准确度雷达',
    aiWeakTitle: '⚡ 薄弱领域分析',
    aiWeakDesc: '{cat}需要重点练习！',
    aiWeakRate: '正确率{n}%',
    aiRecommendLabel: '🎯 今日AI推荐测验',
    aiStartBtn: '🤖 开始AI推荐每日测验',
    aiClose: '关闭',
    aiNoData: '无数据',
    aiNoHistory: '暂无测验记录',
    aiScoreDesc: '{c}/{t}题答对',
    radarPlant: '植物',
    radarAnimal: '动物',
    radarArtifact: '文物',
    firstTimeTitle: '今天的第一次测验！',
    firstTimeDesc: '测验越多，AI分析越精准 📊',
    firstTimeStartBtn: '📝 开始测验',
    firstTimeClose: '关闭',
    // [한글 주석] 도감 화면 텍스트
    dodamLocked: '这本图鉴还没有解锁！请先收集更多之前的图鉴。',
    dodamTabPlant: '🌱 植物',
    dodamTabAnimal: '🦊 动物',
    dodamTabArtifact: '🏺 文物',
    dodamTabAnimalLocked: '🔒 动物',
    dodamTabArtifactLocked: '🔒 文物',
    dodamSummary: '已收集 {n} / {total}',
    dodamUnknownDesc: '未发现',
    dodamDateDefault: '📅 最近收集',
    workshopSummary: '重复卡片合成所',
    workshopEmptyTitle: '合成所是空的',
    workshopEmptyDesc: '收集重复的卡片后<br>它们会出现在这里！<br>收集<span style="color:#ffd700;">5张</span>可以合成新卡片 ✨',
    workshopSelectedInfo: '已选：{n} / 5张',
    workshopHeaderTitle: '⚗️ 卡片合成所',
    workshopHeaderDesc: '选择<span style="color:#ffd700;">5张</span>重复卡片合成新卡！<br>结果稀有度取决于你的选择 🎲',
    workshopCraftBtn: '✨ 合成！',
    workshopMaxSelect: '最多只能选择5张！',
    craftSuccess: '合成成功！',
    craftNewCard: '获得了新卡片！',
    craftDupCard: '虽然是重复卡片，但也得到了！',
    craftConfirm: '🎉 确认！',
    // [한글 주석] 지도 화면 텍스트
    mapStatusTracking: '📍 正在追踪当前位置',
    mapStatusNoPermission: '📍 需要位置权限（显示默认位置）',
    mapStatusNoSupport: '📍 此浏览器不支持位置功能',
    mapMyLocation: '📍 我的位置',
    mapDateUnknown: '日期未知',
    mapClusterTitle: '在此处发现了{n}个！',
    mapRarityCommon: '普通',
    mapRarityRare: '稀有',
    mapRarityEpic: '传说',
    mapCollectedCount: '🎒 已收集道具：{n}个',
    // [한글 주석] 아이템/아바타 화면 텍스트
    avatarSelectPrompt: '请选择一个头像！',
    avatarSelectedStatus: '✅ 已选择',
    avatarSelectAvailable: '可选择',
    avatarLockCond: '🔒 Lv.{n}解锁',
    outfitEquippedStatus: '✅ 已穿戴',
    outfitEquipAvailable: '可穿戴',
    petEquippedStatus: '✅ 已装备',
    petEquipAvailable: '可装备',
    petCondTotal: '需要共{n}张卡片',
    petCondAnimal: '需要{n}张动物卡片',
    titleEquippedStatus: '✅ 已装备（点击卸下）',
    titleEquipAvailable: '点击装备',
    titleLockCond: '🔒 达到Lv.{n}解锁',
    itemEquippedStatus: '✅ 已装备',
    itemEquipAvailable: '可装备',
    itemNone: '暂无道具',
    bagNone: '还没有收到福袋 🎁',
    bagLabel: '福袋 #{n}',
    bagTapToOpen: '点击打开',
    bagOpeningMsg: '正在打开...',
    bagDrumrollMsg: '咚咚咚...',
    bagReceiveBtn: '🎉 领取！',
    bagRarityEpic: '★★★ 传说',
    bagRarityRare: '★★ 稀有',
    bagRarityCommon: '★ 普通',
    levelUpMsg: '恭喜！等级提升了！🎉',
    levelUpConfirm: '确认！',
    itemUnlockToast: '🎉 新道具解锁！{names}',
    petUnlockSuffix: '（宠物）',
    battleCatPlant: '🌱 植物知识对战',
    battleCatAnimal: '🦊 动物知识对战',
    battleCatArtifact: '🏺 文物知识对战',
    workshopTab: '⚗️ 合成所',
    exploreTitle: '🥾 探索中...',
    exploreSafetyMsg: '把视线从屏幕上移开<br>安全地四处走走吧！',
    exploreSafetyHint: '继续走，神奇的卡片就会出现 🌿',
    mapScreenTitle: '🗺️ 探险地图',
    tabExploringBadge: '探索{name}中 {emoji}',
    tabAnimalLocked: '达到5级即可解锁动物！\\n(当前Lv.{cur}，还需要升级{needed}次)',
    tabArtifactLocked: '达到10级即可解锁文物！\\n(当前Lv.{cur}，还需要升级{needed}次)',
    titleBadgeExplorer: '探险家',
    titleBadgePro: 'PRO探险家',
    titleBadgeMaster: '大师',
    dodamScreenTitle: '📖 我的图鉴',
    imagesCached: '✅ 300张图片已保存！离线也可以查看',
    wakeLockOn: '防止熄屏 ON 🔆 开始探索！',
    safetyWarningTitle: '🚨 注 意 安 全！',
    safetyWarningDesc: '先按探索按钮再走路！\n行走时卡片会出现 🌿\n请在安全的地方查看屏幕！',
    itemScreenTitle: '🎒 我的道具',
    itemEquipDone: '装备完成！',
    avatarSelectTitle: '🎮 选择你的探险家！',
    avatarSelectSubtitle: '选择一个角色和你一起<br>探索又感世界吧',
    avatarSelectConfirm: '选择完成！',
    settingsTitle: '⚙️ 设置',
    settingsLang: '🌐 语言设置',
    settingsExport: '📤 导出我的数据',
    settingsExportDesc: '扫描二维码可将数据转移到其他设备',
    settingsClose: '关闭',
    exportTitle: '📤 我的数据二维码',
    exportDesc: '在其他设备上扫描此二维码！',
    exportWarning: '⚠️ 二维码包含你的收集数据。\n请勿向他人展示！',
    exportClose: '关闭',
    exportSuccess: '✅ 数据恢复完成！',
    exportSuccessDesc: '你的卡片和等级已恢复！',
    exportCopyBtn: '🔗 复制链接',
    exportCopied: '✅ 已复制！',
    exportCopyGuide: '将此链接粘贴到新设备的Chrome浏览器地址栏中打开，即可恢复数据！',
    exportBagWarning: '🎁 福袋不会被传输！\n请在导出前打开所有福袋将其变成卡片。',
    helpMainSubtitle: '走路、收集、学习！',
    helpStep1Title: 'STEP 1. 开始探索！',
    helpStep1Desc: '点击橙色的探索按钮。',
    helpStep2Title: 'STEP 2. 四处走走！',
    helpStep2Desc: '保持屏幕亮着放入口袋走路。感到振动时在安全地方查看！',
    helpStep3Title: 'STEP 3. 收集卡片！',
    helpStep3Desc: '完成图鉴并提升等级！',
    helpStep4Title: 'STEP 4. 升级测验！',
    helpStep4Desc: '答对测验，升级解锁下一阶段！',
    helpMainCloseBtn: '确认',
    helpDetailBtn: '📚 了解更多',
    helpBackBtn: '← 返回',
    helpDetailTitle: '📚 详细说明',
    helpExploreTitle: '👟 探索方法',
    helpExploreDesc: '• 点击橙色探索！按钮开始\n• ⚠️ 走路时绝对不要看手机屏幕！\n• 按下探索按钮后保持屏幕亮着放入口袋\n• 走路时周围会随机出现卡片\n• 感到振动时在安全地方停下查看\n• 有30%的概率从3张卡中选择1张！',
    helpDodamTitle: '📖 图鉴',
    helpDodamDesc: '• 查看所有收集的卡片\n• 植物100种、动物100种、文物100种\n• 稀有度：★普通 / ★★稀有 / ★★★传说\n• 点击卡片查看详细信息\n• 在⚗️合成所用重复卡片换新卡片',
    helpWorkshopTitle: '⚗️ 合成所',
    helpWorkshopDesc: '• 重复的卡片会进入合成所\n• 选择5张卡片合成新卡片！\n• 1张以上传说 → 必定传说\n• 4-5张稀有 → 50%传说 / 50%稀有\n• 3张稀有+2张普通 → 100%稀有\n• 1-2张稀有+普通 → 60%稀有 / 40%普通\n• 5张普通 → 75%普通 / 15%稀有 / 10%传说',
    helpLevelTitle: '⭐ 等级与道具',
    helpLevelDesc: '• 每收集10张卡片挑战升级测验！\n• 答对才能升级\n• Lv.5达成 → 解锁动物探索\n• Lv.10达成 → 解锁文物探索\n• 根据等级解锁头像/服装/道具/宠物/称号\n• 点击头像进入装扮界面',
    helpQuizTitle: '📝 每日测验',
    helpQuizDesc: '• 每天一次OX测验\n• 猜猜收集的卡片描述是否正确\n• 答对获得1个福袋！\n• AI又感分析你的薄弱领域\n• 过了零点可以再次挑战',
    helpBattleTitle: '⚔️ 知识对战',
    helpBattleDesc: '• 和同班同学比拼知识！\n• 选择类别→学习1分钟→自动匹配\n• 回答5道题（3分钟限制）决胜负！\n• 获胜→1个福袋 / 平局→1个碎片\n• 2个碎片=1个福袋\n• 每天最多3次 / 匹配失败则与AI对战！',
    helpBagTitle: '🎁 福袋',
    helpBagDesc: '• 每日测验答对/对战获胜时获得\n• 老师也可以发送特别礼物\n• 在道具→福袋标签中查看开启\n• 开启时有咚咚咚动画！',
    helpSettingsTitle: '⚙️ 设置',
    helpSettingsDesc: '• 语言设置：支持韩语/英语/俄语/中文\n• 导出数据：通过二维码将数据传输到新设备\n• 传输前请先打开所有福袋！',
    helpDetailCloseBtn: '确认！',
    cardChoiceTitle: '选择一张卡片！',
    cardChoiceDesc: '选择1张加入图鉴',
    cardChoiceTap: '点击选择',
    bagOpenAll: '🎁 全部打开',
    battleAICorrect: 'AI又感答对了! ✓',
    battleAIWrong: 'AI又感答错了 ✗',
    aiBattleTitle: '⚔️ AI对战',
    aiBattleOpponent: 'AI又感',
    aiBattlePlayer: '🤖 AI玩家',
    aiBattleSpecial: '🤖 AI特别对战！',
    aiBattleDesc: '5题中答对更多题即可获胜！<br>AI对战不计入每日次数',
    aiBattleStart: '⚔️ 开始对战！',
    aiBattleMe: '我',
    aiBattleAI: '🤖 AI',
    aiBattleThinking: 'AI又感思考中...',
    aiBattleQuestion: '这张卡片的描述是？',
    aiBattleDataLoading: '正在加载卡片数据！请稍后重试。',
    battleQuizOf: '题中',
    aiBattleResultWin: '太棒了！你击败了AI又感！🎉<br><span style="color:#ffd700;font-size:11px;">🎁 获得1个福袋！</span>',
    aiBattleResultDraw: '与AI又感平局！💪<br><span style="color:#4a9eff;font-size:11px;">🧩 获得1个碎片！</span>',
    aiBattleResultLose: 'AI又感稍快一步。<br>多读卡片再来挑战！📖',
    aiBattleNoLimit: 'AI对战无每日次数限制',
    aiBattleBack: '返回',
    rewardArriveLabel: '老师的礼物到了！',
    rewardArriveTitle: '福袋已到达！',
    rewardArriveDesc: '在道具 → 福袋标签<br>中查看吧！🌟',
    rewardArriveBtn: '确认！',
    settingsCopyright: '📋 开源及内容说明',
    cardChoiceTimeoutNotice: '⏱ 10秒内未选择将自动选择',
    explorationSummaryTitle: '本次探索结果',
    explorationSummaryCount: '共收集{n}张！',
    discoveryTimeoutNotice: '(10秒内未点击将自动收集)',
  }
};

// [한글 주석] 번역팩에서 텍스트 반환 (API 호출 없음)
// [한글 주석] cards.json의 name_en, short_desc_ru 등 필드를 직접 읽음
function translateText(text, targetLang) {
  // [한글 주석] 한국어는 원본 그대로 반환
  if (!text || targetLang === 'ko') return text;
  // [한글 주석] 번역팩 방식에서는 개별 텍스트 번역 불필요 (applyCardTranslation에서 처리)
  return text;
}

// [한글 주석] 언어 선택 팝업 표시
function showLangSelectPopup() {
  const existing = document.getElementById('lang-select-popup');
  if (existing) { existing.remove(); return; }

  const popup = document.createElement('div');
  popup.id = 'lang-select-popup';
  popup.style.cssText = `
    position:fixed;
    bottom:90px;
    left:14px;
    background:linear-gradient(135deg,#2c3e2d,#3d5239);
    border:1.5px solid #6b8e3d;
    border-radius:14px;
    padding:12px;
    z-index:99999;
    box-shadow:0 8px 24px rgba(0,0,0,0.5);
    display:flex;
    flex-direction:column;
    gap:8px;
    min-width:180px;
  `;

  const langs = [
    { code: 'ko', label: '🇰🇷 한국어' },
    { code: 'en', label: '🇺🇸 English' },
    { code: 'ru', label: '🇷🇺 Русский' },
    { code: 'zh', label: '🇨🇳 中文' },
  ];

  langs.forEach(lang => {
    const btn = document.createElement('button');
    const isActive = window.currentLang === lang.code;
    btn.style.cssText = `
      background:${isActive ? '#8db05c' : 'transparent'};
      border:1px solid ${isActive ? '#8db05c' : '#6b8e3d'};
      border-radius:8px;
      color:${isActive ? '#2c3e2d' : '#f0e6c8'};
      font-family:${LANG_FONTS[lang.code]};
      font-size:15px;
      font-weight:${isActive ? '900' : '700'};
      padding:10px 14px;
      text-align:left;
      cursor:pointer;
      width:100%;
    `;
    btn.textContent = lang.label;
    btn.onclick = () => {
      selectLanguage(lang.code);
      popup.remove();
    };
    popup.appendChild(btn);
  });

  document.body.appendChild(popup);

  // [한글 주석] 팝업 외부 클릭 시 닫기
  setTimeout(() => {
    document.addEventListener('click', function closeLangPopup(e) {
      if (!popup.contains(e.target) && e.target.id !== 'lang-select-btn') {
        popup.remove();
        document.removeEventListener('click', closeLangPopup);
      }
    });
  }, 100);
}

// [한글 주석] 언어 선택 및 UI 전체 적용
function selectLanguage(langCode) {
  window.currentLang = langCode;
  localStorage.setItem('selectedLang', langCode);

  // [한글 주석] body 폰트 변경
  document.body.style.fontFamily = LANG_FONTS[langCode];

  // [한글 주석] 설정 버튼 라벨 업데이트 (언어 버튼이 설정 버튼으로 변경됨)
  const settingsBtnLabel = document.getElementById('settings-btn-label');
  if (settingsBtnLabel) {
    const settingsLabels = { ko: '설정', en: 'Settings', ru: 'Настройки', zh: '设置' };
    settingsBtnLabel.textContent = settingsLabels[langCode] || '설정';
  }

  // [한글 주석] UI 텍스트 일괄 적용
  applyUIText(langCode);
}

// [한글 주석] UI 고정 텍스트 일괄 교체
function applyUIText(langCode) {
  const ui = LANG_UI[langCode];
  if (!ui) return;

  // [한글 주석] 탐험 버튼
  const exploreBtn = document.querySelector('.action-btn.btn-explore');
  if (exploreBtn) exploreBtn.innerHTML = `👟<br>${ui.exploreBtn}`;

  // [한글 주석] 사이드 버튼들 (btn-customize 내부에 span 구조 있으므로 innerHTML로 처리)
  const sideButtons = document.querySelectorAll('.side-btn');
  sideButtons.forEach(btn => {
    if (btn.classList.contains('btn-book')) btn.innerHTML = `📖<br>${ui.dodamBtn}`;
    if (btn.classList.contains('btn-map')) btn.innerHTML = `🗺️<br>${ui.mapBtn}`;
    if (btn.classList.contains('btn-customize')) btn.innerHTML = `🎒<br>${ui.itemBtn}`;
  });

  // [한글 주석] 배틀/일일시험/도움말 버튼 (innerHTML로 줄바꿈 적용)
  const battleBtn = document.getElementById('battle-mode-btn');
  if (battleBtn) battleBtn.innerHTML = `⚔️<br>${ui.battleBtn}`;

  const dailyBtn = document.getElementById('daily-quiz-btn');
  if (dailyBtn) dailyBtn.innerHTML = `📝<br>${ui.dailyQuizBtn}`;

  const helpBtn = document.getElementById('help-btn');
  if (helpBtn) helpBtn.innerHTML = `❓<br>${ui.helpBtn}`;

  // [한글 주석] 상단 카테고리 탭
  const tabs = document.querySelectorAll('.category-tabs .tab');
  tabs.forEach(tab => {
    const target = tab.getAttribute('data-target');
    if (target === 'plant') {
      tab.innerHTML = ui.categoryPlant;
      tab.setAttribute('data-name', ui.categoryPlant.replace(/[^\uAC00-\uD7A3a-zA-Zа-яёА-ЯЁ\u4e00-\u9fff]/g, '').trim());
    } else if (target === 'animal') {
      tab.innerHTML = ui.categoryAnimal;
      tab.setAttribute('data-name', ui.categoryAnimal.replace(/[^\uAC00-\uD7A3a-zA-Zа-яёА-ЯЁ\u4e00-\u9fff]/g, '').trim());
    } else if (target === 'artifact') {
      tab.innerHTML = ui.categoryArtifact;
      tab.setAttribute('data-name', ui.categoryArtifact.replace(/[^\uAC00-\uD7A3a-zA-Zа-яёА-ЯЁ\u4e00-\u9fff]/g, '').trim());
    }
  });

  // [한글 주석] 현재 배지 텍스트도 현재 언어로 갱신
  const currentBadge = document.getElementById('current-category-badge');
  if (currentBadge) {
    const activeTab = document.querySelector('.category-tabs .tab.active');
    if (activeTab) {
      const emoji = activeTab.getAttribute('data-emoji');
      const badgeTpl = ui.tabExploringBadge || '{emoji} {name} 탐험 중';
      const catTarget = activeTab.getAttribute('data-target');
      const catName = catTarget === 'plant' ? ui.categoryPlant :
        catTarget === 'animal' ? ui.categoryAnimal :
          ui.categoryArtifact;
      const cleanName = catName.replace(/[^\uAC00-\uD7A3a-zA-Zа-яёА-ЯЁ\u4e00-\u9fff\s]/g, '').trim();
      currentBadge.textContent = badgeTpl.replace('{emoji}', emoji).replace('{name}', cleanName);
    }
  }

  // [한글 주석] 상단 카테고리 배지
  const badge = document.getElementById('current-category-badge');
  if (badge) badge.textContent = ui.exploringBadge;

  // [한글 주석] 상태카드 제목
  const statusTitle = document.querySelector('.status-card h3');
  if (statusTitle) statusTitle.textContent = ui.totalProgress;

  // [한글 주석] 탐험 중 메시지
  const exploreTop = document.querySelector('.explore-top');
  if (exploreTop) exploreTop.textContent = ui.exploringMsg;

  const exploreEndBtn = document.querySelector('.explore-end-btn');
  if (exploreEndBtn) exploreEndBtn.textContent = ui.stopExplore;

  const discoveryContent = document.getElementById('explore-discovery-content');
  if (discoveryContent) {
    discoveryContent.innerHTML = ui.newDiscovery + '<div id="explore-discovery-timeout-notice" style="font-size:11px;font-weight:400;opacity:0.7;margin-top:8px;color:#d4c89c;">' + (ui.discoveryTimeoutNotice || '(10초 안에 탭하지 않으면 자동으로 수집돼요)') + '</div>';
  }

  // [한글 주석] 탐험 화면 텍스트
  const exploreTopText = document.getElementById('explore-top-text');
  if (exploreTopText) exploreTopText.textContent = ui.exploreTitle || '🥾 탐험 중...';

  const exploreSafetyMsg = document.getElementById('explore-safety-msg');
  if (exploreSafetyMsg) exploreSafetyMsg.innerHTML = ui.exploreSafetyMsg || '두눈은 화면에서 잠시 벗어나<br>두 발로 걸으며 자연을 느껴봐요!';

  const exploreSafetyHint = document.getElementById('explore-safety-hint');
  if (exploreSafetyHint) exploreSafetyHint.textContent = ui.exploreSafetyHint || '걷다 보면 신기한 카드가 나타날 거예요 🌿';

  // [한글 주석] 도감 조합소 탭
  const workshopTabBtn = document.getElementById('workshop-tab-btn');
  if (workshopTabBtn) workshopTabBtn.textContent = ui.workshopTab || '⚗️ 조합소';

  // [한글 주석] 지도 제목
  const mapScreenTitle = document.getElementById('map-screen-title');
  if (mapScreenTitle) mapScreenTitle.textContent = ui.mapScreenTitle || '🗺️ 탐험 지도';

  // [한글 주석] 도감 제목
  const dodamScreenTitle = document.getElementById('dodam-screen-title');
  if (dodamScreenTitle) dodamScreenTitle.textContent = ui.dodamScreenTitle || '📖 나의 도감';

  // [한글 주석] 아이템 화면 제목 및 버튼
  const itemScreenTitle = document.getElementById('item-screen-title');
  if (itemScreenTitle) itemScreenTitle.textContent = ui.itemScreenTitle || '🎒 나의 아이템';
  const itemEquipDoneBtn = document.getElementById('item-equip-done-btn');
  if (itemEquipDoneBtn) itemEquipDoneBtn.textContent = ui.itemEquipDone || '장착 완료!';

  // [한글 주석] 아바타 선택 화면
  const avatarSelectTitle = document.getElementById('avatar-select-title');
  if (avatarSelectTitle) avatarSelectTitle.textContent = ui.avatarSelectTitle || '🎮 탐험가를 선택하세요!';
  const avatarSelectSubtitle = document.getElementById('avatar-select-subtitle');
  if (avatarSelectSubtitle) avatarSelectSubtitle.innerHTML = ui.avatarSelectSubtitle || '또감 세계를 함께 탐험할<br>캐릭터를 골라주세요';
  const avatarSelectConfirmBtn = document.getElementById('avatar-select-confirm-btn');
  if (avatarSelectConfirmBtn) avatarSelectConfirmBtn.textContent = ui.avatarSelectConfirm || '선택 완료!';

  // [한글 주석] 안전주의 팝업
  const safetyTitle = document.getElementById('safety-warning-title');
  const safetyDesc = document.getElementById('safety-warning-desc');
  if (safetyTitle) safetyTitle.textContent = ui.safetyWarningTitle || '🚨 안 전 주 의!';
  if (safetyDesc) safetyDesc.innerHTML = (ui.safetyWarningDesc || '탐험 버튼을 누르고 걸어야<br>카드가 나타나요 🌿<br>안전한 곳에서 화면을 확인해요!').replace(/\n/g, '<br>');

  // [한글 주석] 도움말 번역 적용
  if (typeof applyHelpText === 'function') applyHelpText(langCode);

  // [한글 주석] 전체열기 버튼 번역
  const openAllText = document.getElementById('open-all-bags-text');
  if (openAllText) openAllText.textContent = ui.bagOpenAll || '🎁 전체 열기';

  // [한글 주석] 아이템 화면 탭 이름
  const customizeTabLabels = {
    avatar: { ko: '🧒<br>아바타', en: '🧒<br>Avatar', ru: '🧒<br>Аватар', zh: '🧒<br>头像' },
    outfit: { ko: '👕<br>옷', en: '👕<br>Outfit', ru: '👕<br>Одежда', zh: '👕<br>服装' },
    hat: { ko: '🎩<br>모자', en: '🎩<br>Hat', ru: '🎩<br>Шляпа', zh: '🎩<br>帽子' },
    glasses: { ko: '👓<br>안경', en: '👓<br>Glasses', ru: '👓<br>Очки', zh: '👓<br>眼镜' },
    earring: { ko: '💚<br>귀걸이', en: '💚<br>Earring', ru: '💚<br>Серьги', zh: '💚<br>耳环' },
    pet: { ko: '🐾<br>펫', en: '🐾<br>Pet', ru: '🐾<br>Питомец', zh: '🐾<br>宠物' },
    title: { ko: '🏅<br>칭호', en: '🏅<br>Title', ru: '🏅<br>Звание', zh: '🏅<br>称号' },
    reward: { ko: '🎁<br>복주머니', en: '🎁<br>Lucky Bag', ru: '🎁<br>Мешочек', zh: '🎁<br>福袋' },
  };
  document.querySelectorAll('.customize-slot-tab').forEach(tab => {
    const slot = tab.dataset.slot;
    if (customizeTabLabels[slot]) {
      tab.innerHTML = customizeTabLabels[slot][langCode] || customizeTabLabels[slot].ko;
    }
  });
}

// [한글 주석] cards.json 번역팩에서 카드 텍스트 반환 (API 호출 없음, 즉시 반환)
function applyCardTranslation(card) {
  const lang = window.currentLang || 'ko';

  // [한글 주석] 한국어는 원본 필드 그대로
  if (lang === 'ko') return {
    name: card.name,
    short_desc: card.short_desc,
    detail_desc: card.detail_desc,
    habitat: card.habitat
  };

  // [한글 주석] 번역팩 필드명: name_en, short_desc_ru, detail_desc_zh 등
  return {
    name: card[`name_${lang}`] || card.name,
    short_desc: card[`short_desc_${lang}`] || card.short_desc,
    detail_desc: card[`detail_desc_${lang}`] || card.detail_desc,
    habitat: card[`habitat_${lang}`] || card.habitat
  };
}

// [한글 주석] 앱 시작 시 저장된 언어 자동 적용
function initLang() {
  const saved = localStorage.getItem('selectedLang') || 'ko';
  window.currentLang = saved;
  document.body.style.fontFamily = LANG_FONTS[saved];
  const settingsBtnLabel = document.getElementById('settings-btn-label');
  if (settingsBtnLabel) {
    const settingsLabels = { ko: '설정', en: 'Settings', ru: 'Настройки', zh: '设置' };
    settingsBtnLabel.textContent = settingsLabels[saved] || '설정';
  }
  applyUIText(saved);
}

// [한글 주석] 데이터 압축 - 카드 ID를 짧게 변환
function _compressData() {
  const collection = JSON.parse(localStorage.getItem('userCollection') || '[]');
  const level = localStorage.getItem('confirmedLevel') || localStorage.getItem('currentLevel') || '1';

  // [한글 주석] 카드 ID 압축 (plant_001 → p1, animal_050 → a50, artifact_100 → r100)
  const compressedCards = collection.map(id => {
    if (id.startsWith('plant_')) return 'p' + parseInt(id.replace('plant_', ''));
    if (id.startsWith('animal_')) return 'a' + parseInt(id.replace('animal_', ''));
    if (id.startsWith('artifact_')) return 'r' + parseInt(id.replace('artifact_', ''));
    return id;
  });

  // [한글 주석] 카드 + 레벨만 저장 (아바타/아이템은 레벨로 자동 해금됨)
  const data = {
    v: 2,
    c: compressedCards,
    l: level,
  };

  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

// [한글 주석] 데이터 복원 - 압축된 데이터를 localStorage에 저장
function _restoreData(encoded) {
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    if (!data || (data.v !== 1 && data.v !== 2)) return false;

    // [한글 주석] 카드 ID 복원 (p1 → plant_001, a50 → animal_050)
    const cards = (data.c || []).map(id => {
      if (id.startsWith('p')) return 'plant_' + String(parseInt(id.slice(1))).padStart(3, '0');
      if (id.startsWith('a')) return 'animal_' + String(parseInt(id.slice(1))).padStart(3, '0');
      if (id.startsWith('r')) return 'artifact_' + String(parseInt(id.slice(1))).padStart(3, '0');
      return id;
    });

    // [한글 주석] 카드 + 레벨 복원
    localStorage.setItem('userCollection', JSON.stringify(cards));
    if (data.l) {
      localStorage.setItem('confirmedLevel', data.l);
      localStorage.setItem('currentLevel', data.l);
    }

    // [한글 주석] v1 구버전 호환 - 아바타/아이템도 복원
    if (data.v === 1) {
      if (data.av) localStorage.setItem('selectedAvatar', data.av);
      if (data.ei) localStorage.setItem('equippedItems', data.ei);
      if (data.eo) localStorage.setItem('equippedOutfit', data.eo);
      if (data.ep) localStorage.setItem('equippedPet', data.ep);
      if (data.et) localStorage.setItem('equippedTitle', data.et);
      if (data.ui) localStorage.setItem('unlockedItems', data.ui);
      if (data.ua) localStorage.setItem('unlockedAvatars', data.ua);
      if (data.up) localStorage.setItem('unlockedPets', data.up);
    }

    return true;
  } catch (e) {
    console.error('[데이터 복원 실패]', e);
    return false;
  }
}

// [한글 주석] 복원 성공 팝업 (확인 누르면 새로고침)
function _showRestoreSuccessPopup() {
  const T = window.LANG_UI; const L = window.currentLang || 'ko';
  const t = k => T?.[L]?.[k] || T?.ko?.[k] || '';
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#1e2e1f,#2c3e2d);border:2px solid #8db05c;border-radius:24px;padding:32px 24px;max-width:300px;width:100%;text-align:center;">
      <div style="font-size:52px;margin-bottom:12px;">🎉</div>
      <div style="color:#8db05c;font-size:18px;font-weight:900;margin-bottom:8px;">${t('exportSuccess')}</div>
      <div style="color:#d4c89c;font-size:13px;margin-bottom:20px;">${t('exportSuccessDesc')}</div>
      <div style="color:#aaa;font-size:11px;margin-bottom:16px;">확인을 누르면 앱이 새로고침됩니다</div>
      <button onclick="location.reload();" style="width:100%;background:linear-gradient(135deg,#8db05c,#6b8e3d);color:#1e2e1f;border:none;border-radius:14px;padding:13px;font-size:15px;font-weight:900;cursor:pointer;">✅ 확인 후 시작!</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

// [한글 주석] URL 파라미터에서 restore 감지 및 복원
function checkRestoreFromURL() {
  // [한글 주석] hash(#) 방식으로 restore 파라미터 감지 (서비스워커/PWA에 의해 날아가지 않음)
  const hash = window.location.hash;
  const restoreData = hash.startsWith('#restore=') ? hash.slice('#restore='.length) : null;

  // [한글 주석] 복원 후 새로고침된 경우 → 성공 팝업만 표시
  if (!restoreData) {
    if (localStorage.getItem('_justRestored') === '1') {
      localStorage.removeItem('_justRestored');
      setTimeout(() => _showRestoreSuccessPopup(), 1500);
    }
    return;
  }

  // [한글 주석] hash 즉시 제거
  window.history.replaceState({}, '', window.location.pathname);

  // [한글 주석] 복원 실행
  const ok = _restoreData(restoreData);
  if (ok) {
    // [한글 주석] 성공 플래그 저장 후 새로고침 (깨끗한 상태로 시작)
    localStorage.setItem('_justRestored', '1');
    // [한글 주석] localStorage 저장 확인 후 새로고침
    setTimeout(() => {
      if (localStorage.getItem('_justRestored') === '1') {
        location.reload();
      } else {
        // [한글 주석] 저장 실패 시 바로 팝업 표시
        _showRestoreSuccessPopup();
      }
    }, 200);
  } else {
    // [한글 주석] 복원 실패 팝업
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `
      <div style="background:linear-gradient(135deg,#2e1e1e,#3e2c2c);border:2px solid #ff4444;border-radius:24px;padding:32px 24px;max-width:300px;width:100%;text-align:center;">
        <div style="font-size:52px;margin-bottom:12px;">❌</div>
        <div style="color:#ff4444;font-size:18px;font-weight:900;margin-bottom:8px;">복원 실패</div>
        <div style="color:#d4c89c;font-size:13px;margin-bottom:20px;">QR코드가 올바르지 않아요.</div>
        <button onclick="this.closest('div[style]').remove();" style="width:100%;background:linear-gradient(135deg,#ff4444,#cc0000);color:#fff;border:none;border-radius:14px;padding:13px;font-size:15px;font-weight:900;cursor:pointer;">닫기</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }
}

// [한글 주석] 저작권 안내 팝업 (다국어 지원)
function showCopyrightPopup() {
  var ep = document.getElementById('copyright-popup');
  if (ep) ep.remove();
  var sp = document.getElementById('settings-popup');
  if (sp) sp.remove();

  var lang = window.currentLang || 'ko';
  var texts = {
    ko: {
      title: '📋 오픈소스 및 콘텐츠 안내',
      intro: '이 앱은 다음의 자료를 활용하여 제작되었습니다.',
      confirm: '확인',
      items: [
        ['🖼️', '식물/동물/유물 카드 이미지', '제작 (Google Gemini 이미지 생성)'],
        ['🧍', '아바타 캐릭터 이미지', '확보 (유료 애셋 구매)'],
        ['😊', '이모지 아이콘', '확보 (Google Noto Emoji)'],
        ['🎵', '로그인/메인/탐험/배틀 화면 음악', '확보 (Pixabay)'],
        ['🎵', '사용법 안내 영상 배경음악', '확보 (YouTube Audio Library)'],
        ['🔊', '정답·오답·레벨업 효과음', '제작 (Web Audio API 코드 생성)'],
        ['🎬', '앱 시작 인트로 영상', '제작 (Google Gemini 영상 생성)'],
        ['🎬', '사용법 안내 영상', '제작 (직접 녹화 + Gemini 영상 생성)'],
        ['🗺️', '지도', 'Leaflet.js (BSD License)'],
        ['🔤', '글꼴 (Noto Sans KR)', '확보 (SIL Open Font License)'],
        ['🎨', 'UI 디자인', '자체 제작 (HTML/CSS)']
      ]
    },
    en: {
      title: '📋 Open Source & Content Credits',
      intro: 'This app was made using the following resources.',
      confirm: 'OK',
      items: [
        ['🖼️', 'Plant/Animal/Artifact Card Images', 'Created (Generated with Google Gemini)'],
        ['🧍', 'Avatar Character Images', 'Acquired (purchased asset license)'],
        ['😊', 'Emoji Icons', 'Acquired (Google Noto Emoji)'],
        ['🎵', 'Login/Main/Explore/Battle Screen Music', 'Acquired (Pixabay)'],
        ['🎵', 'Tutorial Video Background Music', 'Acquired (YouTube Audio Library)'],
        ['🔊', 'Correct/Wrong/Level-up Sound Effects', 'Created (Generated with Web Audio API code)'],
        ['🎬', 'App Intro Video', 'Created (Generated with Google Gemini)'],
        ['🎬', 'Tutorial Video', 'Created (Filmed + Generated with Gemini)'],
        ['🗺️', 'Map', 'Leaflet.js (BSD License)'],
        ['🔤', 'Font (Noto Sans KR)', 'Acquired (SIL Open Font License)'],
        ['🎨', 'UI Design', 'Self-made (HTML/CSS)']
      ]
    },
    ru: {
      title: '📋 Открытые источники и контент',
      intro: 'Это приложение создано с использованием следующих ресурсов.',
      confirm: 'ОК',
      items: [
        ['🖼️', 'Изображения карточек растений/животных/артефактов', 'Создано (Google Gemini)'],
        ['🧍', 'Изображения персонажей-аватаров', 'Получено (платная лицензия)'],
        ['😊', 'Иконки эмодзи', 'Получено (Google Noto Emoji)'],
        ['🎵', 'Музыка экранов входа/меню/исследования/битвы', 'Получено (Pixabay)'],
        ['🎵', 'Фоновая музыка обучающего видео', 'Получено (YouTube Audio Library)'],
        ['🔊', 'Звуки правильных/неправильных ответов, повышения уровня', 'Создано (Web Audio API)'],
        ['🎬', 'Вступительное видео приложения', 'Создано (Google Gemini)'],
        ['🎬', 'Обучающее видео', 'Создано (Съёмка + Gemini)'],
        ['🗺️', 'Карта', 'Leaflet.js (BSD License)'],
        ['🔤', 'Шрифт (Noto Sans KR)', 'Получено (SIL Open Font License)'],
        ['🎨', 'Дизайн UI', 'Собственная разработка (HTML/CSS)']
      ]
    },
    zh: {
      title: '📋 开源及内容说明',
      intro: '本应用使用以下资源制作而成。',
      confirm: '确认',
      items: [
        ['🖼️', '植物/动物/文物卡片图片', '制作（使用Google Gemini生成）'],
        ['🧍', '头像角色图片', '获取（购买付费素材）'],
        ['😊', '表情符号图标', '获取（Google Noto Emoji）'],
        ['🎵', '登录/主页/探索/对战画面音乐', '获取（Pixabay）'],
        ['🎵', '使用说明视频背景音乐', '获取（YouTube Audio Library）'],
        ['🔊', '答对·答错·升级音效', '制作（使用Web Audio API生成）'],
        ['🎬', '应用启动开场视频', '制作（使用Google Gemini生成）'],
        ['🎬', '使用说明视频', '制作（直接拍摄+Gemini生成）'],
        ['🗺️', '地图', 'Leaflet.js (BSD License)'],
        ['🔤', '字体 (Noto Sans KR)', '获取（SIL Open Font License）'],
        ['🎨', 'UI设计', '自制 (HTML/CSS)']
      ]
    }
  };

  var data = texts[lang] || texts.ko;

  var popup = document.createElement('div');
  popup.id = 'copyright-popup';
  popup.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);';

  var rows = '';
  for (var i = 0; i < data.items.length; i++) {
    var icon = data.items[i][0];
    var label = data.items[i][1];
    var desc = data.items[i][2];
    rows += '<div style="display:flex;align-items:flex-start;gap:10px;background:rgba(141,176,92,0.06);border:1px solid rgba(107,142,61,0.3);border-radius:10px;padding:10px 12px;margin-bottom:8px;">'
      + '<div style="font-size:16px;flex-shrink:0;">' + icon + '</div>'
      + '<div><div style="color:#8db05c;font-size:11px;font-weight:700;">' + label + '</div>'
      + '<div style="color:#d4c89c;font-size:11px;margin-top:2px;">' + desc + '</div></div></div>';
  }

  popup.innerHTML = '<div style="background:linear-gradient(135deg,#1e2e1f,#2c3e2d);border:2px solid #6b8e3d;border-radius:24px;padding:24px 20px;max-width:320px;width:100%;box-shadow:0 0 40px rgba(141,176,92,0.2);">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'
    + '<div style="color:#8db05c;font-size:15px;font-weight:900;">' + data.title + '</div>'
    + '<button onclick="document.getElementById(\'copyright-popup\').remove()" style="background:rgba(255,255,255,0.08);color:#888;border:1px solid #444;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer;">✕</button>'
    + '</div>'
    + '<div style="color:#d4c89c;font-size:11px;line-height:1.6;margin-bottom:14px;">' + data.intro + '</div>'
    + '<div style="max-height:60vh;overflow-y:auto;">' + rows + '</div>'
    + '<button onclick="document.getElementById(\'copyright-popup\').remove()" style="margin-top:16px;width:100%;background:linear-gradient(135deg,#6b8e3d,#4a6a2d);color:#f0e6c8;border:none;border-radius:12px;padding:11px;font-size:13px;font-weight:700;cursor:pointer;">' + data.confirm + '</button>'
    + '</div>';

  document.body.appendChild(popup);
}

window.showCopyrightPopup = showCopyrightPopup;

// [한글 주석] 도움말 번역 적용 함수
function applyHelpText(langCode) {
  const ui = window.LANG_UI?.[langCode];
  if (!ui) return;
  const t = k => ui[k] || window.LANG_UI?.ko?.[k] || '';

  const els = {
    'help-main-subtitle': t('helpMainSubtitle'),
    'help-step1-title': t('helpStep1Title'),
    'help-step1-desc': t('helpStep1Desc'),
    'help-step2-title': t('helpStep2Title'),
    'help-step2-desc': t('helpStep2Desc'),
    'help-step3-title': t('helpStep3Title'),
    'help-step3-desc': t('helpStep3Desc'),
    'help-step4-title': t('helpStep4Title'),
    'help-step4-desc': t('helpStep4Desc'),
    'help-main-close-btn': t('helpMainCloseBtn'),
    'help-detail-btn': t('helpDetailBtn'),
    'help-back-btn': t('helpBackBtn'),
    'help-detail-title': t('helpDetailTitle'),
    'help-explore-title': t('helpExploreTitle'),
    'help-explore-desc': t('helpExploreDesc'),
    'help-dodam-title': t('helpDodamTitle'),
    'help-dodam-desc': t('helpDodamDesc'),
    'help-workshop-title': t('helpWorkshopTitle'),
    'help-workshop-desc': t('helpWorkshopDesc'),
    'help-level-title': t('helpLevelTitle'),
    'help-level-desc': t('helpLevelDesc'),
    'help-quiz-title': t('helpQuizTitle'),
    'help-quiz-desc': t('helpQuizDesc'),
    'help-battle-title': t('helpBattleTitle'),
    'help-battle-desc': t('helpBattleDesc'),
    'help-bag-title': t('helpBagTitle'),
    'help-bag-desc': t('helpBagDesc'),
    'help-settings-title': t('helpSettingsTitle'),
    'help-settings-desc': t('helpSettingsDesc'),
    'help-detail-close-btn': t('helpDetailCloseBtn'),
  };

  Object.entries(els).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = text.replace(/\n/g, '<br>');
  });
}

window.applyHelpText = applyHelpText;

// [한글 주석] 설정 팝업 표시
function showSettingsPopup() {
  const existing = document.getElementById('settings-popup');
  if (existing) { existing.remove(); return; }

  const T = window.LANG_UI; const L = window.currentLang || 'ko';
  const t = k => T?.[L]?.[k] || T?.ko?.[k] || '';

  const popup = document.createElement('div');
  popup.id = 'settings-popup';
  popup.style.cssText = `
    position:fixed;
    bottom:90px;
    left:14px;
    background:linear-gradient(135deg,#1e2e1f,#2c3e2d);
    border:1.5px solid #6b8e3d;
    border-radius:16px;
    padding:16px;
    z-index:99999;
    box-shadow:0 8px 24px rgba(0,0,0,0.5);
    display:flex;
    flex-direction:column;
    gap:10px;
    min-width:240px;
    font-size:15px;
  `;

  popup.innerHTML = `
    <div style="color:#8db05c;font-size:13px;font-weight:900;padding:4px 8px;border-bottom:1px solid #6b8e3d;margin-bottom:4px;">
      ${t('settingsTitle')}
    </div>

    <!-- [한글 주석] 언어 설정 -->
    <button id="settings-lang-btn" style="
      background:transparent;border:1px solid #6b8e3d;border-radius:10px;
      color:#f0e6c8;font-size:13px;font-weight:700;
      padding:10px 14px;text-align:left;cursor:pointer;width:100%;
    ">${t('settingsLang')}: <span id="settings-lang-label" style="color:#8db05c;">${T?.[L]?.langBtnLabel || '한국어'}</span></button>

    <!-- [한글 주석] 오픈소스 및 콘텐츠 안내 -->
    <button onclick="showCopyrightPopup()" style="
      background:rgba(107,142,61,0.1);border:1px solid #6b8e3d;border-radius:10px;
      color:#8db05c;font-size:13px;font-weight:700;
      padding:10px 14px;text-align:left;cursor:pointer;width:100%;
      font-family:'Noto Sans KR',sans-serif;
    ">${t('settingsCopyright')}</button>

    <!-- [한글 주석] 데이터 내보내기 -->
    <button onclick="showExportQR()" style="
      background:transparent;border:1px solid #6b8e3d;border-radius:10px;
      color:#f0e6c8;font-size:13px;font-weight:700;
      padding:10px 14px;text-align:left;cursor:pointer;width:100%;
    ">${t('settingsExport')}</button>

    <div style="color:#666;font-size:10px;padding:0 4px;line-height:1.5;">
      ${t('settingsExportDesc')}
    </div>

    <!-- [한글 주석] 닫기 -->
    <button onclick="document.getElementById('settings-popup').remove()" style="
      background:rgba(255,255,255,0.05);border:1px solid #444;border-radius:10px;
      color:#aaa;font-size:12px;padding:8px;cursor:pointer;width:100%;
    ">${t('settingsClose')}</button>
  `;

  document.body.appendChild(popup);

  // [한글 주석] 언어 버튼 클릭 시 언어 선택 팝업 열기
  document.getElementById('settings-lang-btn').onclick = () => {
    popup.remove();
    showLangSelectPopup();
  };

  // [한글 주석] 팝업 외부 클릭 시 닫기
  setTimeout(() => {
    document.addEventListener('click', function closeSettings(e) {
      if (!popup.contains(e.target) && e.target.id !== 'settings-btn') {
        popup.remove();
        document.removeEventListener('click', closeSettings);
      }
    });
  }, 100);
}

// [한글 주석] QR코드 내보내기 팝업
function showExportQR() {
  const existing = document.getElementById('export-qr-overlay');
  if (existing) existing.remove();

  const T = window.LANG_UI; const L = window.currentLang || 'ko';
  const t = k => T?.[L]?.[k] || T?.ko?.[k] || '';

  // [한글 주석] 데이터 압축
  const encoded = _compressData();
  const url = `${location.origin}${location.pathname}#restore=${encoded}`;

  const overlay = document.createElement('div');
  overlay.id = 'export-qr-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.92);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';

  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#1e2e1f,#2c3e2d);border:2px solid #8db05c;border-radius:24px;padding:24px 20px;max-width:320px;width:100%;text-align:center;">
      <div style="color:#8db05c;font-size:16px;font-weight:900;margin-bottom:6px;">${t('exportTitle')}</div>
      <div style="color:#aaa;font-size:11px;margin-bottom:16px;">${t('exportDesc')}</div>

      <!-- [한글 주석] QR코드 렌더링 영역 -->
      <div id="qr-code-container" style="
        background:#fff;
        border-radius:12px;
        padding:12px;
        display:inline-block;
        margin-bottom:14px;
      "></div>

      <div style="color:#ff8080;font-size:10px;line-height:1.6;margin-bottom:8px;">
        ${t('exportWarning').replace(/\n/g, '<br>')}
      </div>
      <div style="
        color:#ffd700;font-size:10px;line-height:1.6;
        margin-bottom:16px;
        background:rgba(255,215,0,0.08);
        border:1px solid rgba(255,215,0,0.3);
        border-radius:8px;padding:8px;
      ">${t('exportBagWarning').replace(/\n/g, '<br>')}</div>

      <!-- [한글 주석] URL 복사 버튼 -->
      <button id="export-copy-btn" style="
        width:100%;
        background:rgba(141,176,92,0.15);
        border:1.5px solid #8db05c;
        color:#8db05c;border-radius:14px;
        padding:12px;font-size:14px;font-weight:700;cursor:pointer;
        margin-bottom:8px;
      ">${t('exportCopyBtn')}</button>

      <!-- [한글 주석] 안내 메시지 -->
      <div id="export-copy-guide" style="
        color:#aaa;font-size:10px;line-height:1.6;
        margin-bottom:12px;display:none;
        background:rgba(0,0,0,0.2);border-radius:10px;padding:10px;
      ">${t('exportCopyGuide')}</div>

      <button onclick="document.getElementById('export-qr-overlay').remove()" style="
        width:100%;
        background:linear-gradient(135deg,#8db05c,#6b8e3d);
        color:#1e2e1f;border:none;border-radius:14px;
        padding:13px;font-size:15px;font-weight:900;cursor:pointer;
      ">${t('exportClose')}</button>
    </div>
  `;

  document.body.appendChild(overlay);

  // [한글 주석] URL 복사 버튼 이벤트
  setTimeout(() => {
    const copyBtn = document.getElementById('export-copy-btn');
    const guideEl = document.getElementById('export-copy-guide');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(url).then(() => {
          copyBtn.textContent = t('exportCopied');
          copyBtn.style.background = 'rgba(141,176,92,0.3)';
          if (guideEl) guideEl.style.display = 'block';
          setTimeout(() => {
            copyBtn.textContent = t('exportCopyBtn');
            copyBtn.style.background = 'rgba(141,176,92,0.15)';
          }, 3000);
        }).catch(() => {
          // [한글 주석] clipboard API 미지원 시 폴백
          const ta = document.createElement('textarea');
          ta.value = url;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.textContent = t('exportCopied');
          if (guideEl) guideEl.style.display = 'block';
          setTimeout(() => {
            copyBtn.textContent = t('exportCopyBtn');
          }, 3000);
        });
      });
    }
  }, 150);

  // [한글 주석] QRServer API로 QR코드 생성
  setTimeout(() => {
    const container = document.getElementById('qr-code-container');
    if (container) {
      const encodedUrl = encodeURIComponent(url);
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodedUrl}&ecc=L&margin=4`;
      const img = document.createElement('img');
      img.src = qrApiUrl;
      img.width = 240;
      img.height = 240;
      img.style.display = 'block';
      img.alt = 'QR Code';
      img.onerror = () => {
        // [한글 주석] API 실패 시 qrcode.js 라이브러리로 폴백
        container.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
          new QRCode(container, {
            text: url,
            width: 240,
            height: 240,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.L
          });
        }
      };
      container.appendChild(img);
    }
  }, 100);
}

window.showSettingsPopup = showSettingsPopup;
window.showExportQR = showExportQR;
window.checkRestoreFromURL = checkRestoreFromURL;
window.showLangSelectPopup = showLangSelectPopup;
window.selectLanguage = selectLanguage;
window.applyCardTranslation = applyCardTranslation;
window.initLang = initLang;
window.translateText = translateText;
