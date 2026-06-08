// ==========================================
// [한글 주석] 배틀 모드 시스템
// ==========================================

// [한글 주석] 앱스스크립트 URL
const BATTLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHFQhpwzADLC6JHfMdo4aJ6lUwXW4OFwfKOsQsTQjr07QFX3JJE27xrAJHZ1Zj-KI8/exec';

// [한글 주석] 배틀 상태 관리
let battleState = {
  phase: 'idle',        // idle / mode-select / studying / waiting / matched / quiz / result
  category: null,       // plant / animal / artifact
  studyStartTime: null, // 공부 시작 시간
  waitStartTime: null,  // 대기 시작 시간
  opponentNumber: null, // 매치된 상대 번호
  questions: [],        // 출제된 5문제
  currentQ: 0,          // 현재 문제 인덱스
  myScore: 0,           // 내 점수
  pollInterval: null,   // 폴링 인터벌
  studyCards: [],       // 공부용 카드 목록
  currentCardIdx: 0,    // 현재 보는 카드 인덱스
  showingBack: false,   // 카드 앞/뒷면 상태
  quizTimer: null,      // [한글 주석] 퀴즈 제한 타이머
  matchTime: null       // [한글 주석] 매칭 고유 시간 (결과 조회 식별용)
};

// ==========================================
// [한글 주석] 배틀 모드 진입 팝업
// ==========================================
function showBattleMode() {
  // [한글 주석] 배틀 모드 진입 시 메인 BGM 멈추고 배틀 BGM 시작
  if (typeof stopBGM === 'function') stopBGM();
  if (typeof playBattleBGM === 'function') playBattleBGM();

  // [한글 주석] 로그인 확인
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  if (!userData.class || !userData.number) {
    const T4 = window.LANG_UI; const L4 = window.currentLang || 'ko';
    alert(T4?.[L4]?.battleLoginRequired || '로그인이 필요해요!');
    return;
  }

  const existing = document.getElementById('battle-overlay');
  if (existing) existing.remove();

  const unlockedCats = typeof getUnlockedCategories === 'function'
    ? getUnlockedCategories() : ['plant'];

  const _Tcat = window.LANG_UI; const _Lcat = window.currentLang || 'ko';
  const catConfig = {
    plant: { label: _Tcat?.[_Lcat]?.battleCatPlant || '🌱 식물 지식 배틀', color: '#8db05c', border: '#6b8e3d' },
    animal: { label: _Tcat?.[_Lcat]?.battleCatAnimal || '🦊 동물 지식 배틀', color: '#ff9500', border: '#cc7700' },
    artifact: { label: _Tcat?.[_Lcat]?.battleCatArtifact || '🏺 유물 지식 배틀', color: '#d4a017', border: '#a07c10' }
  };

  const overlay = document.createElement('div');
  overlay.id = 'battle-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.92);
    z-index:99999;
    display:flex;align-items:center;justify-content:center;
    padding:20px;
    animation:fadeIn 0.3s ease;
  `;

  const fragments = typeof getBagFragments === 'function' ? getBagFragments() : 0;

  const T = window.LANG_UI;
  const L = window.currentLang || 'ko';
  const t = k => T?.[L]?.[k] || T?.ko?.[k] || '';

  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1e1010,#2c1a1a);
      border:2px solid #8b3a3a;
      border-radius:24px;
      padding:24px 20px;
      max-width:320px;width:100%;
      box-shadow:0 0 40px rgba(139,58,58,0.4);
    ">
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:32px;margin-bottom:6px;">⚔️</div>
        <div style="color:#ff8080;font-size:18px;font-weight:900;margin-bottom:4px;">
          ${t('battleTitle')}
        </div>
        <div style="color:#aaa;font-size:11px;line-height:1.6;">
          ${t('battleDesc1')}<br>
          ${t('battleDesc2')}<br>
          ${t('battleDesc3')}
        </div>
      </div>

      <div style="
        background:rgba(255,215,0,0.08);
        border:1px solid rgba(255,215,0,0.3);
        border-radius:12px;
        padding:8px 12px;
        text-align:center;
        margin-bottom:16px;
        font-size:12px;color:#d4a017;
      ">
        ${t('battleFragments')} <b>${fragments}/2</b>
        ${fragments === 1 ? ' (' + t('battleFragmentHint') + ')' : ''}
      </div>

      <div id="battle-count-info" style="
        color:#888;font-size:11px;
        text-align:center;margin-bottom:16px;
      ">${t('battleCountLoading')}</div>

      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
        ${unlockedCats.map(cat => `
          <button
            onclick="startBattleStudy('${cat}')"
            style="
              background:rgba(${cat === 'plant' ? '141,176,92' : cat === 'animal' ? '255,149,0' : '212,160,23'},0.1);
              border:1px solid ${catConfig[cat].border};
              border-radius:14px;
              padding:14px;
              color:${catConfig[cat].color};
              font-size:14px;font-weight:700;
              cursor:pointer;
              text-align:left;
            "
          >${catConfig[cat].label}</button>
        `).join('')}
      </div>

      <div style="color:#666;font-size:10px;text-align:center;margin-bottom:16px;line-height:1.6;">
        ${t('battleLimitDesc')}<br>
        ${t('battleDrawDesc')}
      </div>

      <button onclick="closeBattleOverlay()" style="
        width:100%;
        background:rgba(255,255,255,0.05);
        color:#aaa;border:1px solid #444;
        border-radius:12px;padding:10px;
        font-size:13px;cursor:pointer;
      ">${t('battleClose')}</button>
    </div>
  `;

  document.body.appendChild(overlay);

  // [한글 주석] 오늘 배틀 횟수 조회
  _fetchBattleCount();
}

// [한글 주석] 오늘 배틀 횟수 조회
async function _fetchBattleCount() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  try {
    const res = await fetch(
      `${BATTLE_SCRIPT_URL}?type=getBattleCount&class=${userData.class}&number=${userData.number}`
    );
    const data = await res.json();
    const count = data.count || 0;
    const infoEl = document.getElementById('battle-count-info');
    if (infoEl) {
      const T2 = window.LANG_UI;
    const L2 = window.currentLang || 'ko';
    const t2 = k => T2[k]?.[L2] || T2[k]?.ko || '';
    if (count >= 3) {
        infoEl.textContent = t2('battleCountMax');
        infoEl.style.color = '#ff4444';
        document.querySelectorAll('#battle-overlay button[onclick^="startBattleStudy"]')
          .forEach(b => {
            b.disabled = true;
            b.style.opacity = '0.4';
            b.style.cursor = 'not-allowed';
          });
      } else {
        infoEl.textContent = t2('battleCountToday').replace('{n}', count);
        infoEl.style.color = '#8db05c';
      }
    }
  } catch (e) {
    const infoEl = document.getElementById('battle-count-info');
    const T3 = window.LANG_UI; const L3 = window.currentLang || 'ko';
    if (infoEl) infoEl.textContent = T3?.[L3]?.battleCountFail || '횟수 확인 실패';
  }
}

// [한글 주석] 배틀 오버레이 닫기
function closeBattleOverlay() {
  // [한글 주석] 배틀 모드 닫을 때 메인 BGM 복귀 (단, 공부 화면으로 진입할 때의 호출인 경우는 제외)
  if (battleState.phase !== 'studying') {
    if (typeof stopBGM === 'function') stopBGM();
    setTimeout(() => { if (typeof playMainBGM === 'function') playMainBGM(); }, 300);
  }

  const overlay = document.getElementById('battle-overlay');
  if (overlay) overlay.remove();
}

// ==========================================
// [한글 주석] 공부 화면 (1분 카드 학습)
// ==========================================
function startBattleStudy(category) {
  // [한글 주석] 공부 시간에는 음악 없음
  if (typeof stopBGM === 'function') stopBGM();

  battleState.phase = 'studying';
  closeBattleOverlay();

  const allCards = window.allCardsData || [];
  // [한글 주석] 해당 카테고리 전체 100종 사용 (수집 여부 무관)
  const cards = allCards.filter(c => c.category === category);
  if (cards.length === 0) {
    const T5 = window.LANG_UI; const L5 = window.currentLang || 'ko';
    alert(T5?.[L5]?.battleDataLoading || '카드 데이터를 불러오는 중이에요. 잠시 후 다시 시도해줘요!');
    return;
  }

  // [한글 주석] 카드 랜덤 셔플
  const shuffled = [...cards].sort(() => Math.random() - 0.5);

  battleState.phase = 'studying';
  battleState.category = category;
  battleState.studyStartTime = Date.now();
  battleState.studyCards = shuffled;
  battleState.currentCardIdx = 0;
  battleState.showingBack = false;

  _renderStudyScreen();
}

// [한글 주석] 공부 화면 렌더링
function _renderStudyScreen() {
  const existing = document.getElementById('battle-study-overlay');
  if (existing) existing.remove();

  const catLabel = {
    plant: '🌱 식물', animal: '🦊 동물', artifact: '🏺 유물'
  }[battleState.category] || '';

  const overlay = document.createElement('div');
  overlay.id = 'battle-study-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:#0f1c10;
    z-index:99999;
    display:flex;flex-direction:column;
    align-items:center;
    padding:16px;
    overflow-y:auto;
  `;

  const Ts = window.LANG_UI;
  const Ls = window.currentLang || 'ko';
  const ts = k => Ts[k]?.[Ls] || Ts[k]?.ko || '';

  overlay.innerHTML = `
    <div style="
      width:100%;max-width:360px;
      display:flex;justify-content:space-between;
      align-items:center;margin-bottom:12px;
    ">
      <div style="color:#8db05c;font-size:13px;font-weight:700;">
        ⚔️ ${catLabel} ${ts('battleReadyLabel')}
      </div>
      <button onclick="cancelBattle()" style="
        background:rgba(255,68,68,0.15);
        border:1px solid #ff4444;border-radius:8px;
        color:#ff4444;font-size:11px;padding:4px 10px;
        cursor:pointer;
      ">${ts('battleGiveUp')}</button>
    </div>

    <div style="
      width:100%;max-width:360px;
      background:rgba(0,0,0,0.3);
      border:1px solid #6b8e3d;
      border-radius:14px;
      padding:10px 16px;
      margin-bottom:12px;
      text-align:center;
    ">
      <div style="color:#aaa;font-size:11px;margin-bottom:4px;">
        ${ts('battleStudyTimer')}
      </div>
      <div id="battle-timer" style="
        color:#ffd700;font-size:24px;font-weight:900;
      ">1:00</div>
      <div id="battle-timer-msg" style="
        color:#8db05c;font-size:11px;margin-top:4px;
      ">${ts('battleStudyMsg')}</div>
    </div>

    <div id="battle-card-area" style="
      width:100%;max-width:360px;flex:1;
    "></div>

    <div style="
      display:flex;gap:10px;
      width:100%;max-width:360px;
      margin-top:12px;
    ">
      <button onclick="battlePrevCard()" style="
        flex:1;padding:10px;
        background:rgba(255,255,255,0.05);
        border:1px solid #444;border-radius:12px;
        color:#aaa;font-size:13px;cursor:pointer;
      ">${ts('battlePrev')}</button>
      <button onclick="battleFlipCard()" style="
        flex:1;padding:10px;
        background:rgba(141,176,92,0.1);
        border:1px solid #6b8e3d;border-radius:12px;
        color:#8db05c;font-size:13px;cursor:pointer;
      ">${ts('battleFlip')}</button>
      <button onclick="battleNextCard()" style="
        flex:1;padding:10px;
        background:rgba(255,255,255,0.05);
        border:1px solid #444;border-radius:12px;
        color:#aaa;font-size:13px;cursor:pointer;
      ">${ts('battleNext')}</button>
    </div>
  `;

  document.body.appendChild(overlay);
  _renderBattleCard();
  _startBattleTimer();
}

// [한글 주석] 배틀 카드 렌더링 (앞면/뒷면)
function _renderBattleCard() {
  const area = document.getElementById('battle-card-area');
  if (!area) return;

  const card = battleState.studyCards[battleState.currentCardIdx];
  if (!card) return;

  const showBack = battleState.showingBack;
  const rarityConfig = {
    common: { color: '#8db05c', label: '★ 일반' },
    rare: { color: '#4a9eff', label: '★★ 희귀' },
    epic: { color: '#ffd700', label: '★★★ 전설' }
  };
  const cfg = rarityConfig[card.rarity] || rarityConfig.common;

  const imgHTML = typeof getCardImageHTML === 'function'
    ? getCardImageHTML(card, 100)
    : `<div style="font-size:48px;">${card.emoji}</div>`;

  if (!showBack) {
    // [한글 주석] 앞면
    area.innerHTML = `
      <div style="
        background:linear-gradient(135deg,#1a2e1a,#0f1c0f);
        border:2px solid ${cfg.color};
        border-radius:20px;padding:20px;
        text-align:center;
        box-shadow:0 0 20px ${cfg.color}44;
      ">
        <div style="color:${cfg.color};font-size:11px;font-weight:700;margin-bottom:8px;">
          ${cfg.label}
        </div>
        <div style="
          width:120px;height:120px;
          margin:0 auto 12px;
          border-radius:14px;overflow:hidden;
          display:flex;align-items:center;justify-content:center;
          background:rgba(0,0,0,0.2);
        ">${imgHTML}</div>
        <div style="color:#fff;font-size:18px;font-weight:900;margin-bottom:6px;">
          ${card.name}
        </div>
        <div style="color:#d4c89c;font-size:12px;line-height:1.6;">
          ${card.short_desc || ''}
        </div>
        <div style="color:#666;font-size:10px;margin-top:8px;">
          📍 ${card.habitat || ''}
        </div>
        <div style="color:#8db05c;font-size:11px;margin-top:12px;">
          ${typeof window.LANG_UI !== 'undefined' ? (window.LANG_UI?.[window.currentLang || 'ko']?.battleFlipHintFront || '🔄 뒤집기로 자세한 정보 확인!') : '🔄 뒤집기로 자세한 정보 확인!'}
        </div>
      </div>
      <div style="color:#888;font-size:11px;text-align:center;margin-top:8px;">
        ${battleState.currentCardIdx + 1} / ${battleState.studyCards.length}
      </div>
    `;
  } else {
    // [한글 주석] 뒷면 (상세 정보)
    area.innerHTML = `
      <div style="
        background:linear-gradient(135deg,#1a1a2e,#0f0f1c);
        border:2px solid ${cfg.color};
        border-radius:20px;padding:20px;
        text-align:center;
        box-shadow:0 0 20px ${cfg.color}44;
      ">
        <div style="color:${cfg.color};font-size:14px;font-weight:900;margin-bottom:12px;">
          ${card.name} ${typeof window.LANG_UI !== 'undefined' ? (window.LANG_UI?.[window.currentLang || 'ko']?.battleDetailLabel || '상세정보') : '상세정보'}
        </div>
        <div style="
          color:#d4c89c;font-size:12px;
          line-height:1.8;text-align:left;
          background:rgba(0,0,0,0.2);
          border-radius:12px;padding:14px;
        ">
          ${card.detail_desc || card.short_desc || ''}
        </div>
        <div style="color:#8db05c;font-size:11px;margin-top:12px;">
          ${typeof window.LANG_UI !== 'undefined' ? (window.LANG_UI?.[window.currentLang || 'ko']?.battleFlipHintBack || '🔄 뒤집기로 앞면 확인!') : '🔄 뒤집기로 앞면 확인!'}
        </div>
      </div>
      <div style="color:#888;font-size:11px;text-align:center;margin-top:8px;">
        ${battleState.currentCardIdx + 1} / ${battleState.studyCards.length}
      </div>
    `;
  }
}

// [한글 주석] 카드 앞뒤 뒤집기
function battleFlipCard() {
  battleState.showingBack = !battleState.showingBack;
  _renderBattleCard();
}

// [한글 주석] 다음 카드
function battleNextCard() {
  battleState.showingBack = false;
  battleState.currentCardIdx =
    (battleState.currentCardIdx + 1) % battleState.studyCards.length;
  _renderBattleCard();
}

// [한글 주석] 이전 카드
function battlePrevCard() {
  battleState.showingBack = false;
  battleState.currentCardIdx =
    (battleState.currentCardIdx - 1 + battleState.studyCards.length) %
    battleState.studyCards.length;
  _renderBattleCard();
}

// [한글 주석] 배틀 타이머 (1분 공부 + 4분 대기)
function _startBattleTimer() {
  let elapsed = 0; // [한글 주석] 경과 초
  const STUDY_SEC = 60;   // [한글 주석] 1분 공부
  const MAX_WAIT_SEC = 240; // [한글 주석] 4분 대기 한도

  const timerEl = () => document.getElementById('battle-timer');
  const msgEl = () => document.getElementById('battle-timer-msg');

  // [한글 주석] 1초마다 타이머 업데이트
  battleState.pollInterval = setInterval(async () => {
    elapsed++;

    if (elapsed <= STUDY_SEC) {
      // [한글 주석] 공부 단계 (0~60초)
      const remaining = STUDY_SEC - elapsed;
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      if (timerEl()) timerEl().textContent =
        `${m}:${String(s).padStart(2, '0')}`;
      const _T = window.LANG_UI; const _L = window.currentLang || 'ko';
      if (msgEl()) msgEl().textContent = _T?.[_L]?.battleStudyMsg || '카드를 보며 공부해요!';

    } else if (elapsed === STUDY_SEC + 1) {
      // [한글 주석] 공부 완료 → 대기 등록
      battleState.phase = 'waiting';
      battleState.waitStartTime = Date.now();
      await _registerBattleWait();
      const _T2 = window.LANG_UI; const _L2 = window.currentLang || 'ko';
      if (msgEl()) msgEl().textContent = _T2?.[_L2]?.battleMatching || '🔍 매칭 중...';

    } else if (elapsed > STUDY_SEC) {
      // [한글 주석] 대기 단계 (60초 이후)
      const waitElapsed = elapsed - STUDY_SEC;
      const remaining = MAX_WAIT_SEC - waitElapsed;

      if (remaining <= 0) {
        // [한글 주석] 4분 대기 초과 → 매칭 실패
        clearInterval(battleState.pollInterval);
        battleState.pollInterval = null;
        await _cancelBattleWait();
        _startAIBattleTransition();
        return;
      }

      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      if (timerEl()) timerEl().textContent =
        `${m}:${String(s).padStart(2, '0')}`;
      const _T3 = window.LANG_UI; const _L3 = window.currentLang || 'ko';
      if (msgEl()) msgEl().textContent = _T3?.[_L3]?.battleSearching || '🔍 상대방 찾는 중...';

      // [한글 주석] 30초마다 매칭 확인
      if (waitElapsed % 30 === 0) {
        const matched = await _checkBattleMatch();
        if (matched) {
          clearInterval(battleState.pollInterval);
          battleState.pollInterval = null;
          _startBattleQuiz();
        }
      }
    }
  }, 1000);
}

// ==========================================
// [한글 주석] 서버 통신 함수들
// ==========================================

// [한글 주석] 배틀 대기 등록
async function _registerBattleWait() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const formData = new FormData();
  formData.append('payload', JSON.stringify({
    type: 'battleWait',
    class: userData.class,
    number: userData.number,
    category: battleState.category
  }));
  try {
    await fetch(BATTLE_SCRIPT_URL, { method: 'POST', body: formData });
  } catch (e) {
    console.log('[배틀] 대기 등록 실패:', e);
  }
}

// [한글 주석] 매칭 확인
async function _checkBattleMatch() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  try {
    const res = await fetch(
      `${BATTLE_SCRIPT_URL}?type=checkBattleMatch` +
      `&class=${userData.class}&number=${userData.number}` +
      `&category=${battleState.category}`
    );
    const data = await res.json();
    if (data.matched) {
      battleState.opponentNumber = data.opponentNumber;
      // [한글 주석] 매칭 고유 시간 저장
      if (data.matchTime) battleState.matchTime = data.matchTime;
      return true;
    }
  } catch (e) {
    console.log('[배틀] 매칭 확인 실패:', e);
  }
  return false;
}

// [한글 주석] 대기 취소
async function _cancelBattleWait() {
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const formData = new FormData();
  formData.append('payload', JSON.stringify({
    type: 'battleCancel',
    class: userData.class,
    number: userData.number
  }));
  try {
    await fetch(BATTLE_SCRIPT_URL, { method: 'POST', body: formData });
  } catch (e) {
    console.log('[배틀] 대기 취소 실패:', e);
  }
}

// [한글 주석] 배틀 취소 (포기 버튼)
async function cancelBattle() {
  const _Tc = window.LANG_UI; const _Lc = window.currentLang || 'ko';
  if (!confirm(_Tc?.[_Lc]?.battleGiveUpConfirm || '배틀을 포기할까요?')) return;
  if (battleState.pollInterval) {
    clearInterval(battleState.pollInterval);
    battleState.pollInterval = null;
  }
  if (battleState.phase === 'waiting') {
    await _cancelBattleWait();
  }
  battleState.phase = 'idle';
  const overlay = document.getElementById('battle-study-overlay');
  if (overlay) overlay.remove();

  // [한글 주석] 포기 후 메인 BGM 복귀
  if (typeof stopBGM === 'function') stopBGM();
  setTimeout(() => { if (typeof playMainBGM === 'function') playMainBGM(); }, 300);
}

// [한글 주석] 매칭 실패 팝업
function _showMatchFailPopup() {
  const studyOverlay = document.getElementById('battle-study-overlay');
  if (studyOverlay) studyOverlay.remove();

  const overlay = document.createElement('div');
  overlay.id = 'battle-fail-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.9);
    z-index:99999;
    display:flex;align-items:center;justify-content:center;
    padding:20px;
  `;
  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1e1010,#2c1a1a);
      border:2px solid #8b3a3a;
      border-radius:24px;
      padding:32px 24px;
      max-width:300px;width:100%;
      text-align:center;
    ">
      <div style="font-size:48px;margin-bottom:12px;">😔</div>
      <div style="color:#ff8080;font-size:18px;font-weight:900;margin-bottom:8px;" id="battle-fail-title"></div>
      <div style="color:#d4c89c;font-size:13px;line-height:1.7;margin-bottom:20px;" id="battle-fail-desc"></div>
      <button onclick="document.getElementById('battle-fail-overlay').remove()" style="
        width:100%;
        background:linear-gradient(135deg,#8b3a3a,#6b2a2a);
        color:#fff;border:none;border-radius:14px;
        padding:13px;font-size:15px;font-weight:900;cursor:pointer;
      " id="battle-fail-btn"></button>
    </div>
  `;
  document.body.appendChild(overlay);
  const _Tf = window.LANG_UI; const _Lf = window.currentLang || 'ko';
  const _tf = k => _Tf?.[_Lf]?.[k] || _Tf?.ko?.[k] || '';
  const ft = document.getElementById('battle-fail-title');
  const fd = document.getElementById('battle-fail-desc');
  const fb = document.getElementById('battle-fail-btn');
  if (ft) ft.textContent = _tf('battleMatchFail');
  if (fd) fd.innerHTML = _tf('battleMatchFailDesc') + '<br>' + _tf('battleMatchFailHint');
  if (fb) fb.textContent = _tf('battleRetry');
  battleState.phase = 'idle';
}

// ==========================================
// [한글 주석] 배틀 퀴즈 (5문제)
// ==========================================
function _startBattleQuiz() {
  battleState.phase = 'quiz';
  const studyOverlay = document.getElementById('battle-study-overlay');
  if (studyOverlay) studyOverlay.remove();

  // [한글 주석] 해당 카테고리 전체에서 5문제 생성
  const allCards = window.allCardsData || [];
  const catCards = allCards.filter(c =>
    c.category === battleState.category && c.short_desc
  );
  const shuffled = [...catCards].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);

  // [한글 주석] 레벨업 퀴즈와 같은 형식 (카드 이름+이미지 보여주고 설명 4지선다)
  battleState.questions = selected.map(card => {
    const choices = _generateBattleChoices(card, catCards);
    return { card, choices };
  });

  battleState.currentQ = 0;
  battleState.myScore = 0;

  // [한글 주석] 매칭 알림 팝업 후 퀴즈 시작
  _showMatchedPopup();
}

// [한글 주석] 매칭 성공 팝업
function _showMatchedPopup() {
  // [한글 주석] 매칭 성공 효과음 + 배틀 BGM 재시작
  if (typeof playSfxMatched === 'function') playSfxMatched();
  setTimeout(() => { if (typeof playBattleBGM === 'function') playBattleBGM(); }, 800);

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const overlay = document.createElement('div');
  overlay.id = 'battle-matched-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.92);
    z-index:99999;
    display:flex;align-items:center;justify-content:center;
    padding:20px;
    animation:fadeIn 0.3s ease;
  `;
  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1e1010,#2c1a1a);
      border:3px solid #ff8080;
      border-radius:24px;
      padding:32px 24px;
      max-width:300px;width:100%;
      text-align:center;
      box-shadow:0 0 40px rgba(255,128,128,0.4);
    ">
      <div style="font-size:48px;margin-bottom:10px;">⚔️</div>
      <div style="color:#ff8080;font-size:20px;font-weight:900;margin-bottom:8px;" id="bm-title"></div>
      <div style="color:#d4c89c;font-size:14px;margin-bottom:8px;" id="bm-desc"></div>
      <div style="color:#aaa;font-size:12px;margin-bottom:20px;" id="bm-hint"></div>
      <button onclick="
        document.getElementById('battle-matched-overlay').remove();
        _renderBattleQuiz();
      " style="
        width:100%;
        background:linear-gradient(135deg,#ff4444,#cc0000);
        color:#fff;border:none;border-radius:14px;
        padding:13px;font-size:15px;font-weight:900;cursor:pointer;
      " id="bm-btn"></button>
    </div>
  `;
  document.body.appendChild(overlay);
  const _Tm = window.LANG_UI; const _Lm = window.currentLang || 'ko';
  const _tm = k => _Tm?.[_Lm]?.[k] || _Tm?.ko?.[k] || '';
  const bmT = document.getElementById('bm-title');
  const bmD = document.getElementById('bm-desc');
  const bmH = document.getElementById('bm-hint');
  const bmB = document.getElementById('bm-btn');
  if (bmT) bmT.textContent = _tm('battleMatchSuccess');
  if (bmD) bmD.textContent = `${userData.class}반 ` + _tm('battleMatchDesc').replace('{n}', battleState.opponentNumber);
  if (bmH) bmH.innerHTML = _tm('battleMatchHint') + '<br>' + _tm('battleMatchReward');
  if (bmB) bmB.textContent = _tm('battleStart');
}

// [한글 주석] 배틀 퀴즈 4지선다 생성
function _generateBattleChoices(correctCard, allCatCards) {
  const others = allCatCards.filter(c => c.id !== correctCard.id && c.short_desc);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  const wrongs = shuffled.slice(0, 3);
  return [correctCard, ...wrongs].sort(() => Math.random() - 0.5);
}

// [한글 주석] 퀴즈 2분 제한 타이머
function _startQuizTimer() {
  // [한글 주석] 기존 타이머 있으면 제거
  if (battleState.quizTimer) {
    clearInterval(battleState.quizTimer);
    battleState.quizTimer = null;
  }

  // [한글 주석] 3분 = 180초 (5문제 전체 제한시간)
  let remaining = 180;
  battleState.quizTimer = setInterval(() => {
    remaining--;

    // [한글 주석] 타이머 표시 업데이트
    const timerEl = document.getElementById('battle-quiz-timer');
    if (timerEl) {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      timerEl.textContent = `⏱ ${m}:${String(s).padStart(2, '0')}`;
      // [한글 주석] 30초 이하면 빨간색으로
      timerEl.style.color = remaining <= 30 ? '#ff4444' : '#aaa';
    }

    if (remaining <= 0) {
      // [한글 주석] 시간 초과 → 패배 처리
      clearInterval(battleState.quizTimer);
      battleState.quizTimer = null;
      const overlay = document.getElementById('battle-quiz-overlay');
      if (overlay) overlay.remove();
      // [한글 주석] 시간 초과 토스트
      const toast = document.createElement('div');
      toast.className = 'item-unlock-toast';
      toast.style.background = 'linear-gradient(135deg,#ff4444,#cc0000)';
      const _Tto = window.LANG_UI; const _Lto = window.currentLang || 'ko';
      toast.textContent = _Tto?.[_Lto]?.battleTimeout || '⏱ 시간 초과! 패배했어요.';
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('show'), 10);
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
      }, 2500);
      // [한글 주석] 패배로 결과 처리
      _finishBattleQuiz(true); // [한글 주석] true = 시간초과 패배
    }
  }, 1000);
}

// [한글 주석] 배틀 퀴즈 화면 렌더링
function _renderBattleQuiz() {
  const existing = document.getElementById('battle-quiz-overlay');
  if (existing) existing.remove();

  if (battleState.currentQ >= battleState.questions.length) {
    _finishBattleQuiz();
    return;
  }

  const qData = battleState.questions[battleState.currentQ];
  const card = qData.card;
  const choices = qData.choices;
  const total = battleState.questions.length;
  const progress = Math.round((battleState.currentQ / total) * 100);

  const rarityConfig = {
    common: { color: '#8db05c' },
    rare: { color: '#4a9eff' },
    epic: { color: '#ffd700' }
  };
  const rColor = (rarityConfig[card.rarity] || rarityConfig.common).color;

  const imgHTML = typeof getCardImageHTML === 'function'
    ? getCardImageHTML(card, 70)
    : `<div style="font-size:36px;">${card.emoji}</div>`;

  const overlay = document.createElement('div');
  overlay.id = 'battle-quiz-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.95);
    z-index:99999;
    display:flex;align-items:center;justify-content:center;
    padding:16px;
    animation:fadeIn 0.2s ease;
  `;

  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1e1010,#2c1a1a);
      border:2px solid #8b3a3a;
      border-radius:24px;
      padding:20px 18px;
      max-width:340px;width:100%;
      box-shadow:0 0 30px rgba(139,58,58,0.4);
    ">
      <!-- [한글 주석] 헤더 -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div style="color:#ff8080;font-size:12px;font-weight:700;">${typeof window.LANG_UI !== 'undefined' ? (window.LANG_UI?.[window.currentLang || 'ko']?.battleQuizLabel || '⚔️ 배틀 퀴즈') : '⚔️ 배틀 퀴즈'}</div>
        <div style="display:flex;gap:8px;align-items:center;">
          <div id="battle-quiz-timer" style="color:#aaa;font-size:11px;">⏱ 2:00</div>
          <div style="color:#aaa;font-size:12px;">${battleState.currentQ + 1} / ${total}</div>
        </div>
      </div>

      <!-- [한글 주석] 진행바 -->
      <div style="height:3px;background:rgba(0,0,0,0.3);border-radius:4px;margin-bottom:14px;overflow:hidden;">
        <div style="width:${progress}%;height:100%;background:linear-gradient(90deg,#ff4444,#ff8080);"></div>
      </div>

      <!-- [한글 주석] 카드 이미지 + 이름 -->
      <div style="
        display:flex;align-items:center;gap:12px;
        background:rgba(0,0,0,0.3);
        border:1px solid ${rColor};
        border-radius:14px;padding:12px;margin-bottom:14px;
      ">
        <div style="
          width:70px;height:70px;flex-shrink:0;
          border-radius:10px;overflow:hidden;
          display:flex;align-items:center;justify-content:center;
          background:rgba(0,0,0,0.2);
        ">${imgHTML}</div>
        <div>
          <div style="color:${rColor};font-size:10px;font-weight:700;margin-bottom:3px;">
            ${typeof window.LANG_UI !== 'undefined' ? (window.LANG_UI?.[window.currentLang || 'ko']?.battleQuizQuestion || '이 카드의 설명은?') : '이 카드의 설명은?'}
          </div>
          <div style="color:#fff;font-size:16px;font-weight:900;">${card.name}</div>
        </div>
      </div>

      <!-- [한글 주석] 4지선다 -->
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${choices.map((c, i) => `
          <button
            class="battle-quiz-choice"
            data-correct="${c.id === card.id}"
            onclick="handleBattleQuizAnswer(this)"
            style="
              background:rgba(255,255,255,0.04);
              border:1px solid rgba(255,255,255,0.12);
              border-radius:12px;padding:10px 14px;
              color:#f0e6c8;font-size:12px;
              text-align:left;cursor:pointer;
              line-height:1.4;transition:all 0.2s;
            "
          >${['①', '②', '③', '④'][i]} ${c.short_desc}</button>
        `).join('')}
      </div>

      <div style="text-align:center;margin-top:10px;color:#888;font-size:11px;">
        ${typeof window.LANG_UI !== 'undefined' ? (window.LANG_UI?.[window.currentLang || 'ko']?.battleScore || '현재 점수: {my} / {total}').replace('{my}', battleState.myScore).replace('{total}', battleState.currentQ) : '현재 점수: ' + battleState.myScore + ' / ' + battleState.currentQ}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // [한글 주석] 퀴즈 2분 제한 타이머 시작
  _startQuizTimer();
}

// [한글 주석] 배틀 퀴즈 답 선택
function handleBattleQuizAnswer(btn) {
  const overlay = document.getElementById('battle-quiz-overlay');
  if (!overlay || overlay.dataset.answered) return;
  overlay.dataset.answered = 'true';

  const isCorrect = btn.dataset.correct === 'true';
  if (isCorrect) {
    battleState.myScore++;
    // [한글 주석] 배틀 퀴즈 정답 효과음
    if (typeof playSfxCorrect === 'function') playSfxCorrect();
  } else {
    // [한글 주석] 배틀 퀴즈 오답 효과음
    if (typeof playSfxWrong === 'function') playSfxWrong();
  }

  const allBtns = overlay.querySelectorAll('.battle-quiz-choice');
  allBtns.forEach(b => {
    b.disabled = true;
    if (b.dataset.correct === 'true') {
      b.style.background = 'rgba(132,255,0,0.2)';
      b.style.border = '2px solid #84ff00';
      b.style.color = '#84ff00';
    } else if (b === btn && !isCorrect) {
      b.style.background = 'rgba(255,68,68,0.2)';
      b.style.border = '2px solid #ff4444';
      b.style.color = '#ff4444';
    }
  });

  setTimeout(() => {
    battleState.currentQ++;
    const existing = document.getElementById('battle-quiz-overlay');
    if (existing) existing.remove();

    if (battleState.currentQ >= battleState.questions.length) {
      // [한글 주석] 퀴즈 타이머 정지
      if (battleState.quizTimer) {
        clearInterval(battleState.quizTimer);
        battleState.quizTimer = null;
      }
      _finishBattleQuiz();
    } else {
      _renderBattleQuiz();
    }
  }, 900);
}

// [한글 주석] 퀴즈 완료 → 결과 처리
async function _finishBattleQuiz(isTimeout = false) {
  // [한글 주석] 퀴즈 타이머 정지
  if (battleState.quizTimer) {
    clearInterval(battleState.quizTimer);
    battleState.quizTimer = null;
  }

  battleState.phase = 'result';
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // [한글 주석] 내 결과를 서버에 저장
  const formData = new FormData();
  formData.append('payload', JSON.stringify({
    type: 'battleResult',
    class: userData.class,
    number: userData.number,
    opponentNumber: battleState.opponentNumber,
    myScore: battleState.myScore,
    opponentScore: '',
    // [한글 주석] 퀴즈 완료 표시 (done/timeout으로 저장해야 상대가 완료된 결과만 조회)
    result: isTimeout ? 'timeout' : 'done',
    // [한글 주석] 매칭 고유 시간 (결과 조회 식별용)
    matchTime: battleState.matchTime || 0
  }));

  try {
    await fetch(BATTLE_SCRIPT_URL, { method: 'POST', body: formData });
  } catch (e) {
    console.log('[배틀] 결과 저장 실패:', e);
  }

  // [한글 주석] 상대방 결과 대기 팝업
  _showWaitingResultPopup();

  // [한글 주석] 최대 60초, 3초마다 상대 결과 확인
  let attempts = 0;
  const maxAttempts = 20;

  const checkInterval = setInterval(async () => {
    attempts++;
    try {
      const res = await fetch(
        `${BATTLE_SCRIPT_URL}?type=checkBattleResult` +
        `&class=${userData.class}` +
        `&number=${userData.number}` +
        `&opponentNumber=${battleState.opponentNumber}` +
        // [한글 주석] 매칭 고유 시간 전달
        `&matchTime=${battleState.matchTime || 0}`
      );
      const data = await res.json();

      if (data.found) {
        clearInterval(checkInterval);
        const opponentScore = Number(data.opponentScore);
        const existing = document.getElementById('battle-wait-result-overlay');
        if (existing) existing.remove();

        // [한글 주석] 승패 판정
        let result;
        if (isTimeout) {
          result = 'lose'; // [한글 주석] 시간초과는 무조건 패배
        } else if (battleState.myScore > opponentScore) {
          result = 'win';
        } else if (battleState.myScore < opponentScore) {
          result = 'lose';
        } else {
          result = 'draw';
        }

        _showBattleResult(battleState.myScore, opponentScore, result);
        return;
      }
    } catch (e) {
      console.log('[배틀] 상대 결과 확인 실패:', e);
    }

    if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
      const existing = document.getElementById('battle-wait-result-overlay');
      if (existing) existing.remove();
      // [한글 주석] 60초 넘어도 상대 결과 없으면 내 점수로만 표시
      _showBattleResult(battleState.myScore, -1, isTimeout ? 'lose' : 'unknown');
    }
  }, 3000);
}

// [한글 주석] 상대 결과 대기 팝업
function _showWaitingResultPopup() {
  const overlay = document.createElement('div');
  overlay.id = 'battle-wait-result-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.92);
    z-index:99999;
    display:flex;align-items:center;justify-content:center;
    padding:20px;
  `;
  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1e1010,#2c1a1a);
      border:2px solid #8b3a3a;
      border-radius:24px;
      padding:32px 24px;
      max-width:300px;width:100%;
      text-align:center;
    ">
      <div style="font-size:36px;margin-bottom:12px;animation:bagShake 0.5s infinite;">⏳</div>
      <div style="color:#ff8080;font-size:16px;font-weight:900;margin-bottom:8px;" id="bwr-title"></div>
      <div style="color:#aaa;font-size:12px;" id="bwr-hint"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  const _Tw = window.LANG_UI; const _Lw = window.currentLang || 'ko';
  const bwrT = document.getElementById('bwr-title');
  const bwrH = document.getElementById('bwr-hint');
  if (bwrT) bwrT.textContent = _Tw?.[_Lw]?.battleWaitResult || '상대방 결과 기다리는 중...';
  if (bwrH) bwrH.textContent = _Tw?.[_Lw]?.battleWaitHint || '잠시만 기다려요!';
}

// [한글 주석] 배틀 최종 결과 팝업
function _showBattleResult(myScore, opponentScore, result) {
  // [한글 주석] 배틀 종료 후 메인 BGM 복귀
  if (typeof stopBGM === 'function') stopBGM();
  setTimeout(() => { if (typeof playMainBGM === 'function') playMainBGM(); }, 1000);

  let resultLabel, resultColor, rewardMsg;

  const _Tr = window.LANG_UI; const _Lr = window.currentLang || 'ko';
  const _tr = k => _Tr?.[_Lr]?.[k] || _Tr?.ko?.[k] || '';
  if (result === 'win') {
    resultLabel = _tr('battleWin');
    resultColor = '#ffd700';
    rewardMsg = _tr('battleRewardWin');
    _grantBattleReward('win');
    if (typeof playSfxBattleWin === 'function') playSfxBattleWin();
  } else if (result === 'lose') {
    resultLabel = _tr('battleLose');
    resultColor = '#ff4444';
    rewardMsg = _tr('battleRewardLose');
  } else if (result === 'draw') {
    resultLabel = _tr('battleDraw');
    resultColor = '#4a9eff';
    rewardMsg = _tr('battleRewardDraw');
    _grantBattleReward('draw');
  } else {
    resultLabel = _tr('battleUnknown');
    resultColor = '#aaa';
    rewardMsg = _tr('battleRewardUnknown');
  }

  const overlay = document.createElement('div');
  overlay.id = 'battle-result-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.92);
    z-index:99999;
    display:flex;align-items:center;justify-content:center;
    padding:20px;
    animation:fadeIn 0.3s ease;
  `;

  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1e1010,#2c1a1a);
      border:3px solid ${resultColor};
      border-radius:24px;
      padding:32px 24px;
      max-width:300px;width:100%;
      text-align:center;
      box-shadow:0 0 40px ${resultColor}44;
    ">
      <div style="color:${resultColor};font-size:28px;font-weight:900;margin-bottom:12px;">
        ${resultLabel}
      </div>
      <div style="display:flex;gap:12px;justify-content:center;margin-bottom:16px;">
        <div style="
          flex:1;background:rgba(0,0,0,0.3);
          border:1px solid ${resultColor};border-radius:14px;
          padding:14px 8px;text-align:center;
        ">
          <div style="color:#aaa;font-size:10px;margin-bottom:4px;">${typeof window.LANG_UI !== 'undefined' ? (window.LANG_UI?.[window.currentLang || 'ko']?.battleMe||'나') : '나'}</div>
          <div style="color:#fff;font-size:28px;font-weight:900;">${myScore}</div>
          <div style="color:#aaa;font-size:10px;">/ 5</div>
        </div>
        <div style="display:flex;align-items:center;color:#666;font-size:20px;">VS</div>
        <div style="
          flex:1;background:rgba(0,0,0,0.3);
          border:1px solid #666;border-radius:14px;
          padding:14px 8px;text-align:center;
        ">
          <div style="color:#aaa;font-size:10px;margin-bottom:4px;">${typeof window.LANG_UI !== 'undefined' ? (window.LANG_UI?.[window.currentLang || 'ko']?.battleOpponent||'상대') : '상대'}</div>
          <div style="color:#fff;font-size:28px;font-weight:900;">
            ${opponentScore === -1 ? '?' : opponentScore}
          </div>
          <div style="color:#aaa;font-size:10px;">/ 5</div>
        </div>
      </div>
      <div style="color:#d4c89c;font-size:13px;margin-bottom:20px;">${rewardMsg}</div>
      <button onclick="document.getElementById('battle-result-overlay').remove()" style="
        width:100%;
        background:linear-gradient(135deg,${resultColor},${resultColor}aa);
        color:#000;border:none;border-radius:14px;
        padding:13px;font-size:15px;font-weight:900;cursor:pointer;
      ">${typeof window.LANG_UI !== 'undefined' ? (window.LANG_UI?.[window.currentLang || 'ko']?.battleConfirm||'확인!') : '확인!'}</button>
    </div>
  `;

  document.body.appendChild(overlay);
  battleState.phase = 'idle';

  if (result === 'win' && navigator.vibrate) {
    navigator.vibrate([200, 100, 200, 100, 300]);
  }
}

// [한글 주석] 배틀 보상 지급
function _grantBattleReward(result) {
  if (result === 'win') {
    // [한글 주석] 복주머니 1개 지급
    const bags = JSON.parse(localStorage.getItem('rewardBags') || '[]');
    const now = new Date();
    const timeStr = now.toLocaleDateString('ko-KR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const unlockedCats = typeof getUnlockedCategories === 'function'
      ? getUnlockedCategories() : ['plant'];
    const randomCat = unlockedCats[Math.floor(Math.random() * unlockedCats.length)];

    bags.push({
      reward: { type: 'category', category: randomCat, rarity: 'all' },
      receivedAt: timeStr,
      source: 'battle_win'
    });
    localStorage.setItem('rewardBags', JSON.stringify(bags));
    if (typeof updateRewardBadge === 'function') updateRewardBadge();

  } else if (result === 'draw') {
    // [한글 주석] 복주머니 조각 1개 지급
    if (typeof addBagFragment === 'function') addBagFragment();
    if (typeof updateFragmentBadge === 'function') updateFragmentBadge();
  }
}

// [한글 주석] 매칭 실패 → AI 배틀 자동 전환
function _startAIBattleTransition() {
  // [한글 주석] 공부 화면 제거
  const studyOverlay = document.getElementById('battle-study-overlay');
  if (studyOverlay) studyOverlay.remove();

  battleState.phase = 'idle';

  // [한글 주석] AI 배틀 전환 안내 팝업
  const overlay = document.createElement('div');
  overlay.id = 'ai-transition-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.92);
    z-index:99999;
    display:flex;align-items:center;justify-content:center;
    padding:20px;
    animation:fadeIn 0.3s ease;
  `;
  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#0d1a30,#1a2e4a);
      border:2px solid #4a9eff;
      border-radius:24px;
      padding:32px 24px;
      max-width:300px;width:100%;
      text-align:center;
      box-shadow:0 0 40px rgba(74,158,255,0.3);
    ">
      <div style="font-size:52px;margin-bottom:12px;animation:aib-pulse 1s ease-in-out infinite;">🤖</div>
      <div style="color:#4a9eff;font-size:16px;font-weight:900;margin-bottom:8px;" id="ai-tr-title"></div>
      <div style="color:#b0b8d0;font-size:13px;line-height:1.7;margin-bottom:8px;" id="ai-tr-desc"></div>
      <div style="color:#555;font-size:11px;" id="ai-tr-hint"></div>
    </div>
    <style>
      @keyframes aib-pulse {
        0%,100% { transform:scale(1); }
        50%      { transform:scale(1.1); }
      }
    </style>`;
  document.body.appendChild(overlay);

  const _Tai = window.LANG_UI; const _Lai = window.currentLang || 'ko';
  const _tai = k => _Tai?.[_Lai]?.[k] || _Tai?.ko?.[k] || '';
  const aiT = document.getElementById('ai-tr-title');
  const aiD = document.getElementById('ai-tr-desc');
  const aiH = document.getElementById('ai-tr-hint');
  if (aiT) aiT.textContent = _tai('battleAITitle');
  if (aiD) aiD.innerHTML = _tai('battleAIDesc1') + '<br>' + _tai('battleAIDesc2');
  if (aiH) aiH.textContent = _tai('battleAIDesc3');

  // [한글 주석] 2초 후 AI 배틀 시작 (ai_battle.js의 startAIBattle 호출)
  setTimeout(() => {
    const tr = document.getElementById('ai-transition-overlay');
    if (tr) tr.remove();
    if (typeof startAIBattle === 'function') {
      startAIBattle(battleState.category);
    }
  }, 2000);
}

// [한글 주석] 전역 노출
window.showBattleMode = showBattleMode;
window.closeBattleOverlay = closeBattleOverlay;
window.startBattleStudy = startBattleStudy;
window.cancelBattle = cancelBattle;
window.battleFlipCard = battleFlipCard;
window.battleNextCard = battleNextCard;
window.battlePrevCard = battlePrevCard;
window.handleBattleQuizAnswer = handleBattleQuizAnswer;
window._renderBattleQuiz = _renderBattleQuiz;
window._startAIBattleTransition = _startAIBattleTransition;
