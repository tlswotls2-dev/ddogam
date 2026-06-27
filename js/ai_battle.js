// js/ai_battle.js
// [한글 주석] AI 배틀 NPC 시스템
// [한글 주석] 매칭 실패 시 자동 전환, 일일 배틀 횟수 미차감

// [한글 주석] 플레이어 레벨별 AI 정답률 (낮을수록 학생이 이기기 쉬움)
function _getAICorrectRate(playerLevel) {
  if (playerLevel <= 5)  return 0.40;
  if (playerLevel <= 15) return 0.52;
  if (playerLevel <= 25) return 0.62;
  return 0.68;
}

// [한글 주석] AI 배틀 진입점 — allCardsData 기반으로 실제 배틀과 동일한 형식 사용
function startAIBattle(category) {
  const allCards = window.allCardsData || [];
  const catCards = allCards.filter(c => c.category === category && c.short_desc);

  if (catCards.length < 4) {
    // [한글 주석] 카드 데이터 미로드 시 잠시 후 재시도 안내
    const toast = document.createElement('div');
    toast.className = 'item-unlock-toast';
    toast.textContent = '카드 데이터를 불러오는 중이에요! 잠시 후 다시 시도해주세요.';
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 2500);
    return;
  }

  const playerLevel = typeof getCurrentLevel === 'function' ? getCurrentLevel() : 1;
  const aiRate = _getAICorrectRate(playerLevel);

  // [한글 주석] 카드 5장 랜덤 선택 (실제 배틀과 동일한 방식)
  const shuffled = [...catCards].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);

  // [한글 주석] 각 카드에 대해 정답 + 오답 3개 short_desc 보기 구성
  const questions = selected.map(card => {
    const others = catCards.filter(c => c.id !== card.id && c.short_desc);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
    const wrongs = shuffledOthers.slice(0, 3);
    const choices = [card, ...wrongs].sort(() => Math.random() - 0.5);
    return { card, choices };
  });

  _showAIBattleIntro(questions, aiRate, playerLevel);
}

// [한글 주석] AI 배틀 인트로 화면 (VS 화면)
function _showAIBattleIntro(questions, aiRate, playerLevel) {
  const existing = document.getElementById('ai-battle-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'ai-battle-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:#090d19;
    z-index:99998;
    display:flex;flex-direction:column;
    align-items:center;
    padding:20px;
    overflow-y:auto;`;

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const playerName = userData.name || '나';

  overlay.innerHTML = `
    <div style="max-width:340px;width:100%;padding-top:24px;display:flex;flex-direction:column;align-items:center;">

      <div style="color:#ffd700;font-size:13px;font-weight:700;letter-spacing:2px;margin-bottom:22px;">
        ⚔️ AI 배틀
      </div>

      <div style="display:flex;align-items:center;gap:18px;margin-bottom:24px;width:100%;">
        <div style="flex:1;text-align:center;">
          <div style="width:60px;height:60px;background:#1a2e1a;border:2px solid #84ff00;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 6px;">
            🧑
          </div>
          <div style="color:#fff;font-size:13px;">${playerName}</div>
          <div style="color:#84ff00;font-size:11px;">Lv.${playerLevel}</div>
        </div>

        <div style="color:#ffd700;font-size:20px;font-weight:700;flex-shrink:0;">VS</div>

        <div style="flex:1;text-align:center;">
          <div style="width:60px;height:60px;background:#0d1a30;border:2px solid #4a9eff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 6px;animation:aib-pulse 1.5s ease-in-out infinite;">
            🤖
          </div>
          <div style="color:#4a9eff;font-size:13px;">AI 또감이</div>
          <div style="background:rgba(74,158,255,0.15);border:1px solid #4a9eff;border-radius:5px;padding:1px 8px;color:#4a9eff;font-size:9px;display:inline-block;margin-top:3px;">
            🤖 AI 플레이어
          </div>
        </div>
      </div>

      <div style="background:rgba(74,158,255,0.07);border:1px solid rgba(74,158,255,0.25);border-radius:14px;padding:14px;text-align:center;margin-bottom:22px;width:100%;">
        <div style="color:#4a9eff;font-size:12px;font-weight:700;margin-bottom:5px;">🤖 AI와의 특별 배틀!</div>
        <div style="color:#b0b8d0;font-size:11px;line-height:1.8;">
          5문제 중 더 많이 맞히면 이겨요<br>
          AI 배틀은 일일 횟수에 포함되지 않아요
        </div>
      </div>

      <button id="aib-start-btn"
        style="width:100%;background:linear-gradient(135deg,#0d1a30,#1a3060);border:2px solid #4a9eff;border-radius:14px;padding:15px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:1px;">
        ⚔️ 배틀 시작!
      </button>
    </div>
    <style>
      @keyframes aib-pulse {
        0%,100% { box-shadow: 0 0 0 0 rgba(74,158,255,0.4); }
        50%      { box-shadow: 0 0 0 8px rgba(74,158,255,0); }
      }
    </style>`;

  document.body.appendChild(overlay);

  // [한글 주석] AI 배틀 BGM 시작 (실제 배틀과 동일한 음악)
  if (typeof stopBGM === 'function') stopBGM();
  setTimeout(() => { if (typeof playBattleBGM === 'function') playBattleBGM(); }, 300);

  // [한글 주석] 배틀 상태 객체
  const state = { qi: 0, ps: 0, as: 0, questions, aiRate, answered: false };
  document.getElementById('aib-start-btn').onclick = () => _renderAIBattleQ(overlay, state);
}

// [한글 주석] AI 배틀 문제 화면 — 실제 배틀과 동일한 카드 이미지+설명 형식
function _renderAIBattleQ(overlay, state) {
  if (state.qi >= state.questions.length) {
    _renderAIBattleResult(overlay, state);
    return;
  }

  const qData = state.questions[state.qi];
  const card = qData.card;
  const choices = qData.choices;
  state.answered = false;

  // [한글 주석] AI 정답 여부 미리 결정 (확률 기반)
  const aiCorrect = Math.random() < state.aiRate;
  const aiDelay = 1200 + Math.random() * 2000;
  let aiDone = false;

  const rarityColors = { common:'#84ff00', rare:'#4a9eff', epic:'#ffd700' };
  const rColor = rarityColors[card.rarity] || '#84ff00';

  // [한글 주석] 카드 이미지 (실제 배틀과 동일)
  const imgHTML = typeof getCardImageHTML === 'function'
    ? getCardImageHTML(card, 70)
    : `<div style="font-size:36px;">${card.emoji || '🃏'}</div>`;

  overlay.innerHTML = `
    <div style="max-width:340px;width:100%;padding-top:8px;">

      <!-- [한글 주석] 상단 점수판 -->
      <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.04);border-radius:12px;padding:10px 16px;margin-bottom:14px;">
        <div style="text-align:center;">
          <div style="color:#84ff00;font-size:22px;font-weight:700;">${state.ps}</div>
          <div style="color:#555;font-size:10px;">나</div>
        </div>
        <div style="color:#555;font-size:12px;">${state.qi + 1} / ${state.questions.length}</div>
        <div style="text-align:center;">
          <div style="color:#4a9eff;font-size:22px;font-weight:700;">${state.as}</div>
          <div style="color:#555;font-size:10px;">🤖 AI</div>
        </div>
      </div>

      <!-- [한글 주석] AI 상태 표시 -->
      <div id="aib-ai-status" style="display:flex;align-items:center;gap:8px;background:rgba(74,158,255,0.07);border:1px solid rgba(74,158,255,0.2);border-radius:9px;padding:8px 12px;margin-bottom:12px;">
        <span style="font-size:16px;">🤖</span>
        <span id="aib-ai-txt" style="color:#4a9eff;font-size:11px;font-weight:700;">AI 또감이 생각 중...</span>
        <span id="aib-ai-icon" style="margin-left:auto;font-size:13px;">💭</span>
      </div>

      <!-- [한글 주석] 카드 이미지 + 이름 (실제 배틀과 동일한 형식) -->
      <div style="display:flex;align-items:center;gap:12px;background:rgba(0,0,0,0.3);border:1px solid ${rColor};border-radius:14px;padding:12px;margin-bottom:14px;">
        <div style="width:70px;height:70px;flex-shrink:0;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.2);">${imgHTML}</div>
        <div>
          <div style="color:${rColor};font-size:10px;font-weight:700;margin-bottom:3px;">이 카드의 설명은?</div>
          <div style="color:#fff;font-size:16px;font-weight:900;">${card.name}</div>
        </div>
      </div>

      <!-- [한글 주석] 4지선다 보기 (short_desc 기반) -->
      <div id="aib-opts" style="display:flex;flex-direction:column;gap:8px;">
        ${choices.map((c, i) => `
          <button class="aib-opt" data-idx="${i}" data-correct="${c.id === card.id}"
            style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:11px;padding:11px 14px;color:#f0e6c8;font-size:12px;text-align:left;cursor:pointer;transition:all 0.15s;line-height:1.5;">
            ${['①','②','③','④'][i]} ${c.short_desc}
          </button>`).join('')}
      </div>
    </div>`;

  // [한글 주석] AI 생각 중 💭 애니메이션
  const frames = ['💭', '💭💭', '💭💭💭', '💭'];
  const dotTimer = setInterval(() => {
    const el = document.getElementById('aib-ai-icon');
    if (el) el.textContent = frames[Math.floor(Date.now() / 400) % 4];
  }, 300);

  // [한글 주석] AI 응답 타이머 — 1.2~3.2초 후 정답/오답 표시
  const aiTimer = setTimeout(() => {
    clearInterval(dotTimer);
    aiDone = true;
    const txt  = document.getElementById('aib-ai-txt');
    const icon = document.getElementById('aib-ai-icon');
    if (!txt) return;
    const _tai = window.LANG_UI?.[window.currentLang||'ko'];
    if (aiCorrect) {
      state.as++;
      txt.textContent = _tai?.battleAICorrect || 'AI 또감이 정답! ✓';
      txt.style.color = '#84ff00';
      if (icon) icon.textContent = '✅';
    } else {
      txt.textContent = _tai?.battleAIWrong || 'AI 또감이 오답 ✗';
      txt.style.color = '#ff8080';
      if (icon) icon.textContent = '❌';
    }
    // [한글 주석] 시간 제한 없음 — 학생이 직접 답해야 다음 문제로 넘어감
  }, aiDelay);

  // [한글 주석] 플레이어 답 처리
  overlay.querySelectorAll('.aib-opt').forEach(btn => {
    btn.onclick = () => {
      if (state.answered) return;
      state.answered = true;
      clearTimeout(aiTimer);
      clearInterval(dotTimer);

      const isCorrect = btn.dataset.correct === 'true';

      if (isCorrect) {
        state.ps++;
        btn.style.background = 'rgba(132,255,0,0.2)';
        btn.style.border = '2px solid #84ff00';
        btn.style.color = '#84ff00';
        if (typeof playSfxCorrect === 'function') playSfxCorrect();
      } else {
        btn.style.background = 'rgba(255,68,68,0.18)';
        btn.style.border = '2px solid #ff4444';
        btn.style.color = '#ff4444';
        // [한글 주석] 정답 보기 초록색으로 표시
        const correctBtn = overlay.querySelector('[data-correct="true"]');
        if (correctBtn) {
          correctBtn.style.background = 'rgba(132,255,0,0.15)';
          correctBtn.style.border = '2px solid #84ff00';
        }
        if (typeof playSfxWrong === 'function') playSfxWrong();
      }

      overlay.querySelectorAll('.aib-opt').forEach(b => b.disabled = true);

      // [한글 주석] AI가 아직 답 안 했으면 결과 즉시 반영
      if (!aiDone) {
        if (aiCorrect) state.as++;
        const txt  = document.getElementById('aib-ai-txt');
        const icon = document.getElementById('aib-ai-icon');
        if (txt) {
          txt.textContent = aiCorrect ? 'AI 또감이 정답! ✓' : 'AI 또감이 오답 ✗';
          txt.style.color  = aiCorrect ? '#84ff00' : '#ff8080';
        }
        if (icon) icon.textContent = aiCorrect ? '✅' : '❌';
      }

      setTimeout(() => { state.qi++; _renderAIBattleQ(overlay, state); }, 1500);
    };
  });
}

// [한글 주석] AI 배틀 결과 화면
function _renderAIBattleResult(overlay, state) {
  const win  = state.ps > state.as;
  const draw = state.ps === state.as;

  // [한글 주석] AI 배틀 보상 지급 (승리: 복주머니 1개, 무승부: 복주머니 조각 1개)
  if (win) {
    const bags = JSON.parse(localStorage.getItem('rewardBags') || '[]');
    const now = new Date();
    const timeStr = now.toLocaleDateString('ko-KR', {
      year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit'
    });
    const unlockedCats = typeof getUnlockedCategories === 'function'
      ? getUnlockedCategories() : ['plant'];
    const randomCat = unlockedCats[Math.floor(Math.random() * unlockedCats.length)];
    bags.push({
      reward: { type:'category', category:randomCat, rarity:'all' },
      receivedAt: timeStr,
      source: 'ai_battle_win'
    });
    localStorage.setItem('rewardBags', JSON.stringify(bags));
    if (typeof updateRewardBadge === 'function') updateRewardBadge();
  } else if (draw) {
    if (typeof addBagFragment === 'function') addBagFragment();
    if (typeof updateFragmentBadge === 'function') updateFragmentBadge();
  }

  overlay.innerHTML = `
    <div style="max-width:340px;width:100%;padding-top:30px;text-align:center;">
      <div style="font-size:62px;margin-bottom:10px;">
        ${win ? '🏆' : draw ? '🤝' : '😅'}
      </div>
      <div style="color:${win ? '#ffd700' : draw ? '#4a9eff' : '#ff8080'};font-size:22px;font-weight:700;margin-bottom:6px;">
        ${win ? '승리!' : draw ? '무승부!' : '패배...'}
      </div>
      <div style="color:#555;font-size:12px;margin-bottom:22px;">vs 🤖 AI 또감이</div>

      <div style="display:flex;gap:10px;margin-bottom:20px;">
        <div style="flex:1;background:rgba(132,255,0,0.08);border:${win ? '2' : '1'}px solid ${win ? '#84ff00' : 'rgba(132,255,0,0.25)'};border-radius:14px;padding:16px;">
          <div style="color:#888;font-size:10px;margin-bottom:3px;">나</div>
          <div style="color:#84ff00;font-size:28px;font-weight:700;">${state.ps}</div>
          <div style="color:#555;font-size:10px;">${state.questions.length}문제 중</div>
        </div>
        <div style="display:flex;align-items:center;color:#333;font-size:18px;font-weight:700;">:</div>
        <div style="flex:1;background:rgba(74,158,255,0.08);border:${!win && !draw ? '2' : '1'}px solid ${!win && !draw ? '#4a9eff' : 'rgba(74,158,255,0.25)'};border-radius:14px;padding:16px;">
          <div style="color:#888;font-size:10px;margin-bottom:3px;">🤖 AI</div>
          <div style="color:#4a9eff;font-size:28px;font-weight:700;">${state.as}</div>
          <div style="color:#555;font-size:10px;">${state.questions.length}문제 중</div>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.04);border-radius:14px;padding:14px;margin-bottom:18px;color:#b0b8d0;font-size:12px;line-height:1.8;">
        ${win  ? '대단해요! AI 또감이를 이겼어요! 🎉<br><span style="color:#ffd700;font-size:11px;">🎁 복주머니 1개 획득!</span>'
               : draw ? 'AI 또감이와 비겼어요! 💪<br><span style="color:#4a9eff;font-size:11px;">🧩 복주머니 조각 1개 획득!</span>'
               : 'AI 또감이가 조금 더 빨랐어요.<br>카드를 더 읽고 다시 도전! 📖'}
        <br><span style="color:#444;font-size:10px;">AI 배틀은 일일 횟수 · 제한 없음</span>
      </div>

      <button onclick="document.getElementById('ai-battle-overlay').remove(); if(typeof stopBGM==='function') stopBGM(); setTimeout(()=>{ if(typeof playMainBGM==='function') playMainBGM(); },300);"
        style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:13px;color:#c0c8e0;font-size:13px;font-weight:700;cursor:pointer;">
        돌아가기
      </button>
    </div>`;

  if (win && navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

window.startAIBattle = startAIBattle;
