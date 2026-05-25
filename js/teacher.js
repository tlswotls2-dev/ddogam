// ==========================================
// [한글 주석] 선생님 대시보드 시스템 (teacher.js)
// ==========================================

const TEACHER_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHFQhpwzADLC6JHfMdo4aJ6lUwXW4OFwfKOsQsTQjr07QFX3JJE27xrAJHZ1Zj-KI8/exec';

// ==========================================
// [한글 주석] 평가 기준 상수
// ==========================================
const EVAL_CRITERIA = {
  steps: {
    great: 3000,   // [한글 주석] 매우잘함: 3000보 이상
    good:  2000,   // [한글 주석] 잘함: 2000보 이상
    ok:    1000,   // [한글 주석] 보통: 1000보 이상
  },
  collect: {
    great: 5,      // [한글 주석] 매우잘함: 5개 이상
    good:  3,      // [한글 주석] 잘함: 3개 이상
    ok:    1,      // [한글 주석] 보통: 1개 이상
  },
  learning: {
    great: 2,      // [한글 주석] 매우잘함: 정답 2개 이상
    good:  1,      // [한글 주석] 잘함: 정답 1개 이상
    ok:    0,      // [한글 주석] 보통: 참여만 (정답 0)
    // [한글 주석] 미참여 = 노력요함
  }
};

// [한글 주석] 평가 등급 레이블/색상
const EVAL_LEVELS = {
  great: { label: '매우잘함', color: '#4a9eff', bg: 'rgba(74,158,255,0.15)', border: '#4a9eff' },
  good:  { label: '잘함',     color: '#84ff00', bg: 'rgba(132,255,0,0.15)',  border: '#84ff00' },
  ok:    { label: '보통',     color: '#ffd700', bg: 'rgba(255,215,0,0.15)',  border: '#ffd700' },
  bad:   { label: '노력요함', color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)', border: '#ff6b6b' }
};

// ==========================================
// [한글 주석] 항목별 등급 계산
// ==========================================
function evalSteps(steps) {
  if (steps >= EVAL_CRITERIA.steps.great) return 'great';
  if (steps >= EVAL_CRITERIA.steps.good)  return 'good';
  if (steps >= EVAL_CRITERIA.steps.ok)    return 'ok';
  return 'bad';
}

function evalCollect(todayCollect) {
  if (todayCollect >= EVAL_CRITERIA.collect.great) return 'great';
  if (todayCollect >= EVAL_CRITERIA.collect.good)  return 'good';
  if (todayCollect >= EVAL_CRITERIA.collect.ok)    return 'ok';
  return 'bad';
}

function evalLearning(correct, participated) {
  if (!participated) return 'bad';
  if (correct >= EVAL_CRITERIA.learning.great) return 'great';
  if (correct >= EVAL_CRITERIA.learning.good)  return 'good';
  return 'ok';
}

// [한글 주석] 종합 평가: 3항목 점수 평균
function evalTotal(stepsGrade, collectGrade, learningGrade) {
  const gradeScore = { great: 4, good: 3, ok: 2, bad: 1 };
  const avg = (gradeScore[stepsGrade] + gradeScore[collectGrade] + gradeScore[learningGrade]) / 3;
  if (avg >= 3.5) return 'great';
  if (avg >= 2.5) return 'good';
  if (avg >= 1.5) return 'ok';
  return 'bad';
}

// [한글 주석] 등급 뱃지 HTML
function evalBadge(grade) {
  const e = EVAL_LEVELS[grade];
  return `<span style="
    background:${e.bg};
    color:${e.color};
    border:1px solid ${e.border};
    border-radius:20px;
    padding:2px 10px;
    font-size:11px;
    font-weight:900;
    white-space:nowrap;
  ">${e.label}</span>`;
}

// [한글 주석] 카테고리별 정답률 바 HTML
function categoryStatsHTML(categoryStats) {
  if (!categoryStats) return '';
  const cats = [
    { key: 'plant',    label: '🌱 식물', color: '#84ff00' },
    { key: 'animal',   label: '🦊 동물', color: '#ff9500' },
    { key: 'artifact', label: '🏺 유물', color: '#d4a017' },
  ];
  return cats.map(cat => {
    const stat = categoryStats[cat.key] || { correct: 0, total: 0 };
    if (stat.total === 0) return '';
    const pct = Math.round((stat.correct / stat.total) * 100);
    return `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <span style="font-size:11px;width:42px;flex-shrink:0;">${cat.label}</span>
        <div style="flex:1;height:6px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
          <div style="width:${pct}%;height:100%;background:${cat.color};border-radius:4px;"></div>
        </div>
        <span style="font-size:10px;color:#aaa;width:36px;text-align:right;">
          ${stat.correct}/${stat.total}
        </span>
      </div>
    `;
  }).join('');
}

// ==========================================
// [한글 주석] 대시보드 초기화
// ==========================================
function initDashboard() {
  const teacherClass = localStorage.getItem('teacherClass');
  const titleEl = document.getElementById('dashboard-title');
  if (titleEl) titleEl.textContent = `📊 또감 대시보드 - ${teacherClass}반`;
  loadStudentData(teacherClass);
}

async function loadStudentData(classNum) {
  const gridEl = document.getElementById('dashboard-student-grid');
  if (gridEl) gridEl.innerHTML = '<div class="dashboard-loading">📡 학생 데이터를 불러오는 중...</div>';
  try {
    const res = await fetch(`${TEACHER_SCRIPT_URL}?type=getStudents&class=${classNum}`);
    const data = await res.json();
    renderDashboard(data.students || []);
  } catch (err) {
    console.log('학생 데이터 로드 실패:', err);
    renderDashboard([]);
  }
}

// ==========================================
// [한글 주석] 대시보드 렌더링
// ==========================================
function renderDashboard(students) {
  const teacherClass = localStorage.getItem('teacherClass');

  // [한글 주석] 통계 계산
  const totalStudents = students.length;
  const totalCollected = students.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const avgCollected = totalStudents > 0 ? Math.round(totalCollected / totalStudents) : 0;
  const today = new Date().toLocaleDateString('ko-KR');
  const todayActiveCount = students.filter(s => {
    if (!s.lastSync || s.lastSync === '-') return false;
    return s.lastSync.includes(today.split('.')[0]) &&
           s.lastSync.includes(today.split('.')[1]?.trim()) &&
           s.lastSync.includes(today.split('.')[2]?.trim());
  }).length;

  // [한글 주석] 오늘 매우잘함 학생 수
  const greatCount = students.filter(s => {
    const sg = evalSteps(Number(s.steps) || 0);
    const cg = evalCollect(Number(s.todayCollect) || 0);
    const lg = evalLearning(s.todayCorrect || 0, s.todayParticipated || false);
    return evalTotal(sg, cg, lg) === 'great';
  }).length;

  let topStudent = { name: '-', total: 0 };
  students.forEach(s => {
    if ((Number(s.total) || 0) > topStudent.total) {
      topStudent = { name: s.name || `${s.number}번`, total: Number(s.total) };
    }
  });

  document.getElementById('stat-student-count').textContent = `${totalStudents}명`;
  document.getElementById('stat-avg-collect').textContent = `${avgCollected}개`;
  document.getElementById('stat-top-student').textContent = `${topStudent.name} (${topStudent.total}개)`;
  // [한글 주석] 오늘 접속자 수
  document.getElementById('stat-today-active').textContent = `${todayActiveCount}명`;
  // [한글 주석] 오늘 매우잘함 학생 수
  document.getElementById('stat-today-great').textContent = `${greatCount}명`;

  // ==========================================
  // [한글 주석] 학생 카드 렌더링
  // ==========================================
  const gridEl = document.getElementById('dashboard-student-grid');
  if (!gridEl) return;

  if (students.length === 0) {
    gridEl.innerHTML = `
      <div class="dashboard-empty">
        <div style="font-size:48px;margin-bottom:16px;">📭</div>
        <p>아직 동기화된 학생 데이터가 없습니다.</p>
        <p style="font-size:0.85rem;color:#a0c4ff;">학생들이 WiFi에 연결하면 자동으로 데이터가 전송됩니다.</p>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = '';

  students.forEach(student => {
    const plantCount    = Number(student.plant) || 0;
    const animalCount   = Number(student.animal) || 0;
    const artifactCount = Number(student.artifact) || 0;
    const total         = Number(student.total) || 0;
    const steps         = Number(student.steps) || 0;
    const lastSync      = student.lastSync || '미동기화';

    // [한글 주석] 오늘 수집 수 (총 수집에서 어제까지 수집 추정 불가 → steps 동기화 기준 사용)
    // [한글 주석] todayCollect가 없으면 0으로 처리
    const todayCollect  = Number(student.todayCollect) || 0;
    const todayCorrect  = Number(student.todayCorrect) || 0;
    const participated  = student.todayParticipated || false;
    const battleToday   = student.todayBattle || false;
    const battleWon     = student.todayBattleWon || false;

    // [한글 주석] 항목별 평가
    const stepsGrade    = evalSteps(steps);
    const collectGrade  = evalCollect(todayCollect);
    const learningGrade = evalLearning(todayCorrect, participated);
    const totalGrade    = evalTotal(stepsGrade, collectGrade, learningGrade);
    const totalEval     = EVAL_LEVELS[totalGrade];

    const level = Math.min(30, Math.floor(total / 10) + 1);

    const card = document.createElement('div');
    card.className = 'dashboard-student-card';
    // [한글 주석] 종합 평가 등급에 따라 카드 왼쪽 테두리 색상 변경
    card.style.borderLeft = `4px solid ${totalEval.border}`;

    card.innerHTML = `
      <!-- [한글 주석] 카드 상단: 번호 + 레벨 + 종합평가 -->
      <div class="dsc-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="dsc-number" style="font-size:15px;font-weight:900;color:#fff;">
            ${student.number}번
          </span>
          ${student.name ? `<span style="font-size:12px;color:#aaa;">${student.name}</span>` : ''}
          <span style="
            background:linear-gradient(135deg,#ffd700,#ff9500);
            color:#000;font-size:10px;font-weight:900;
            border-radius:20px;padding:1px 7px;
          ">Lv.${level}</span>
        </div>
        <!-- [한글 주석] 종합 평가 뱃지 -->
        ${evalBadge(totalGrade)}
      </div>

      <!-- [한글 주석] 오늘 활동 평가 3항목 -->
      <div style="
        display:grid;grid-template-columns:1fr 1fr 1fr;
        gap:4px;margin-bottom:10px;
      ">
        <!-- [한글 주석] 걸음수 -->
        <div style="
          background:rgba(0,0,0,0.2);border-radius:8px;
          padding:6px 4px;text-align:center;
          border:1px solid ${EVAL_LEVELS[stepsGrade].border}22;
        ">
          <div style="font-size:14px;">🦶</div>
          <div style="font-size:10px;color:#aaa;margin:2px 0;">걸음수</div>
          <div style="font-size:11px;font-weight:700;color:#fff;">${steps.toLocaleString()}</div>
          <div style="margin-top:2px;">${evalBadge(stepsGrade)}</div>
        </div>
        <!-- [한글 주석] 수집 -->
        <div style="
          background:rgba(0,0,0,0.2);border-radius:8px;
          padding:6px 4px;text-align:center;
          border:1px solid ${EVAL_LEVELS[collectGrade].border}22;
        ">
          <div style="font-size:14px;">📦</div>
          <div style="font-size:10px;color:#aaa;margin:2px 0;">수집</div>
          <div style="font-size:11px;font-weight:700;color:#fff;">${total}개</div>
          <div style="margin-top:2px;">${evalBadge(collectGrade)}</div>
        </div>
        <!-- [한글 주석] 학습활동 -->
        <div style="
          background:rgba(0,0,0,0.2);border-radius:8px;
          padding:6px 4px;text-align:center;
          border:1px solid ${EVAL_LEVELS[learningGrade].border}22;
        ">
          <div style="font-size:14px;">📝</div>
          <div style="font-size:10px;color:#aaa;margin:2px 0;">학습</div>
          <div style="font-size:11px;font-weight:700;color:#fff;">
            ${participated ? `정답 ${todayCorrect}` : '미참여'}
            ${battleToday ? (battleWon ? ' ⚔️승' : ' ⚔️') : ''}
          </div>
          <div style="margin-top:2px;">${evalBadge(learningGrade)}</div>
        </div>
      </div>

      <!-- [한글 주석] 도감 진행바 -->
      <div class="dsc-progress-area" style="margin-bottom:8px;">
        <div class="dsc-progress-row" style="display:flex;align-items:center;gap:4px;margin-bottom:3px;">
          <span style="font-size:11px;width:16px;">🌱</span>
          <div class="dsc-progress-bg" style="flex:1;height:5px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
            <div style="width:${Math.min(plantCount,100)}%;height:100%;background:#84ff00;border-radius:4px;"></div>
          </div>
          <span style="font-size:10px;color:#aaa;width:24px;text-align:right;">${plantCount}</span>
        </div>
        <div class="dsc-progress-row" style="display:flex;align-items:center;gap:4px;margin-bottom:3px;">
          <span style="font-size:11px;width:16px;">🦊</span>
          <div class="dsc-progress-bg" style="flex:1;height:5px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
            <div style="width:${Math.min(animalCount,100)}%;height:100%;background:#ff9500;border-radius:4px;"></div>
          </div>
          <span style="font-size:10px;color:#aaa;width:24px;text-align:right;">${animalCount}</span>
        </div>
        <div class="dsc-progress-row" style="display:flex;align-items:center;gap:4px;">
          <span style="font-size:11px;width:16px;">🏺</span>
          <div class="dsc-progress-bg" style="flex:1;height:5px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
            <div style="width:${Math.min(artifactCount,100)}%;height:100%;background:#d4a017;border-radius:4px;"></div>
          </div>
          <span style="font-size:10px;color:#aaa;width:24px;text-align:right;">${artifactCount}</span>
        </div>
      </div>

      <!-- [한글 주석] 카테고리별 퀴즈 정답률 -->
      ${student.categoryStats ? `
        <div style="
          background:rgba(0,0,0,0.15);
          border-radius:8px;padding:8px;
          margin-bottom:8px;
        ">
          <div style="font-size:10px;color:#888;margin-bottom:6px;">📊 퀴즈 정답률</div>
          ${categoryStatsHTML(student.categoryStats)}
        </div>
      ` : ''}

      <!-- [한글 주석] 하단: 동기화 시간 + 선물 버튼 -->
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="font-size:10px;color:#666;">🕐 ${lastSync}</div>
        <button
          class="dsc-reward-btn"
          onclick="showRewardModal('${teacherClass}', '${student.number}', '${student.name || ''}')"
          style="
            background:linear-gradient(135deg,#d4a017,#b3850e);
            color:#1e2e1f;border:none;border-radius:8px;
            padding:5px 12px;font-size:11px;font-weight:700;
            cursor:pointer;white-space:nowrap;
          ">🎁 선물</button>
      </div>
    `;

    gridEl.appendChild(card);
  });
}

// ==========================================
// [한글 주석] 복주머니 보상 모달
// ==========================================
function showRewardModal(classNum, studentNum, studentName) {
  const existing = document.getElementById('reward-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'reward-modal-overlay';
  overlay.className = 'reward-modal-overlay';

  const rewardOptions = [
    { emoji: '🎁', label: '전체 랜덤',  type: 'random',   category: 'all',      rarity: 'all' },
    { emoji: '🌱', label: '식물 일반',  type: 'category', category: 'plant',    rarity: 'common' },
    { emoji: '🌸', label: '식물 희귀',  type: 'category', category: 'plant',    rarity: 'rare' },
    { emoji: '🌺', label: '식물 전설',  type: 'category', category: 'plant',    rarity: 'epic' },
    { emoji: '🦊', label: '동물 일반',  type: 'category', category: 'animal',   rarity: 'common' },
    { emoji: '🦁', label: '동물 희귀',  type: 'category', category: 'animal',   rarity: 'rare' },
    { emoji: '🐉', label: '동물 전설',  type: 'category', category: 'animal',   rarity: 'epic' },
    { emoji: '🏺', label: '유물 일반',  type: 'category', category: 'artifact', rarity: 'common' },
    { emoji: '💎', label: '유물 희귀',  type: 'category', category: 'artifact', rarity: 'rare' },
    { emoji: '👑', label: '유물 전설',  type: 'category', category: 'artifact', rarity: 'epic' }
  ];

  const buttonsHTML = rewardOptions.map(opt => `
    <button class="reward-option-btn"
      onclick="sendReward('${classNum}','${studentNum}','${opt.type}','${opt.category}','${opt.rarity}')">
      <span class="reward-option-emoji">${opt.emoji}</span>
      <span class="reward-option-label">${opt.label}</span>
    </button>
  `).join('');

  overlay.innerHTML = `
    <div class="reward-modal-card">
      <div class="reward-modal-header">
        <h3>🎁 복주머니 선물</h3>
        <p>${studentNum}번 ${studentName || '학생'}에게 보낼 선물을 선택하세요</p>
      </div>
      <div class="reward-options-grid">${buttonsHTML}</div>
      <button class="reward-modal-close" onclick="closeRewardModal()">취소</button>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
}

function closeRewardModal() {
  const overlay = document.getElementById('reward-modal-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  }
}

async function sendReward(classNum, studentNum, rewardType, category, rarity) {
  const buttons = document.querySelectorAll('.reward-option-btn');
  buttons.forEach(btn => { btn.disabled = true; btn.style.opacity = '0.5'; });

  const formData = new FormData();
  formData.append('payload', JSON.stringify({
    type: 'sendReward', class: classNum, number: studentNum,
    reward: { type: rewardType, category, rarity }
  }));

  try {
    await fetch(TEACHER_SCRIPT_URL, { method: 'POST', body: formData });
    closeRewardModal();
    showDashboardToast(`🎁 ${studentNum}번 학생에게 선물을 보냈어요!`, 'success');
  } catch (err) {
    showDashboardToast('전송 실패 - 다시 시도해주세요', 'error');
    buttons.forEach(btn => { btn.disabled = false; btn.style.opacity = '1'; });
  }
}

function refreshDashboard() {
  const teacherClass = localStorage.getItem('teacherClass');
  if (teacherClass) {
    showDashboardToast('🔄 데이터 새로고침 중...', 'info');
    loadStudentData(teacherClass);
  }
}

function teacherLogout() {
  localStorage.removeItem('isTeacher');
  localStorage.removeItem('teacherClass');
  location.reload();
}

function showDashboardToast(message, type) {
  const colors = { info: '#4a9eff', success: '#84ff00', error: '#ff4444' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:40px;left:50%;
    transform:translateX(-50%);
    background:${colors[type] || '#4a9eff'};
    color:#000;padding:12px 24px;
    border-radius:20px;font-size:14px;
    font-weight:bold;z-index:99999;
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
    opacity:0;transition:opacity 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '1'; }, 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// [한글 주석] 전체 일괄 선물
// ==========================================
function showBulkRewardModal() {
  const existing = document.getElementById('reward-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'reward-modal-overlay';
  overlay.className = 'reward-modal-overlay';

  const rewardOptions = [
    { emoji: '🎁', label: '전체 랜덤',  type: 'random',   category: 'all',      rarity: 'all' },
    { emoji: '🌱', label: '식물 일반',  type: 'category', category: 'plant',    rarity: 'common' },
    { emoji: '🌸', label: '식물 희귀',  type: 'category', category: 'plant',    rarity: 'rare' },
    { emoji: '🌺', label: '식물 전설',  type: 'category', category: 'plant',    rarity: 'epic' },
    { emoji: '🦊', label: '동물 일반',  type: 'category', category: 'animal',   rarity: 'common' },
    { emoji: '🦁', label: '동물 희귀',  type: 'category', category: 'animal',   rarity: 'rare' },
    { emoji: '🐉', label: '동물 전설',  type: 'category', category: 'animal',   rarity: 'epic' },
    { emoji: '🏺', label: '유물 일반',  type: 'category', category: 'artifact', rarity: 'common' },
    { emoji: '💎', label: '유물 희귀',  type: 'category', category: 'artifact', rarity: 'rare' },
    { emoji: '👑', label: '유물 전설',  type: 'category', category: 'artifact', rarity: 'epic' }
  ];

  const teacherClass = localStorage.getItem('teacherClass');
  const buttonsHTML = rewardOptions.map(opt => `
    <button class="reward-option-btn"
      onclick="sendBulkReward('${opt.type}','${opt.category}','${opt.rarity}')">
      <span class="reward-option-emoji">${opt.emoji}</span>
      <span class="reward-option-label">${opt.label}</span>
    </button>
  `).join('');

  overlay.innerHTML = `
    <div class="reward-modal-card">
      <div class="reward-modal-header">
        <h3>🎁 전체 일괄 선물</h3>
        <p style="color:#ff9500;font-weight:700;">⚠️ ${teacherClass}반 전체 학생에게 보냅니다!</p>
      </div>
      <div class="reward-options-grid">${buttonsHTML}</div>
      <button class="reward-modal-close" onclick="closeRewardModal()">취소</button>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
}

async function sendBulkReward(rewardType, category, rarity) {
  const studentCards = document.querySelectorAll('.dashboard-student-card');
  const teacherClass = localStorage.getItem('teacherClass');
  if (studentCards.length === 0) {
    showDashboardToast('학생 데이터가 없어요!', 'error'); return;
  }
  if (!confirm(`${teacherClass}반 전체 ${studentCards.length}명에게 선물을 보낼까요?`)) return;

  const buttons = document.querySelectorAll('.reward-option-btn');
  buttons.forEach(btn => { btn.disabled = true; btn.style.opacity = '0.5'; });

  const studentNumbers = [];
  studentCards.forEach(card => {
    const numEl = card.querySelector('.dsc-number');
    if (numEl) studentNumbers.push(numEl.textContent.replace('번', '').trim());
  });

  let successCount = 0;
  for (const studentNum of studentNumbers) {
    const formData = new FormData();
    formData.append('payload', JSON.stringify({
      type: 'sendReward', class: teacherClass, number: studentNum,
      reward: { type: rewardType, category, rarity }
    }));
    try {
      await fetch(TEACHER_SCRIPT_URL, { method: 'POST', body: formData });
      successCount++;
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      console.log(`[일괄선물] ${studentNum}번 전송 실패:`, err);
    }
  }
  closeRewardModal();
  showDashboardToast(`🎁 ${successCount}명에게 선물을 보냈어요!`, 'success');
}

// [한글 주석] 전역 노출
window.initDashboard = initDashboard;
window.showRewardModal = showRewardModal;
window.closeRewardModal = closeRewardModal;
window.sendReward = sendReward;
window.refreshDashboard = refreshDashboard;
window.teacherLogout = teacherLogout;
window.showBulkRewardModal = showBulkRewardModal;
window.sendBulkReward = sendBulkReward;
