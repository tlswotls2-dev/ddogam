// ==========================================
// [한글 주석] 선생님 대시보드 시스템 (teacher.js)
// - Google Sheets에서 학생 데이터 로드
// - 반 전체 통계 및 개별 학생 카드 렌더링
// - 복주머니 보상 전송 기능
// ==========================================

// [한글 주석] Google Apps Script 웹 앱 배포 URL (하드코딩)
const TEACHER_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHFQhpwzADLC6JHfMdo4aJ6lUwXW4OFwfKOsQsTQjr07QFX3JJE27xrAJHZ1Zj-KI8/exec';

/**
 * [한글 주석] 대시보드 초기화 함수
 * 로그인된 선생님의 반 정보를 가져와 데이터를 로드합니다.
 */
function initDashboard() {
  const teacherClass = localStorage.getItem('teacherClass');
  // [한글 주석] 대시보드 헤더에 반 번호 표시
  const titleEl = document.getElementById('dashboard-title');
  if (titleEl) {
    titleEl.textContent = `📊 또감 대시보드 - ${teacherClass}반`;
  }
  // [한글 주석] Google Sheets에서 해당 반 학생 데이터 로드
  loadStudentData(teacherClass);
}

/**
 * [한글 주석] Google Sheets에서 학생 데이터를 비동기로 가져옵니다.
 * @param {string} classNum - 반 번호
 */
async function loadStudentData(classNum) {
  // [한글 주석] 로딩 상태 표시
  const gridEl = document.getElementById('dashboard-student-grid');
  if (gridEl) {
    gridEl.innerHTML = '<div class="dashboard-loading">📡 학생 데이터를 불러오는 중...</div>';
  }

  try {
    const res = await fetch(`${TEACHER_SCRIPT_URL}?type=getStudents&class=${classNum}`);
    const data = await res.json();
    renderDashboard(data.students || []);
  } catch (err) {
    console.log('학생 데이터 로드 실패:', err);
    // [한글 주석] 로드 실패 시 빈 대시보드 표시
    renderDashboard([]);
  }
}

/**
 * [한글 주석] 대시보드 전체를 렌더링합니다. (통계 카드 + 학생 목록)
 * @param {Array} students - 학생 데이터 배열
 */
function renderDashboard(students) {
  const teacherClass = localStorage.getItem('teacherClass');

  // ==========================================
  // [한글 주석] 1. 반 전체 통계 계산
  // ==========================================
  const totalStudents = students.length;
  const totalCollected = students.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const avgCollected = totalStudents > 0 ? Math.round(totalCollected / totalStudents) : 0;
  const totalSteps = students.reduce((sum, s) => sum + (Number(s.steps) || 0), 0);

  // [한글 주석] 가장 많이 수집한 학생 찾기
  let topStudent = { name: '-', total: 0 };
  students.forEach(s => {
    if ((Number(s.total) || 0) > topStudent.total) {
      topStudent = { name: s.name || `${s.number}번`, total: Number(s.total) };
    }
  });

  // [한글 주석] 통계 카드 렌더링
  document.getElementById('stat-student-count').textContent = `${totalStudents}명`;
  document.getElementById('stat-avg-collect').textContent = `${avgCollected}개`;
  document.getElementById('stat-top-student').textContent = `${topStudent.name} (${topStudent.total}개)`;
  document.getElementById('stat-total-steps').textContent = totalSteps.toLocaleString();

  // ==========================================
  // [한글 주석] 2. 학생 카드 목록 렌더링
  // ==========================================
  const gridEl = document.getElementById('dashboard-student-grid');
  if (!gridEl) return;

  // [한글 주석] 데이터 없을 시 안내 메시지 표시
  if (students.length === 0) {
    gridEl.innerHTML = `
      <div class="dashboard-empty">
        <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
        <p>아직 동기화된 학생 데이터가 없습니다.</p>
        <p style="font-size: 0.85rem; color: #a0c4ff;">학생들이 WiFi에 연결하면 자동으로 데이터가 전송됩니다.</p>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = '';

  // [한글 주석] 각 학생별 카드 생성
  students.forEach(student => {
    const plantCount = Number(student.plant) || 0;
    const animalCount = Number(student.animal) || 0;
    const artifactCount = Number(student.artifact) || 0;
    const total = Number(student.total) || 0;
    const steps = Number(student.steps) || 0;
    const lastSync = student.lastSync || '미동기화';

    const card = document.createElement('div');
    card.className = 'dashboard-student-card';

    card.innerHTML = `
      <!-- [한글 주석] 카드 상단: 번호 + 레벨 표시 -->
      <div class="dsc-header">
        <span class="dsc-number">${student.number}번</span>
        <span class="dsc-level" style="
          background:linear-gradient(135deg,#ffd700,#ff9500);
          color:#000;font-size:11px;font-weight:900;
          border-radius:20px;padding:2px 8px;
        ">Lv.${Math.min(30, Math.floor((Number(student.total)||0) / 10) + 1)}</span>
      </div>

      <!-- [한글 주석] 카드 중간: 카테고리별 진행바 -->
      <div class="dsc-progress-area">
        <div class="dsc-progress-row">
          <span class="dsc-progress-label">🌱</span>
          <div class="dsc-progress-bg">
            <div class="dsc-progress-fill dsc-fill-plant" style="width: ${Math.min(plantCount, 100)}%;"></div>
          </div>
          <span class="dsc-progress-count">${plantCount}</span>
        </div>
        <div class="dsc-progress-row">
          <span class="dsc-progress-label">🦊</span>
          <div class="dsc-progress-bg">
            <div class="dsc-progress-fill dsc-fill-animal" style="width: ${Math.min(animalCount, 100)}%;"></div>
          </div>
          <span class="dsc-progress-count">${animalCount}</span>
        </div>
        <div class="dsc-progress-row">
          <span class="dsc-progress-label">🌰</span>
          <div class="dsc-progress-bg">
            <div class="dsc-progress-fill dsc-fill-artifact" style="width: ${Math.min(artifactCount, 100)}%;"></div>
          </div>
          <span class="dsc-progress-count">${artifactCount}</span>
        </div>
      </div>

      <!-- [한글 주석] 카드 하단: 총 수집수, 걸음수, 동기화 시간 -->
      <div class="dsc-footer">
        <div class="dsc-stats">
          <span>📦 총 ${total}/300개</span>
          <span>👟 ${steps.toLocaleString()}걸음</span>
        </div>
        <div class="dsc-sync-time">🕐 ${lastSync}</div>
      </div>

      <!-- [한글 주석] 선물 버튼 -->
      <button class="dsc-reward-btn" onclick="showRewardModal('${teacherClass}', '${student.number}', '${student.name || ''}')">
        🎁 선물하기
      </button>
    `;

    gridEl.appendChild(card);
  });
}

/**
 * [한글 주석] 복주머니 보상 모달을 띄웁니다.
 * @param {string} classNum - 반 번호
 * @param {string} studentNum - 학생 번호
 * @param {string} studentName - 학생 이름
 */
function showRewardModal(classNum, studentNum, studentName) {
  // [한글 주석] 기존 모달이 있으면 제거
  const existing = document.getElementById('reward-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'reward-modal-overlay';
  overlay.className = 'reward-modal-overlay';

  // [한글 주석] 보상 종류 버튼 목록 정의 (10가지)
  const rewardOptions = [
    { emoji: '🎁', label: '전체 랜덤', type: 'random', category: 'all', rarity: 'all' },
    { emoji: '🌱', label: '식물 일반', type: 'category', category: 'plant', rarity: 'common' },
    { emoji: '🌸', label: '식물 희귀', type: 'category', category: 'plant', rarity: 'rare' },
    { emoji: '🌺', label: '식물 전설', type: 'category', category: 'plant', rarity: 'epic' },
    { emoji: '🦊', label: '동물 일반', type: 'category', category: 'animal', rarity: 'common' },
    { emoji: '🦁', label: '동물 희귀', type: 'category', category: 'animal', rarity: 'rare' },
    { emoji: '🐉', label: '동물 전설', type: 'category', category: 'animal', rarity: 'epic' },
    { emoji: '🌰', label: '유물 일반', type: 'category', category: 'artifact', rarity: 'common' },
    { emoji: '🏺', label: '유물 희귀', type: 'category', category: 'artifact', rarity: 'rare' },
    { emoji: '👑', label: '유물 전설', type: 'category', category: 'artifact', rarity: 'epic' }
  ];

  // [한글 주석] 보상 버튼 HTML 생성
  const buttonsHTML = rewardOptions.map(opt => `
    <button class="reward-option-btn" onclick="sendReward('${classNum}', '${studentNum}', '${opt.type}', '${opt.category}', '${opt.rarity}')">
      <span class="reward-option-emoji">${opt.emoji}</span>
      <span class="reward-option-label">${opt.label}</span>
    </button>
  `).join('');

  overlay.innerHTML = `
    <div class="reward-modal-card">
      <!-- [한글 주석] 모달 헤더 -->
      <div class="reward-modal-header">
        <h3>🎁 복주머니 선물</h3>
        <p>${studentNum}번 ${studentName || '학생'}에게 보낼 선물을 선택하세요</p>
      </div>

      <!-- [한글 주석] 보상 옵션 그리드 -->
      <div class="reward-options-grid">
        ${buttonsHTML}
      </div>

      <!-- [한글 주석] 닫기 버튼 -->
      <button class="reward-modal-close" onclick="closeRewardModal()">취소</button>
    </div>
  `;

  document.body.appendChild(overlay);

  // [한글 주석] 등장 애니메이션
  requestAnimationFrame(() => {
    overlay.classList.add('show');
  });
}

/**
 * [한글 주석] 보상 모달 닫기
 */
function closeRewardModal() {
  const overlay = document.getElementById('reward-modal-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  }
}

/**
 * [한글 주석] 학생에게 복주머니 보상을 Google Sheets로 전송합니다.
 * @param {string} classNum - 반 번호
 * @param {string} studentNum - 학생 번호
 * @param {string} rewardType - 보상 타입 ('random' 또는 'category')
 * @param {string} category - 카테고리 ('plant', 'animal', 'artifact', 'all')
 * @param {string} rarity - 희귀도 ('common', 'rare', 'epic', 'all')
 */
async function sendReward(classNum, studentNum, rewardType, category, rarity) {
  // [한글 주석] 버튼 비활성화 (중복 전송 방지)
  const buttons = document.querySelectorAll('.reward-option-btn');
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  });

  const payload = {
    type: 'sendReward',
    class: classNum,
    number: studentNum,
    reward: { type: rewardType, category: category, rarity: rarity }
  };

  // [한글 주석] CORS 회피를 위해 FormData 형식으로 전송
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));

  try {
    await fetch(TEACHER_SCRIPT_URL, {
      method: 'POST',
      body: formData
    });

    // [한글 주석] 성공 알림
    closeRewardModal();
    showDashboardToast(`🎁 ${studentNum}번 학생에게 선물을 보냈어요!`, 'success');
  } catch (err) {
    console.log('보상 전송 실패:', err);
    showDashboardToast('전송 실패 - 다시 시도해주세요', 'error');
    // [한글 주석] 실패 시 버튼 다시 활성화
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  }
}

/**
 * [한글 주석] 대시보드 새로고침
 */
function refreshDashboard() {
  const teacherClass = localStorage.getItem('teacherClass');
  if (teacherClass) {
    showDashboardToast('🔄 데이터 새로고침 중...', 'info');
    loadStudentData(teacherClass);
  }
}

/**
 * [한글 주석] 선생님 로그아웃 처리
 */
function teacherLogout() {
  localStorage.removeItem('isTeacher');
  localStorage.removeItem('teacherClass');
  location.reload(); // [한글 주석] 페이지 새로고침하여 로그인 화면으로 복귀
}

/**
 * [한글 주석] 대시보드 전용 토스트 메시지
 * @param {string} message - 표시할 메시지
 * @param {string} type - 'success', 'error', 'info'
 */
function showDashboardToast(message, type) {
  const colors = {
    info: '#4a9eff',
    success: '#84ff00',
    error: '#ff4444'
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 40px; left: 50%;
    transform: translateX(-50%);
    background: ${colors[type] || '#4a9eff'};
    color: #000; padding: 12px 24px;
    border-radius: 20px; font-size: 14px;
    font-weight: bold; z-index: 99999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    opacity: 0; transition: opacity 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  // [한글 주석] 나타남 + 사라짐 애니메이션
  setTimeout(() => { toast.style.opacity = '1'; }, 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// [한글 주석] 전역 노출 (app.js 및 index.html에서 호출 가능)
window.initDashboard = initDashboard;
window.showRewardModal = showRewardModal;
window.closeRewardModal = closeRewardModal;
window.sendReward = sendReward;
window.refreshDashboard = refreshDashboard;
window.teacherLogout = teacherLogout;
