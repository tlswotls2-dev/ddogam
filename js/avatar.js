// ==========================================
// avatar.js - 도트 아바타, 성별 선택, 꾸미기 시스템
// ==========================================

const GENDER_STORAGE_KEY = 'selectedGender';
const UNLOCKED_ITEMS_KEY = 'unlockedItems';
const EQUIPPED_ITEMS_KEY = 'equippedItems';

// 4종 아바타 목록 정의 (픽셀아트 SVG 캐릭터)
const AVATAR_LIST = [
  { id: 'boy_explorer', name: '갈색 탐험가', isGirl: false },
  { id: 'boy_police', name: '경찰 탐험가', isGirl: false },
  { id: 'girl_sakura', name: '벚꽃 탐험가', isGirl: true },
  { id: 'girl_sports', name: '스포츠 탐험가', isGirl: true }
];

// 8종 펫 목록 정의
const PET_LIST = [
  { id: 'pet_none', name: '없음', emoji: '❌', condition: null },
  { id: 'pet_chick', name: '병아리', emoji: '🐥', condition: { category: 'animal', count: 5 } },
  { id: 'pet_rabbit', name: '토끼', emoji: '🐰', condition: { category: 'animal', count: 15 } },
  { id: 'pet_squirrel', name: '다람쥐', emoji: '🐿️', condition: { category: 'animal', count: 30 } },
  { id: 'pet_butterfly', name: '나비', emoji: '🦋', condition: { category: 'animal', count: 50 } },
  { id: 'pet_fox', name: '여우', emoji: '🦊', condition: { category: 'animal', count: 70 } },
  { id: 'pet_deer', name: '사슴', emoji: '🦌', condition: { category: 'animal', count: 90 } },
  { id: 'pet_crane', name: '두루미', emoji: '🦢', condition: { total: 200 } }
];

// [한글 주석] 아바타 선택 저장 함수
function selectAvatar(avatarId) {
  localStorage.setItem('selectedAvatar', avatarId);
}

// [한글 주석] 현재 선택된 아바타 ID 가져오기 (기본값: boy_explorer)
function getSelectedAvatar() {
  return localStorage.getItem('selectedAvatar') || 'boy_explorer';
}

// [한글 주석] 아바타 선택이 필요한지 여부 확인
function needsAvatarSelection() {
  return !localStorage.getItem('selectedAvatar');
}

// [한글 주석] 하위 호환성 유지 (기존 코드가 gender 함수 호출 시 동작하도록 매핑)
function needsGenderSelection() {
  return needsAvatarSelection();
}

// [한글 주석] 선택된 아바타의 성별(isGirl 여부)에 따라 'girl' 또는 'boy'를 반환
function getSelectedGender() {
  const id = getSelectedAvatar();
  const avatar = AVATAR_LIST.find(a => a.id === id);
  return avatar && avatar.isGirl ? 'girl' : 'boy';
}

// ==========================================
// [한글 주석] 해금 아이템 정의 (슬롯별 조건 및 희귀도 - 레벨 기반)
// ==========================================
const AVATAR_ITEMS = {
  'leaf_hat':       { slot:'hat',   name:'나뭇잎 모자',  condition:{ level:3  }, rarity:'common', emoji:'🌿' },
  'flower_crown':   { slot:'hat',   name:'꽃 왕관',      condition:{ level:8  }, rarity:'rare',   emoji:'🌸' },
  'king_crown':     { slot:'hat',   name:'조선 왕관',    condition:{ level:15 }, rarity:'rare',   emoji:'👑' },
  'gold_crown':     { slot:'hat',   name:'황금 왕관',    condition:{ level:25 }, rarity:'epic',   emoji:'✨' },
  'nature_cape':    { slot:'cape',  name:'자연 망토',    condition:{ level:10 }, rarity:'rare',   emoji:'🌳' },
  'artifact_cape':  { slot:'cape',  name:'유물 망토',    condition:{ level:15 }, rarity:'rare',   emoji:'🏺' },
  'butterfly_wing': { slot:'wing',  name:'나비 날개',    condition:{ level:5  }, rarity:'common', emoji:'🦋' },
  'sky_wing':       { slot:'wing',  name:'하늘 날개',    condition:{ level:20 }, rarity:'epic',   emoji:'🌤️' },
  'explorer_badge': { slot:'badge', name:'탐험가 배지',  condition:{ level:25 }, rarity:'rare',   emoji:'🎖️' },
  'legend_badge':   { slot:'badge', name:'전설 탐험가',  condition:{ level:30 }, rarity:'epic',   emoji:'🏆' }
};

// ==========================================
// [한글 주석] 아이템 SVG 조각 (viewBox 0 0 60 100 기준)
// ==========================================
function getItemSVG(itemId) {
  const items = {

    // ==========================================
    // [한글 주석] 모자류 - 머리 위에 제대로 된 모양으로
    // ==========================================

    // [한글 주석] 나뭇잎 모자 - 넓은 잎사귀 모양
    'leaf_hat': `<g>
      <!-- 모자 챙 -->
      <ellipse cx="30" cy="10" rx="18" ry="4" fill="#2d8a3a"/>
      <!-- 모자 몸통 -->
      <rect x="18" y="2" width="24" height="9" fill="#3aaa4a" rx="3"/>
      <!-- 잎맥 장식 -->
      <line x1="30" y1="3" x2="30" y2="10" stroke="#7fff00" stroke-width="1" opacity="0.8"/>
      <line x1="22" y1="6" x2="38" y2="6" stroke="#7fff00" stroke-width="1" opacity="0.6"/>
      <!-- 꽃 장식 -->
      <circle cx="30" cy="3" r="2" fill="#7fff00"/>
      <circle cx="26" cy="5" r="1.5" fill="#84ff00" opacity="0.8"/>
      <circle cx="34" cy="5" r="1.5" fill="#84ff00" opacity="0.8"/>
    </g>`,

    // [한글 주석] 꽃 왕관 - 꽃들이 빙 둘러싼 왕관
    'flower_crown': `<g>
      <!-- 왕관 밴드 -->
      <rect x="14" y="8" width="32" height="5" fill="#ffaacc" rx="2"/>
      <!-- 꽃들 -->
      <circle cx="16" cy="7" r="4" fill="#ff69b4"/>
      <circle cx="16" cy="7" r="2" fill="#fff"/>
      <circle cx="23" cy="4" r="4" fill="#ff99cc"/>
      <circle cx="23" cy="4" r="2" fill="#ffeeee"/>
      <circle cx="30" cy="3" r="5" fill="#ff69b4"/>
      <circle cx="30" cy="3" r="2.5" fill="#fff"/>
      <circle cx="37" cy="4" r="4" fill="#ff99cc"/>
      <circle cx="37" cy="4" r="2" fill="#ffeeee"/>
      <circle cx="44" cy="7" r="4" fill="#ff69b4"/>
      <circle cx="44" cy="7" r="2" fill="#fff"/>
      <!-- 꽃술 -->
      <circle cx="30" cy="3" r="1" fill="#ffd700"/>
    </g>`,

    // [한글 주석] 조선 왕관 - 익선관 스타일
    'king_crown': `<g>
      <!-- 왕관 베이스 -->
      <rect x="13" y="7" width="34" height="7" fill="#ffd700" rx="2"/>
      <!-- 왕관 포인트 3개 -->
      <polygon points="18,7 21,0 24,7" fill="#ffd700"/>
      <polygon points="27,7 30,-1 33,7" fill="#ffd700"/>
      <polygon points="36,7 39,0 42,7" fill="#ffd700"/>
      <!-- 보석들 -->
      <circle cx="21" cy="2" r="2" fill="#ff4444"/>
      <circle cx="30" cy="1" r="2.5" fill="#4a9eff"/>
      <circle cx="39" cy="2" r="2" fill="#ff4444"/>
      <!-- 왕관 장식선 -->
      <rect x="13" y="11" width="34" height="2" fill="#ffaa00" rx="1"/>
      <!-- 작은 보석들 -->
      <circle cx="18" cy="10" r="1.5" fill="#ff69b4"/>
      <circle cx="25" cy="10" r="1.5" fill="#7fff00"/>
      <circle cx="30" cy="10" r="1.5" fill="#ff4444"/>
      <circle cx="35" cy="10" r="1.5" fill="#7fff00"/>
      <circle cx="42" cy="10" r="1.5" fill="#ff69b4"/>
    </g>`,

    // [한글 주석] 황금 왕관 - 화려한 전설급 왕관
    'gold_crown': `<g>
      <!-- 왕관 베이스 (두껍게) -->
      <rect x="11" y="8" width="38" height="8" fill="#ffd700" rx="3"/>
      <!-- 왕관 포인트 5개 -->
      <polygon points="13,8 16,0 19,8" fill="#ffd700"/>
      <polygon points="20,8 24,1 28,8" fill="#ffd700"/>
      <polygon points="27,8 30,-2 33,8" fill="#ffd700"/>
      <polygon points="32,8 36,1 40,8" fill="#ffd700"/>
      <polygon points="41,8 44,0 47,8" fill="#ffd700"/>
      <!-- 왕관 테두리 (빛나는 효과) -->
      <rect x="11" y="8" width="38" height="2" fill="#fff8aa" opacity="0.6"/>
      <!-- 메인 보석 (가운데) -->
      <circle cx="30" cy="0" r="3" fill="#ff4444"/>
      <circle cx="30" cy="0" r="1.5" fill="#ff9999"/>
      <!-- 사이드 보석들 -->
      <circle cx="16" cy="2" r="2" fill="#4a9eff"/>
      <circle cx="24" cy="3" r="2" fill="#7fff00"/>
      <circle cx="36" cy="3" r="2" fill="#7fff00"/>
      <circle cx="44" cy="2" r="2" fill="#4a9eff"/>
      <!-- 베이스 장식 -->
      <rect x="11" y="13" width="38" height="2" fill="#ffaa00"/>
      <circle cx="16" cy="11" r="2" fill="#ff69b4"/>
      <circle cx="23" cy="11" r="2" fill="#4a9eff"/>
      <circle cx="30" cy="11" r="2" fill="#ff4444"/>
      <circle cx="37" cy="11" r="2" fill="#4a9eff"/>
      <circle cx="44" cy="11" r="2" fill="#ff69b4"/>
      <!-- 반짝임 효과 -->
      <circle cx="14" cy="5" r="1" fill="#fff" opacity="0.8"/>
      <circle cx="46" cy="5" r="1" fill="#fff" opacity="0.8"/>
    </g>`,

    // ==========================================
    // [한글 주석] 망토류 - 넓고 길게 다리까지
    // ==========================================

    // [한글 주석] 자연 망토 - 넓은 초록 망토
    'nature_cape': `<g>
      <!-- 왼쪽 망토 (어깨부터 발목까지) -->
      <path d="M2,32 L10,32 L14,85 L2,85 Z" fill="#2d8a3a" opacity="0.85"/>
      <!-- 오른쪽 망토 -->
      <path d="M50,32 L58,32 L58,85 L46,85 Z" fill="#2d8a3a" opacity="0.85"/>
      <!-- 망토 테두리 장식 -->
      <path d="M2,32 L10,32 L14,85" fill="none" stroke="#7fff00" stroke-width="1.5" opacity="0.7"/>
      <path d="M50,32 L58,32 L58,85" fill="none" stroke="#7fff00" stroke-width="1.5" opacity="0.7"/>
      <!-- 잎사귀 패턴 -->
      <ellipse cx="6" cy="45" rx="3" ry="5" fill="#7fff00" opacity="0.5" transform="rotate(-20,6,45)"/>
      <ellipse cx="7" cy="60" rx="3" ry="5" fill="#84ff00" opacity="0.5" transform="rotate(15,7,60)"/>
      <ellipse cx="5" cy="74" rx="3" ry="5" fill="#7fff00" opacity="0.5" transform="rotate(-10,5,74)"/>
      <ellipse cx="54" cy="45" rx="3" ry="5" fill="#7fff00" opacity="0.5" transform="rotate(20,54,45)"/>
      <ellipse cx="53" cy="60" rx="3" ry="5" fill="#84ff00" opacity="0.5" transform="rotate(-15,53,60)"/>
      <ellipse cx="55" cy="74" rx="3" ry="5" fill="#7fff00" opacity="0.5" transform="rotate(10,55,74)"/>
      <!-- 망토 끝 장식 -->
      <rect x="2" y="83" width="12" height="2" fill="#7fff00" rx="1"/>
      <rect x="46" y="83" width="12" height="2" fill="#7fff00" rx="1"/>
    </g>`,

    // [한글 주석] 유물 망토 - 황금 문양 망토
    'artifact_cape': `<g>
      <!-- 왼쪽 망토 -->
      <path d="M2,32 L10,32 L14,85 L2,85 Z" fill="#8B6914" opacity="0.85"/>
      <!-- 오른쪽 망토 -->
      <path d="M50,32 L58,32 L58,85 L46,85 Z" fill="#8B6914" opacity="0.85"/>
      <!-- 황금 테두리 -->
      <path d="M2,32 L10,32 L14,85" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.8"/>
      <path d="M50,32 L58,32 L58,85" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.8"/>
      <!-- 유물 문양 패턴 -->
      <circle cx="6" cy="44" r="3" fill="none" stroke="#ffd700" stroke-width="1" opacity="0.7"/>
      <circle cx="6" cy="44" r="1" fill="#ffd700" opacity="0.7"/>
      <circle cx="6" cy="58" r="3" fill="none" stroke="#ffd700" stroke-width="1" opacity="0.7"/>
      <circle cx="6" cy="58" r="1" fill="#ffd700" opacity="0.7"/>
      <circle cx="6" cy="72" r="3" fill="none" stroke="#ffd700" stroke-width="1" opacity="0.7"/>
      <circle cx="6" cy="72" r="1" fill="#ffd700" opacity="0.7"/>
      <circle cx="54" cy="44" r="3" fill="none" stroke="#ffd700" stroke-width="1" opacity="0.7"/>
      <circle cx="54" cy="44" r="1" fill="#ffd700" opacity="0.7"/>
      <circle cx="54" cy="58" r="3" fill="none" stroke="#ffd700" stroke-width="1" opacity="0.7"/>
      <circle cx="54" cy="58" r="1" fill="#ffd700" opacity="0.7"/>
      <circle cx="54" cy="72" r="3" fill="none" stroke="#ffd700" stroke-width="1" opacity="0.7"/>
      <circle cx="54" cy="72" r="1" fill="#ffd700" opacity="0.7"/>
      <!-- 망토 끝 황금 장식 -->
      <rect x="2" y="83" width="12" height="3" fill="#ffd700" rx="1"/>
      <rect x="46" y="83" width="12" height="3" fill="#ffd700" rx="1"/>
    </g>`,

    // ==========================================
    // [한글 주석] 날개류 - 크고 화려하게
    // ==========================================

    // [한글 주석] 나비 날개 - 크고 화려한 나비 날개
    'butterfly_wing': `<g>
      <!-- 왼쪽 위 날개 (크게) -->
      <ellipse cx="4" cy="36" rx="12" ry="16" fill="#87CEEB" opacity="0.75" transform="rotate(-20,4,36)"/>
      <!-- 왼쪽 아래 날개 -->
      <ellipse cx="6" cy="56" rx="9" ry="12" fill="#4a9eff" opacity="0.65" transform="rotate(15,6,56)"/>
      <!-- 오른쪽 위 날개 -->
      <ellipse cx="56" cy="36" rx="12" ry="16" fill="#87CEEB" opacity="0.75" transform="rotate(20,56,36)"/>
      <!-- 오른쪽 아래 날개 -->
      <ellipse cx="54" cy="56" rx="9" ry="12" fill="#4a9eff" opacity="0.65" transform="rotate(-15,54,56)"/>
      <!-- 날개 문양 (왼쪽) -->
      <ellipse cx="4" cy="34" rx="5" ry="7" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.6" transform="rotate(-20,4,34)"/>
      <circle cx="3" cy="32" r="2" fill="#ffd700" opacity="0.5"/>
      <!-- 날개 문양 (오른쪽) -->
      <ellipse cx="56" cy="34" rx="5" ry="7" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.6" transform="rotate(20,56,34)"/>
      <circle cx="57" cy="32" r="2" fill="#ffd700" opacity="0.5"/>
      <!-- 날개 끝 점들 -->
      <circle cx="-2" cy="28" r="1.5" fill="#87CEEB" opacity="0.8"/>
      <circle cx="62" cy="28" r="1.5" fill="#87CEEB" opacity="0.8"/>
    </g>`,

    // [한글 주석] 하늘 날개 - 전설급 천사 날개
    'sky_wing': `<g>
      <!-- 왼쪽 큰 날개 -->
      <path d="M10,38 C-10,20 -15,50 -5,65 C0,70 8,60 10,55 Z" fill="#ffffff" opacity="0.85"/>
      <!-- 왼쪽 날개 깃털 레이어 -->
      <path d="M10,40 C-5,25 -8,45 2,58 Z" fill="#e8f4ff" opacity="0.7"/>
      <path d="M10,42 C0,30 -2,48 5,57 Z" fill="#ffffff" opacity="0.6"/>
      <!-- 오른쪽 큰 날개 -->
      <path d="M50,38 C70,20 75,50 65,65 C60,70 52,60 50,55 Z" fill="#ffffff" opacity="0.85"/>
      <!-- 오른쪽 날개 깃털 레이어 -->
      <path d="M50,40 C65,25 68,45 58,58 Z" fill="#e8f4ff" opacity="0.7"/>
      <path d="M50,42 C60,30 62,48 55,57 Z" fill="#ffffff" opacity="0.6"/>
      <!-- 날개 빛나는 효과 -->
      <path d="M10,38 C-10,20 -15,50 -5,65" fill="none" stroke="#4a9eff" stroke-width="1.5" opacity="0.5"/>
      <path d="M50,38 C70,20 75,50 65,65" fill="none" stroke="#4a9eff" stroke-width="1.5" opacity="0.5"/>
      <!-- 빛 반짝임 -->
      <circle cx="-3" cy="30" r="2" fill="#fff" opacity="0.9"/>
      <circle cx="63" cy="30" r="2" fill="#fff" opacity="0.9"/>
      <circle cx="-8" cy="48" r="1.5" fill="#4a9eff" opacity="0.7"/>
      <circle cx="68" cy="48" r="1.5" fill="#4a9eff" opacity="0.7"/>
    </g>`,

    // ==========================================
    // [한글 주석] 배지류 - 명확하고 화려하게
    // ==========================================

    // [한글 주석] 탐험가 배지 - 별 모양 메달 (가슴에 크게)
    'explorer_badge': `<g>
      <!-- 메달 리본 -->
      <rect x="27" y="32" width="6" height="8" fill="#4a9eff" rx="1"/>
      <rect x="26" y="32" width="3" height="5" fill="#2277cc"/>
      <!-- 별 모양 배지 -->
      <polygon points="30,42 32,48 38,48 33,52 35,58 30,54 25,58 27,52 22,48 28,48"
               fill="#ffd700" stroke="#ffaa00" stroke-width="1"/>
      <!-- 별 중앙 장식 -->
      <circle cx="30" cy="50" r="4" fill="#ff9500"/>
      <circle cx="30" cy="50" r="2" fill="#ffd700"/>
      <!-- 반짝임 -->
      <circle cx="25" cy="44" r="1" fill="#fff" opacity="0.8"/>
      <circle cx="35" cy="44" r="1" fill="#fff" opacity="0.8"/>
    </g>`,

    // [한글 주석] 전설 탐험가 트로피 - 아바타 옆에 크게!
    'legend_badge': `<g>
      <!-- 트로피 컵 (아바타 오른쪽 옆에 크게) -->
      <!-- 트로피 받침대 -->
      <rect x="38" y="88" width="18" height="4" fill="#ffd700" rx="2"/>
      <rect x="41" y="82" width="12" height="7" fill="#ffd700"/>
      <!-- 트로피 몸통 -->
      <path d="M38,50 Q36,65 40,75 L56,75 Q60,65 58,50 Z" fill="#ffd700"/>
      <!-- 트로피 광택 -->
      <path d="M40,52 Q38,65 41,73" fill="none" stroke="#fff8aa" stroke-width="2" opacity="0.6"/>
      <!-- 트로피 손잡이 왼쪽 -->
      <path d="M38,55 Q30,55 30,63 Q30,70 38,68" fill="none" stroke="#ffd700" stroke-width="4"/>
      <!-- 트로피 손잡이 오른쪽 -->
      <path d="M58,55 Q66,55 66,63 Q66,70 58,68" fill="none" stroke="#ffd700" stroke-width="4"/>
      <!-- 트로피 별 장식 -->
      <polygon points="48,56 49.5,61 55,61 50.5,64 52,69 48,66 44,69 45.5,64 41,61 46.5,61"
               fill="#fff" opacity="0.9"/>
      <!-- 트로피 테두리 -->
      <path d="M38,50 Q36,65 40,75 L56,75 Q60,65 58,50 Z" fill="none" stroke="#ffaa00" stroke-width="1.5"/>
      <!-- 빛나는 효과 -->
      <circle cx="43" cy="54" r="2" fill="#fff" opacity="0.7"/>
      <circle cx="62" cy="52" r="1.5" fill="#fff" opacity="0.8"/>
      <circle cx="66" cy="60" r="1.5" fill="#ffd700" opacity="0.9"/>
      <!-- 반짝임 파티클 -->
      <circle cx="68" cy="48" r="1" fill="#ffd700" opacity="0.8"/>
      <circle cx="70" cy="55" r="1" fill="#fff" opacity="0.7"/>
      <circle cx="69" cy="65" r="1" fill="#ffd700" opacity="0.8"/>
    </g>`
  };
  return items[itemId] || '';
}


// ==========================================
// 4종 아바타 SVG 라우터 및 픽셀아트 함수
// ==========================================

// [한글 주석] 아바타 ID에 따라 해당 SVG를 반환하는 메인 라우터 함수
function getAvatarSVG(avatarId) {
  // [한글 주석] 하위 호환성 처리 (기존 ID를 새 ID로 매핑)
  if (avatarId === 'boy' || avatarId === 'boy_default') avatarId = 'boy_explorer';
  if (avatarId === 'girl' || avatarId === 'girl_default') avatarId = 'girl_sakura';

  if (avatarId === 'boy_explorer') return getBoyExplorerSVG();
  if (avatarId === 'boy_police') return getBoyPoliceSVG();
  if (avatarId === 'girl_sakura') return getGirlSakuraSVG();
  if (avatarId === 'girl_sports') return getGirlSportsSVG();
  return getBoyExplorerSVG();
}

// [한글 주석] 갈색 탐험가 (남) - 픽셀아트 SVG
function getBoyExplorerSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" style="image-rendering:pixelated" width="100%" height="100%">
    <g id="baseLayer">
      <rect x="10" y="0" width="40" height="7" fill="#6b4a1a"/>
      <rect x="7" y="6" width="46" height="4" fill="#4a3008"/>
      <rect x="10" y="4" width="40" height="3" fill="#c8914a"/>
      <rect x="12" y="8" width="36" height="5" fill="#3a2200"/>
      <rect x="10" y="10" width="6" height="10" fill="#3a2200"/>
      <rect x="44" y="10" width="6" height="10" fill="#3a2200"/>
      <rect x="12" y="13" width="36" height="22" fill="#e8aa70"/>
      <rect x="10" y="15" width="2" height="16" fill="#e8aa70"/>
      <rect x="48" y="15" width="2" height="16" fill="#e8aa70"/>
      <rect x="14" y="19" width="12" height="9" fill="#fff"/>
      <rect x="15" y="19" width="10" height="9" fill="#1a0a00"/>
      <rect x="16" y="20" width="6" height="6" fill="#8b5e00"/>
      <rect x="18" y="20" width="3" height="3" fill="#fff"/>
      <rect x="34" y="19" width="12" height="9" fill="#fff"/>
      <rect x="35" y="19" width="10" height="9" fill="#1a0a00"/>
      <rect x="36" y="20" width="6" height="6" fill="#8b5e00"/>
      <rect x="38" y="20" width="3" height="3" fill="#fff"/>
      <rect x="15" y="17" width="10" height="2" fill="#3a2200"/>
      <rect x="35" y="17" width="10" height="2" fill="#3a2200"/>
      <rect x="11" y="28" width="6" height="3" fill="#e8998a" opacity="0.8"/>
      <rect x="43" y="28" width="6" height="3" fill="#e8998a" opacity="0.8"/>
      <rect x="22" y="31" width="16" height="3" fill="#c06050"/>
      <rect x="20" y="31" width="2" height="2" fill="#c06050"/>
      <rect x="38" y="31" width="2" height="2" fill="#c06050"/>
      <rect x="24" y="35" width="12" height="5" fill="#e8aa70"/>
      <rect x="10" y="40" width="40" height="22" fill="#8b6914"/>
      <rect x="5" y="40" width="6" height="20" fill="#8b6914"/>
      <rect x="49" y="40" width="6" height="20" fill="#8b6914"/>
      <rect x="3" y="44" width="4" height="14" fill="#8b6914"/>
      <rect x="53" y="44" width="4" height="14" fill="#8b6914"/>
      <rect x="5" y="48" width="6" height="3" fill="#c8914a"/>
      <rect x="49" y="48" width="6" height="3" fill="#c8914a"/>
      <rect x="28" y="41" width="3" height="20" fill="#6b4a1a"/>
      <rect x="27" y="44" width="3" height="3" fill="#ffd700"/>
      <rect x="27" y="51" width="3" height="3" fill="#ffd700"/>
      <rect x="27" y="58" width="3" height="3" fill="#ffd700"/>
      <rect x="12" y="46" width="12" height="8" fill="#6b4a1a"/>
      <rect x="36" y="46" width="12" height="8" fill="#6b4a1a"/>
      <rect x="3" y="57" width="4" height="6" fill="#e8aa70"/>
      <rect x="53" y="57" width="4" height="6" fill="#e8aa70"/>
      <rect x="10" y="62" width="40" height="4" fill="#4a3008"/>
      <rect x="24" y="61" width="12" height="6" fill="#c8914a"/>
      <rect x="27" y="62" width="6" height="4" fill="#8b6914"/>
      <rect x="10" y="66" width="18" height="24" fill="#5a4a1a"/>
      <rect x="32" y="66" width="18" height="24" fill="#5a4a1a"/>
      <rect x="11" y="78" width="16" height="6" fill="#4a3a0a"/>
      <rect x="33" y="78" width="16" height="6" fill="#4a3a0a"/>
      <rect x="8" y="90" width="22" height="7" fill="#3a2800"/>
      <rect x="30" y="90" width="22" height="7" fill="#3a2800"/>
      <rect x="7" y="95" width="24" height="5" fill="#2a1800"/>
      <rect x="29" y="95" width="24" height="5" fill="#2a1800"/>
    </g>
    <g id="itemLayer"></g>
  </svg>`;
}


// [한글 주석] 파랑 경찰관 (남) - 픽셀아트 SVG
function getBoyPoliceSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" style="image-rendering:pixelated" width="100%" height="100%">
    <g id="baseLayer">
      <rect x="10" y="0" width="40" height="10" fill="#1a3a8a"/>
      <rect x="7" y="9" width="46" height="4" fill="#0a2a6a"/>
      <rect x="12" y="2" width="36" height="4" fill="#4a7aff"/>
      <rect x="24" y="1" width="12" height="7" fill="#ffd700"/>
      <rect x="26" y="2" width="8" height="5" fill="#ffaa00"/>
      <rect x="29" y="1" width="2" height="7" fill="#ffd700"/>
      <rect x="10" y="11" width="6" height="8" fill="#1a0a00"/>
      <rect x="44" y="11" width="6" height="8" fill="#1a0a00"/>
      <rect x="12" y="13" width="36" height="22" fill="#f5c48a"/>
      <rect x="10" y="15" width="2" height="16" fill="#f5c48a"/>
      <rect x="48" y="15" width="2" height="16" fill="#f5c48a"/>
      <rect x="14" y="19" width="12" height="9" fill="#fff"/>
      <rect x="15" y="19" width="10" height="9" fill="#1a0a00"/>
      <rect x="16" y="20" width="6" height="6" fill="#1a4aaa"/>
      <rect x="18" y="20" width="3" height="3" fill="#fff"/>
      <rect x="34" y="19" width="12" height="9" fill="#fff"/>
      <rect x="35" y="19" width="10" height="9" fill="#1a0a00"/>
      <rect x="36" y="20" width="6" height="6" fill="#1a4aaa"/>
      <rect x="38" y="20" width="3" height="3" fill="#fff"/>
      <rect x="15" y="17" width="10" height="2" fill="#1a0a00"/>
      <rect x="35" y="17" width="10" height="2" fill="#1a0a00"/>
      <rect x="11" y="28" width="6" height="3" fill="#ffbbaa" opacity="0.7"/>
      <rect x="43" y="28" width="6" height="3" fill="#ffbbaa" opacity="0.7"/>
      <rect x="22" y="31" width="16" height="3" fill="#c06050"/>
      <rect x="20" y="31" width="2" height="2" fill="#c06050"/>
      <rect x="38" y="31" width="2" height="2" fill="#c06050"/>
      <rect x="24" y="35" width="12" height="5" fill="#f5c48a"/>
      <rect x="22" y="38" width="16" height="5" fill="#ffffff"/>
      <rect x="24" y="38" width="12" height="8" fill="#ffffff"/>
      <rect x="27" y="40" width="6" height="12" fill="#0a1a6a"/>
      <rect x="26" y="46" width="8" height="4" fill="#0a1a6a"/>
      <rect x="10" y="40" width="40" height="22" fill="#1a3a8a"/>
      <rect x="5" y="40" width="6" height="20" fill="#1a3a8a"/>
      <rect x="49" y="40" width="6" height="20" fill="#1a3a8a"/>
      <rect x="3" y="44" width="4" height="14" fill="#1a3a8a"/>
      <rect x="53" y="44" width="4" height="14" fill="#1a3a8a"/>
      <rect x="5" y="50" width="6" height="3" fill="#4a7aff"/>
      <rect x="49" y="50" width="6" height="3" fill="#4a7aff"/>
      <rect x="12" y="44" width="12" height="10" fill="#ffd700"/>
      <rect x="13" y="45" width="10" height="8" fill="#ffaa00"/>
      <rect x="17" y="46" width="2" height="6" fill="#ffd700"/>
      <rect x="28" y="40" width="3" height="22" fill="#0a2a6a"/>
      <rect x="27" y="46" width="3" height="3" fill="#4a7aff"/>
      <rect x="27" y="53" width="3" height="3" fill="#4a7aff"/>
      <rect x="3" y="57" width="4" height="6" fill="#f5c48a"/>
      <rect x="53" y="57" width="4" height="6" fill="#f5c48a"/>
      <rect x="10" y="62" width="40" height="4" fill="#0a1a4a"/>
      <rect x="24" y="61" width="12" height="6" fill="#ffd700"/>
      <rect x="10" y="66" width="18" height="24" fill="#0a2a6a"/>
      <rect x="32" y="66" width="18" height="24" fill="#0a2a6a"/>
      <rect x="26" y="66" width="3" height="24" fill="#4a7aff"/>
      <rect x="31" y="66" width="3" height="24" fill="#4a7aff"/>
      <rect x="8" y="90" width="22" height="7" fill="#0a0a1a"/>
      <rect x="30" y="90" width="22" height="7" fill="#0a0a1a"/>
      <rect x="7" y="95" width="24" height="5" fill="#1a1a2a"/>
      <rect x="29" y="95" width="24" height="5" fill="#1a1a2a"/>
    </g>
    <g id="itemLayer"></g>
  </svg>`;
}


// [한글 주석] 벚꽃 탐험가 (여) - 픽셀아트 SVG
function getGirlSakuraSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" style="image-rendering:pixelated" width="100%" height="100%">
    <g id="baseLayer">
      <rect x="14" y="2" width="32" height="5" fill="#5a2a00"/>
      <rect x="12" y="5" width="36" height="7" fill="#5a2a00"/>
      <rect x="10" y="8" width="40" height="8" fill="#5a2a00"/>
      <rect x="8" y="10" width="6" height="46" fill="#5a2a00"/>
      <rect x="46" y="10" width="6" height="46" fill="#5a2a00"/>
      <rect x="6" y="14" width="4" height="40" fill="#5a2a00"/>
      <rect x="50" y="14" width="4" height="40" fill="#5a2a00"/>
      <rect x="6" y="34" width="4" height="6" fill="#7a3a10"/>
      <rect x="8" y="42" width="4" height="6" fill="#7a3a10"/>
      <rect x="50" y="34" width="4" height="6" fill="#7a3a10"/>
      <rect x="48" y="42" width="4" height="6" fill="#7a3a10"/>
      <rect x="10" y="9" width="8" height="5" fill="#ffb7c5"/>
      <rect x="12" y="7" width="4" height="4" fill="#ff88aa"/>
      <rect x="12" y="10" width="4" height="2" fill="#fff" opacity="0.5"/>
      <rect x="12" y="13" width="36" height="22" fill="#f5c48a"/>
      <rect x="10" y="15" width="2" height="16" fill="#f5c48a"/>
      <rect x="48" y="15" width="2" height="16" fill="#f5c48a"/>
      <rect x="13" y="19" width="13" height="9" fill="#fff"/>
      <rect x="14" y="19" width="11" height="9" fill="#1a0a00"/>
      <rect x="15" y="20" width="7" height="6" fill="#aa3366"/>
      <rect x="17" y="20" width="3" height="3" fill="#fff"/>
      <rect x="34" y="19" width="13" height="9" fill="#fff"/>
      <rect x="35" y="19" width="11" height="9" fill="#1a0a00"/>
      <rect x="36" y="20" width="7" height="6" fill="#aa3366"/>
      <rect x="38" y="20" width="3" height="3" fill="#fff"/>
      <rect x="13" y="17" width="3" height="4" fill="#1a0a00"/>
      <rect x="17" y="16" width="3" height="4" fill="#1a0a00"/>
      <rect x="22" y="16" width="3" height="4" fill="#1a0a00"/>
      <rect x="34" y="17" width="3" height="4" fill="#1a0a00"/>
      <rect x="38" y="16" width="3" height="4" fill="#1a0a00"/>
      <rect x="43" y="16" width="3" height="4" fill="#1a0a00"/>
      <rect x="11" y="28" width="6" height="3" fill="#ffb7c5" opacity="0.9"/>
      <rect x="43" y="28" width="6" height="3" fill="#ffb7c5" opacity="0.9"/>
      <rect x="22" y="31" width="16" height="3" fill="#e07090"/>
      <rect x="20" y="31" width="2" height="2" fill="#e07090"/>
      <rect x="38" y="31" width="2" height="2" fill="#e07090"/>
      <rect x="8" y="22" width="3" height="3" fill="#ffb7c5"/>
      <rect x="7" y="23" width="5" height="3" fill="#ffb7c5"/>
      <rect x="8" y="26" width="3" height="3" fill="#ffb7c5"/>
      <rect x="49" y="22" width="3" height="3" fill="#ffb7c5"/>
      <rect x="48" y="23" width="5" height="3" fill="#ffb7c5"/>
      <rect x="49" y="26" width="3" height="3" fill="#ffb7c5"/>
      <rect x="24" y="35" width="12" height="5" fill="#f5c48a"/>
      <rect x="18" y="39" width="24" height="2" fill="#ffb7c5"/>
      <rect x="27" y="39" width="6" height="4" fill="#ff88aa"/>
      <rect x="15" y="40" width="30" height="22" fill="#f48aaa"/>
      <rect x="10" y="42" width="6" height="18" fill="#f48aaa"/>
      <rect x="44" y="42" width="6" height="18" fill="#f48aaa"/>
      <rect x="8" y="46" width="4" height="12" fill="#f48aaa"/>
      <rect x="48" y="46" width="4" height="12" fill="#f48aaa"/>
      <rect x="22" y="40" width="16" height="3" fill="#ffb7c5"/>
      <rect x="26" y="40" width="8" height="6" fill="#ffccdd"/>
      <rect x="29" y="40" width="2" height="8" fill="#fff" opacity="0.4"/>
      <rect x="15" y="58" width="30" height="3" fill="#e06080"/>
      <rect x="8" y="54" width="4" height="6" fill="#f5c48a"/>
      <rect x="48" y="54" width="4" height="6" fill="#f5c48a"/>
      <rect x="15" y="61" width="30" height="34" fill="#f48aaa"/>
      <rect x="17" y="61" width="3" height="34" fill="#e06080" opacity="0.4"/>
      <rect x="40" y="61" width="3" height="34" fill="#e06080" opacity="0.4"/>
      <rect x="20" y="68" width="6" height="6" fill="#ffccdd" opacity="0.7"/>
      <rect x="22" y="66" width="2" height="3" fill="#ffccdd" opacity="0.7"/>
      <rect x="34" y="74" width="6" height="6" fill="#ffccdd" opacity="0.7"/>
      <rect x="36" y="72" width="2" height="3" fill="#ffccdd" opacity="0.7"/>
      <rect x="18" y="80" width="6" height="6" fill="#ffccdd" opacity="0.7"/>
      <rect x="14" y="94" width="32" height="2" fill="#ffb7c5"/>
      <rect x="18" y="96" width="10" height="4" fill="#e06080"/>
      <rect x="32" y="96" width="10" height="4" fill="#e06080"/>
      <rect x="26" y="99" width="3" height="5" fill="#c04060"/>
      <rect x="37" y="99" width="3" height="5" fill="#c04060"/>
    </g>
    <g id="itemLayer"></g>
  </svg>`;
}


// [한글 주석] 스포츠 탐험가 (여) - 픽셀아트 SVG
function getGirlSportsSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" style="image-rendering:pixelated" width="100%" height="100%">
    <g id="baseLayer">
      <rect x="14" y="2" width="32" height="5" fill="#1a1a1a"/>
      <rect x="12" y="5" width="36" height="7" fill="#1a1a1a"/>
      <rect x="10" y="8" width="40" height="8" fill="#1a1a1a"/>
      <rect x="8" y="10" width="6" height="24" fill="#1a1a1a"/>
      <rect x="46" y="10" width="6" height="14" fill="#1a1a1a"/>
      <rect x="6" y="14" width="4" height="18" fill="#1a1a1a"/>
      <rect x="46" y="10" width="10" height="28" fill="#1a1a1a"/>
      <rect x="48" y="36" width="8" height="18" fill="#1a1a1a"/>
      <rect x="50" y="52" width="6" height="10" fill="#1a1a1a"/>
      <rect x="10" y="12" width="40" height="4" fill="#84ff00"/>
      <rect x="12" y="13" width="36" height="22" fill="#f5c48a"/>
      <rect x="10" y="15" width="2" height="16" fill="#f5c48a"/>
      <rect x="48" y="15" width="2" height="16" fill="#f5c48a"/>
      <rect x="13" y="19" width="13" height="9" fill="#fff"/>
      <rect x="14" y="19" width="11" height="9" fill="#1a0a00"/>
      <rect x="15" y="20" width="7" height="6" fill="#2a8a2a"/>
      <rect x="17" y="20" width="3" height="3" fill="#fff"/>
      <rect x="34" y="19" width="13" height="9" fill="#fff"/>
      <rect x="35" y="19" width="11" height="9" fill="#1a0a00"/>
      <rect x="36" y="20" width="7" height="6" fill="#2a8a2a"/>
      <rect x="38" y="20" width="3" height="3" fill="#fff"/>
      <rect x="14" y="17" width="10" height="2" fill="#1a0a00"/>
      <rect x="36" y="17" width="10" height="2" fill="#1a0a00"/>
      <rect x="11" y="28" width="6" height="3" fill="#ffbbaa" opacity="0.8"/>
      <rect x="43" y="28" width="6" height="3" fill="#ffbbaa" opacity="0.8"/>
      <rect x="22" y="31" width="16" height="3" fill="#d06050"/>
      <rect x="20" y="31" width="2" height="2" fill="#d06050"/>
      <rect x="38" y="31" width="2" height="2" fill="#d06050"/>
      <rect x="24" y="35" width="12" height="5" fill="#f5c48a"/>
      <rect x="13" y="40" width="34" height="22" fill="#f0f0f0"/>
      <rect x="8" y="42" width="6" height="18" fill="#f0f0f0"/>
      <rect x="46" y="42" width="6" height="18" fill="#f0f0f0"/>
      <rect x="6" y="46" width="4" height="12" fill="#f0f0f0"/>
      <rect x="50" y="46" width="4" height="12" fill="#f0f0f0"/>
      <rect x="13" y="40" width="4" height="22" fill="#84ff00"/>
      <rect x="43" y="40" width="4" height="22" fill="#84ff00"/>
      <rect x="8" y="42" width="4" height="18" fill="#84ff00"/>
      <rect x="48" y="42" width="4" height="18" fill="#84ff00"/>
      <rect x="22" y="44" width="16" height="12" fill="#e0e0e0"/>
      <rect x="24" y="45" width="12" height="10" fill="#84ff00" opacity="0.4"/>
      <rect x="29" y="46" width="2" height="8" fill="#2a6a2a"/>
      <rect x="6" y="56" width="4" height="6" fill="#f5c48a"/>
      <rect x="50" y="56" width="4" height="6" fill="#f5c48a"/>
      <rect x="13" y="62" width="34" height="5" fill="#2a2a2a"/>
      <rect x="24" y="61" width="12" height="7" fill="#84ff00"/>
      <rect x="28" y="62" width="4" height="5" fill="#2a2a2a"/>
      <rect x="13" y="67" width="16" height="18" fill="#2a2a2a"/>
      <rect x="31" y="67" width="16" height="18" fill="#2a2a2a"/>
      <rect x="27" y="67" width="3" height="18" fill="#84ff00"/>
      <rect x="30" y="67" width="3" height="18" fill="#84ff00"/>
      <rect x="14" y="85" width="14" height="8" fill="#f5c48a"/>
      <rect x="32" y="85" width="14" height="8" fill="#f5c48a"/>
      <rect x="13" y="93" width="16" height="12" fill="#f0f0f0"/>
      <rect x="31" y="93" width="16" height="12" fill="#f0f0f0"/>
      <rect x="13" y="96" width="16" height="3" fill="#84ff00"/>
      <rect x="31" y="96" width="16" height="3" fill="#84ff00"/>
    </g>
    <g id="itemLayer"></g>
  </svg>`;
}


// ==========================================
// [한글 주석] 아바타/성별 선택 호환성 관리자
// ==========================================
function selectGender(g) {
  // [한글 주석] 기존 selectGender 함수 호출 시 아바타 ID로 역추적하여 저장
  if (g === 'girl') selectAvatar('girl_sakura');
  else selectAvatar('boy_explorer');
}

let tempSelectedAvatarId = null;

function showGenderSelectScreen() {
  const s = document.getElementById('gender-select-screen');
  if (s) {
    s.style.display = 'flex';
    renderAvatarPreviews();
  }
}

// [한글 주석] 아바타를 화면에 그리드 형식으로 렌더링
function renderAvatarPreviews() {
  const container = document.querySelector('.gender-options');
  if (!container) return;

  container.innerHTML = '';

  AVATAR_LIST.forEach(avatar => {
    const btn = document.createElement('button');
    btn.className = 'gender-btn';
    btn.type = 'button';
    btn.setAttribute('data-avatar-id', avatar.id);
    btn.onclick = () => handleAvatarSelect(avatar.id);

    btn.innerHTML = `
      <div class="gender-avatar-preview" style="width: 80px; height: 120px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin: 0 auto 8px;">
        ${getAvatarSVG(avatar.id)}
      </div>
      <span class="gender-label" style="font-size: 11px; font-weight: 700; color: #fff; display: block; text-align: center;">${avatar.name}</span>
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
    alert("원하는 아바타를 하나 선택해주세요!");
    return;
  }
  selectAvatar(tempSelectedAvatarId);
  const s = document.getElementById('gender-select-screen');
  if (s) s.style.display = 'none';
  if (typeof window.proceedToMainScreen === 'function') window.proceedToMainScreen();
}

// [한글 주석] 아바타 초기화 (메인 화면에 SVG 삽입 및 펫 렌더링)
function initAvatar() {
  const avatarId = getSelectedAvatar();
  if (!avatarId) return;
  const el = document.getElementById('main-character');
  if (!el) return;
  el.innerHTML = getAvatarSVG(avatarId);
  el.style.cssText = 'width:120px;height:180px;font-size:unset;line-height:normal;image-rendering:pixelated;cursor:pointer;';
  // [한글 주석] 장착된 아이템 렌더링
  renderEquippedItems();

  // [한글 주석] 메인 화면 아바타 옆 펫 표시
  renderPet();

  // [한글 주석] 레벨 뱃지 초기값 설정
  updateLevelBadge();
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
function checkAndUnlockItems() {
  // [한글 주석] 퀴즈 통과 후 확정된 레벨 사용 (카드 수 기반 레벨 사용 금지)
  const currentLevel = typeof getCurrentLevel === 'function'
    ? getCurrentLevel()
    : 1;

  const unlocked = getUnlockedItems();
  let newItems = [];

  Object.keys(AVATAR_ITEMS).forEach(itemId => {
    if (unlocked.includes(itemId)) return;
    const cond = AVATAR_ITEMS[itemId].condition;
    // [한글 주석] 레벨 조건 체크
    if (cond.level && currentLevel >= cond.level) {
      unlocked.push(itemId);
      newItems.push(AVATAR_ITEMS[itemId].name);
    }
  });

  if (newItems.length > 0) {
    saveUnlockedItems(unlocked);
    showItemToast(newItems);
  }
}

// [한글 주석] 토스트 메시지
function showItemToast(names) {
  const toast = document.createElement('div');
  toast.className = 'item-unlock-toast';
  toast.textContent = `🎉 새 아이템 해금! ${names.join(', ')}`;
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
    showItemToast(newPets.map(name => name + '(펫)'));
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
// [한글 주석] 장착 아이템을 SVG itemLayer에 렌더링
// ==========================================
function renderEquippedItems() {
  const targets = document.querySelectorAll('#itemLayer');
  const equipped = getEquippedItems();

  targets.forEach(layer => {
    layer.innerHTML = '';
    Object.values(equipped).forEach(itemId => {
      const svg = getItemSVG(itemId);
      if (svg) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.innerHTML = svg;
        layer.appendChild(g);
      }
    });
  });
}

// ==========================================
// [한글 주석] 꾸미기 화면 UI
// ==========================================
let currentCustomizeSlot = 'hat';

function showCustomizeScreen() {
  const screen = document.getElementById('avatar-customize-screen');
  if (!screen) return;
  screen.style.display = 'flex';
  setTimeout(() => screen.classList.add('slide-in'), 10);
  currentCustomizeSlot = 'hat';

  // [한글 주석] 초기 진입 시 복주머니 목록 숨김
  const bagList = document.getElementById('reward-bag-list');
  const allBagsBtn = document.getElementById('open-all-bags-btn');
  if (bagList) bagList.style.display = 'none';
  if (allBagsBtn) allBagsBtn.style.display = 'none';

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

function renderCustomizeUI() {
  // [한글 주석] 미리보기 아바타 렌더링
  const preview = document.getElementById('customize-avatar-preview');
  if (preview) {
    const avatarId = getSelectedAvatar();
    preview.innerHTML = getAvatarSVG(avatarId);
    const layer = preview.querySelector('#itemLayer');
    if (layer) {
      const equipped = getEquippedItems();
      Object.values(equipped).forEach(itemId => {
        const svg = getItemSVG(itemId);
        if (svg) {
          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.innerHTML = svg;
          layer.appendChild(g);
        }
      });
    }
  }
  // [한글 주석] 슬롯 탭 활성화
  document.querySelectorAll('.customize-slot-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.slot === currentCustomizeSlot);
  });
  // [한글 주석] 아이템 목록 렌더링
  renderItemList();
}

function renderItemList() {
  const listEl = document.getElementById('customize-item-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  const unlocked = getUnlockedItems();
  const equipped = getEquippedItems();
  const collection = typeof getCollection === 'function' ? getCollection() : [];

  // [한글 주석] 현재 수집 수 계산
  let pCount = 0, aCount = 0, arCount = 0;
  collection.forEach(id => {
    if (id.startsWith('plant_')) pCount++;
    else if (id.startsWith('animal_')) aCount++;
    else if (id.startsWith('artifact_')) arCount++;
  });
  const total = pCount + aCount + arCount;
  const counts = { plant: pCount, animal: aCount, artifact: arCount };

  if (currentCustomizeSlot === 'pet') {
    // [한글 주석] 펫 탭 처리
    const unlockedPets = getUnlockedPets();
    const equippedPet = getEquippedPet();

    PET_LIST.forEach(pet => {
      const isUnlocked = unlockedPets.includes(pet.id);
      const isEquipped = equippedPet === pet.id;

      const div = document.createElement('div');
      div.className = 'customize-item' + (isUnlocked ? '' : ' locked') + (isEquipped ? ' equipped' : '');
      const borderColor = isEquipped ? '#84ff00' : (isUnlocked ? '#4a9eff' : '#333');
      div.style.borderColor = borderColor;

      let condText = '';
      if (!isUnlocked && pet.condition) {
        if (pet.condition.total) {
          condText = `전체 ${pet.condition.total}개 필요 (현재 ${total}개)`;
        } else {
          const catNames = { plant: '식물', animal: '동물', artifact: '유물' };
          const cur = counts[pet.condition.category] || 0;
          condText = `${catNames[pet.condition.category]} ${pet.condition.count}개 필요 (현재 ${cur}개)`;
        }
      }

      div.innerHTML = `
        <div class="customize-item-emoji" style="font-size: 2.2rem;">${pet.emoji}</div>
        <div class="customize-item-info">
          <div class="customize-item-name">${pet.name}</div>
          ${isUnlocked
          ? `<div class="customize-item-status">${isEquipped ? '✅ 장착 중' : '장착 가능'}</div>`
          : `<div class="customize-item-cond">🔒 ${condText}</div>`
        }
        </div>
      `;

      if (isUnlocked) {
        div.onclick = () => {
          equipPet(pet.id);
          renderCustomizeUI();
        };
      }

      listEl.appendChild(div);
    });

  } else {
    // [한글 주석] 기존 아이템 탭 처리
    const slotItems = Object.entries(AVATAR_ITEMS).filter(([, v]) => v.slot === currentCustomizeSlot);

    slotItems.forEach(([itemId, item]) => {
      const isUnlocked = unlocked.includes(itemId);
      const isEquipped = equipped[item.slot] === itemId;

      const div = document.createElement('div');
      div.className = 'customize-item' + (isUnlocked ? '' : ' locked') + (isEquipped ? ' equipped' : '');

      // [한글 주석] 희귀도 색상
      const rarityColors = { common: '#7fff00', rare: '#4a9eff', epic: '#ffd700' };
      const borderColor = isEquipped ? '#7fff00' : (isUnlocked ? (rarityColors[item.rarity] || '#4a9eff') : '#333');

      div.style.borderColor = borderColor;

      // [한글 주석] 잠금 조건 텍스트 - 레벨 기반
      let condText = '';
      if (!isUnlocked) {
        condText = item.condition.level
          ? `Lv.${item.condition.level} 해금`
          : '조건 미달';
      }

      div.innerHTML = `
        <div class="customize-item-emoji">${item.emoji}</div>
        <div class="customize-item-info">
          <div class="customize-item-name">${item.name}</div>
          ${isUnlocked
          ? `<div class="customize-item-status">${isEquipped ? '✅ 장착 중' : '장착 가능'}</div>`
          : `<div class="customize-item-cond">🔒 ${condText}</div>`
        }
        </div>
      `;

      if (isUnlocked) {
        div.onclick = () => {
          equipItem(itemId);
          renderCustomizeUI();
        };
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
    listEl.innerHTML = '<div style="text-align:center;color:#888;padding:40px;">아직 받은 복주머니가 없어요 🎁</div>';
    return;
  }

  listEl.innerHTML = bags.map((bag, idx) => `
    <div class="reward-bag-item" onclick="openOneBag(${idx})">
      <div style="font-size:2.5rem;">🎁</div>
      <div style="color:#ffd700;font-size:13px;font-weight:700;">복주머니 #${idx + 1}</div>
      <div style="color:#888;font-size:11px;">${bag.receivedAt}</div>
      <div style="color:#4a9eff;font-size:11px;margin-top:4px;">탭해서 열기</div>
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
      <div style="color:#ffd700;font-size:20px;font-weight:900;margin-top:16px;">열리고 있어요...</div>
      <div style="color:#888;font-size:13px;margin-top:8px;">두구두구두구...</div>
    </div>
    <div id="card-reveal-phase" style="display:none;text-align:center;">
      <div class="card-flip-container">
        <div class="card-flip-inner" id="flip-inner">
          <div class="card-flip-back">❓</div>
          <div class="card-flip-front">
            <div style="font-size:56px;margin-bottom:8px;">${card.emoji || '🌿'}</div>
            <div style="color:#fff;font-size:18px;font-weight:700;">${card.name}</div>
            <div style="color:${card.rarity === 'epic' ? '#ffd700' : card.rarity === 'rare' ? '#4a9eff' : '#84ff00'};font-size:12px;margin:4px 0;">
              ${card.rarity === 'epic' ? '★★★ 전설' : card.rarity === 'rare' ? '★★ 희귀' : '★ 일반'}
            </div>
            <div style="color:#ccc;font-size:11px;line-height:1.5;">${card.short_desc || ''}</div>
          </div>
        </div>
      </div>
      <button onclick="closeBagAnimation()" style="
        margin-top:24px;background:#ffd700;color:#000;
        border:none;border-radius:12px;padding:14px 40px;
        font-size:16px;font-weight:900;cursor:pointer;
      ">🎉 받기!</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // [한글 주석] 1.5초 후 카드 뒤집기로 전환
  setTimeout(() => {
    document.getElementById('bag-shake-phase').style.display = 'none';
    const revealPhase = document.getElementById('card-reveal-phase');
    revealPhase.style.display = 'block';
    // [한글 주석] 0.1초 후 뒤집기 애니메이션 시작
    setTimeout(() => {
      const flipInner = document.getElementById('flip-inner');
      if (flipInner) flipInner.classList.add('flipped');
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
      ">축하해요! 레벨이 올랐어요! 🎉</div>
      
      <button onclick="document.getElementById('levelup-overlay').remove()"
        style="
          background:#ffd700;color:#000;
          border:none;border-radius:12px;
          padding:14px 48px;
          font-size:16px;font-weight:900;
          cursor:pointer;
        ">확인!</button>
    </div>
  `;

  document.body.appendChild(overlay);

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


