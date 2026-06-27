// ==========================================
// avatar.js - 도트 아바타, 성별 선택, 꾸미기 시스템
// ==========================================

const UNLOCKED_ITEMS_KEY = 'unlockedItems';
const EQUIPPED_ITEMS_KEY = 'equippedItems';
const UNLOCKED_AVATARS_KEY = 'unlockedAvatars';

// [한글 주석] 이미지 기본 경로
const IMG_BASE = 'images/avatars/';

// [한글 주석] 8종 아바타 정의
const AVATAR_LIST = [
  { id: 'boy1_dodam', name: '도담', gender: 'boy', unlockLevel: 1 },
  { id: 'boy2_junseo', name: '준서', gender: 'boy', unlockLevel: 6 },
  { id: 'boy3_minjun', name: '민준', gender: 'boy', unlockLevel: 12 },
  { id: 'boy4_jiho', name: '지호', gender: 'boy', unlockLevel: 18 },
  { id: 'girl1_nari', name: '나리', gender: 'girl', unlockLevel: 1 },
  { id: 'girl2_soyeon', name: '소연', gender: 'girl', unlockLevel: 6 },
  { id: 'girl3_sua', name: '수아', gender: 'girl', unlockLevel: 12 },
  { id: 'girl4_jia', name: '지아', gender: 'girl', unlockLevel: 18 },
];

// [한글 주석] 아이템 정의 (액세서리)
const AVATAR_ITEMS = {
  'earring_emerald': { slot: 'earring', name: '에메랄드 귀걸이', name_en: 'Emerald Earring', name_ru: 'Изумрудные серьги', name_zh: '翡翠耳环', unlockLevel: 3, rarity: 'common', emoji: '💚' },
  'glasses': { slot: 'glasses', name: '안경', name_en: 'Glasses', name_ru: 'Очки', name_zh: '眼镜', unlockLevel: 5, rarity: 'common', emoji: '👓' },
  'hat_cowboy': { slot: 'hat', name: '카우보이 모자', name_en: 'Cowboy Hat', name_ru: 'Ковбойская шляпа', name_zh: '牛仔帽', unlockLevel: 8, rarity: 'common', emoji: '🤠' },
  'glasses_sun': { slot: 'glasses', name: '선글라스', name_en: 'Sunglasses', name_ru: 'Солнечные очки', name_zh: '太阳镜', unlockLevel: 10, rarity: 'rare', emoji: '🕶️' },
  'earring_red': { slot: 'earring', name: '레드 귀걸이', name_en: 'Red Earring', name_ru: 'Красные серьги', name_zh: '红色耳环', unlockLevel: 13, rarity: 'common', emoji: '❤️' },
  'hat_lucky': { slot: 'hat', name: '행운 모자', name_en: 'Lucky Hat', name_ru: 'Шляпа удачи', name_zh: '幸运帽', unlockLevel: 15, rarity: 'rare', emoji: '🍀' },
  'hat_pumpkin': { slot: 'hat', name: '호박 모자', name_en: 'Pumpkin Hat', name_ru: 'Тыквенная шляпа', name_zh: '南瓜帽', unlockLevel: 20, rarity: 'rare', emoji: '🎃' },
  'hat_witch': { slot: 'hat', name: '마녀 모자', name_en: 'Witch Hat', name_ru: 'Шляпа ведьмы', name_zh: '女巫帽', unlockLevel: 23, rarity: 'epic', emoji: '🧙' },
  'earring_emerald_silver': { slot: 'earring', name: '에메랄드 실버 귀걸이', name_en: 'Emerald Silver Earring', name_ru: 'Серебряные изумрудные серьги', name_zh: '翡翠银耳环', unlockLevel: 25, rarity: 'epic', emoji: '💎' },
  'hat_pumpkin_purple': { slot: 'hat', name: '보라 호박 모자', name_en: 'Purple Pumpkin Hat', name_ru: 'Фиолетовая тыквенная шляпа', name_zh: '紫色南瓜帽', unlockLevel: 27, rarity: 'epic', emoji: '🟣' },
  'earring_red_silver': { slot: 'earring', name: '레드 실버 귀걸이', name_en: 'Red Silver Earring', name_ru: 'Серебряные красные серьги', name_zh: '红色银耳环', unlockLevel: 30, rarity: 'epic', emoji: '👑' },
};

// [한글 주석] 옷 정의
const OUTFIT_LIST = [
  { id: 'default', name: '기본 복장', name_en: 'Default Outfit', name_ru: 'Обычная одежда', name_zh: '默认服装', unlockLevel: 1, rarity: 'common', emoji: '👕' },
  { id: 'outfit_sporty_red', name: '빨간 스포츠', name_en: 'Red Sporty', name_ru: 'Красный спортивный', name_zh: '红色运动装', unlockLevel: 7, rarity: 'common', emoji: '🏃' },
  { id: 'outfit_sporty_green', name: '초록 스포츠', name_en: 'Green Sporty', name_ru: 'Зелёный спортивный', name_zh: '绿色运动装', unlockLevel: 7, rarity: 'common', emoji: '🏃' },
  { id: 'outfit_floral_pink', name: '핑크 꽃무늬', name_en: 'Pink Floral', name_ru: 'Розовый цветочный', name_zh: '粉色花纹', unlockLevel: 7, rarity: 'common', emoji: '🌸' },
  { id: 'outfit_floral_purple', name: '보라 꽃무늬', name_en: 'Purple Floral', name_ru: 'Фиолетовый цветочный', name_zh: '紫色花纹', unlockLevel: 7, rarity: 'common', emoji: '💜' },
  { id: 'outfit_stripe_blue', name: '파란 스트라이프', name_en: 'Blue Stripe', name_ru: 'Синяя полоска', name_zh: '蓝色条纹', unlockLevel: 13, rarity: 'rare', emoji: '🔵' },
  { id: 'outfit_stripe_green', name: '초록 스트라이프', name_en: 'Green Stripe', name_ru: 'Зелёная полоска', name_zh: '绿色条纹', unlockLevel: 13, rarity: 'rare', emoji: '🟢' },
  { id: 'outfit_sailor_blue', name: '파란 세일러', name_en: 'Blue Sailor', name_ru: 'Синий матросский', name_zh: '蓝色水手服', unlockLevel: 13, rarity: 'rare', emoji: '⛵' },
  { id: 'outfit_sailor_pink', name: '핑크 세일러', name_en: 'Pink Sailor', name_ru: 'Розовый матросский', name_zh: '粉色水手服', unlockLevel: 13, rarity: 'rare', emoji: '🌸' },
  { id: 'outfit_suit_blue', name: '파란 정장', name_en: 'Blue Suit', name_ru: 'Синий костюм', name_zh: '蓝色正装', unlockLevel: 23, rarity: 'epic', emoji: '🤵' },
  { id: 'outfit_suit_black', name: '검정 정장', name_en: 'Black Suit', name_ru: 'Чёрный костюм', name_zh: '黑色正装', unlockLevel: 23, rarity: 'epic', emoji: '🖤' },
  { id: 'outfit_dress_purple', name: '보라 드레스', name_en: 'Purple Dress', name_ru: 'Фиолетовое платье', name_zh: '紫色连衣裙', unlockLevel: 23, rarity: 'epic', emoji: '👗' },
  { id: 'outfit_dress_pink', name: '핑크 드레스', name_en: 'Pink Dress', name_ru: 'Розовое платье', name_zh: '粉色连衣裙', unlockLevel: 23, rarity: 'epic', emoji: '💗' },
];

// [한글 주석] 레벨 달성 특별 칭호/뱃지 정의
const LEVEL_BADGES = [
  {
    id: 'explorer',
    name: '탐험가',
    name_en: 'Explorer', name_ru: 'Исследователь', name_zh: '探险家',
    unlockLevel: 10,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 80" width="100%" height="100%">
      <path d="M32,0 L62,12 L62,38 Q62,58 32,70 Q2,58 2,38 L2,12 Z" fill="#4a7aaa" stroke="#6aacee" stroke-width="1.5"/>
      <path d="M32,6 L56,16 L56,38 Q56,54 32,62 Q8,54 8,38 L8,16 Z" fill="#2d5a8a" stroke="#4a7aaa" stroke-width="1"/>
      <circle cx="32" cy="34" r="14" fill="none" stroke="#6aacee" stroke-width="1"/>
      <polygon points="32,22 35,32 32,30 29,32" fill="#ff4444"/>
      <polygon points="32,46 35,36 32,38 29,36" fill="#aaaaaa"/>
      <polygon points="20,34 30,31 28,34 30,37" fill="#aaaaaa"/>
      <polygon points="44,34 34,31 36,34 34,37" fill="#aaaaaa"/>
      <circle cx="32" cy="34" r="3" fill="#ffffff" opacity="0.9"/>
      <text x="32" y="80" font-size="9" font-weight="bold" text-anchor="middle"
            fill="#6aacee" letter-spacing="2" font-family="monospace">EXPLORER</text>
    </svg>`
  },
  {
    id: 'pro',
    name: 'PRO 탐험가',
    name_en: 'PRO Explorer', name_ru: 'PRO Исследователь', name_zh: 'PRO探险家',
    unlockLevel: 20,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 75" width="100%" height="100%">
      <path d="M12,8 Q8,28 12,44 L52,44 Q56,28 52,8 Z" fill="#ffd700" stroke="#ff9500" stroke-width="1.5"/>
      <path d="M15,10 Q12,28 15,42" fill="none" stroke="#fff8aa" stroke-width="2" opacity="0.6"/>
      <path d="M12,14 Q2,14 2,24 Q2,34 12,34" fill="none" stroke="#ffd700" stroke-width="4" stroke-linecap="round"/>
      <path d="M52,14 Q62,14 62,24 Q62,34 52,34" fill="none" stroke="#ffd700" stroke-width="4" stroke-linecap="round"/>
      <rect x="20" y="44" width="24" height="6" fill="#ffd700"/>
      <rect x="14" y="50" width="36" height="5" fill="#ffd700" rx="2"/>
      <polygon points="32,14 34,21 42,21 36,26 38,33 32,28 26,33 28,26 22,21 30,21"
               fill="#ffffff" opacity="0.9"/>
      <circle cx="8"  cy="10" r="2" fill="#ffd700" opacity="0.7"/>
      <circle cx="56" cy="8"  r="2" fill="#ffd700" opacity="0.7"/>
      <text x="32" y="68" font-size="10" font-weight="bold" text-anchor="middle"
            fill="#ffd700" letter-spacing="2" font-family="monospace">PRO</text>
    </svg>`
  },
  {
    id: 'master',
    name: '마스터',
    name_en: 'Master', name_ru: 'Мастер', name_zh: '大师',
    unlockLevel: 30,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 75" width="100%" height="100%">
      <circle cx="32" cy="33" r="30" fill="#1a2a1a" stroke="#ffd700" stroke-width="2.5"/>
      <circle cx="32" cy="5"  r="2" fill="#ffd700" opacity="0.7"/>
      <circle cx="56" cy="14" r="2" fill="#ffd700" opacity="0.7"/>
      <circle cx="61" cy="33" r="2" fill="#ffd700" opacity="0.7"/>
      <circle cx="56" cy="52" r="2" fill="#ffd700" opacity="0.7"/>
      <circle cx="32" cy="61" r="2" fill="#ffd700" opacity="0.7"/>
      <circle cx="8"  cy="52" r="2" fill="#ffd700" opacity="0.7"/>
      <circle cx="3"  cy="33" r="2" fill="#ffd700" opacity="0.7"/>
      <circle cx="8"  cy="14" r="2" fill="#ffd700" opacity="0.7"/>
      <polygon points="32,12 36,24 50,24 39,32 43,46 32,38 21,46 25,32 14,24 28,24"
               fill="#ffd700" stroke="#ff9500" stroke-width="1"/>
      <text x="32" y="57" font-size="7" font-weight="bold" text-anchor="middle"
            fill="#ffd700" letter-spacing="2" font-family="monospace">MASTER</text>
    </svg>`
  }
];

// [한글 주석] 펫 목록
const PET_LIST = [
  { id: 'pet_none', name: '없음', name_en: 'None', name_ru: 'Нет', name_zh: '无', emoji: '❌', condition: null },
  { id: 'pet_chick', name: '병아리', name_en: 'Chick', name_ru: 'Цыплёнок', name_zh: '小鸡', emoji: '🐥', condition: { category: 'animal', count: 5 } },
  { id: 'pet_rabbit', name: '토끼', name_en: 'Rabbit', name_ru: 'Кролик', name_zh: '兔子', emoji: '🐰', condition: { category: 'animal', count: 15 } },
  { id: 'pet_squirrel', name: '다람쥐', name_en: 'Squirrel', name_ru: 'Белка', name_zh: '松鼠', emoji: '🐿️', condition: { category: 'animal', count: 30 } },
  { id: 'pet_butterfly', name: '나비', name_en: 'Butterfly', name_ru: 'Бабочка', name_zh: '蝴蝶', emoji: '🦋', condition: { category: 'animal', count: 50 } },
  { id: 'pet_fox', name: '여우', name_en: 'Fox', name_ru: 'Лиса', name_zh: '狐狸', emoji: '🦊', condition: { category: 'animal', count: 70 } },
  { id: 'pet_deer', name: '사슴', name_en: 'Deer', name_ru: 'Олень', name_zh: '鹿', emoji: '🦌', condition: { category: 'animal', count: 90 } },
  { id: 'pet_crane', name: '두루미', name_en: 'Crane', name_ru: 'Журавль', name_zh: '仙鹤', emoji: '🦢', condition: { total: 200 } },
];

// [한글 주석] 현재 선택된 아바타 ID 가져오기
function getSelectedAvatar() {
  return localStorage.getItem('selectedAvatar') || 'boy1_dodam';
}

// [한글 주석] 아바타 선택 저장
function selectAvatar(avatarId) {
  localStorage.setItem('selectedAvatar', avatarId);
}

// [한글 주석] 아바타 선택이 필요한지 여부
function needsAvatarSelection() {
  return !localStorage.getItem('selectedAvatar');
}

// [한글 주석] 하위 호환성 유지
function needsGenderSelection() {
  return needsAvatarSelection();
}

// [한글 주석] 성별 반환
function getSelectedGender() {
  const id = getSelectedAvatar();
  const av = AVATAR_LIST.find(a => a.id === id);
  return av && av.gender === 'girl' ? 'girl' : 'boy';
}

// [한글 주석] 하위 호환성 - 기존 성별 선택 매핑
function selectGender(g) {
  if (g === 'girl') selectAvatar('girl1_nari');
  else selectAvatar('boy1_dodam');
}

// ==========================================
// ==========================================
// [한글 주석] 아바타 렌더링 함수
// ==========================================

// [한글 주석] PNG 이미지 반환 (기존 SVG 방식 대체)
function getAvatarSVG(avatarId) {
  // [한글 주석] 기존 SVG ID를 새 PNG ID로 매핑
  const mapping = {
    'boy_explorer': 'boy1_dodam',
    'boy_police': 'boy2_junseo',
    'girl_sakura': 'girl1_nari',
    'girl_sports': 'girl3_sua',
    'boy': 'boy1_dodam',
    'girl': 'girl1_nari',
  };
  const mapped = mapping[avatarId] || avatarId;
  return `<img src="${IMG_BASE}avatar_${mapped}.png"
    style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated;"
    alt="${mapped}">`;
}


// ==========================================
// [한글 주석] 아바타/성별 선택 호환성 관리자
// ==========================================
function showGenderSelectScreen() {
  const s = document.getElementById('gender-select-screen');
  if (s) {
    s.style.display = 'flex';
    renderAvatarPreviews();
  }
}

// [한글 주석] 아바타 선택 화면 미리보기 렌더링
function renderAvatarPreviews() {
  const container = document.querySelector('.gender-options');
  if (!container) return;
  container.innerHTML = '';

  const unlockedAvatars = getUnlockedAvatars();

  // [한글 주석] 맨 위: Lv.1 해금 캐릭터 (남자 왼쪽, 여자 오른쪽)
  // [한글 주석] 그 아래: 레벨순 해금 캐릭터 (남자 왼쪽, 여자 오른쪽)
  const boys = AVATAR_LIST.filter(a => a.gender === 'boy');
  const girls = AVATAR_LIST.filter(a => a.gender === 'girl');

  // [한글 주석] 레벨 순서로 정렬 후 쌍으로 배치
  const pairs = boys.map((b, i) => [b, girls[i]]).flat().filter(Boolean);

  pairs.forEach(avatar => {
    const isUnlocked = unlockedAvatars.includes(avatar.id);
    const btn = document.createElement('button');
    btn.className = 'gender-btn' + (isUnlocked ? '' : ' locked');
    btn.type = 'button';
    btn.setAttribute('data-avatar-id', avatar.id);

    if (isUnlocked) {
      btn.onclick = () => handleAvatarSelect(avatar.id);
    }

    btn.innerHTML = `
      <div style="
        width:64px;height:64px;
        display:flex;align-items:center;justify-content:center;
        overflow:hidden;margin:0 auto 6px;
        position:relative;
        ${!isUnlocked ? 'opacity:0.4;filter:grayscale(1);' : ''}
      ">
        <img src="${IMG_BASE}avatar_${avatar.id}.png"
          style="width:64px;height:64px;object-fit:contain;
          image-rendering:pixelated;"
          alt="${avatar.name}">
      </div>
      <span style="font-size:11px;font-weight:700;color:#fff;display:block;text-align:center;">
        ${avatar.name}
      </span>
      ${!isUnlocked
        ? `<span style="font-size:10px;color:#aaa;display:block;text-align:center;">
            Lv.${avatar.unlockLevel}
           </span>`
        : ''}
    `;
    container.appendChild(btn);
  });
}

function handleAvatarSelect(avatarId) {
  tempSelectedAvatarId = avatarId;

  // [한글 주석] 선택한 아바타에 초록 테두리 강조 효과
  document.querySelectorAll('.gender-btn').forEach(btn => {
    const isSelected = btn.getAttribute('data-avatar-id') === avatarId;
    if (isSelected) {
      btn.classList.add('selected');
      btn.style.borderColor = '#84ff00';
      btn.style.boxShadow = '0 0 15px rgba(132, 255, 0, 0.4)';
    } else {
      btn.classList.remove('selected');
      btn.style.borderColor = '#4a6fa5';
      btn.style.boxShadow = 'none';
    }
  });
}

// [한글 주석] 하위 호환성 유지용 성별 선택 호출 함수
function handleGenderSelect(gender) {
  if (gender === 'girl') selectAvatar('girl_sakura');
  else selectAvatar('boy_explorer');
  const s = document.getElementById('gender-select-screen');
  if (s) s.style.display = 'none';
  if (typeof window.proceedToMainScreen === 'function') window.proceedToMainScreen();
}

// [한글 주석] 아바타 선택 완료 버튼 클릭 시 작동하는 최종 함수
function confirmAvatarSelection() {
  if (!tempSelectedAvatarId) {
    const _T = window.LANG_UI; const _L = window.currentLang || 'ko';
    alert(_T?.[_L]?.avatarSelectPrompt || '원하는 아바타를 하나 선택해주세요!');
    return;
  }
  selectAvatar(tempSelectedAvatarId);
  const s = document.getElementById('gender-select-screen');
  if (s) s.style.display = 'none';
  if (typeof window.proceedToMainScreen === 'function') window.proceedToMainScreen();
}

// [한글 주석] 아바타 초기화 (메인 화면)
function initAvatar() {
  const avatarId = getSelectedAvatar();
  if (!avatarId) return;

  const el = document.getElementById('main-character');
  if (el) {
    // [한글 주석] 기존 내용 비우고 컨테이너 생성
    el.innerHTML = '<div id="main-avatar-container" style="position:relative;width:100%;height:100%;"></div>';
    // [한글 주석] 메인 아바타 크기 (정면 128x128 PNG 기준)
    el.style.cssText = 'width:140px;height:140px;cursor:pointer;position:relative;';
    const container = document.getElementById('main-avatar-container');
    const equipped = getEquippedItems();
    const outfitId = getEquippedOutfit();
    _renderAvatarWithItems(container, avatarId, outfitId, equipped);
  }

  renderPet();
  // [한글 주석] 레벨 칭호 뱃지 렌더링
  renderLevelBadge();
  updateLevelBadge();
}

// [한글 주석] PNG 레이어 방식으로 아바타 + 아이템 렌더링
function _renderAvatarWithItems(container, avatarId, outfitId, equipped) {
  if (!container) return;
  container.innerHTML = '';
  container.style.cssText = 'position:relative;width:100%;height:100%;';

  const layers = [];

  // [한글 주석] 1. 기본 아바타 또는 옷 레이어
  if (!outfitId || outfitId === 'default') {
    // [한글 주석] 기본 아바타 전체 이미지
    layers.push(`${IMG_BASE}avatar_${avatarId}.png`);
  } else {
    // [한글 주석] 옷 착용 시: 베이스 바디 + 옷 + 헤어 순서
    layers.push(`${IMG_BASE}char_base.png`);
    layers.push(`${IMG_BASE}${outfitId}.png`);
    layers.push(`${IMG_BASE}hair_${avatarId}.png`);
  }

  // [한글 주석] 2. 액세서리 레이어들
  Object.values(equipped).forEach(itemId => {
    if (itemId && AVATAR_ITEMS[itemId]) {
      layers.push(`${IMG_BASE}item_${itemId}.png`);
    }
  });

  // [한글 주석] 레이어 이미지 쌓기
  layers.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
      position:absolute;top:0;left:0;
      width:100%;height:100%;
      object-fit:contain;
      image-rendering:pixelated;
      z-index:${i + 1};
    `;
    img.onerror = () => { img.style.display = 'none'; };
    container.appendChild(img);
  });
}

// ==========================================
// [한글 주석] 해금/장착 데이터 관리
// ==========================================
function getUnlockedItems() {
  const d = localStorage.getItem(UNLOCKED_ITEMS_KEY);
  return d ? JSON.parse(d) : [];
}
function saveUnlockedItems(arr) {
  localStorage.setItem(UNLOCKED_ITEMS_KEY, JSON.stringify(arr));
}
function getEquippedItems() {
  const d = localStorage.getItem(EQUIPPED_ITEMS_KEY);
  return d ? JSON.parse(d) : {};
}
function saveEquippedItems(obj) {
  localStorage.setItem(EQUIPPED_ITEMS_KEY, JSON.stringify(obj));
}

// ==========================================
// [한글 주석] 해금 체크 (수집 시마다 호출)
// ==========================================
// [한글 주석] 해금된 아바타 목록 가져오기
function getUnlockedAvatars() {
  const saved = localStorage.getItem(UNLOCKED_AVATARS_KEY);
  if (saved) return JSON.parse(saved);
  return ['boy1_dodam', 'girl1_nari'];
}

// [한글 주석] 해금된 아바타 목록 저장
function saveUnlockedAvatars(arr) {
  localStorage.setItem(UNLOCKED_AVATARS_KEY, JSON.stringify(arr));
}

// [한글 주석] 아바타 해금 체크 (레벨 기반)
function checkAndUnlockAvatars() {
  const level = typeof getCurrentLevel === 'function' ? getCurrentLevel() : 1;
  const unlocked = getUnlockedAvatars();
  let newAvatars = [];
  AVATAR_LIST.forEach(av => {
    if (unlocked.includes(av.id)) return;
    if (level >= av.unlockLevel) {
      unlocked.push(av.id);
      newAvatars.push(av.name + ' 해금!');
    }
  });
  if (newAvatars.length > 0) {
    saveUnlockedAvatars(unlocked);
    showItemToast(newAvatars);
  }
}

// [한글 주석] 옷 착용/해제 저장
function getEquippedOutfit() {
  return localStorage.getItem('equippedOutfit') || 'default';
}
function saveEquippedOutfit(id) {
  localStorage.setItem('equippedOutfit', id);
}

// [한글 주석] 장착된 칭호 가져오기 (없으면 null)
function getEquippedTitle() {
  return localStorage.getItem('equippedTitle') || null;
}
// [한글 주석] 칭호 장착 저장
function saveEquippedTitle(id) {
  if (id) localStorage.setItem('equippedTitle', id);
  else localStorage.removeItem('equippedTitle');
}
// [한글 주석] 아이템 + 아바타 해금 체크 (레벨 기반)
function checkAndUnlockItems() {
  const level = typeof getCurrentLevel === 'function' ? getCurrentLevel() : 1;
  const unlocked = getUnlockedItems();
  let newItems = [];

  Object.keys(AVATAR_ITEMS).forEach(itemId => {
    if (unlocked.includes(itemId)) return;
    if (level >= AVATAR_ITEMS[itemId].unlockLevel) {
      unlocked.push(itemId);
      newItems.push(AVATAR_ITEMS[itemId].name);
    }
  });

  // [한글 주석] 아바타 해금도 함께 체크
  checkAndUnlockAvatars();

  if (newItems.length > 0) {
    saveUnlockedItems(unlocked);
    showItemToast(newItems);
  }
}

// [한글 주석] 토스트 메시지
function showItemToast(names) {
  const toast = document.createElement('div');
  toast.className = 'item-unlock-toast';
  const _Tt = window.LANG_UI; const _Lt = window.currentLang || 'ko';
  // [한글 주석] 아이템 이름 번역 적용
  const translatedNames = names.map(n => {
    const allItems = [...Object.values(AVATAR_ITEMS), ...OUTFIT_LIST, ...PET_LIST];
    const found = allItems.find(i => i.name === n || (i.name + (_Lt !== 'ko' ? '' : '')) === n);
    if (found && _Lt !== 'ko' && found[`name_${_Lt}`]) return found[`name_${_Lt}`];
    return n;
  });
  toast.textContent = (_Tt?.[_Lt]?.itemUnlockToast || '🎉 새 아이템 해금! {names}').replace('{names}', translatedNames.join(', '));
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.add('show'); }, 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}

// ==========================================
// [한글 주석] 장착/해제
// ==========================================
function equipItem(itemId) {
  const item = AVATAR_ITEMS[itemId];
  if (!item) return;
  const equipped = getEquippedItems();
  if (equipped[item.slot] === itemId) {
    delete equipped[item.slot];
  } else {
    equipped[item.slot] = itemId;
  }
  saveEquippedItems(equipped);
  renderEquippedItems();
}


// ==========================================
// [한글 주석] 펫 시스템 - 해금, 장착, 표시 로직
// ==========================================

const UNLOCKED_PETS_KEY = 'unlockedPets';
const EQUIPPED_PET_KEY = 'equippedPet';

function getUnlockedPets() {
  const d = localStorage.getItem(UNLOCKED_PETS_KEY);
  return d ? JSON.parse(d) : ['pet_none'];
}
function saveUnlockedPets(arr) {
  localStorage.setItem(UNLOCKED_PETS_KEY, JSON.stringify(arr));
}
function getEquippedPet() {
  return localStorage.getItem(EQUIPPED_PET_KEY) || 'pet_none';
}
function equipPet(petId) {
  localStorage.setItem(EQUIPPED_PET_KEY, petId);
  renderPet();
}

function checkAndUnlockPets() {
  const collection = typeof getCollection === 'function' ? getCollection() : [];
  let pCount = 0, aCount = 0, arCount = 0;
  collection.forEach(id => {
    if (id.startsWith('plant_')) pCount++;
    else if (id.startsWith('animal_')) aCount++;
    else if (id.startsWith('artifact_')) arCount++;
  });
  const total = pCount + aCount + arCount;
  const counts = { plant: pCount, animal: aCount, artifact: arCount };

  const unlocked = getUnlockedPets();
  let newPets = [];

  PET_LIST.forEach(pet => {
    if (unlocked.includes(pet.id)) return;
    if (!pet.condition) return;

    const cond = pet.condition;
    let met = false;
    if (cond.total) {
      met = total >= cond.total;
    } else if (cond.category && cond.count) {
      met = (counts[cond.category] || 0) >= cond.count;
    }

    if (met) {
      unlocked.push(pet.id);
      newPets.push(pet.name);
    }
  });

  if (newPets.length > 0) {
    saveUnlockedPets(unlocked);
    const _Tp = window.LANG_UI; const _Lp = window.currentLang || 'ko';
    const _suffix = _Tp?.[_Lp]?.petUnlockSuffix || '(펫)';
    showItemToast(newPets.map(name => name + _suffix));
  }
}
// [한글 주석] 장착된 칭호 뱃지를 메인화면 아바타 옆에 표시
function renderLevelBadge() {
  // [한글 주석] 기존 뱃지 제거
  const existing = document.getElementById('level-special-badge');
  if (existing) existing.remove();

  // [한글 주석] 장착된 칭호 확인
  const equippedTitleId = getEquippedTitle();
  if (!equippedTitleId) return;

  const badge = LEVEL_BADGES.find(b => b.id === equippedTitleId);
  if (!badge) return;

  const badgeEl = document.createElement('div');
  badgeEl.id = 'level-special-badge';
  badgeEl.title = badge.name;
  /* [한글 주석] 칭호 위치 - append 대상으로 메인/미리보기 구분 */
  const _mainChar = document.getElementById('main-character');
  const _parentEl = _mainChar || document.querySelector('.customize-avatar-box');
  const _parentH = _parentEl ? _parentEl.getBoundingClientRect().height : 150;
  const _badgeSize = Math.round(_parentH * 0.28);
  // [한글 주석] main-character가 있으면 메인화면, 없으면 미리보기
  const _isMainScreen = !!_mainChar;
  badgeEl.style.cssText = `
    position:absolute;
    right:0px;
    top:0px;
    width:${_badgeSize}px;
    height:${_badgeSize}px;
    z-index:10;
    filter:drop-shadow(0 2px 6px rgba(255,215,0,0.5));
    animation:badgeFloat 2.5s ease-in-out infinite;
    cursor:pointer;
  `;
  badgeEl.innerHTML = badge.svg;
  badgeEl.onclick = () => showItemToast([`${badge.name} 장착 중! 🎉`]);

  // [한글 주석] main-character에 직접 추가
  const mainChar = document.getElementById('main-character');
  if (mainChar) {
    const originalPosition = window.getComputedStyle(mainChar).position;
    if (originalPosition === 'static') {
      mainChar.style.position = 'relative';
    }
    mainChar.appendChild(badgeEl);
  }
}

function renderPet() {
  const petDisplay = document.getElementById('pet-display');
  if (!petDisplay) return;

  const equippedPetId = getEquippedPet();
  const pet = PET_LIST.find(p => p.id === equippedPetId);

  if (pet && pet.id !== 'pet_none') {
    petDisplay.textContent = pet.emoji;
    petDisplay.style.display = 'flex';
  } else {
    petDisplay.style.display = 'none';
  }
}

// ==========================================
// [한글 주석] 장착된 아이템 렌더링 업데이트
// ==========================================
function renderEquippedItems() {
  const equipped = getEquippedItems();
  const outfitId = getEquippedOutfit();
  const avatarId = getSelectedAvatar();

  // [한글 주석] 메인 화면 컨테이너 업데이트
  const mainContainer = document.getElementById('main-avatar-container');
  if (mainContainer) {
    _renderAvatarWithItems(mainContainer, avatarId, outfitId, equipped);
  }

  // [한글 주석] 꾸미기 화면 컨테이너 업데이트
  const customizeContainer = document.getElementById('customize-avatar-container');
  if (customizeContainer) {
    _renderAvatarWithItems(customizeContainer, avatarId, outfitId, equipped);
  }
}

// ==========================================
// [한글 주석] 꾸미기 화면 UI
// ==========================================
let currentCustomizeSlot = 'hat';

function showCustomizeScreen() {
  // [한글 주석] 뒤로가기 스택에 추가
  if (typeof pushScreen === 'function') pushScreen('avatar-customize-screen');
  const screen = document.getElementById('avatar-customize-screen');
  if (!screen) return;
  screen.style.display = 'flex';
  setTimeout(() => screen.classList.add('slide-in'), 10);
  // [한글 주석] 아이템 탭 열면 복주머니 탭이 먼저 표시
  currentCustomizeSlot = 'reward';

  // [한글 주석] 초기 진입 시 복주머니 탭에 맞게 화면 전환
  switchCustomizeSlot('reward');
  renderCustomizeUI();
}

function hideCustomizeScreen() {
  const screen = document.getElementById('avatar-customize-screen');
  if (!screen) return;
  screen.classList.remove('slide-in');
  setTimeout(() => { screen.style.display = 'none'; }, 300);
}

function switchCustomizeSlot(slot) {
  currentCustomizeSlot = slot;

  // [한글 주석] 탭 활성화 갱신
  document.querySelectorAll('.customize-slot-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.slot === slot);
  });

  // [한글 주석] 일반 아이템 목록과 복주머니 목록 교차 표시
  const itemList = document.getElementById('customize-item-list');
  const bagList = document.getElementById('reward-bag-list');
  const allBagsBtn = document.getElementById('open-all-bags-btn');

  // [한글 주석] 칭호 탭 처리
  if (slot === 'title') {
    if (itemList) itemList.style.display = 'block';
    if (bagList) bagList.style.display = 'none';
    renderItemList();
    return;
  }

  if (slot === 'reward') {
    // [한글 주석] 복주머니 탭: 아이템 목록 숨기고 복주머니 목록 표시
    if (itemList) itemList.style.display = 'none';
    if (bagList) bagList.style.display = 'block';
    renderRewardBagList();
    return;
  }

  // [한글 주석] 일반 탭: 복주머니 목록 숨기고 아이템 목록 표시
  if (itemList) itemList.style.display = 'block';
  if (bagList) bagList.style.display = 'none';
  if (allBagsBtn) allBagsBtn.style.display = 'none';

  renderItemList();
}

// [한글 주석] 꾸미기 화면 전체 UI 렌더링
function renderCustomizeUI() {
  // [한글 주석] 꾸미기 미리보기 아바타 컨테이너
  let container = document.getElementById('customize-avatar-container');
  if (!container) {
    // [한글 주석] 기존 ID 호환 처리
    const old = document.getElementById('customize-avatar-preview');
    if (old) {
      old.id = 'customize-avatar-container';
      container = old;
    }
  }
  if (container) {
    container.style.cssText = 'position:relative;width:80px;height:120px;margin:0 auto;';
    const avatarId = getSelectedAvatar();
    const equipped = getEquippedItems();
    const outfitId = getEquippedOutfit();
    _renderAvatarWithItems(container, avatarId, outfitId, equipped);

    // [한글 주석] 미리보기에 칭호 뱃지 표시
    const equippedTitleId = getEquippedTitle();
    const titleBadge = LEVEL_BADGES.find(b => b.id === equippedTitleId);
    if (titleBadge) {
      const badgePreview = document.createElement('div');
      badgePreview.style.cssText = `
        position:absolute;
        right:60px;
        bottom:60px;
        width:40px;
        height:48px;
        z-index:10;
        filter:drop-shadow(0 2px 4px rgba(255,215,0,0.4));
      `;
      badgePreview.innerHTML = titleBadge.svg;
      container.style.position = 'relative';
      container.appendChild(badgePreview);
    }

    // [한글 주석] 미리보기에 펫 표시
    const equippedPetId = getEquippedPet();
    const pet = PET_LIST.find(p => p.id === equippedPetId);
    if (pet && pet.id !== 'pet_none') {
      const petPreview = document.createElement('div');
      petPreview.style.cssText = `
        position:absolute;
        bottom:10px;
        right:10px;
        font-size:1.8rem;
        z-index:10;
      `;
      petPreview.textContent = pet.emoji;
      container.style.position = 'relative';
      container.appendChild(petPreview);
    }
  }

  // [한글 주석] 슬롯 탭 활성화
  document.querySelectorAll('.customize-slot-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.slot === currentCustomizeSlot);
  });

  renderItemList();
}

// [한글 주석] 아이템 목록 렌더링
function renderItemList() {
  const listEl = document.getElementById('customize-item-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  const level = typeof getCurrentLevel === 'function' ? getCurrentLevel() : 1;
  const unlocked = getUnlockedItems();
  const equipped = getEquippedItems();
  const unlockedAvatars = getUnlockedAvatars();
  const rarityColors = { common: '#7fff00', rare: '#4a9eff', epic: '#ffd700' };

  // ==========================================
  // [한글 주석] 아바타 탭
  // ==========================================
  if (currentCustomizeSlot === 'avatar') {
    AVATAR_LIST.forEach(av => {
      const isUnlocked = unlockedAvatars.includes(av.id);
      const isSelected = getSelectedAvatar() === av.id;
      const div = document.createElement('div');
      div.className = 'customize-item'
        + (!isUnlocked ? ' locked' : '')
        + (isSelected ? ' equipped' : '');
      div.style.borderColor = isSelected ? '#84ff00' : (isUnlocked ? '#4a9eff' : '#333');
      div.innerHTML = `
        <div style="width:40px;height:80px;overflow:hidden;position:relative;flex-shrink:0;
          ${!isUnlocked ? 'filter:grayscale(1);opacity:0.4;' : ''}">
          <img src="${IMG_BASE}avatar_${av.id}.png"
            style="width:40px;height:160px;object-fit:contain;object-position:top;
            image-rendering:pixelated;position:absolute;top:0;">
        </div>
        <div class="customize-item-info">
          <div class="customize-item-name">${(window.currentLang && window.currentLang !== 'ko' && av[`name_${window.currentLang}`]) ? av[`name_${window.currentLang}`] : av.name}</div>
          ${isUnlocked
          ? `<div class="customize-item-status">${isSelected ? (window.LANG_UI?.[window.currentLang || 'ko']?.avatarSelectedStatus || '✅ 선택 중') : (window.LANG_UI?.[window.currentLang || 'ko']?.avatarSelectAvailable || '선택 가능')}</div>`
          : `<div class="customize-item-cond">${(window.LANG_UI?.[window.currentLang || 'ko']?.avatarLockCond || '🔒 Lv.{n} 해금').replace('{n}', av.unlockLevel)}</div>`}
        </div>
      `;
      if (isUnlocked) {
        div.onclick = () => {
          selectAvatar(av.id);
          initAvatar();
          renderCustomizeUI();
        };
      }
      listEl.appendChild(div);
    });

    // ==========================================
    // [한글 주석] 옷 탭
    // ==========================================
  } else if (currentCustomizeSlot === 'outfit') {
    const currentOutfit = getEquippedOutfit();
    OUTFIT_LIST.forEach(outfit => {
      const isUnlocked = level >= outfit.unlockLevel;
      const isEquipped = currentOutfit === outfit.id;
      const rColor = rarityColors[outfit.rarity] || '#7fff00';
      const div = document.createElement('div');
      div.className = 'customize-item'
        + (!isUnlocked ? ' locked' : '')
        + (isEquipped ? ' equipped' : '');
      div.style.borderColor = isEquipped ? '#84ff00' : (isUnlocked ? rColor : '#333');
      div.innerHTML = `
        <div class="customize-item-emoji">${outfit.emoji}</div>
        <div class="customize-item-info">
          <div class="customize-item-name">${(window.currentLang && window.currentLang !== 'ko' && outfit[`name_${window.currentLang}`]) ? outfit[`name_${window.currentLang}`] : outfit.name}</div>
          <div style="color:${rColor};font-size:10px;">
            ${'★'.repeat(outfit.rarity === 'epic' ? 3 : outfit.rarity === 'rare' ? 2 : 1)}
          </div>
          ${isUnlocked
          ? `<div class="customize-item-status">${isEquipped ? (window.LANG_UI?.[window.currentLang || 'ko']?.outfitEquippedStatus || '✅ 착용 중') : (window.LANG_UI?.[window.currentLang || 'ko']?.outfitEquipAvailable || '착용 가능')}</div>`
          : `<div class="customize-item-cond">${(window.LANG_UI?.[window.currentLang || 'ko']?.avatarLockCond || '🔒 Lv.{n} 해금').replace('{n}', outfit.unlockLevel)}</div>`}
        </div>
      `;
      if (isUnlocked) {
        div.onclick = () => {
          saveEquippedOutfit(outfit.id);
          renderEquippedItems();
          renderCustomizeUI();
        };
      }
      listEl.appendChild(div);
    });

    // ==========================================
    // [한글 주석] 펫 탭
    // ==========================================
  } else if (currentCustomizeSlot === 'pet') {
    const collection = typeof getCollection === 'function' ? getCollection() : [];
    let aCount = 0, total = 0;
    collection.forEach(id => {
      if (id.startsWith('animal_')) aCount++;
      total++;
    });
    const unlockedPets = getUnlockedPets();
    const equippedPet = getEquippedPet();

    PET_LIST.forEach(pet => {
      const isUnlocked = unlockedPets.includes(pet.id);
      const isEquipped = equippedPet === pet.id;
      const div = document.createElement('div');
      div.className = 'customize-item'
        + (!isUnlocked ? ' locked' : '')
        + (isEquipped ? ' equipped' : '');
      div.style.borderColor = isEquipped ? '#84ff00' : (isUnlocked ? '#4a9eff' : '#333');
      let condText = '';
      if (!isUnlocked && pet.condition) {
        const _Tpc = window.LANG_UI; const _Lpc = window.currentLang || 'ko';
        condText = pet.condition.total
          ? (_Tpc?.[_Lpc]?.petCondTotal || '전체 {n}개 필요').replace('{n}', pet.condition.total)
          : (_Tpc?.[_Lpc]?.petCondAnimal || '동물 {n}개 필요').replace('{n}', pet.condition.count);
      }
      div.innerHTML = `
        <div class="customize-item-emoji" style="font-size:2.2rem;">${pet.emoji}</div>
        <div class="customize-item-info">
          <div class="customize-item-name">${(window.currentLang && window.currentLang !== 'ko' && pet[`name_${window.currentLang}`]) ? pet[`name_${window.currentLang}`] : pet.name}</div>
          ${isUnlocked
          ? `<div class="customize-item-status">${isEquipped ? (window.LANG_UI?.[window.currentLang || 'ko']?.petEquippedStatus || '✅ 장착 중') : (window.LANG_UI?.[window.currentLang || 'ko']?.petEquipAvailable || '장착 가능')}</div>`
          : `<div class="customize-item-cond">🔒 ${condText}</div>`}
        </div>
      `;
      if (isUnlocked) {
        div.onclick = () => { equipPet(pet.id); renderCustomizeUI(); };
      }
      listEl.appendChild(div);
    });

    // ==========================================
    // [한글 주석] 일반 액세서리 탭 (hat, glasses, earring, weapon)
    // ==========================================
    // ==========================================
    // [한글 주석] 칭호 탭
    // ==========================================
  } else if (currentCustomizeSlot === 'title') {
    const level = typeof getCurrentLevel === 'function' ? getCurrentLevel() : 1;
    const equippedTitleId = getEquippedTitle();

    LEVEL_BADGES.forEach(badge => {
      const isUnlocked = level >= badge.unlockLevel;
      const isEquipped = equippedTitleId === badge.id;

      const div = document.createElement('div');
      div.className = 'customize-item'
        + (!isUnlocked ? ' locked' : '')
        + (isEquipped ? ' equipped' : '');
      div.style.borderColor = isEquipped ? '#ffd700' : (isUnlocked ? '#c8a000' : '#333');

      div.innerHTML = `
        <div style="width:44px;height:52px;flex-shrink:0;
          ${!isUnlocked ? 'filter:grayscale(1);opacity:0.4;' : ''}">
          ${badge.svg}
        </div>
        <div class="customize-item-info">
          <div class="customize-item-name">${(window.currentLang && window.currentLang !== 'ko' && badge[`name_${window.currentLang}`]) ? badge[`name_${window.currentLang}`] : badge.name}</div>
          <div style="color:#ffd700;font-size:10px;">
            ${'★'.repeat(badge.unlockLevel === 30 ? 3 : badge.unlockLevel === 20 ? 2 : 1)}
          </div>
          ${isUnlocked
          ? `<div class="customize-item-status">${isEquipped ? (window.LANG_UI?.[window.currentLang || 'ko']?.titleEquippedStatus || '✅ 장착 중 (탭하여 해제)') : (window.LANG_UI?.[window.currentLang || 'ko']?.titleEquipAvailable || '탭하여 장착')}</div>`
          : `<div class="customize-item-cond">${(window.LANG_UI?.[window.currentLang || 'ko']?.titleLockCond || '🔒 Lv.{n} 달성 시 해금').replace('{n}', badge.unlockLevel)}</div>`}
        </div>
      `;

      if (isUnlocked) {
        div.onclick = () => {
          // [한글 주석] 이미 장착 중이면 해제, 아니면 장착
          if (isEquipped) {
            saveEquippedTitle(null);
          } else {
            saveEquippedTitle(badge.id);
          }
          // [한글 주석] 메인화면 + 미리보기 갱신
          renderLevelBadge();
          renderCustomizeUI();
        };
      }

      listEl.appendChild(div);
    });

  } else {
    const slotItems = Object.entries(AVATAR_ITEMS)
      .filter(([, v]) => v.slot === currentCustomizeSlot);

    if (slotItems.length === 0) {
      const _Tni = window.LANG_UI; const _Lni = window.currentLang || 'ko';
      listEl.innerHTML = `<div style="text-align:center;color:#888;padding:20px;">${_Tni?.[_Lni]?.itemNone || '아이템 없음'}</div>`;
      return;
    }

    slotItems.forEach(([itemId, item]) => {
      const isUnlocked = unlocked.includes(itemId) || level >= item.unlockLevel;
      const isEquipped = equipped[item.slot] === itemId;
      const rColor = rarityColors[item.rarity] || '#7fff00';
      const div = document.createElement('div');
      div.className = 'customize-item'
        + (!isUnlocked ? ' locked' : '')
        + (isEquipped ? ' equipped' : '');
      div.style.borderColor = isEquipped ? '#84ff00' : (isUnlocked ? rColor : '#333');
      div.innerHTML = `
        <div style="width:40px;height:80px;overflow:hidden;position:relative;flex-shrink:0;
          ${!isUnlocked ? 'filter:grayscale(1);opacity:0.4;' : ''}">
          <img src="${IMG_BASE}item_${itemId}.png"
            style="width:40px;height:160px;object-fit:contain;object-position:top;
            image-rendering:pixelated;position:absolute;top:0;"
            onerror="this.parentElement.innerHTML='<div style=font-size:1.8rem;text-align:center;padding-top:16px>${item.emoji}</div>'">
        </div>
        <div class="customize-item-info">
          <div class="customize-item-name">${(window.currentLang && window.currentLang !== 'ko' && item[`name_${window.currentLang}`]) ? item[`name_${window.currentLang}`] : item.name}</div>
          <div style="color:${rColor};font-size:10px;">
            ${'★'.repeat(item.rarity === 'epic' ? 3 : item.rarity === 'rare' ? 2 : 1)}
          </div>
          ${isUnlocked
          ? `<div class="customize-item-status">${isEquipped ? (window.LANG_UI?.[window.currentLang || 'ko']?.itemEquippedStatus || '✅ 장착 중') : (window.LANG_UI?.[window.currentLang || 'ko']?.itemEquipAvailable || '장착 가능')}</div>`
          : `<div class="customize-item-cond">${(window.LANG_UI?.[window.currentLang || 'ko']?.avatarLockCond || '🔒 Lv.{n} 해금').replace('{n}', item.unlockLevel)}</div>`}
        </div>
      `;
      if (isUnlocked) {
        div.onclick = () => { equipItem(itemId); renderCustomizeUI(); };
      }
      listEl.appendChild(div);
    });
  }
}


// [한글 주석] 복주머니 뱃지 숫자 업데이트 (아이템 버튼에 표시)
function updateRewardBadge() {
  const bags = JSON.parse(localStorage.getItem('rewardBags') || '[]');
  const badge = document.getElementById('reward-badge');
  if (!badge) return;
  if (bags.length > 0) {
    badge.textContent = bags.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// [한글 주석] 복주머니 목록 화면 렌더링
function renderRewardBagList() {
  const listEl = document.getElementById('reward-bag-list');
  if (!listEl) return;
  const bags = JSON.parse(localStorage.getItem('rewardBags') || '[]');

  if (bags.length === 0) {
    const _Tbn = window.LANG_UI; const _Lbn = window.currentLang || 'ko';
    listEl.innerHTML = `<div style="text-align:center;color:#888;padding:40px;">${_Tbn?.[_Lbn]?.bagNone || '아직 받은 복주머니가 없어요 🎁'}</div>`;
    return;
  }

  const _Tbl = window.LANG_UI; const _Lbl = window.currentLang || 'ko';
  const _tbl = k => _Tbl?.[_Lbl]?.[k] || _Tbl?.ko?.[k] || '';
  listEl.innerHTML = bags.map((bag, idx) => `
    <div class="reward-bag-item" onclick="openOneBag(${idx})">
      <div style="font-size:2.5rem;">🎁</div>
      <div style="color:#ffd700;font-size:13px;font-weight:700;">${_tbl('bagLabel').replace('{n}', idx + 1)}</div>
      <div style="color:#888;font-size:11px;">${bag.receivedAt}</div>
      <div style="color:#4a9eff;font-size:11px;margin-top:4px;">${_tbl('bagTapToOpen')}</div>
    </div>
  `).join('');

  // [한글 주석] 전체 열기 버튼 표시
  const allBtn = document.getElementById('open-all-bags-btn');
  if (allBtn) allBtn.style.display = bags.length > 1 ? 'block' : 'none';
}

// [한글 주석] 복주머니 하나 열기 (두구두구 애니메이션)
function openOneBag(idx) {
  const bags = JSON.parse(localStorage.getItem('rewardBags') || '[]');
  if (!bags[idx]) return;
  const bag = bags[idx];
  showBagOpenAnimation(bag.reward, () => {
    // [한글 주석] 애니메이션 완료 후 해당 복주머니 제거
    bags.splice(idx, 1);
    localStorage.setItem('rewardBags', JSON.stringify(bags));
    updateRewardBadge();
    renderRewardBagList();
  });
}

// [한글 주석] 전체 열기
function openAllBags() {
  const bags = JSON.parse(localStorage.getItem('rewardBags') || '[]');
  if (bags.length === 0) return;
  let i = 0;
  function openNext() {
    if (i >= bags.length) {
      // [한글 주석] 전체 제거
      localStorage.setItem('rewardBags', JSON.stringify([]));
      updateRewardBadge();
      renderRewardBagList();
      return;
    }
    showBagOpenAnimation(bags[i].reward, () => {
      i++;
      setTimeout(openNext, 500);
    });
  }
  openNext();
}

// [한글 주석] 두구두구 애니메이션 + 카드 뒤집기
function showBagOpenAnimation(reward, onComplete) {
  // [한글 주석] 보상 카드 결정
  const allCards = window.allCardsData || [];
  let card = null;
  if (reward.type === 'random_all' || !reward.category) {
    card = allCards[Math.floor(Math.random() * allCards.length)];
  } else {
    // [한글 주석] 카테고리 필터링
    let filtered = allCards.filter(c => c.category === reward.category);

    // [한글 주석] rarity가 'all'이 아닐 때만 희귀도 필터 추가 적용
    if (reward.rarity && reward.rarity !== 'all') {
      const rarFiltered = filtered.filter(c => c.rarity === reward.rarity);
      // [한글 주석] 희귀도 필터 결과가 있으면 적용, 없으면 카테고리 필터만 유지
      if (rarFiltered.length > 0) filtered = rarFiltered;
    }

    // [한글 주석] 해당 카테고리 카드가 없으면 전체에서 뽑기 (예외 처리)
    card = filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : allCards[Math.floor(Math.random() * allCards.length)];
  }
  if (!card) { if (onComplete) onComplete(); return; }

  // [한글 주석] 카드 수집 처리
  if (window.saveCollection) window.saveCollection(card.id);

  // [한글 주석] 메인화면 완성도 즉시 업데이트
  if (typeof window.updateMainScreenData === 'function') {
    window.updateMainScreenData();
  }

  // [한글 주석] 오버레이 생성
  const overlay = document.createElement('div');
  overlay.id = 'bag-open-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.92);z-index:99999;
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
  `;

  // [한글 주석] 복주머니 흔들리는 단계
  overlay.innerHTML = `
    <div id="bag-shake-phase" style="text-align:center;">
      <div id="bag-emoji" style="font-size:80px;animation:bagShake 0.4s infinite;">🎁</div>
      <div style="color:#ffd700;font-size:20px;font-weight:900;margin-top:16px;" id="bag-opening-msg"></div>
      <div style="color:#888;font-size:13px;margin-top:8px;" id="bag-drumroll-msg"></div>
    </div>
    <div id="card-reveal-phase" style="display:none;text-align:center;">
      <div class="card-flip-container">
        <div class="card-flip-inner" id="flip-inner">
          <div class="card-flip-back">❓</div>
          <div class="card-flip-front">
            <!-- [한글 주석] 카드 이미지 또는 이모지 렌더링을 위한 120x120px 박스 구조 -->
            <div style="
              width:120px;height:120px;
              margin:0 auto 12px;
              border-radius:16px;overflow:hidden;
              display:flex;align-items:center;justify-content:center;
              background:rgba(0,0,0,0.2);
            ">${typeof getCardImageHTML === 'function'
      ? getCardImageHTML(card, 56) /* [한글 주석] 카드 이미지 렌더링 함수가 존재하면 호출 */
      : `<div style="font-size:56px;">${card.emoji || '🌿'}</div>` /* [한글 주석] 없으면 기본 이모지 출력 */
    }</div>
            <div style="color:#fff;font-size:18px;font-weight:700;">${card.name}</div>
            <div style="color:${card.rarity === 'epic' ? '#ffd700' : card.rarity === 'rare' ? '#4a9eff' : '#84ff00'};font-size:12px;margin:4px 0;" id="bag-card-rarity"></div>
            <div style="color:#ccc;font-size:11px;line-height:1.5;">${card.short_desc || ''}</div>
          </div>
        </div>
      </div>
      <button onclick="closeBagAnimation()" style="
        margin-top:24px;background:#ffd700;color:#000;
        border:none;border-radius:12px;padding:14px 40px;
        font-size:16px;font-weight:900;cursor:pointer;
      " id="bag-receive-btn"></button>
    </div>
  `;
  document.body.appendChild(overlay);

  // [한글 주석] 복주머니 두구두구 효과음
  if (typeof playSfxBagDrumroll === 'function') playSfxBagDrumroll();
  const _Tba = window.LANG_UI; const _Lba = window.currentLang || 'ko';
  const _tba = k => _Tba?.[_Lba]?.[k] || _Tba?.ko?.[k] || '';
  const bagOM = document.getElementById('bag-opening-msg');
  const bagDR = document.getElementById('bag-drumroll-msg');
  const bagCR = document.getElementById('bag-card-rarity');
  const bagRB = document.getElementById('bag-receive-btn');
  if (bagOM) bagOM.textContent = _tba('bagOpeningMsg');
  if (bagDR) bagDR.textContent = _tba('bagDrumrollMsg');
  if (bagCR) bagCR.textContent = card.rarity === 'epic' ? _tba('bagRarityEpic') : card.rarity === 'rare' ? _tba('bagRarityRare') : _tba('bagRarityCommon');
  if (bagRB) bagRB.textContent = _tba('bagReceiveBtn');

  // [한글 주석] 1.5초 후 카드 뒤집기로 전환
  setTimeout(() => {
    document.getElementById('bag-shake-phase').style.display = 'none';
    const revealPhase = document.getElementById('card-reveal-phase');
    revealPhase.style.display = 'block';
    // [한글 주석] 0.1초 후 뒤집기 애니메이션 시작
    setTimeout(() => {
      const flipInner = document.getElementById('flip-inner');
      if (flipInner) {
        flipInner.classList.add('flipped');
        // [한글 주석] 복주머니 오픈 효과음
        if (typeof playSfxBagOpen === 'function') playSfxBagOpen();
      }
    }, 100);
  }, 1500);

  // [한글 주석] 받기 버튼 클릭 시 콜백
  window.closeBagAnimation = function () {
    const el = document.getElementById('bag-open-overlay');
    if (el) el.remove();
    if (onComplete) onComplete();
  };
}

// [한글 주석] 전역 노출
window.updateRewardBadge = updateRewardBadge;
window.openOneBag = openOneBag;
window.openAllBags = openAllBags;
window.renderRewardBagList = renderRewardBagList;

// [한글 주석] 메인화면 레벨 뱃지 - 퀴즈 통과 후 확정된 레벨만 표시
function updateLevelBadge() {
  // [한글 주석] 카드 수가 아닌 확정 저장된 레벨 사용
  const level = typeof getCurrentLevel === 'function' ? getCurrentLevel() : 1;
  const badge = document.getElementById('level-badge');
  if (badge) badge.textContent = `Lv.${level}`;
  // [한글 주석] 레벨 변경 시 칭호 뱃지 갱신
  renderLevelBadge();
}

// [한글 주석] 레벨업 축하 팝업
function showLevelUpPopup(newLevel) {
  // [한글 주석] 기존 팝업 있으면 제거
  const existing = document.getElementById('levelup-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'levelup-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.85);
    z-index:99999;
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    animation:fadeIn 0.3s ease;
  `;

  overlay.innerHTML = `
    <div style="
      text-align:center;
      animation:bounceIn 0.6s ease;
    ">
      <!-- [한글 주석] 레벨업 이펙트 별 -->
      <div style="font-size:60px;margin-bottom:8px;animation:spin 1s linear infinite;">⭐</div>
      
      <div style="
        color:#ffd700;
        font-size:14px;
        font-weight:700;
        letter-spacing:4px;
        margin-bottom:8px;
      ">LEVEL UP!</div>
      
      <div style="
        background:linear-gradient(135deg,#ffd700,#ff9500);
        color:#000;
        font-size:48px;
        font-weight:900;
        border-radius:24px;
        padding:16px 40px;
        margin-bottom:16px;
        box-shadow:0 0 40px rgba(255,215,0,0.6);
      ">Lv.${newLevel}</div>
      
      <div style="
        color:#fff;
        font-size:15px;
        margin-bottom:32px;
      " id="levelup-msg"></div>
      
      <button onclick="document.getElementById('levelup-overlay').remove()"
        style="
          background:#ffd700;color:#000;
          border:none;border-radius:12px;
          padding:14px 48px;
          font-size:16px;font-weight:900;
          cursor:pointer;
        " id="levelup-confirm-btn"></button>
    </div>
  `;

  document.body.appendChild(overlay);
  const _Tlu = window.LANG_UI; const _Llu = window.currentLang || 'ko';
  const luM = document.getElementById('levelup-msg');
  const luB = document.getElementById('levelup-confirm-btn');
  if (luM) luM.textContent = _Tlu?.[_Llu]?.levelUpMsg || '축하해요! 레벨이 올랐어요! 🎉';
  if (luB) luB.textContent = _Tlu?.[_Llu]?.levelUpConfirm || '확인!';

  // [한글 주석] 진동 알림
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);

  // [한글 주석] 5초 후 자동 닫힘
  setTimeout(() => {
    const el = document.getElementById('levelup-overlay');
    if (el) el.remove();
  }, 5000);
}

// [한글 주석] 전역 노출
window.updateLevelBadge = updateLevelBadge;
window.showLevelUpPopup = showLevelUpPopup;

window.getUnlockedAvatars = getUnlockedAvatars;
window.checkAndUnlockAvatars = checkAndUnlockAvatars;
window.getEquippedOutfit = getEquippedOutfit;
window.saveEquippedOutfit = saveEquippedOutfit;
window._renderAvatarWithItems = _renderAvatarWithItems;
window.renderLevelBadge = renderLevelBadge;

window.getEquippedTitle = getEquippedTitle;
window.saveEquippedTitle = saveEquippedTitle;
