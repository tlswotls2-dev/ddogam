// ==========================================
// [한글 주석] 튜토리얼 시스템
// 최초 로그인 시 한 번만 실행
// ==========================================

// [한글 주석] 튜토리얼 완료 여부 확인
function isTutorialDone() {
  return localStorage.getItem('tutorialDone') === 'true';
}

// [한글 주석] 튜토리얼 완료 저장
function setTutorialDone() {
  localStorage.setItem('tutorialDone', 'true');
}

// [한글 주석] 튜토리얼 시작 (최초 로그인 시 호출)
function startTutorial() {
  if (isTutorialDone()) return;
  _showTutorialStep(0);
}

// ==========================================
// [한글 주석] 튜토리얼 단계 정의
// ==========================================
// [한글 주석] 튜토리얼 단계 - 모든 단계 다음 버튼으로 진행 (자동 진행 autoNext 제거)
const TUTORIAL_STEPS = [
  {
    // [한글 주석] 1단계: 탐험 버튼 안내
    targetId: 'btn-explore',
    message: '👟 탐험 버튼을 눌러봐요!\n걷다 보면 카드가 나타나요.',
    clickToNext: false,
    blockOthers: false,
    position: 'top'
  },
  {
    // [한글 주석] 2단계: 걷기 안내
    targetId: null,
    message: '🚶 스마트기기를 들고\n주변을 걸으면 카드가 나타나요!\n튜토리얼에서는 바로 보여드릴게요.',
    clickToNext: false,
    blockOthers: false,
    position: 'center'
  },
  {
    // [한글 주석] 3단계: 카드 강제 출현
    targetId: null,
    message: '✨ 카드가 나타났어요!\n식물의 모습과 간단한 정보를\n볼 수 있어요.',
    clickToNext: false,
    blockOthers: false,
    position: 'center',
    action: 'showTutorialCard'
  },
  {
    // [한글 주석] 4단계: 자세히 보기 버튼 하이라이트
    targetId: 'btn-detail',
    message: '📖 자세히 보기를 누르면\n더 많은 정보를 볼 수 있어요!',
    clickToNext: false,
    blockOthers: false,
    position: 'top'
  },
  {
    // [한글 주석] 5단계: 자세한 정보 안내
    targetId: null,
    message: '📚 카드의 자세한 정보도\n이렇게 확인할 수 있어요!',
    clickToNext: false,
    blockOthers: false,
    position: 'top'
  },
  {
    // [한글 주석] 6단계: 닫기 버튼 하이라이트
    targetId: 'btn-close',
    message: '✅ 확인 버튼으로\n카드를 닫을 수 있어요!',
    clickToNext: false,
    blockOthers: false,
    position: 'top'
  },
  {
    // [한글 주석] 7단계: 도움말 버튼 안내
    targetId: 'help-btn',
    message: '❓ 도움말 버튼이에요!\n게임 방법을 자세히 알 수 있어요.',
    clickToNext: false,
    blockOthers: false,
    position: 'right'
  },
  {
    // [한글 주석] 8단계: 마무리
    targetId: null,
    message: '🎉 튜토리얼 완료!\n더 자세한 게임 방법은\n도움말을 참고해요!\n\n이제 탐험을 시작해봐요! 🌿',
    clickToNext: false,
    blockOthers: false,
    position: 'center',
    isLast: true
  }
];

let _tutorialCurrentStep = 0;
let _tutorialAutoTimer = null;
let _tutorialCardData = null;

// ==========================================
// [한글 주석] 튜토리얼 단계 표시
// ==========================================
function _showTutorialStep(stepIdx) {
  // [한글 주석] 기존 오버레이 제거
  _removeTutorialOverlay();

  if (stepIdx >= TUTORIAL_STEPS.length) {
    _endTutorial();
    return;
  }

  _tutorialCurrentStep = stepIdx;
  const step = TUTORIAL_STEPS[stepIdx];

  // [한글 주석] 액션 처리 (카드 강제 출현 등)
  if (step.action === 'showTutorialCard') {
    _spawnTutorialCard();
  }

  // [한글 주석] 타겟 요소 위치 계산
  let targetRect = null;
  if (step.targetId) {
    // [한글 주석] id로 먼저 찾고 없으면 class로 찾기
    const el = document.getElementById(step.targetId)
      || document.querySelector('.' + step.targetId);
    if (el) targetRect = el.getBoundingClientRect();
  }

  // [한글 주석] 오버레이 생성
  const overlay = document.createElement('div');
  overlay.id = 'tutorial-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    z-index:999990;
    pointer-events:${step.blockOthers ? 'all' : 'none'};
  `;

  // [한글 주석] SVG 마스크로 타겟만 밝게 표시
  if (targetRect) {
    const padding = 12;
    const rx = targetRect.left - padding;
    const ry = targetRect.top - padding;
    const rw = targetRect.width + padding * 2;
    const rh = targetRect.height + padding * 2;

    overlay.innerHTML = `
      <svg width="100%" height="100%" style="position:absolute;top:0;left:0;">
        <defs>
          <mask id="tutorial-mask">
            <rect width="100%" height="100%" fill="white"/>
            <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}"
              fill="black" rx="16"/>
          </mask>
        </defs>
        <rect width="100%" height="100%"
          fill="rgba(0,0,0,0.78)"
          mask="url(#tutorial-mask)"/>
        <rect x="${rx - 2}" y="${ry - 2}" width="${rw + 4}" height="${rh + 4}"
          fill="none"
          stroke="#ffd700"
          stroke-width="2.5"
          rx="17"
          opacity="0.9"/>
      </svg>
    `;
  } else {
    // [한글 주석] 타겟 없으면 전체 어둡게
    overlay.innerHTML = `
      <div style="
        position:absolute;top:0;left:0;right:0;bottom:0;
        background:rgba(0,0,0,0.55);
      "></div>
    `;
  }

  document.body.appendChild(overlay);

  // [한글 주석] 말풍선 메시지 박스
  const msgBox = document.createElement('div');
  msgBox.id = 'tutorial-msg';

  // [한글 주석] 메시지 위치 결정
  let msgStyle = '';
  if (step.position === 'center' || !targetRect) {
    msgStyle = `
      position:fixed;
      top:50%;left:50%;
      transform:translate(-50%,-50%);
    `;
  } else if (step.position === 'top' && targetRect) {
    // [한글 주석] 타겟 위에 표시
    const msgTop = Math.max(10, targetRect.top - 160);
    msgStyle = `
      position:fixed;
      top:${msgTop}px;
      left:50%;
      transform:translateX(-50%);
    `;
  } else if (step.position === 'right' && targetRect) {
    msgStyle = `
      position:fixed;
      top:${targetRect.top}px;
      left:${Math.min(targetRect.right + 12, window.innerWidth - 220)}px;
    `;
  }

  const isLast = step.isLast;
  const canSkip = stepIdx < TUTORIAL_STEPS.length - 1;

  msgBox.style.cssText = `
    ${msgStyle}
    z-index:999999;
    background:linear-gradient(135deg,#1e2e1f,#2c3e2d);
    border:2px solid #ffd700;
    border-radius:20px;
    padding:18px 20px;
    max-width:260px;
    width:85vw;
    box-shadow:0 0 30px rgba(255,215,0,0.3);
    text-align:center;
    animation:fadeIn 0.3s ease;
  `;

  msgBox.innerHTML = `
    <!-- [한글 주석] 튜토리얼 헤더 -->
    <div style="
      color:#ffd700;font-size:11px;font-weight:700;
      letter-spacing:2px;margin-bottom:10px;
      opacity:0.8;
    ">📋 튜토리얼 ${stepIdx + 1} / ${TUTORIAL_STEPS.length}</div>

    <div style="
      color:#f0e6c8;font-size:13px;
      line-height:1.8;white-space:pre-line;
      margin-bottom:14px;
    ">${step.message}</div>

    <div style="display:flex;gap:8px;justify-content:center;">
      ${canSkip ? `
        <button onclick="skipTutorial()" style="
          background:rgba(255,255,255,0.08);
          color:#888;border:1px solid #555;
          border-radius:10px;padding:8px 14px;
          font-size:11px;cursor:pointer;
        ">건너뛰기</button>
      ` : ''}
      ${step.clickToNext ? '' : `
        <button onclick="_nextTutorialStep()" style="
          background:linear-gradient(135deg,#d4a017,#b3850e);
          color:#1e2e1f;border:none;
          border-radius:10px;padding:8px 18px;
          font-size:12px;font-weight:700;cursor:pointer;
        ">${isLast ? '시작하기! 🌿' : '다음 →'}</button>
      `}
    </div>

    <!-- [한글 주석] 진행 표시 -->
    <div style="
      display:flex;gap:4px;justify-content:center;
      margin-top:10px;
    ">
      ${TUTORIAL_STEPS.map((_, i) => `
        <div style="
          width:${i === stepIdx ? '14px' : '6px'};height:6px;
          background:${i === stepIdx ? '#ffd700' : 'rgba(255,255,255,0.2)'};
          border-radius:3px;
          transition:all 0.3s;
        "></div>
      `).join('')}
    </div>
  `;

  document.body.appendChild(msgBox);

  // [한글 주석] 타겟 버튼 클릭 시 다음 단계로
  if (step.clickToNext && step.targetId) {
    // [한글 주석] id로 먼저 찾고 없으면 class로 찾기
    const targetEl = document.getElementById(step.targetId)
      || document.querySelector('.' + step.targetId);
    if (targetEl) {
      targetEl.style.position = 'relative';
      targetEl.style.zIndex = '999995';
      targetEl.style.pointerEvents = 'all';

      const handler = () => {
        targetEl.removeEventListener('click', handler);
        targetEl.style.zIndex = '';
        targetEl.style.pointerEvents = '';
        setTimeout(() => _nextTutorialStep(), 400);
      };
      targetEl.addEventListener('click', handler);
      // [한글 주석] 핸들러 저장 (cleanup용)
      overlay._targetHandler = { el: targetEl, fn: handler };
    }
  }

  // [한글 주석] 자동 다음 단계
  if (step.autoNext) {
    _tutorialAutoTimer = setTimeout(() => {
      _nextTutorialStep();
    }, step.autoNext);
  }
}

// [한글 주석] 다음 단계로
function _nextTutorialStep() {
  if (_tutorialAutoTimer) {
    clearTimeout(_tutorialAutoTimer);
    _tutorialAutoTimer = null;
  }
  _showTutorialStep(_tutorialCurrentStep + 1);
}

// [한글 주석] 오버레이 제거
function _removeTutorialOverlay() {
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) {
    if (overlay._targetHandler) {
      overlay._targetHandler.el.removeEventListener(
        'click', overlay._targetHandler.fn
      );
    }
    overlay.remove();
  }
  const msg = document.getElementById('tutorial-msg');
  if (msg) msg.remove();
}

// [한글 주석] 튜토리얼 건너뛰기
function skipTutorial() {
  if (_tutorialAutoTimer) {
    clearTimeout(_tutorialAutoTimer);
    _tutorialAutoTimer = null;
  }
  _removeTutorialOverlay();
  // [한글 주석] 튜토리얼 카드 팝업 닫기
  const cardPopup = document.getElementById('tutorial-card-popup');
  if (cardPopup) cardPopup.remove();
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
  // [한글 주석] 식물 일반 카드 중 랜덤 1개 선택
  const allCards = window.allCardsData || [];
  const plantCommon = allCards.filter(
    c => c.category === 'plant' && c.rarity === 'common'
  );
  if (plantCommon.length === 0) return;

  const card = plantCommon[Math.floor(Math.random() * plantCommon.length)];
  _tutorialCardData = card;

  // [한글 주석] 카드 팝업 생성
  const popup = document.createElement('div');
  popup.id = 'tutorial-card-popup';
  popup.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    z-index:999992;
    display:flex;align-items:center;justify-content:center;
    padding:20px;
    animation:fadeIn 0.4s ease;
  `;

  const imgHTML = typeof getCardImageHTML === 'function'
    ? getCardImageHTML(card, 110)
    : `<div style="font-size:56px;">${card.emoji || '🌿'}</div>`;

  popup.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1a2e1a,#0f1c0f);
      border:2px solid #8db05c;
      border-radius:24px;
      padding:24px 20px;
      max-width:300px;width:100%;
      text-align:center;
      box-shadow:0 0 40px rgba(141,176,92,0.4);
    ">
      <!-- [한글 주석] 희귀도 -->
      <div style="color:#8db05c;font-size:11px;font-weight:700;margin-bottom:8px;">
        ★ 일반
      </div>

      <!-- [한글 주석] 카드 이미지 -->
      <div style="
        width:120px;height:120px;
        margin:0 auto 12px;
        border-radius:16px;overflow:hidden;
        display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,0.2);
        border:2px solid #6b8e3d;
      ">${imgHTML}</div>

      <!-- [한글 주석] 카드 이름 -->
      <div style="color:#fff;font-size:20px;font-weight:900;margin-bottom:6px;">
        ${card.name}
      </div>

      <!-- [한글 주석] 짧은 설명 -->
      <div style="color:#d4c89c;font-size:12px;line-height:1.6;margin-bottom:16px;">
        ${card.short_desc || ''}
      </div>

      <!-- [한글 주석] 서식지 -->
      <div style="color:#8db05c;font-size:11px;margin-bottom:20px;">
        📍 ${card.habitat || ''}
      </div>

      <!-- [한글 주석] 버튼들 -->
      <div style="display:flex;gap:10px;">
        <button
          id="tutorial-close-btn"
          onclick="_tutorialCloseCard()"
          style="
            flex:1;
            background:rgba(255,255,255,0.08);
            color:#d4c89c;border:1px solid #6b8e3d;
            border-radius:12px;padding:11px;
            font-size:13px;cursor:pointer;
          ">확인!</button>
        <button
          id="tutorial-detail-btn"
          onclick="_tutorialShowDetail()"
          style="
            flex:1.5;
            background:linear-gradient(135deg,#8db05c,#6b8e3d);
            color:#1e2e1f;border:none;
            border-radius:12px;padding:11px;
            font-size:13px;font-weight:700;cursor:pointer;
          ">자세히 보기 ▶</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
}

// [한글 주석] 튜토리얼 카드 자세히 보기
function _tutorialShowDetail() {
  const card = _tutorialCardData;
  if (!card) return;

  const detailArea = document.createElement('div');
  detailArea.id = 'tutorial-detail-area';
  detailArea.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    z-index:999993;
    display:flex;align-items:center;justify-content:center;
    padding:20px;
    background:rgba(0,0,0,0.7);
    animation:fadeIn 0.3s ease;
  `;

  detailArea.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1a1a2e,#0f0f1c);
      border:2px solid #8db05c;
      border-radius:24px;
      padding:24px 20px;
      max-width:300px;width:100%;
      text-align:center;
      box-shadow:0 0 40px rgba(141,176,92,0.3);
    ">
      <div style="color:#8db05c;font-size:15px;font-weight:900;margin-bottom:12px;">
        ${card.name} 상세정보
      </div>
      <div style="
        color:#d4c89c;font-size:12px;
        line-height:1.8;text-align:left;
        background:rgba(0,0,0,0.2);
        border-radius:12px;padding:14px;
        margin-bottom:16px;
      ">
        ${card.detail_desc || card.short_desc || ''}
      </div>
      <button
        id="tutorial-close-btn"
        onclick="_tutorialCloseDetail()"
        style="
          width:100%;
          background:linear-gradient(135deg,#8db05c,#6b8e3d);
          color:#1e2e1f;border:none;border-radius:12px;
          padding:12px;font-size:14px;font-weight:700;cursor:pointer;
        ">확인!</button>
    </div>
  `;

  document.body.appendChild(detailArea);

  // [한글 주석] 상세 보기 후 다음 단계
  _nextTutorialStep();
}

// [한글 주석] 튜토리얼 카드 닫기
function _tutorialCloseCard() {
  // [한글 주석] 이 버튼 클릭은 7단계(닫기 버튼) 에서만 동작
  const popup = document.getElementById('tutorial-card-popup');
  if (popup) popup.remove();
  _nextTutorialStep();
}

// [한글 주석] 튜토리얼 상세 닫기
function _tutorialCloseDetail() {
  const detail = document.getElementById('tutorial-detail-area');
  if (detail) detail.remove();
  const popup = document.getElementById('tutorial-card-popup');
  if (popup) popup.remove();
  _nextTutorialStep();
}

// [한글 주석] 전역 노출
window.startTutorial = startTutorial;
window.skipTutorial = skipTutorial;
window._nextTutorialStep = _nextTutorialStep;
window._tutorialShowDetail = _tutorialShowDetail;
window._tutorialCloseCard = _tutorialCloseCard;
window._tutorialCloseDetail = _tutorialCloseDetail;
window.isTutorialDone = isTutorialDone;
