// ==========================================
// [한글 주석] 다국어 번역 시스템 (lang.js)
// 지원 언어: 한국어, 영어, 러시아어, 중국어
// Gemini API 실시간 번역 사용 (한국어 제외)
// ==========================================

// [한글 주석] 현재 선택된 언어 (기본값: 한국어)
window.currentLang = localStorage.getItem('selectedLang') || 'ko';

// [한글 주석] 언어별 폰트 설정
const LANG_FONTS = {
  ko: "'Noto Sans KR', sans-serif",
  en: "'Noto Sans', 'Noto Sans KR', sans-serif",
  ru: "'Noto Sans', 'Noto Sans KR', sans-serif",
  zh: "'Noto Sans SC', 'Noto Sans KR', sans-serif"
};

// [한글 주석] 언어별 UI 텍스트 (버튼, 메뉴, 고정 텍스트)
const LANG_UI = {
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
  }
};

// [한글 주석] Gemini API로 텍스트 번역 (한국어→선택언어)
async function translateText(text, targetLang) {
  if (!text || targetLang === 'ko') return text;

  const GEMINI_API_KEY = localStorage.getItem('gemini_api_key');
  if (!GEMINI_API_KEY) return text;

  const langNames = { en: 'English', ru: 'Russian', zh: 'Simplified Chinese' };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Translate the following Korean text to ${langNames[targetLang]}. Return ONLY the translated text, no explanations, no quotes:\n\n${text}` }]
        }]
      })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
  } catch (e) {
    console.warn('[번역 실패]', e);
    return text;
  }
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
    padding:8px;
    z-index:99999;
    box-shadow:0 8px 24px rgba(0,0,0,0.5);
    display:flex;
    flex-direction:column;
    gap:4px;
    min-width:130px;
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
      font-size:13px;
      font-weight:${isActive ? '900' : '700'};
      padding:8px 12px;
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

  // [한글 주석] 언어 버튼 라벨 업데이트
  const langBtnLabel = document.getElementById('lang-btn-label');
  if (langBtnLabel) langBtnLabel.textContent = LANG_UI[langCode].langBtnLabel;

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
    if (target === 'plant') tab.innerHTML = ui.categoryPlant;
    else if (target === 'animal') tab.innerHTML = ui.categoryAnimal;
    else if (target === 'artifact') tab.innerHTML = ui.categoryArtifact;
  });

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
  if (discoveryContent) discoveryContent.textContent = ui.newDiscovery;
}

// [한글 주석] 카드 팝업 텍스트 번역 적용 (collection.js에서 호출)
async function applyCardTranslation(card) {
  const lang = window.currentLang || 'ko';
  if (lang === 'ko') return {
    name: card.name,
    short_desc: card.short_desc,
    detail_desc: card.detail_desc,
    habitat: card.habitat
  };

  // [한글 주석] 병렬 번역으로 속도 최적화
  const [name, short_desc, detail_desc, habitat] = await Promise.all([
    translateText(card.name, lang),
    translateText(card.short_desc, lang),
    translateText(card.detail_desc, lang),
    translateText(card.habitat, lang)
  ]);

  return { name, short_desc, detail_desc, habitat };
}

// [한글 주석] 앱 시작 시 저장된 언어 자동 적용
function initLang() {
  const saved = localStorage.getItem('selectedLang') || 'ko';
  window.currentLang = saved;
  document.body.style.fontFamily = LANG_FONTS[saved];
  const langBtnLabel = document.getElementById('lang-btn-label');
  if (langBtnLabel) langBtnLabel.textContent = LANG_UI[saved].langBtnLabel;
  applyUIText(saved);
}

window.showLangSelectPopup = showLangSelectPopup;
window.selectLanguage = selectLanguage;
window.applyCardTranslation = applyCardTranslation;
window.initLang = initLang;
window.translateText = translateText;
