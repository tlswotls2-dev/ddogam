// ==========================================
// [한글 주석] WiFi 자동 동기화 및 오프라인 대기열 시스템 (sync.js)
// ==========================================

const SYNC_QUEUE_KEY = 'syncQueue'; // LocalStorage 키

// [한글 주석] Google Apps Script 웹 앱 배포 URL (하드코딩 연결)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHFQhpwzADLC6JHfMdo4aJ6lUwXW4OFwfKOsQsTQjr07QFX3JJE27xrAJHZ1Zj-KI8/exec';

/**
 * [한글 주석] 동기화 대기열에 새로운 이벤트를 추가합니다.
 * @param {string} eventType - 이벤트 종류 ('card_collected', 'quiz_passed' 등)
 * @param {Object} data - 저장할 세부 데이터
 */
function addToSyncQueue(eventType, data) {
  const queue = getSyncQueue();
  queue.push({
    id: Date.now(),           // 고유 ID
    type: eventType,          // 'card_collected', 'quiz_passed' 등
    data: data,               // 전송할 데이터
    timestamp: new Date().toISOString(), // 발생 시각
    synced: false             // 동기화 완료 여부
  });
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * [한글 주석] 로컬 저장소에서 현재의 동기화 대기열 전체를 가져옵니다.
 */
function getSyncQueue() {
  return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
}

/**
 * [한글 주석] 이미 성공적으로 동기화(synced: true)된 대기열 항목들을 정리합니다.
 */
function clearSyncedItems() {
  const queue = getSyncQueue().filter(item => !item.synced);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

// [한글 주석] 온라인(WiFi 연결) 시 자동 동기화 시작
window.addEventListener('online', () => {
  console.log('WiFi 연결됨 - 동기화 시작');
  showSyncToast('WiFi 연결됨! 데이터 동기화 중...', 'info');
  syncToServer();
});

// [한글 주석] 오프라인 전환 시 사용자 안내
window.addEventListener('offline', () => {
  console.log('오프라인 - 로컬 저장 모드');
  showSyncToast('오프라인 모드 - 데이터는 로컬에 저장됩니다', 'warning');
});

/**
 * [한글 주석] 대기 중인 모든 데이터를 Google Sheets (Apps Script) 서버로 안전하게 전송합니다.
 */
async function syncToServer() {
  // [한글 주석] 하드코딩된 SCRIPT_URL을 사용하여 대기열에서 동기화되지 않은 항목 필터링
  // [한글 주석] 미전송 항목 필터링 (카드 수집, 퀴즈 결과 등 모든 타입 포함)
  const queue = getSyncQueue().filter(item => !item.synced);
// [한글 주석] 큐가 비어있어도 학생 정보는 항상 서버에 등록
if (queue.length === 0) {
  // [한글 주석] 수집 데이터 없어도 학생 현황은 전송 (신규 로그인 등록용)
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  if (!userData.class || !userData.number) return;

  const collection = JSON.parse(localStorage.getItem('userCollection') || '[]');
  // [한글 주석] 오늘 날짜 기준 dailyStats 항목 가져오기 (신체활동 랭킹/기록용)
  const todayKeyForSync = (() => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  })();
  const allDailyStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
  const todayStats = allDailyStats[todayKeyForSync] || { steps: 0, kcal: 0, meters: 0, minutes: 0, cards: 0, quizCorrect: 0 };
  const payload = {
    type: 'sync',
    student: {
      class: userData.class,
      number: userData.number,
      name: userData.name || '',
      avatar: localStorage.getItem('selectedAvatar') || 'boy1_dodam'
    },
    events: [],
    totalCollection: {
      plant:    collection.filter(id => id.startsWith('plant_')).length,
      animal:   collection.filter(id => id.startsWith('animal_')).length,
      artifact: collection.filter(id => id.startsWith('artifact_')).length
    },
    steps: (() => {
      const pedData = JSON.parse(localStorage.getItem('pedometerData') || '{}');
      return pedData.steps || 0;
    })(),
    todayActivity: todayStats,
    syncTime: new Date().toISOString()
  };

  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));

  try {
    await fetch(SCRIPT_URL, { method: 'POST', body: formData });
    console.log('[동기화] 학생 현황 등록 완료');
  } catch (err) {
    console.log('[동기화] 학생 현황 등록 실패:', err);
  }
  return;
}

  // [한글 주석] 기존 userData에서 정보를 안전하게 추출
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const studentInfo = {
    class: userData.class || '',
    number: userData.number || '',
    name: userData.name || '',
    avatar: localStorage.getItem('selectedAvatar') || 'boy1_dodam'
  };

  // [한글 주석] 오늘 날짜 기준 dailyStats 항목 가져오기 (신체활동 랭킹/기록용)
  const todayKeyForQueueSync = (() => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  })();
  const allDailyStatsForQueue = JSON.parse(localStorage.getItem('dailyStats') || '{}');
  const todayStatsForQueue = allDailyStatsForQueue[todayKeyForQueueSync] || { steps: 0, kcal: 0, meters: 0, minutes: 0, cards: 0, quizCorrect: 0 };

  const payload = {
    type: 'sync',
    student: studentInfo,
    events: queue, // [한글 주석] 카드 수집 + 퀴즈 결과 모두 포함
    // [한글 주석] 기존 userCollection 스키마에 부합하도록 안전하게 필터링 카운트
    totalCollection: {
      plant: (JSON.parse(localStorage.getItem('userCollection') || '[]')).filter(id => id.startsWith('plant_')).length,
      animal: (JSON.parse(localStorage.getItem('userCollection') || '[]')).filter(id => id.startsWith('animal_')).length,
      artifact: (JSON.parse(localStorage.getItem('userCollection') || '[]')).filter(id => id.startsWith('artifact_')).length
    },
    steps: (() => {
        const pedData = JSON.parse(localStorage.getItem('pedometerData') || '{}');
        return pedData.steps || 0;
    })(),
    todayActivity: todayStatsForQueue,
    syncTime: new Date().toISOString()
  };

  // [한글 주석] CORS 회피를 위해 FormData 형식으로 전송
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      // 동기화 성공 - 대기열 초기화
      const currentQueue = getSyncQueue();
      currentQueue.forEach(item => item.synced = true);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(currentQueue));
      clearSyncedItems();
      showSyncToast('✅ 동기화 완료!', 'success');
      console.log('동기화 성공');
      
      // 선생님 보상 확인
      checkTeacherReward();
    }
  } catch (err) {
    console.log('동기화 실패 - 나중에 재시도:', err);
  }
}

/**
 * [한글 주석] 선생님이 학생에게 부여한 복주머니 보상을 조회합니다.
 */
async function checkTeacherReward() {
  if (!navigator.onLine) return;
  
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHFQhpwzADLC6JHfMdo4aJ6lUwXW4OFwfKOsQsTQjr07QFX3JJE27xrAJHZ1Zj-KI8/exec';
  
  // [한글 주석] 선생님 계정이면 보상 확인 안 함
  if (localStorage.getItem('isTeacher') === 'true') return;
  
  // [한글 주석] userData 키에서 학급/번호 읽기
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userClass = userData.class || '';
  const userNumber = userData.number || '';
  if (!userClass || !userNumber || userNumber === '0') return;
  
  try {
    const res = await fetch(
      `${SCRIPT_URL}?type=checkReward&class=${userClass}&number=${userNumber}`
    );
    const data = await res.json();
    console.log('[보상] 확인 결과:', data);
    
    if (data.hasReward && data.reward) {
      showRewardPopup(data.reward);
    }
  } catch(err) {
    console.log('[보상] 확인 실패:', err);
  }
}

/**
 * [한글 주석] 동기화 상태 변화 및 성공 여부를 알려주는 세련된 토스트 메시지
 */
function showSyncToast(message, type) {
  const colors = {
    info: '#4a9eff',
    warning: '#ff9500',
    success: '#84ff00',
    error: '#ff4444'
  };
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 80px; left: 50%;
    transform: translateX(-50%);
    background: ${colors[type] || '#333'};
    color: #000; padding: 10px 20px;
    border-radius: 20px; font-size: 13px;
    font-weight: bold; z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    opacity: 0; transition: opacity 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * [한글 주석] 선생님이 보낸 복주머니 보상 팝업을 즉시 표시하지 않고 대기열(가방)에 저장합니다.
 */
function showRewardPopup(reward) {
  // [한글 주석] 복주머니를 localStorage에 쌓기
  const bags = JSON.parse(localStorage.getItem('rewardBags') || '[]');
  bags.push({
    id: Date.now(),
    reward: reward,
    receivedAt: new Date().toLocaleString('ko-KR')
  });
  localStorage.setItem('rewardBags', JSON.stringify(bags));

  // [한글 주석] 아이템 탭 뱃지 숫자 업데이트
  if (typeof updateRewardBadge === 'function') updateRewardBadge();

  // [한글 주석] 진동 알림
  if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 500]);

  // [한글 주석] 기존 팝업 있으면 제거
  const existing = document.getElementById('reward-arrive-popup');
  if (existing) existing.remove();

  // [한글 주석] 화려한 보상 도착 팝업
  const popup = document.createElement('div');
  popup.id = 'reward-arrive-popup';
  popup.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.85);
    animation: rewardFadeIn 0.4s ease;
    backdrop-filter: blur(6px);
  `;

  const _T = window.LANG_UI; const _L = window.currentLang || 'ko';
  const _t = k => _T?.[_L]?.[k] || _T?.ko?.[k] || '';

  popup.innerHTML = `
    <style>
      @keyframes rewardFadeIn { from { opacity:0; } to { opacity:1; } }
      @keyframes rewardBounce {
        0%   { transform: scale(0.3) rotate(-10deg); opacity:0; }
        60%  { transform: scale(1.15) rotate(3deg); opacity:1; }
        80%  { transform: scale(0.95) rotate(-2deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes rewardShine {
        0%   { left: -100%; }
        100% { left: 200%; }
      }
      @keyframes rewardPulse {
        0%, 100% { box-shadow: 0 0 20px rgba(255,215,0,0.4), 0 0 60px rgba(255,215,0,0.2); }
        50%       { box-shadow: 0 0 40px rgba(255,215,0,0.8), 0 0 100px rgba(255,215,0,0.4); }
      }
      @keyframes rewardFloat {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-8px); }
      }
      @keyframes rewardStar {
        0%   { transform: scale(0) rotate(0deg); opacity:1; }
        100% { transform: scale(1.5) rotate(180deg); opacity:0; }
      }
      #reward-arrive-card {
        animation: rewardBounce 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards,
                   rewardPulse 2s ease-in-out 0.6s infinite;
      }
      #reward-bag-icon {
        animation: rewardFloat 1.5s ease-in-out infinite;
        display: inline-block;
      }
    </style>

    <!-- [한글 주석] 파티클 별 효과 -->
    <div style="position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden;">
      ${Array.from({length:12}).map((_,i) => `
        <div style="
          position:absolute;
          left:${Math.random()*100}%;
          top:${Math.random()*100}%;
          font-size:${16+Math.random()*20}px;
          animation: rewardStar ${0.8+Math.random()*1.2}s ease-out ${Math.random()*0.5}s forwards;
          pointer-events:none;
        ">${['⭐','✨','🌟','💫','🎊','🎉'][Math.floor(Math.random()*6)]}</div>
      `).join('')}
    </div>

    <!-- [한글 주석] 메인 카드 -->
    <div id="reward-arrive-card" style="
      background: linear-gradient(135deg, #1a1000, #2a1f00, #1a1000);
      border: 3px solid #ffd700;
      border-radius: 28px;
      padding: 32px 28px;
      max-width: 300px;
      width: 85%;
      text-align: center;
      position: relative;
      overflow: hidden;
    ">
      <!-- [한글 주석] 빛나는 효과 -->
      <div style="
        position:absolute;
        top:0; left:-100%;
        width:60%; height:100%;
        background: linear-gradient(90deg, transparent, rgba(255,215,0,0.3), transparent);
        animation: rewardShine 1.5s ease 0.6s 2;
        pointer-events:none;
        transform: skewX(-20deg);
      "></div>

      <!-- [한글 주석] 상단 라벨 -->
      <div style="
        background: linear-gradient(135deg, #ffd700, #ff9500);
        color: #000;
        font-size: 11px;
        font-weight: 900;
        padding: 4px 14px;
        border-radius: 20px;
        display: inline-block;
        margin-bottom: 16px;
        letter-spacing: 1px;
      ">🎁 ${_t('rewardArriveLabel') || '선생님의 선물 도착!'}</div>

      <!-- [한글 주석] 복주머니 아이콘 -->
      <div id="reward-bag-icon" style="font-size:72px;margin-bottom:12px;line-height:1;">🎁</div>

      <!-- [한글 주석] 메시지 -->
      <div style="color:#ffd700;font-size:20px;font-weight:900;margin-bottom:8px;">
        ${_t('rewardArriveTitle') || '복주머니가 도착했어요!'}
      </div>
      <div style="color:#d4c89c;font-size:13px;line-height:1.7;margin-bottom:24px;">
        ${_t('rewardArriveDesc') || '아이템 → 복주머니 탭에서<br>열어보세요! 🌟'}
      </div>

      <!-- [한글 주석] 확인 버튼 -->
      <button onclick="document.getElementById('reward-arrive-popup').remove();" style="
        width: 100%;
        background: linear-gradient(135deg, #ffd700, #ff9500);
        color: #000;
        border: none;
        border-radius: 14px;
        padding: 14px;
        font-size: 16px;
        font-weight: 900;
        cursor: pointer;
        letter-spacing: 0.5px;
      ">✨ ${_t('rewardArriveBtn') || '확인!'}</button>
    </div>
  `;

  document.body.appendChild(popup);

  // [한글 주석] 10초 후 자동 닫기
  setTimeout(() => {
    const p = document.getElementById('reward-arrive-popup');
    if (p) p.remove();
  }, 10000);
}

// [한글 주석] 온라인 상태이고 Service Worker 활성화된 경우 이미지 캐시
async function triggerImageCache() {
  if (!navigator.onLine) return;
  
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg || !reg.active) return;
  
  // [한글 주석] 이미 캐시됐는지 확인
  const cache = await caches.open('ttogam-images-v1');
  const keys = await cache.keys();
  const imagesCached = keys.filter(k => k.url.includes('/images/')).length;
  
  if (imagesCached >= 300) {
    console.log('[캐시] 이미지 300장 이미 캐시됨');
    return;
  }
  
  console.log(`[캐시] 이미지 캐시 시작 (현재 ${imagesCached}/300)`);
  showSyncToast('📥 이미지 다운로드 중... (오프라인 대비)', 'info');
  
  // [한글 주석] Service Worker에 캐시 요청
  reg.active.postMessage('cacheImages');
  
  // [한글 주석] 진행상황 수신
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'cacheProgress') {
      const { cached, total } = event.data;
      if (cached === total) {
        const _Ts = window.LANG_UI; const _Ls = window.currentLang || 'ko';
        showSyncToast(_Ts?.[_Ls]?.imagesCached || '✅ 이미지 300장 저장 완료! 오프라인에서도 볼 수 있어요', 'success');
      }
    }
  });
}

// [한글 주석] 보상 확인 인터벌 (30초)
let rewardCheckInterval = null;

/**
 * [한글 주석] 백그라운드에서 30초마다 보상을 지속적으로 확인합니다.
 */
function startRewardPolling() {
  // [한글 주석] 기존 인터벌 완전 제거 후 재시작 (중복 방지)
  if (rewardCheckInterval) {
    clearInterval(rewardCheckInterval);
    rewardCheckInterval = null;
  }
  
  rewardCheckInterval = setInterval(() => {
    if (navigator.onLine) {
      checkTeacherReward();
    }
  }, 30000); // [한글 주석] 30초마다 보상 확인
  
  console.log('[보상] 30초마다 보상 확인 시작');
}

/**
 * [한글 주석] 앱 구동 시 동기화 초기화
 */
function initSync() {
  if (navigator.onLine) {
    setTimeout(syncToServer, 2000); // [한글 주석] 2초 후 동기화
  }
  
  const pendingCount = getSyncQueue().filter(i => !i.synced).length;
  if (pendingCount > 0) {
    console.log(`미동기화 데이터 ${pendingCount}개 대기 중`);
  }

  // [한글 주석] 앱 시작 시 이미지 캐시 트리거 (3초 후 시작)
  setTimeout(triggerImageCache, 3000);
  
  // [한글 주석] 기존 인터벌 정리
  if (rewardCheckInterval) {
    clearInterval(rewardCheckInterval);
    rewardCheckInterval = null;
  }
  
  // [한글 주석] 30초마다 선생님 보상 자동 확인 시작
  startRewardPolling();
}

// 전역으로 노출
window.addToSyncQueue = addToSyncQueue;
window.syncToServer = syncToServer;
window.initSync = initSync;
