const fs = require('fs');
const file = 'c:/Users/tlswo/Desktop/deploy-6a0bf2f473599df66c36b293/js/avatar.js';
let content = fs.readFileSync(file, 'utf8');
let lines = content.split('\r\n');
if (lines.length === 1) lines = content.split('\n');

function replaceLines(start, end, newLines) {
    let startIndex = start - 1;
    let endIndex = end - 1;
    if (start > end) {
        lines.splice(startIndex, 0, ...newLines);
    } else {
        lines.splice(startIndex, endIndex - startIndex + 1, ...newLines);
    }
}

// 5. Insert above checkAndUnlockItems (Line 764)
const insert5 = `
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
`.trim().split('\n');
replaceLines(764, 763, insert5);

// 4. Delete selectGender (Lines 646 to 653)
replaceLines(646, 653, []);

// 3. Replace SVG functions (Lines 355 to 640)
const insert3 = `
// ==========================================
// [한글 주석] 아바타 렌더링 함수
// ==========================================

// [한글 주석] PNG 이미지 반환 (기존 SVG 방식 대체)
function getAvatarSVG(avatarId) {
  // [한글 주석] 기존 SVG ID를 새 PNG ID로 매핑
  const mapping = {
    'boy_explorer': 'boy1_dodam',
    'boy_police':   'boy2_junseo',
    'girl_sakura':  'girl1_nari',
    'girl_sports':  'girl3_sua',
    'boy':          'boy1_dodam',
    'girl':         'girl1_nari',
  };
  const mapped = mapping[avatarId] || avatarId;
  return \`<img src="\${IMG_BASE}avatar_\${mapped}.png"
    style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated;"
    alt="\${mapped}">\`;
}
`.trim().split('\n');
replaceLines(355, 640, insert3);

// 2. Delete getItemSVG (Lines 72 to 352)
replaceLines(72, 352, []);

// 1. Replace first 6 functions and lists (Lines 5 to 54)
const insert1 = `
const UNLOCKED_ITEMS_KEY = 'unlockedItems';
const EQUIPPED_ITEMS_KEY = 'equippedItems';
const UNLOCKED_AVATARS_KEY = 'unlockedAvatars';

// [한글 주석] 이미지 기본 경로
const IMG_BASE = 'images/avatars/';

// [한글 주석] 8종 아바타 정의
const AVATAR_LIST = [
  { id: 'boy1_dodam',   name: '도담', gender: 'boy',  unlockLevel: 1  },
  { id: 'boy2_junseo',  name: '준서', gender: 'boy',  unlockLevel: 6  },
  { id: 'boy3_minjun',  name: '민준', gender: 'boy',  unlockLevel: 12 },
  { id: 'boy4_jiho',    name: '지호', gender: 'boy',  unlockLevel: 18 },
  { id: 'girl1_nari',   name: '나리', gender: 'girl', unlockLevel: 1  },
  { id: 'girl2_soyeon', name: '소연', gender: 'girl', unlockLevel: 6  },
  { id: 'girl3_sua',    name: '수아', gender: 'girl', unlockLevel: 12 },
  { id: 'girl4_jia',    name: '지아', gender: 'girl', unlockLevel: 18 },
];

// [한글 주석] 아이템 정의 (액세서리)
const AVATAR_ITEMS = {
  'earring_emerald':        { slot:'earring', name:'에메랄드 귀걸이',     unlockLevel:3,  rarity:'common', emoji:'💚' },
  'glasses':                { slot:'glasses', name:'안경',                 unlockLevel:5,  rarity:'common', emoji:'👓' },
  'hat_cowboy':             { slot:'hat',     name:'카우보이 모자',         unlockLevel:8,  rarity:'common', emoji:'🤠' },
  'glasses_sun':            { slot:'glasses', name:'선글라스',              unlockLevel:10, rarity:'rare',   emoji:'🕶️' },
  'earring_red':            { slot:'earring', name:'레드 귀걸이',           unlockLevel:13, rarity:'common', emoji:'❤️' },
  'hat_lucky':              { slot:'hat',     name:'행운 모자',             unlockLevel:15, rarity:'rare',   emoji:'🍀' },
  'sword':                  { slot:'weapon',  name:'탐험가의 검',           unlockLevel:17, rarity:'rare',   emoji:'⚔️' },
  'hat_pumpkin':            { slot:'hat',     name:'호박 모자',             unlockLevel:20, rarity:'rare',   emoji:'🎃' },
  'hat_witch':              { slot:'hat',     name:'마녀 모자',             unlockLevel:23, rarity:'epic',   emoji:'🧙' },
  'earring_emerald_silver': { slot:'earring', name:'에메랄드 실버 귀걸이', unlockLevel:25, rarity:'epic',   emoji:'💎' },
  'hat_pumpkin_purple':     { slot:'hat',     name:'보라 호박 모자',       unlockLevel:27, rarity:'epic',   emoji:'🟣' },
  'earring_red_silver':     { slot:'earring', name:'레드 실버 귀걸이',     unlockLevel:30, rarity:'epic',   emoji:'👑' },
};

// [한글 주석] 옷 정의
const OUTFIT_LIST = [
  { id: 'default',               name: '기본 복장',       unlockLevel: 1,  rarity: 'common', emoji: '👕' },
  { id: 'outfit_sporty_red',     name: '빨간 스포츠',     unlockLevel: 7,  rarity: 'common', emoji: '🏃' },
  { id: 'outfit_sporty_green',   name: '초록 스포츠',     unlockLevel: 7,  rarity: 'common', emoji: '🏃' },
  { id: 'outfit_floral_pink',    name: '핑크 꽃무늬',     unlockLevel: 7,  rarity: 'common', emoji: '🌸' },
  { id: 'outfit_floral_purple',  name: '보라 꽃무늬',     unlockLevel: 7,  rarity: 'common', emoji: '💜' },
  { id: 'outfit_stripe_blue',    name: '파란 스트라이프', unlockLevel: 13, rarity: 'rare',   emoji: '🔵' },
  { id: 'outfit_stripe_green',   name: '초록 스트라이프', unlockLevel: 13, rarity: 'rare',   emoji: '🟢' },
  { id: 'outfit_sailor_blue',    name: '파란 세일러',     unlockLevel: 13, rarity: 'rare',   emoji: '⛵' },
  { id: 'outfit_sailor_pink',    name: '핑크 세일러',     unlockLevel: 13, rarity: 'rare',   emoji: '🌸' },
  { id: 'outfit_suit_blue',      name: '파란 정장',       unlockLevel: 23, rarity: 'epic',   emoji: '🤵' },
  { id: 'outfit_suit_black',     name: '검정 정장',       unlockLevel: 23, rarity: 'epic',   emoji: '🖤' },
  { id: 'outfit_dress_purple',   name: '보라 드레스',     unlockLevel: 23, rarity: 'epic',   emoji: '👗' },
  { id: 'outfit_dress_pink',     name: '핑크 드레스',     unlockLevel: 23, rarity: 'epic',   emoji: '💗' },
  { id: 'outfit_pantssuit_black',name: '블랙 팬츠수트',   unlockLevel: 23, rarity: 'epic',   emoji: '🕴️' },
];

// [한글 주석] 펫 목록
const PET_LIST = [
  { id: 'pet_none',      name: '없음',   emoji: '❌', condition: null },
  { id: 'pet_chick',     name: '병아리', emoji: '🐥', condition: { category:'animal', count:5  } },
  { id: 'pet_rabbit',    name: '토끼',   emoji: '🐰', condition: { category:'animal', count:15 } },
  { id: 'pet_squirrel',  name: '다람쥐', emoji: '🐿️', condition: { category:'animal', count:30 } },
  { id: 'pet_butterfly', name: '나비',   emoji: '🦋', condition: { category:'animal', count:50 } },
  { id: 'pet_fox',       name: '여우',   emoji: '🦊', condition: { category:'animal', count:70 } },
  { id: 'pet_deer',      name: '사슴',   emoji: '🦌', condition: { category:'animal', count:90 } },
  { id: 'pet_crane',     name: '두루미', emoji: '🦢', condition: { total:200 } },
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
`.trim().split('\n');
replaceLines(5, 54, insert1);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('Done');