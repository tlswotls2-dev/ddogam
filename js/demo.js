// js/demo.js
// [한글 주석] 체험 모드 시스템 — 심사위원·외부 교사용 데모

// [한글 주석] 체험 모드 비밀번호
const DEMO_PASSWORD = 'ddogam2026';

// [한글 주석] 교사 대시보드 체험용 샘플 학생 20명 데이터
const DEMO_STUDENTS = [
  { number:'1',  name:'김민준', steps:4200, total:65, plant:35, animal:20, artifact:10, todayCollect:6, todayCorrect:2, todayParticipated:true,  todayBattle:true,  todayBattleWon:true,  lastSync:'2026.06.02 10:23', categoryStats:{ plant:{correct:8,total:10}, animal:{correct:6,total:8},  artifact:{correct:3,total:5} } },
  { number:'2',  name:'이서연', steps:3800, total:58, plant:30, animal:18, artifact:10, todayCollect:5, todayCorrect:2, todayParticipated:true,  todayBattle:false, todayBattleWon:false, lastSync:'2026.06.02 10:18', categoryStats:{ plant:{correct:7,total:9},  animal:{correct:5,total:7},  artifact:{correct:2,total:4} } },
  { number:'3',  name:'박지호', steps:2900, total:42, plant:28, animal:14, artifact:0,  todayCollect:4, todayCorrect:1, todayParticipated:true,  todayBattle:true,  todayBattleWon:false, lastSync:'2026.06.02 09:55', categoryStats:{ plant:{correct:5,total:8},  animal:{correct:3,total:6},  artifact:{correct:0,total:0} } },
  { number:'4',  name:'최수아', steps:3200, total:51, plant:29, animal:16, artifact:6,  todayCollect:5, todayCorrect:2, todayParticipated:true,  todayBattle:false, todayBattleWon:false, lastSync:'2026.06.02 10:10', categoryStats:{ plant:{correct:6,total:8},  animal:{correct:4,total:6},  artifact:{correct:1,total:3} } },
  { number:'5',  name:'정하윤', steps:1800, total:31, plant:25, animal:6,  artifact:0,  todayCollect:2, todayCorrect:1, todayParticipated:true,  todayBattle:false, todayBattleWon:false, lastSync:'2026.06.02 09:42', categoryStats:{ plant:{correct:4,total:7},  animal:{correct:1,total:4},  artifact:{correct:0,total:0} } },
  { number:'6',  name:'강민서', steps:4500, total:73, plant:38, animal:25, artifact:10, todayCollect:7, todayCorrect:2, todayParticipated:true,  todayBattle:true,  todayBattleWon:true,  lastSync:'2026.06.02 10:28', categoryStats:{ plant:{correct:9,total:10}, animal:{correct:7,total:9},  artifact:{correct:3,total:4} } },
  { number:'7',  name:'윤서진', steps:2100, total:38, plant:27, animal:11, artifact:0,  todayCollect:3, todayCorrect:0, todayParticipated:true,  todayBattle:false, todayBattleWon:false, lastSync:'2026.06.02 09:30', categoryStats:{ plant:{correct:3,total:6},  animal:{correct:2,total:5},  artifact:{correct:0,total:0} } },
  { number:'8',  name:'임도윤', steps:800,  total:18, plant:18, animal:0,  artifact:0,  todayCollect:1, todayCorrect:0, todayParticipated:false, todayBattle:false, todayBattleWon:false, lastSync:'2026.06.02 09:15', categoryStats:{ plant:{correct:2,total:5},  animal:{correct:0,total:0},  artifact:{correct:0,total:0} } },
  { number:'9',  name:'한지아', steps:3500, total:55, plant:32, animal:17, artifact:6,  todayCollect:5, todayCorrect:1, todayParticipated:true,  todayBattle:true,  todayBattleWon:false, lastSync:'2026.06.02 10:05', categoryStats:{ plant:{correct:6,total:9},  animal:{correct:4,total:7},  artifact:{correct:2,total:4} } },
  { number:'10', name:'오준혁', steps:500,  total:12, plant:12, animal:0,  artifact:0,  todayCollect:0, todayCorrect:0, todayParticipated:false, todayBattle:false, todayBattleWon:false, lastSync:'2026.06.01 14:22', categoryStats:null },
  { number:'11', name:'배나은', steps:2700, total:44, plant:28, animal:14, artifact:2,  todayCollect:4, todayCorrect:2, todayParticipated:true,  todayBattle:false, todayBattleWon:false, lastSync:'2026.06.02 10:00', categoryStats:{ plant:{correct:5,total:7},  animal:{correct:3,total:5},  artifact:{correct:1,total:2} } },
  { number:'12', name:'신채원', steps:3100, total:48, plant:30, animal:15, artifact:3,  todayCollect:5, todayCorrect:1, todayParticipated:true,  todayBattle:false, todayBattleWon:false, lastSync:'2026.06.02 09:48', categoryStats:{ plant:{correct:6,total:8},  animal:{correct:3,total:6},  artifact:{correct:1,total:2} } },
  { number:'13', name:'류지훈', steps:1200, total:22, plant:20, animal:2,  artifact:0,  todayCollect:1, todayCorrect:0, todayParticipated:true,  todayBattle:false, todayBattleWon:false, lastSync:'2026.06.02 09:20', categoryStats:{ plant:{correct:2,total:4},  animal:{correct:0,total:1},  artifact:{correct:0,total:0} } },
  { number:'14', name:'권아린', steps:4100, total:68, plant:36, animal:22, artifact:10, todayCollect:6, todayCorrect:2, todayParticipated:true,  todayBattle:true,  todayBattleWon:true,  lastSync:'2026.06.02 10:20', categoryStats:{ plant:{correct:8,total:10}, animal:{correct:6,total:8},  artifact:{correct:3,total:5} } },
  { number:'15', name:'문태양', steps:2400, total:36, plant:26, animal:10, artifact:0,  todayCollect:3, todayCorrect:1, todayParticipated:true,  todayBattle:false, todayBattleWon:false, lastSync:'2026.06.02 09:38', categoryStats:{ plant:{correct:4,total:6},  animal:{correct:2,total:4},  artifact:{correct:0,total:0} } },
  { number:'16', name:'',     steps:1600, total:28, plant:24, animal:4,  artifact:0,  todayCollect:2, todayCorrect:0, todayParticipated:false, todayBattle:false, todayBattleWon:false, lastSync:'2026.06.02 09:10', categoryStats:{ plant:{correct:3,total:5},  animal:{correct:0,total:2},  artifact:{correct:0,total:0} } },
  { number:'17', name:'조예린', steps:3700, total:60, plant:33, animal:20, artifact:7,  todayCollect:6, todayCorrect:2, todayParticipated:true,  todayBattle:true,  todayBattleWon:false, lastSync:'2026.06.02 10:15', categoryStats:{ plant:{correct:7,total:9},  animal:{correct:5,total:7},  artifact:{correct:2,total:3} } },
  { number:'18', name:'서민우', steps:900,  total:15, plant:15, animal:0,  artifact:0,  todayCollect:0, todayCorrect:0, todayParticipated:false, todayBattle:false, todayBattleWon:false, lastSync:'2026.06.01 16:30', categoryStats:null },
  { number:'19', name:'황지은', steps:2600, total:41, plant:27, animal:12, artifact:2,  todayCollect:3, todayCorrect:1, todayParticipated:true,  todayBattle:false, todayBattleWon:false, lastSync:'2026.06.02 09:52', categoryStats:{ plant:{correct:5,total:7},  animal:{correct:2,total:5},  artifact:{correct:1,total:2} } },
  { number:'20', name:'노현준', steps:3300, total:53, plant:31, animal:17, artifact:5,  todayCollect:4, todayCorrect:2, todayParticipated:true,  todayBattle:true,  todayBattleWon:true,  lastSync:'2026.06.02 10:08', categoryStats:{ plant:{correct:6,total:8},  animal:{correct:4,total:6},  artifact:{correct:2,total:3} } },
];

// ==========================================
// [한글 주석] 체험 모드 진입 — 비밀번호 모달
// ==========================================
function showDemoModeEntry() {
  const existing = document.getElementById('demo-entry-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'demo-entry-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.92);
    z-index:99999;
    display:flex;align-items:center;justify-content:center;
    padding:20px;animation:fadeIn 0.3s ease;`;

  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#0d1a30,#1a2e4a);
      border:2px solid #4a9eff;
      border-radius:22px;
      padding:28px 24px;
      max-width:320px;width:100%;
      text-align:center;
      box-shadow:0 0 40px rgba(74,158,255,0.25);
    ">
      <div style="font-size:40px;margin-bottom:10px;">🔍</div>
      <div style="color:#4a9eff;font-size:16px;font-weight:900;margin-bottom:6px;">체험 모드</div>
      <div style="color:#888;font-size:11px;margin-bottom:20px;">교사·심사위원 전용 체험 모드입니다</div>

      <input id="demo-pw-input" type="password" placeholder="비밀번호를 입력하세요"
        style="
          width:100%;box-sizing:border-box;
          background:rgba(255,255,255,0.06);
          border:1.5px solid #4a9eff;
          border-radius:10px;padding:12px 14px;
          color:#fff;font-size:14px;
          margin-bottom:8px;outline:none;
          text-align:center;letter-spacing:2px;
        "
        onkeydown="if(event.key==='Enter') _verifyDemoPassword();"
      />
      <div id="demo-pw-error" style="color:#ff8080;font-size:11px;min-height:16px;margin-bottom:10px;"></div>

      <button onclick="_verifyDemoPassword()" style="
        width:100%;
        background:linear-gradient(135deg,#1a3a5a,#4a9eff);
        border:none;border-radius:12px;
        padding:13px;color:#fff;
        font-size:14px;font-weight:700;cursor:pointer;
        margin-bottom:8px;
      ">✓ 확인</button>
      <button onclick="document.getElementById('demo-entry-overlay').remove();" style="
        width:100%;background:transparent;
        border:1px solid rgba(255,255,255,0.12);
        border-radius:10px;padding:10px;
        color:#666;font-size:12px;cursor:pointer;
      ">닫기</button>
    </div>`;

  document.body.appendChild(overlay);
  setTimeout(() => {
    const input = document.getElementById('demo-pw-input');
    if (input) input.focus();
  }, 100);
}

// [한글 주석] 비밀번호 검증
function _verifyDemoPassword() {
  const input = document.getElementById('demo-pw-input');
  const errEl = document.getElementById('demo-pw-error');
  if (!input) return;
  if (input.value === DEMO_PASSWORD) {
    document.getElementById('demo-entry-overlay').remove();
    _showDemoSelection();
  } else {
    if (errEl) errEl.textContent = '비밀번호가 틀렸어요.';
    input.value = '';
    input.focus();
  }
}

// ==========================================
// [한글 주석] 체험 모드 선택 화면
// ==========================================
function _showDemoSelection() {
  const overlay = document.createElement('div');
  overlay.id = 'demo-select-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.95);
    z-index:99999;
    display:flex;align-items:center;justify-content:center;
    padding:20px;animation:fadeIn 0.3s ease;`;

  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#0d1a30,#1a2e4a);
      border:2px solid #4a9eff;
      border-radius:22px;
      padding:28px 24px;
      max-width:340px;width:100%;
      box-shadow:0 0 40px rgba(74,158,255,0.25);
    ">
      <div style="text-align:center;margin-bottom:22px;">
        <div style="font-size:36px;margin-bottom:8px;">🔍</div>
        <div style="color:#4a9eff;font-size:15px;font-weight:900;margin-bottom:4px;">
          어떤 화면을 체험하시겠어요?
        </div>
        <div style="color:#666;font-size:11px;">모든 기능이 샘플 데이터로 동작합니다</div>
      </div>

      <!-- [한글 주석] 학생 체험 버튼 -->
      <button onclick="startStudentDemo()" style="
        width:100%;
        background:linear-gradient(135deg,#1a3a1a,#2d6a2d);
        border:1.5px solid #84ff00;
        border-radius:14px;padding:18px 16px;
        text-align:left;cursor:pointer;
        margin-bottom:12px;
      ">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="font-size:36px;">🧑🎓</div>
          <div>
            <div style="color:#84ff00;font-size:14px;font-weight:900;margin-bottom:3px;">
              학생 체험
            </div>
            <div style="color:#9ab89a;font-size:11px;line-height:1.6;">
              레벨 30 · 카드 300장 전부 수집<br>
              모든 아이템·카테고리 해금 상태
            </div>
          </div>
        </div>
      </button>

      <!-- [한글 주석] 교사 대시보드 체험 버튼 -->
      <button onclick="startTeacherDemo()" style="
        width:100%;
        background:linear-gradient(135deg,#1a2e1a,#1a3a5a);
        border:1.5px solid #4a9eff;
        border-radius:14px;padding:18px 16px;
        text-align:left;cursor:pointer;
        margin-bottom:20px;
      ">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="font-size:36px;">📊</div>
          <div>
            <div style="color:#4a9eff;font-size:14px;font-weight:900;margin-bottom:3px;">
              교사 대시보드 체험
            </div>
            <div style="color:#7a9ab8;font-size:11px;line-height:1.6;">
              샘플 학생 20명 데이터<br>
              모든 대시보드 기능 체험 가능
            </div>
          </div>
        </div>
      </button>

      <button onclick="document.getElementById('demo-select-overlay').remove();" style="
        width:100%;background:transparent;
        border:1px solid rgba(255,255,255,0.1);
        border-radius:10px;padding:10px;
        color:#555;font-size:12px;cursor:pointer;
      ">닫기</button>
    </div>`;

  document.body.appendChild(overlay);
}

// ==========================================
// [한글 주석] 학생 체험 모드 시작
// ==========================================
function startStudentDemo() {
  // [한글 주석] 체험용 사용자 데이터 설정
  localStorage.setItem('userData', JSON.stringify({
    class: '체험', number: '99', name: '데모계정'
  }));
  localStorage.setItem('isTeacher', 'false');
  localStorage.setItem('demoMode', 'true');

  // [한글 주석] 레벨 30 설정
  if (typeof saveCurrentLevel === 'function') saveCurrentLevel(30);
  localStorage.setItem('currentLevel', '30');

  // [한글 주석] 모든 카테고리 해금
  if (typeof setQuizPassed === 'function') {
    setQuizPassed('animal');
    setQuizPassed('artifact');
  }
  localStorage.setItem('quizPassed_animal', 'true');
  localStorage.setItem('quizPassed_artifact', 'true');
  localStorage.setItem('unlockedCategories', JSON.stringify(['plant','animal','artifact']));

  // [한글 주석] 카드 300장 전부 수집
  const allIds = [];
  for (let i = 1; i <= 100; i++) {
    const n = String(i).padStart(3, '0');
    allIds.push('plant_' + n, 'animal_' + n, 'artifact_' + n);
  }
  if (typeof saveCollection === 'function') saveCollection(allIds);
  localStorage.setItem('collection', JSON.stringify(allIds));

  // [한글 주석] 아이템 전체 해금
  localStorage.setItem('unlockedItems', 'all');

  // [한글 주석] 샘플 퀴즈 기록 (AI 분석 화면 체험용)
  const sampleHistory = [
    ...Array(8).fill(null).map(() => ({ type:'level_quiz', correct:true,  category:'plant',    ts:Date.now() })),
    ...Array(3).fill(null).map(() => ({ type:'level_quiz', correct:false, category:'plant',    ts:Date.now() })),
    ...Array(4).fill(null).map(() => ({ type:'level_quiz', correct:true,  category:'animal',   ts:Date.now() })),
    ...Array(4).fill(null).map(() => ({ type:'level_quiz', correct:false, category:'animal',   ts:Date.now() })),
    ...Array(2).fill(null).map(() => ({ type:'daily_quiz', correct:true,  category:'artifact', ts:Date.now() })),
    ...Array(5).fill(null).map(() => ({ type:'daily_quiz', correct:false, category:'artifact', ts:Date.now() })),
  ];
  localStorage.setItem('localQuizHistory', JSON.stringify(sampleHistory));

  // [한글 주석] 선택 화면 제거
  const sel = document.getElementById('demo-select-overlay');
  if (sel) sel.remove();

  // [한글 주석] 인트로 영상 건너뛰기 플래그 설정
  localStorage.setItem('demoSkipIntro', 'true');

  // [한글 주석] reload 후 app.js가 자동으로 체험 모드 진입 처리
  location.reload();
}

// ==========================================
// [한글 주석] 교사 대시보드 체험 모드 시작
// ==========================================
function startTeacherDemo() {
  // [한글 주석] 체험 모드 플래그 + 샘플 데이터 localStorage 저장
  localStorage.setItem('demoMode', 'true');
  localStorage.setItem('isTeacher', 'true');
  localStorage.setItem('teacherClass', '체험반');
  localStorage.setItem('demoStudents', JSON.stringify(DEMO_STUDENTS));

  // [한글 주석] 교사 대시보드 페이지로 이동
  location.href = 'teacher.html';
}

// ==========================================
// [한글 주석] 체험 모드 배너 (학생 앱 + 교사 대시보드 공통)
// ==========================================
function showDemoBanner() {
  // [한글 주석] 이미 있으면 중복 생성 방지
  if (document.getElementById('demo-mode-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'demo-mode-banner';
  banner.style.cssText = `
    position:fixed;top:0;left:0;right:0;
    background:linear-gradient(90deg,#0d1a30,#1a3a5a);
    border-bottom:1.5px solid #4a9eff;
    z-index:99997;
    display:flex;align-items:center;justify-content:center;
    padding:6px 16px;gap:12px;
    box-shadow:0 2px 12px rgba(74,158,255,0.3);`;

  banner.innerHTML = `
    <span style="font-size:13px;">🔍</span>
    <span style="color:#4a9eff;font-size:12px;font-weight:700;letter-spacing:0.5px;">
      체험 모드 (샘플 데이터)
    </span>
    <span style="color:#555;font-size:11px;">|</span>
    <button onclick="exitDemoMode()" style="
      background:rgba(255,68,68,0.15);
      border:1px solid #ff4444;
      border-radius:6px;
      color:#ff8080;font-size:11px;font-weight:700;
      padding:3px 10px;cursor:pointer;
    ">나가기 ✕</button>`;

  document.body.appendChild(banner);

  // [한글 주석] 배너 높이만큼 body 상단 여백 추가 (기존 레이아웃 밀림 방지)
  document.body.style.paddingTop = '34px';
}

// ==========================================
// [한글 주석] 체험 모드 종료
// ==========================================
function exitDemoMode() {
  // [한글 주석] 주입한 데모 데이터 전체 삭제
  const demoKeys = [
    'demoMode', 'demoStudents', 'isTeacher', 'teacherClass',
    'userData', 'currentLevel', 'collection',
    'quizPassed_animal', 'quizPassed_artifact', 'unlockedCategories',
    'unlockedItems', 'localQuizHistory', 'rewardBags',
    'dailyQuizTime', 'localQuizHistory'
  ];
  demoKeys.forEach(k => localStorage.removeItem(k));

  // [한글 주석] 로그인 화면으로 복귀
  location.href = 'index.html';
}

// ==========================================
// [한글 주석] 앱 시작 시 체험 모드 배너 체크 (index.html에서 호출)
// ==========================================
function checkDemoModeBanner() {
  if (localStorage.getItem('demoMode') === 'true') {
    // [한글 주석] 로그인 화면이 아닐 때만 배너 표시
    setTimeout(() => {
      const loginContainer = document.getElementById('login-container');
      const isLoginVisible = loginContainer &&
        loginContainer.style.display !== 'none' &&
        !loginContainer.classList.contains('hidden');
      if (!isLoginVisible) showDemoBanner();
    }, 800);
  }
}

// [한글 주석] 전역 노출
window.showDemoModeEntry  = showDemoModeEntry;
window.startStudentDemo   = startStudentDemo;
window.startTeacherDemo   = startTeacherDemo;
window.showDemoBanner     = showDemoBanner;
window.exitDemoMode       = exitDemoMode;
window.checkDemoModeBanner = checkDemoModeBanner;
window._verifyDemoPassword = _verifyDemoPassword;
