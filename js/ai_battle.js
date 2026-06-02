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

// [한글 주석] AI 배틀 진입점 — battle.js의 매칭 실패 시점에서 호출
function startAIBattle(category) {
  // [한글 주석] quizData는 quiz.js에서 이미 로드된 전역 변수 사용
  if (typeof quizData === 'undefined' || !quizData) {
    alert('퀴즈 데이터를 불러오는 중이에요! 잠시 후 다시 시도해주세요.');
    return;
  }
  const playerLevel = typeof getCurrentLevel === 'function' ? getCurrentLevel() : 1;
  const aiRate = _getAICorrectRate(playerLevel);

  // [한글 주석] 배틀 카테고리에 맞는 퀴즈 풀 선택 (기존 배틀 로직과 동일)
  const qCat = category === 'animal' ? 'plant'
             : category === 'artifact' ? 'animal'
             : 'plant';
  const pool = quizData[qCat] || quizData.plant || [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const questions = shuffled.slice(0, 5).map(q => {
    // [한글 주석] 보기 순서 섞기 (기존 startQuiz 로직과 동일)
    const correctText = q.options[q.answer];
    const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
    return { ...q, options: shuffledOpts, answer: shuffledOpts.indexOf(correctText) };
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

  // [한글 주석] 배틀 상태 객체
  const state = { qi: 0, ps: 0, as: 0, questions, aiRate, answered: false };
  document.getElementById('aib-start-btn').onclick = () => _renderAIBattleQ(overlay, state);
}

// [한글 주석] AI 배틀 문제 화면
function _renderAIBattleQ(overlay, state) {
  if (state.qi >= state.questions.length) {
    _renderAIBattleResult(overlay, state);
    return;
  }

  const q = state.questions[state.qi];
  state.answered = false;

  // [한글 주석] AI 정답 여부를 미리 결정 (확률 기반)
  const aiCorrect = Math.random() < state.aiRate;
  // [한글 주석] AI 생각 시간: 1.2~3.2초 랜덤
  const aiDelay = 1200 + Math.random() * 2000;
  let aiDone = false;

  overlay.innerHTML = `
    <div style="max-width:340px;width:100%;padding-top:8px;">

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

      <div id="aib-ai-status" style="display:flex;align-items:center;gap:8px;background:rgba(74,158,255,0.07);border:1px solid rgba(74,158,255,0.2);border-radius:9px;padding:8px 12px;margin-bottom:12px;">
        <span style="font-size:16px;">🤖</span>
        <span id="aib-ai-txt" style="color:#4a9eff;font-size:11px;font-weight:700;">AI 또감이 생각 중...</span>
        <span id="aib-ai-icon" style="margin-left:auto;font-size:13px;">💭</span>
      </div>

      <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;margin-bottom:12px;min-height:72px;display:flex;align-items:center;justify-content:center;">
        <div style="color:#f0e6c8;font-size:14px;line-height:1.7;text-align:center;">
          ${q.question}
        </div>
      </div>

      <div id="aib-opts" style="display:flex;flex-direction:column;gap:8px;">
        ${q.options.map((opt, i) => `
          <button class="aib-opt" data-idx="${i}"
            style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:11px;padding:11px 14px;color:#f0e6c8;font-size:12px;text-align:left;cursor:pointer;transition:all 0.15s;line-height:1.5;">
            ${['①','②','③','④'][i]} ${opt}
          </button>`).join('')}
      </div>
    </div>`;

  // [한글 주석] AI 생각 중 💭 애니메이션
  const frames = ['💭', '💭💭', '💭💭💭', '💭'];
  const dotTimer = setInterval(() => {
    const el = document.getElementById('aib-ai-icon');
    if (el) el.textContent = frames[Math.floor(Date.now() / 400) % 4];
  }, 300);

  // [한글 주석] AI 응답 타이머 — 랜덤 딜레이 후 정답/오답 표시
  const aiTimer = setTimeout(() => {
    clearInterval(dotTimer);
    aiDone = true;
    const txt  = document.getElementById('aib-ai-txt');
    const icon = document.getElementById('aib-ai-icon');
    if (!txt) return;
    if (aiCorrect) {
      state.as++;
      txt.textContent  = 'AI 또감이 정답! ✓';
      txt.style.color  = '#84ff00';
      if (icon) icon.textContent = '✅';
    } else {
      txt.textContent  = 'AI 또감이 오답 ✗';
      txt.style.color  = '#ff8080';
      if (icon) icon.textContent = '❌';
    }
    // [한글 주석] 플레이어가 아직 답 안 했으면 2초 후 다음 문제
    if (!state.answered) {
      setTimeout(() => { state.qi++; _renderAIBattleQ(overlay, state); }, 2000);
    }
  }, aiDelay);

  // [한글 주석] 플레이어 답 클릭 처리
  overlay.querySelectorAll('.aib-opt').forEach(btn => {
    btn.onclick = () => {
      if (state.answered) return;
      state.answered = true;
      clearTimeout(aiTimer);
      clearInterval(dotTimer);

      const sel = parseInt(btn.dataset.idx);
      const ok  = sel === q.answer;

      if (ok) {
        state.ps++;
        btn.style.background = 'rgba(132,255,0,0.2)';
        btn.style.border     = '2px solid #84ff00';
        btn.style.color      = '#84ff00';
        if (typeof playSfxCorrect === 'function') playSfxCorrect();
      } else {
        btn.style.background = 'rgba(255,68,68,0.18)';
        btn.style.border     = '2px solid #ff4444';
        btn.style.color      = '#ff4444';
        // [한글 주석] 정답 보기 초록색으로 표시
        const correctBtn = overlay.querySelector(`[data-idx="${q.answer}"]`);
        if (correctBtn) {
          correctBtn.style.background = 'rgba(132,255,0,0.15)';
          correctBtn.style.border     = '2px solid #84ff00';
        }
        if (typeof playSfxWrong === 'function') playSfxWrong();
      }

      overlay.querySelectorAll('.aib-opt').forEach(b => b.disabled = true);

      // [한글 주석] AI가 아직 생각 중이었으면 결과 즉시 반영
      if (!aiDone) {
        if (aiCorrect) state.as++;
        const txt  = document.getElementById('aib-ai-txt');
        const icon = document.getElementById('aib-ai-icon');
        if (txt) {
          txt.textContent = aiCorrect ? 'AI 또감이 정답! ✓' : 'AI 또감이 오답 ✗';
          txt.style.color = aiCorrect ? '#84ff00' : '#ff8080';
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
        ${win  ? '대단해요! AI 또감이를 이겼어요! 🎉'
               : draw ? 'AI 또감이와 비겼어요! 한 번 더 도전해봐요 💪'
               : 'AI 또감이가 조금 더 빨랐어요.<br>카드를 더 읽고 다시 도전! 📖'}
        <br><span style="color:#333;font-size:10px;">AI 배틀은 일일 횟수에 포함되지 않아요</span>
      </div>

      <button onclick="document.getElementById('ai-battle-overlay').remove();"
        style="width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:13px;color:#c0c8e0;font-size:13px;font-weight:700;cursor:pointer;">
        돌아가기
      </button>
    </div>`;

  if (win && navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

window.startAIBattle = startAIBattle;
