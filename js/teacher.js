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
    good: 2000,   // [한글 주석] 잘함: 2000보 이상
    ok: 1000,   // [한글 주석] 보통: 1000보 이상
  },
  collect: {
    great: 5,      // [한글 주석] 매우잘함: 5개 이상
    good: 3,      // [한글 주석] 잘함: 3개 이상
    ok: 1,      // [한글 주석] 보통: 1개 이상
  },
  learning: {
    great: 2,      // [한글 주석] 매우잘함: 정답 2개 이상
    good: 1,      // [한글 주석] 잘함: 정답 1개 이상
    ok: 0,      // [한글 주석] 보통: 참여만 (정답 0)
    // [한글 주석] 미참여 = 노력요함
  }
};

// [한글 주석] 평가 등급 레이블/색상
const EVAL_LEVELS = {
  great: { label: '매우잘함', color: '#4a9eff', bg: 'rgba(74,158,255,0.15)', border: '#4a9eff' },
  good: { label: '잘함', color: '#84ff00', bg: 'rgba(132,255,0,0.15)', border: '#84ff00' },
  ok: { label: '보통', color: '#ffd700', bg: 'rgba(255,215,0,0.15)', border: '#ffd700' },
  bad: { label: '노력요함', color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)', border: '#ff6b6b' }
};

// ==========================================
// [한글 주석] 항목별 등급 계산
// ==========================================
function evalSteps(steps) {
  if (steps >= EVAL_CRITERIA.steps.great) return 'great';
  if (steps >= EVAL_CRITERIA.steps.good) return 'good';
  if (steps >= EVAL_CRITERIA.steps.ok) return 'ok';
  return 'bad';
}

function evalCollect(todayCollect) {
  if (todayCollect >= EVAL_CRITERIA.collect.great) return 'great';
  if (todayCollect >= EVAL_CRITERIA.collect.good) return 'good';
  if (todayCollect >= EVAL_CRITERIA.collect.ok) return 'ok';
  return 'bad';
}

function evalLearning(correct, participated) {
  if (!participated) return 'bad';
  if (correct >= EVAL_CRITERIA.learning.great) return 'great';
  if (correct >= EVAL_CRITERIA.learning.good) return 'good';
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
    { key: 'plant', label: '🌱 식물', color: '#84ff00' },
    { key: 'animal', label: '🦊 동물', color: '#ff9500' },
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
  // [한글 주석] 체험 모드: 서버 요청 없이 샘플 데이터로 렌더링
  if (localStorage.getItem('demoMode') === 'true') {
    const demoStudents = JSON.parse(localStorage.getItem('demoStudents') || '[]');
    renderDashboard(demoStudents);
    return;
  }

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
    const plantCount = Number(student.plant) || 0;
    const animalCount = Number(student.animal) || 0;
    const artifactCount = Number(student.artifact) || 0;
    const total = Number(student.total) || 0;
    const steps = Number(student.steps) || 0;
    const lastSync = student.lastSync || '미동기화';

    // [한글 주석] 오늘 수집 수 (총 수집에서 어제까지 수집 추정 불가 → steps 동기화 기준 사용)
    // [한글 주석] todayCollect가 없으면 0으로 처리
    const todayCollect = Number(student.todayCollect) || 0;
    const todayCorrect = Number(student.todayCorrect) || 0;
    const participated = student.todayParticipated || false;
    const battleToday = student.todayBattle || false;
    const battleWon = student.todayBattleWon || false;

    // [한글 주석] 항목별 평가
    const stepsGrade = evalSteps(steps);
    const collectGrade = evalCollect(todayCollect);
    const learningGrade = evalLearning(todayCorrect, participated);
    const totalGrade = evalTotal(stepsGrade, collectGrade, learningGrade);
    const totalEval = EVAL_LEVELS[totalGrade];

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
            <div style="width:${Math.min(plantCount, 100)}%;height:100%;background:#84ff00;border-radius:4px;"></div>
          </div>
          <span style="font-size:10px;color:#aaa;width:24px;text-align:right;">${plantCount}</span>
        </div>
        <div class="dsc-progress-row" style="display:flex;align-items:center;gap:4px;margin-bottom:3px;">
          <span style="font-size:11px;width:16px;">🦊</span>
          <div class="dsc-progress-bg" style="flex:1;height:5px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
            <div style="width:${Math.min(animalCount, 100)}%;height:100%;background:#ff9500;border-radius:4px;"></div>
          </div>
          <span style="font-size:10px;color:#aaa;width:24px;text-align:right;">${animalCount}</span>
        </div>
        <div class="dsc-progress-row" style="display:flex;align-items:center;gap:4px;">
          <span style="font-size:11px;width:16px;">🏺</span>
          <div class="dsc-progress-bg" style="flex:1;height:5px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;">
            <div style="width:${Math.min(artifactCount, 100)}%;height:100%;background:#d4a017;border-radius:4px;"></div>
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
    { emoji: '🎁', label: '전체 랜덤', type: 'random', category: 'all', rarity: 'all' },
    { emoji: '🌱', label: '식물 일반', type: 'category', category: 'plant', rarity: 'common' },
    { emoji: '🌸', label: '식물 희귀', type: 'category', category: 'plant', rarity: 'rare' },
    { emoji: '🌺', label: '식물 전설', type: 'category', category: 'plant', rarity: 'epic' },
    { emoji: '🦊', label: '동물 일반', type: 'category', category: 'animal', rarity: 'common' },
    { emoji: '🦁', label: '동물 희귀', type: 'category', category: 'animal', rarity: 'rare' },
    { emoji: '🐉', label: '동물 전설', type: 'category', category: 'animal', rarity: 'epic' },
    { emoji: '🏺', label: '유물 일반', type: 'category', category: 'artifact', rarity: 'common' },
    { emoji: '💎', label: '유물 희귀', type: 'category', category: 'artifact', rarity: 'rare' },
    { emoji: '👑', label: '유물 전설', type: 'category', category: 'artifact', rarity: 'epic' }
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
  // [한글 주석] 체험 모드면 exitDemoMode로 깔끔하게 종료
  if (localStorage.getItem('demoMode') === 'true') {
    if (typeof exitDemoMode === 'function') { exitDemoMode(); return; }
  }
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
    { emoji: '🎁', label: '전체 랜덤', type: 'random', category: 'all', rarity: 'all' },
    { emoji: '🌱', label: '식물 일반', type: 'category', category: 'plant', rarity: 'common' },
    { emoji: '🌸', label: '식물 희귀', type: 'category', category: 'plant', rarity: 'rare' },
    { emoji: '🌺', label: '식물 전설', type: 'category', category: 'plant', rarity: 'epic' },
    { emoji: '🦊', label: '동물 일반', type: 'category', category: 'animal', rarity: 'common' },
    { emoji: '🦁', label: '동물 희귀', type: 'category', category: 'animal', rarity: 'rare' },
    { emoji: '🐉', label: '동물 전설', type: 'category', category: 'animal', rarity: 'epic' },
    { emoji: '🏺', label: '유물 일반', type: 'category', category: 'artifact', rarity: 'common' },
    { emoji: '💎', label: '유물 희귀', type: 'category', category: 'artifact', rarity: 'rare' },
    { emoji: '👑', label: '유물 전설', type: 'category', category: 'artifact', rarity: 'epic' }
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
window.showTeacherHelp = showTeacherHelp;
window.showTeacherHelpDetail = showTeacherHelpDetail;
window.hideTeacherHelpDetail = hideTeacherHelpDetail;
window.closeTeacherHelp = closeTeacherHelp;

// ==========================================
// [한글 주석] 교사용 도움말 시스템
// ==========================================

function showTeacherHelp() {
  // [한글 주석] 기존 도움말 있으면 제거
  const existing = document.getElementById('teacher-help-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'teacher-help-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.88);
    z-index:99999;
    display:flex;
    align-items:flex-start;
    justify-content:center;
    overflow-y:auto;
    padding:24px 16px;
  `;

  overlay.innerHTML = `
    <!-- [한글 주석] 메인 도움말 -->
    <div id="teacher-help-main" style="
      background:linear-gradient(135deg,#0f1c2e,#1a2a3e);
      border:2px solid #4a6fa5;
      border-radius:24px;
      padding:28px 24px;
      max-width:480px;
      width:100%;
      box-shadow:0 0 40px rgba(74,158,255,0.2);
    ">
      <!-- [한글 주석] 헤더 -->
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:28px;margin-bottom:6px;">👨🏫 선생님 도움말</div>
        <div style="color:#7aabff;font-size:13px;">또감 앱 소개 및 대시보드 사용 안내</div>
      </div>

      <!-- [한글 주석] 앱 소개 및 오프라인 안내 (최상단 강조 박스) -->
      <div style="
        background:linear-gradient(135deg,rgba(132,255,0,0.08),rgba(74,158,255,0.08));
        border:1.5px solid #4a7a1e;
        border-radius:16px;
        padding:16px;
        margin-bottom:16px;
      ">
        <div style="color:#84ff00;font-size:13px;font-weight:900;margin-bottom:10px;">
          🌿 또감이란?
        </div>
        <div style="color:#c8d8f0;font-size:12px;line-height:1.9;">
          <b style="color:#fff;">또감</b>은 초등학생이 직접 걸으며 식물·동물·유물 카드를 수집하는
          <b style="color:#84ff00;">도감 수집형 학습 앱</b>이에요.<br>
          걷기→카드수집→레벨업→퀴즈 사이클로 자연스럽게 학습이 이루어져요.
        </div>
        <!-- [한글 주석] 오프라인 동작 안내 -->
        <div style="
          background:rgba(255,215,0,0.08);
          border:1px solid #a07c10;
          border-radius:10px;
          padding:10px 12px;
          margin-top:10px;
        ">
          <div style="color:#ffd700;font-size:12px;font-weight:900;margin-bottom:6px;">
            📶 인터넷 연결 없이도 탐험 가능해요!
          </div>
          <div style="color:#c8d8f0;font-size:11px;line-height:1.8;">
            • 학생 기기에 앱 데이터가 저장되어 있어서
            <b style="color:#fff;">인터넷 연결 없이도</b> 탐험·카드수집·퀴즈를 모두 할 수 있어요.<br>
            • 오프라인 중 활동한 내용(걸음수, 수집, 퀴즈 결과)은 기기에 임시 저장돼요.<br>
            • 나중에 <b style="color:#fff;">와이파이에 연결되면 자동으로</b> 선생님 대시보드에 반영돼요.<br>
            • 그렇기 때문에 야외활동 시 인터넷이 끊기더라도 걱정 없이 사용하세요! 😊
          </div>
        </div>
      </div>

      <!-- [한글 주석] 핵심 안내 4가지 -->
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">

        <div style="background:rgba(74,158,255,0.08);border:1px solid #4a6fa5;border-radius:14px;padding:14px;display:flex;align-items:flex-start;gap:12px;">
          <div style="font-size:26px;flex-shrink:0;">📊</div>
          <div>
            <div style="color:#7aabff;font-size:13px;font-weight:900;margin-bottom:4px;">대시보드 보는 법</div>
            <div style="color:#c8d8f0;font-size:12px;line-height:1.7;">
              학생 카드에는 걸음수·수집·학습 3가지 항목이 평가돼요.<br>
              <span style="color:#4a9eff;">매우잘함</span> /
              <span style="color:#84ff00;">잘함</span> /
              <span style="color:#ffd700;">보통</span> /
              <span style="color:#ff6b6b;">노력요함</span>
              4단계로 표시됩니다.
            </div>
          </div>
        </div>

        <div style="background:rgba(212,160,23,0.08);border:1px solid #a07c10;border-radius:14px;padding:14px;display:flex;align-items:flex-start;gap:12px;">
          <div style="font-size:26px;flex-shrink:0;">🎁</div>
          <div>
            <div style="color:#d4a017;font-size:13px;font-weight:900;margin-bottom:4px;">복주머니 선물하기</div>
            <div style="color:#c8d8f0;font-size:12px;line-height:1.7;">
              학생 카드의 🎁 선물 버튼으로 개별 선물,<br>
              상단 <b style="color:#ff9500;">전체 선물하기</b> 버튼으로 반 전체에게 동시 선물할 수 있어요.<br>
              선물은 학생이 WiFi 연결 시 자동 수령해요.
            </div>
          </div>
        </div>

        <div style="background:rgba(132,255,0,0.06);border:1px solid #4a7a1e;border-radius:14px;padding:14px;display:flex;align-items:flex-start;gap:12px;">
          <div style="font-size:26px;flex-shrink:0;">🔄</div>
          <div>
            <div style="color:#84ff00;font-size:13px;font-weight:900;margin-bottom:4px;">데이터 동기화</div>
            <div style="color:#c8d8f0;font-size:12px;line-height:1.7;">
              학생 데이터는 WiFi 연결 시 자동 전송돼요.<br>
              최신 데이터를 보려면 🔄 새로고침 버튼을 눌러주세요.<br>
              오프라인 상태의 학생은 접속 후 자동 반영됩니다.
            </div>
          </div>
        </div>

        <div style="background:rgba(255,107,107,0.06);border:1px solid #8b3a3a;border-radius:14px;padding:14px;display:flex;align-items:flex-start;gap:12px;">
          <div style="font-size:26px;flex-shrink:0;">🔑</div>
          <div>
            <div style="color:#ff8080;font-size:13px;font-weight:900;margin-bottom:4px;">로그인 방법</div>
            <div style="color:#c8d8f0;font-size:12px;line-height:1.7;">
              반 선택 → 번호 <b>0</b> 입력 → 비밀번호 <b>teacher반번호</b><br>
              예) 3반 선생님 → 비밀번호: <b style="color:#ffd700;">teacher3</b><br>
              학생 비밀번호는 공통 <b style="color:#ffd700;">1234</b>예요.
            </div>
          </div>
        </div>

      </div>

      <!-- [한글 주석] 버튼 2개 -->
      <div style="display:flex;gap:8px;">
        <button onclick="closeTeacherHelp()" style="
          flex:1;
          background:rgba(255,255,255,0.06);
          color:#c8d8f0;border:1px solid #4a6fa5;
          border-radius:12px;padding:12px;
          font-size:13px;font-weight:700;cursor:pointer;
        ">확인</button>
        <button onclick="showTeacherHelpDetail()" style="
          flex:1.5;
          background:linear-gradient(135deg,#4a6fa5,#2a4a7a);
          color:#fff;border:none;
          border-radius:12px;padding:12px;
          font-size:13px;font-weight:900;cursor:pointer;
        ">📚 자세히 알아보기</button>
      </div>
    </div>

    <!-- [한글 주석] 상세 도움말 (처음엔 숨김) -->
    <div id="teacher-help-detail" style="display:none;
      background:linear-gradient(135deg,#0f1c2e,#1a2a3e);
      border:2px solid #4a6fa5;
      border-radius:24px;
      padding:28px 24px;
      max-width:480px;
      width:100%;
      box-shadow:0 0 40px rgba(74,158,255,0.2);
    ">
      <!-- [한글 주석] 상세 헤더 -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
        <button onclick="hideTeacherHelpDetail()" style="
          background:rgba(255,255,255,0.06);color:#c8d8f0;
          border:1px solid #4a6fa5;border-radius:10px;
          padding:6px 12px;font-size:13px;cursor:pointer;
        ">← 뒤로</button>
        <div style="color:#7aabff;font-size:15px;font-weight:900;">📚 자세한 사용법</div>
      </div>

      <!-- [한글 주석] 상세 항목 -->
      <div style="display:flex;flex-direction:column;gap:14px;max-height:65vh;overflow-y:auto;">

        <div style="background:rgba(74,158,255,0.08);border:1px solid #4a6fa5;border-radius:14px;padding:14px;">
          <div style="color:#7aabff;font-size:13px;font-weight:900;margin-bottom:8px;">📊 평가 기준</div>
          <div style="color:#c8d8f0;font-size:12px;line-height:1.9;">
            <b style="color:#fff;">🦶 걸음수</b><br>
            &nbsp;&nbsp;매우잘함: 3,000보 이상<br>
            &nbsp;&nbsp;잘함: 2,000보 이상 / 보통: 1,000보 이상<br>
            <b style="color:#fff;">📦 수집 (오늘)</b><br>
            &nbsp;&nbsp;매우잘함: 5개 이상<br>
            &nbsp;&nbsp;잘함: 3개 이상 / 보통: 1개 이상<br>
            <b style="color:#fff;">📝 학습활동 (오늘)</b><br>
            &nbsp;&nbsp;매우잘함: 퀴즈 정답 2개 이상<br>
            &nbsp;&nbsp;잘함: 정답 1개 / 보통: 참여만 / 노력요함: 미참여<br>
            종합 평가는 3항목 점수를 평균낸 결과예요.
          </div>
        </div>

        <div style="background:rgba(212,160,23,0.08);border:1px solid #a07c10;border-radius:14px;padding:14px;">
          <div style="color:#d4a017;font-size:13px;font-weight:900;margin-bottom:8px;">🎁 복주머니 종류</div>
          <div style="color:#c8d8f0;font-size:12px;line-height:1.9;">
            • 🎁 전체 랜덤: 해금된 카테고리 중 랜덤 카드<br>
            • 카테고리별 (식물/동물/유물) × 희귀도 (일반/희귀/전설)<br>
            • 전설 복주머니는 특별한 보상용으로 아껴두세요!<br>
            • 학생이 아직 해금 안 한 카테고리의 카드는<br>
            &nbsp;&nbsp;선물해도 수령 후 열 수 없어요.
          </div>
        </div>

        <div style="background:rgba(132,255,0,0.06);border:1px solid #4a7a1e;border-radius:14px;padding:14px;">
          <div style="color:#84ff00;font-size:13px;font-weight:900;margin-bottom:8px;">📱 학생 앱 구조</div>
          <div style="color:#c8d8f0;font-size:12px;line-height:1.9;">
            • 카드 10장 수집마다 레벨업 퀴즈 도전<br>
            • Lv.5 → 동물 해금 / Lv.10 → 유물 해금<br>
            • 일일 OX 시험: 하루 1회, 정답 시 복주머니 획득<br>
            • 지식 배틀: 같은 반 친구와 실시간 퀴즈 대결<br>
            • 오프라인에서 퀴즈 풀면 WiFi 연결 시 자동 전송
          </div>
        </div>

        <div style="background:rgba(255,107,107,0.06);border:1px solid #8b3a3a;border-radius:14px;padding:14px;">
          <div style="color:#ff8080;font-size:13px;font-weight:900;margin-bottom:8px;">⚠️ 주의사항</div>
          <div style="color:#c8d8f0;font-size:12px;line-height:1.9;">
            • 학생 비밀번호는 <b style="color:#ffd700;">1234</b> (공통)<br>
            • 기기 초기화 시 해당 기기의 모든 수집 기록 삭제<br>
            • 구글 시트 데이터는 삭제되지 않아요<br>
            • 전체 선물은 취소가 안 되니 신중하게 눌러주세요<br>
            • 학생 데이터 반영까지 최대 30초 소요될 수 있어요
          </div>
        </div>

        <div style="background:rgba(141,176,92,0.08);border:1px solid #6b8e3d;border-radius:14px;padding:14px;">
          <div style="color:#8db05c;font-size:13px;font-weight:900;margin-bottom:8px;">💡 활용 팁</div>
          <div style="color:#c8d8f0;font-size:12px;line-height:1.9;">
            • 수업 전 전체 선물로 동기 부여해보세요<br>
            • 매우잘함 학생 수로 학급 전체 참여도 파악 가능<br>
            • 퀴즈 정답률로 학습 이해도를 파악할 수 있어요<br>
            • 걸음수가 낮은 학생에게 개별 복주머니로 격려해보세요<br>
            • 새로고침은 수업 시작 전 한 번 눌러두면 좋아요
          </div>
        </div>

      </div>

      <!-- [한글 주석] 닫기 버튼 -->
      <button onclick="closeTeacherHelp()" style="
        margin-top:16px;
        width:100%;
        background:linear-gradient(135deg,#4a6fa5,#2a4a7a);
        color:#fff;border:none;border-radius:12px;
        padding:12px;font-size:14px;font-weight:900;cursor:pointer;
      ">확인!</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

// [한글 주석] 상세 도움말 표시
function showTeacherHelpDetail() {
  const main = document.getElementById('teacher-help-main');
  const detail = document.getElementById('teacher-help-detail');
  if (main) main.style.display = 'none';
  if (detail) detail.style.display = 'block';
}

// [한글 주석] 상세 도움말 숨기고 메인으로
function hideTeacherHelpDetail() {
  const main = document.getElementById('teacher-help-main');
  const detail = document.getElementById('teacher-help-detail');
  if (main) main.style.display = 'block';
  if (detail) detail.style.display = 'none';
}

// [한글 주석] 교사용 도움말 닫기
function closeTeacherHelp() {
  const overlay = document.getElementById('teacher-help-overlay');
  if (overlay) overlay.remove();
}


