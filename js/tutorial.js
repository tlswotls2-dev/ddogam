// ==========================================
// [한글 주석] 튜토리얼 시스템 - 최초 로그인 시 한 번만 실행
// ==========================================

function isTutorialDone() {
  return localStorage.getItem('tutorialDone') === 'true';
}

function setTutorialDone() {
  localStorage.setItem('tutorialDone', 'true');
}

function startTutorial() {
  if (isTutorialDone()) return;
  _showTutorialStep(0);
}

// ==========================================
// [한글 주석] 튜토리얼 단계 정의
// ==========================================
const TUTORIAL_STEPS = [
  {
    // [한글 주석] 1단계: 탐험 버튼 하이라이트 (클릭 차단)
    targetSelector: '.btn-explore',
    message: '👟 탐험 버튼을 누르고\n걷다보면 카드가 나와요!',
    blockTarget: true,
    position: 'top',
    showSkip: true,
    showPrev: false,
    showNext: true
  },
  {
    // [한글 주석] 2단계: 카드 출현 + 자세히보기 하이라이트
    // [한글 주석] 카드 생성 후 tutorial-detail-btn을 하이라이트
    targetSelector: '#tutorial-detail-btn',
    message: '✨ 카드가 나타났어요!\n식물의 모습과 간단한 정보를\n볼 수 있어요.\n자세히 보기를 눌러봐요!',
    blockTarget: false,
    blockExtra: '#tutorial-close-btn', // [한글 주석] 확인 버튼 차단
    position: 'top-minimal',
    action: 'showTutorialCard',
    showSkip: false,
    showPrev: true,
    showNext: false,
    nextOnTargetClick: true
  },
  {
    // [한글 주석] 3단계: 확인 버튼 하이라이트
    targetSelector: '#tutorial-close-btn',
    message: '📚 더 많은 정보를 볼 수도\n있답니다. 확인을 누르세요.',
    blockTarget: false,
    position: 'top-minimal',
    showSkip: false,
    showPrev: true,
    showNext: false,
    nextOnTargetClick: true
  },
  {
    // [한글 주석] 4단계: 도움말 버튼 하이라이트 (클릭 차단, 팝업만 중앙)
    targetSelector: '#help-btn',
    message: '❓ 도움말 버튼이에요!\n게임 방법을 자세히 알 수 있어요.',
    blockTarget: true,
    position: 'center-only',
    showSkip: false,
    showPrev: false,
    showNext: true
  },
  {
    // [한글 주석] 마지막 단계: 마무리
    targetSelector: null,
    message: '🎉 튜토리얼 완료!\n더 자세한 게임 방법은\n도움말을 참고해요!\n\n이제 탐험을 시작해봐요! 🌿',
    blockTarget: false,
    position: 'center',
    showSkip: false,
    showPrev: false,
    showNext: false,
    isLast: true
  }
];

let _tutorialCurrentStep = 0;
let _tutorialAutoTimer = null;
let _tutorialCardData = null;
// [한글 주석] 차단된 버튼 전역 저장 (overlay 삭제 후에도 복구 가능)
let _tutorialBlockedEl = null;
let _tutorialTargetEl = null;

// ==========================================
// [한글 주석] 튜토리얼 단계 표시
// ==========================================
function _showTutorialStep(stepIdx) {
  _removeTutorialOverlay();

  if (stepIdx >= TUTORIAL_STEPS.length) {
    _endTutorial();
    return;
  }

  _tutorialCurrentStep = stepIdx;
  const step = TUTORIAL_STEPS[stepIdx];

  // [한글 주석] 카드 생성 액션 처리
  if (step.action === 'showTutorialCard') {
    _spawnTutorialCard();
    // [한글 주석] 카드 DOM 생성 후 300ms 뒤 다시 렌더링
    setTimeout(() => {
      const s = TUTORIAL_STEPS[stepIdx];
      const noActionStep = Object.assign({}, s, { action: null });
      TUTORIAL_STEPS[stepIdx] = noActionStep;
      _showTutorialStep(stepIdx);
      TUTORIAL_STEPS[stepIdx] = s;
    }, 300);
    return;
  }

  // [한글 주석] 타겟 요소 찾기 (selector 방식)
  let targetRect = null;
  let targetEl = null;
  if (step.targetSelector) {
    targetEl = document.querySelector(step.targetSelector);
    if (targetEl) targetRect = targetEl.getBoundingClientRect();
  }

  // [한글 주석] 타겟 전역 저장
  _tutorialTargetEl = targetEl;

  // [한글 주석] 추가 차단 버튼 처리
  _tutorialBlockedEl = null;
  if (step.blockExtra) {
    const blockedEl = document.querySelector(step.blockExtra);
    if (blockedEl) {
      blockedEl.style.pointerEvents = 'none';
      blockedEl.style.opacity = '0.4';
      _tutorialBlockedEl = blockedEl;
    }
  }

  // [한글 주석] 타겟 버튼 z-index + 클릭 가능 여부
  if (targetEl) {
    targetEl.style.zIndex = '999995';
    targetEl.style.pointerEvents = step.blockTarget ? 'none' : 'all';

    if (step.nextOnTargetClick) {
      const handler = () => {
        targetEl.removeEventListener('click', handler);
        // [한글 주석] _tutorialShowDetail이 자체적으로 다음단계 호출하므로
        // nextOnTargetClick은 자세히보기에만 쓰임 - 직접 호출 안 함
      };
      targetEl.addEventListener('click', handler);
    }
  }

  // [한글 주석] 오버레이 생성
  const overlay = document.createElement('div');
  overlay.id = 'tutorial-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    z-index:999990;pointer-events:none;
  `;

  // [한글 주석] SVG 마스크 - 타겟만 밝게
  if (targetRect && step.position !== 'center-only') {
    const p = 12;
    overlay.innerHTML = `
      <svg width="100%" height="100%"
        style="position:absolute;top:0;left:0;pointer-events:none;">
        <defs>
          <mask id="tutorial-mask">
            <rect width="100%" height="100%" fill="white"/>
            <rect x="${targetRect.left - p}"
                  y="${targetRect.top - p}"
                  width="${targetRect.width + p*2}"
                  height="${targetRect.height + p*2}"
                  fill="black" rx="16"/>
          </mask>
        </defs>
        <rect width="100%" height="100%"
          fill="rgba(0,0,0,0.78)"
          mask="url(#tutorial-mask)"/>
        <rect x="${targetRect.left - p - 2}"
              y="${targetRect.top - p - 2}"
              width="${targetRect.width + p*2 + 4}"
              height="${targetRect.height + p*2 + 4}"
              fill="none" stroke="#ffd700"
              stroke-width="2.5" rx="17" opacity="0.9"/>
      </svg>
    `;
  } else if (targetRect && step.position === 'center-only') {
    // [한글 주석] center-only: 실제 위치에 하이라이트, 팝업은 중앙
    const p = 12;
    overlay.innerHTML = `
      <svg width="100%" height="100%"
        style="position:absolute;top:0;left:0;pointer-events:none;">
        <defs>
          <mask id="tutorial-mask">
            <rect width="100%" height="100%" fill="white"/>
            <rect x="${targetRect.left - p}"
                  y="${targetRect.top - p}"
                  width="${targetRect.width + p*2}"
                  height="${targetRect.height + p*2}"
                  fill="black" rx="16"/>
          </mask>
        </defs>
        <rect width="100%" height="100%"
          fill="rgba(0,0,0,0.78)"
          mask="url(#tutorial-mask)"/>
        <rect x="${targetRect.left - p - 2}"
              y="${targetRect.top - p - 2}"
              width="${targetRect.width + p*2 + 4}"
              height="${targetRect.height + p*2 + 4}"
              fill="none" stroke="#ffd700"
              stroke-width="2.5" rx="17" opacity="0.9"/>
      </svg>
    `;
  } else {
    overlay.innerHTML = `
      <div style="
        position:absolute;top:0;left:0;right:0;bottom:0;
        background:rgba(0,0,0,0.55);pointer-events:none;
      "></div>
    `;
  }

  document.body.appendChild(overlay);

  // [한글 주석] 메시지 박 위치 결정
  let msgStyle = '';
  if (step.position === 'center' || !targetRect) {
    msgStyle = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);';
  } else if (step.position === 'center-only') {
    // [한글 주석] 팝업만 중앙 - 버튼은 원위치 하이라이트
    msgStyle = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);';
  } else if (step.position === 'top-minimal') {
    msgStyle = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);';
  } else if (step.position === 'top' && targetRect) {
    const t = Math.max(12, targetRect.top - 180);
    msgStyle = `position:fixed;top:${t}px;left:50%;transform:translateX(-50%);`;
  }

  // [한글 주석] 버튼들
  const skipBtn = step.showSkip ? `
    <button onclick="skipTutorial()" style="
      background:rgba(255,255,255,0.08);color:#888;
      border:1px solid #555;border-radius:10px;
      padding:8px 14px;font-size:11px;cursor:pointer;
      pointer-events:all;">건너뛰기</button>` : '';

  const prevBtn = step.showPrev ? `
    <button onclick="_prevTutorialStep()" style="
      background:rgba(255,255,255,0.08);color:#d4c89c;
      border:1px solid #6b8e3d;border-radius:10px;
      padding:8px 14px;font-size:11px;cursor:pointer;
      pointer-events:all;">← 이전</button>` : '';

  const nextBtn = step.showNext ? `
    <button onclick="_nextTutorialStep()" style="
      background:linear-gradient(135deg,#d4a017,#b3850e);
      color:#1e2e1f;border:none;border-radius:10px;
      padding:8px 18px;font-size:12px;font-weight:700;
      cursor:pointer;pointer-events:all;">다음 →</button>` : '';

  const lastBtn = step.isLast ? `
    <button onclick="_nextTutorialStep()" style="
      background:linear-gradient(135deg,#8db05c,#6b8e3d);
      color:#1e2e1f;border:none;border-radius:10px;
      padding:8px 24px;font-size:13px;font-weight:700;
      cursor:pointer;pointer-events:all;">시작하기! 🌿</button>` : '';

  // [한글 주석] 메시지 박스
  const msgBox = document.createElement('div');
  msgBox.id = 'tutorial-msg';
  msgBox.style.cssText = `
    ${msgStyle}
    z-index:999999;
    background:linear-gradient(135deg,#1e2e1f,#2c3e2d);
    border:2px solid #ffd700;border-radius:20px;
    padding:16px 18px;max-width:260px;width:85vw;
    box-shadow:0 0 30px rgba(255,215,0,0.3);
    text-align:center;animation:fadeIn 0.3s ease;
    pointer-events:all;
  `;

  msgBox.innerHTML = `
    <div style="color:#ffd700;font-size:10px;font-weight:700;
      letter-spacing:2px;margin-bottom:8px;opacity:0.8;">
      📋 튜토리얼 ${stepIdx + 1} / ${TUTORIAL_STEPS.length}
    </div>
    <div style="color:#f0e6c8;font-size:13px;line-height:1.8;
      white-space:pre-line;margin-bottom:12px;">
      ${step.message}
    </div>
    <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
      ${skipBtn}${prevBtn}${nextBtn}${lastBtn}
    </div>
    <div style="display:flex;gap:4px;justify-content:center;margin-top:10px;">
      ${TUTORIAL_STEPS.map((_, i) => `
        <div style="
          width:${i === stepIdx ? '14px' : '6px'};height:6px;
          background:${i === stepIdx ? '#ffd700' : 'rgba(255,255,255,0.2)'};
          border-radius:3px;"></div>
      `).join('')}
    </div>
  `;

  document.body.appendChild(msgBox);
}

// [한글 주석] 다음 단계
function _nextTutorialStep() {
  _showTutorialStep(_tutorialCurrentStep + 1);
}

// [한글 주석] 이전 단계
function _prevTutorialStep() {
  if (_tutorialCurrentStep > 0) {
    const cardPopup = document.getElementById('tutorial-card-popup');
    if (cardPopup) cardPopup.remove();
    const detailArea = document.getElementById('tutorial-detail-area');
    if (detailArea) detailArea.remove();
    _showTutorialStep(_tutorialCurrentStep - 1);
  }
}

// [한글 주석] 오버레이 + 스타일 완전 복구
function _removeTutorialOverlay() {
  // [한글 주석] 차단된 버튼 복구 (전역 변수 사용)
  if (_tutorialBlockedEl) {
    _tutorialBlockedEl.style.pointerEvents = '';
    _tutorialBlockedEl.style.opacity = '';
    _tutorialBlockedEl = null;
  }
  // [한글 주석] 타겟 버튼 스타일 복구
  if (_tutorialTargetEl) {
    _tutorialTargetEl.style.zIndex = '';
    _tutorialTargetEl.style.pointerEvents = '';
    _tutorialTargetEl = null;
  }
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) overlay.remove();
  const msg = document.getElementById('tutorial-msg');
  if (msg) msg.remove();
}

// [한글 주석] 건너뛰기
function skipTutorial() {
  _removeTutorialOverlay();
  const cardPopup = document.getElementById('tutorial-card-popup');
  if (cardPopup) cardPopup.remove();
  const detailArea = document.getElementById('tutorial-detail-area');
  if (detailArea) detailArea.remove();
  setTutorialDone();
}

// [한글 주석] 튜토리얼 종료
function _endTutorial() {
  _removeTutorialOverlay();
  setTutorialDone();
}

// ==========================================
// [한글 주석] 튜토리얼 전용 카드 강제 출현
// ==========================================
function _spawnTutorialCard() {
  const allCards = window.allCardsData || [];
  const plantCommon = allCards.filter(
    c => c.category === 'plant' && c.rarity === 'common'
  );
  if (plantCommon.length === 0) return;

  const card = plantCommon[Math.floor(Math.random() * plantCommon.length)];
  _tutorialCardData = card;

  const popup = document.createElement('div');
  popup.id = 'tutorial-card-popup';
  popup.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    z-index:999992;
    display:flex;align-items:center;justify-content:center;
    padding:20px;animation:fadeIn 0.4s ease;
  `;

  const imgHTML = typeof getCardImageHTML === 'function'
    ? getCardImageHTML(card, 110)
    : `<div style="font-size:56px;">${card.emoji || '🌿'}</div>`;

  popup.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1a2e1a,#0f1c0f);
      border:2px solid #8db05c;border-radius:24px;
      padding:24px 20px;max-width:300px;width:100%;
      text-align:center;
      box-shadow:0 0 40px rgba(141,176,92,0.4);
    ">
      <div style="color:#8db05c;font-size:11px;font-weight:700;margin-bottom:8px;">
        ★ 일반
      </div>
      <div style="
        width:120px;height:120px;margin:0 auto 12px;
        border-radius:16px;overflow:hidden;
        display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,0.2);border:2px solid #6b8e3d;
      ">${imgHTML}</div>
      <div style="color:#fff;font-size:20px;font-weight:900;margin-bottom:6px;">
        ${card.name}
      </div>
      <div style="color:#d4c89c;font-size:12px;line-height:1.6;margin-bottom:16px;">
        ${card.short_desc || ''}
      </div>
      <div style="color:#8db05c;font-size:11px;margin-bottom:20px;">
        📍 ${card.habitat || ''}
      </div>
      <div style="display:flex;gap:10px;">
        <button id="tutorial-close-btn"
          style="flex:1;background:rgba(255,255,255,0.08);
            color:#d4c89c;border:1px solid #6b8e3d;
            border-radius:12px;padding:11px;
            font-size:13px;cursor:pointer;">확인!</button>
        <button id="tutorial-detail-btn"
          onclick="_tutorialShowDetail()"
          style="flex:1.5;
            background:linear-gradient(135deg,#8db05c,#6b8e3d);
            color:#1e2e1f;border:none;
            border-radius:12px;padding:11px;
            font-size:13px;font-weight:700;cursor:pointer;">
          자세히 보기 ▶</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
}

// [한글 주석] 자세히 보기
function _tutorialShowDetail() {
  const card = _tutorialCardData;
  if (!card) return;

  // [한글 주석] 기존 오버레이/메시지 제거 후 3단계로
  _removeTutorialOverlay();
  _tutorialCurrentStep = 2; // [한글 주석] 3단계 인덱스

  const detailArea = document.createElement('div');
  detailArea.id = 'tutorial-detail-area';
  detailArea.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    z-index:999993;
    display:flex;align-items:center;justify-content:center;
    padding:20px;background:rgba(0,0,0,0.7);
    animation:fadeIn 0.3s ease;
  `;

  detailArea.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1a1a2e,#0f0f1c);
      border:2px solid #8db05c;border-radius:24px;
      padding:24px 20px;max-width:300px;width:100%;
      text-align:center;
      box-shadow:0 0 40px rgba(141,176,92,0.3);
    ">
      <div style="color:#8db05c;font-size:15px;font-weight:900;margin-bottom:12px;">
        ${card.name} 상세정보
      </div>
      <div style="
        color:#d4c89c;font-size:12px;line-height:1.8;
        text-align:left;background:rgba(0,0,0,0.2);
        border-radius:12px;padding:14px;margin-bottom:16px;
      ">${card.detail_desc || card.short_desc || ''}</div>
      <button id="tutorial-close-btn"
        onclick="_tutorialCloseDetail()"
        style="width:100%;
          background:linear-gradient(135deg,#8db05c,#6b8e3d);
          color:#1e2e1f;border:none;border-radius:12px;
          padding:12px;font-size:14px;font-weight:700;cursor:pointer;">
        확인!</button>
    </div>
  `;

  document.body.appendChild(detailArea);

  // [한글 주석] 3단계 렌더링 (확인 버튼 하이라이트)
  setTimeout(() => {
    _showTutorialStep(2);
  }, 200);
}

// [한글 주석] 튜토리얼 상세 닫기 (3단계 확인 버튼)
function _tutorialCloseDetail() {
  const detail = document.getElementById('tutorial-detail-area');
  if (detail) detail.remove();
  const popup = document.getElementById('tutorial-card-popup');
  if (popup) popup.remove();
  _showTutorialStep(3); // [한글 주석] 4단계로
}

// [한글 주석] 전역 노출
window.startTutorial = startTutorial;
window.skipTutorial = skipTutorial;
window._nextTutorialStep = _nextTutorialStep;
window._prevTutorialStep = _prevTutorialStep;
window._tutorialShowDetail = _tutorialShowDetail;
window._tutorialCloseDetail = _tutorialCloseDetail;
window.isTutorialDone = isTutorialDone;
