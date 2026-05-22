// js/quiz.js
// [한글 주석] 카테고리 해금 퀴즈 시스템은 레벨업 퀴즈로 대체됨
// [한글 주석] 레벨 5 → 동물 해금, 레벨 10 → 유물 해금 (storage.js 참고)

// --- 퀴즈 설정 상수 ---
const QUIZ_PASS_SCORE = 3;    // 통과 기준 정답 수 (5문제 중 3문제 이상 정답 시 통과)
const QUIZ_QUESTION_COUNT = 5; // 한 번의 퀴즈에서 출제되는 문제 수

// --- 퀴즈 상태 변수 ---
let currentQuizCategory = ''; // 현재 진행 중인 퀴즈의 목적 카테고리 (animal 또는 artifact)
let currentQuestions = [];    // 현재 진행 중인 5개의 문제 목록 (랜덤 선택 + 보기 셔플 완료된 상태)
let currentQuestionIndex = 0; // 현재 풀고 있는 문제 번호 (0~4)
let currentScore = 0;         // 현재까지 맞춘 정답 개수
let quizData = null;          // quiz.json에서 불러온 전체 문제은행 데이터

/**
 * 앱 시작 시 quiz.json에서 문제은행 데이터를 불러옵니다.
 * 캐시 버스팅을 적용하여 항상 최신 데이터를 가져옵니다.
 */
async function loadQuizData() {
    try {
        // [한글 주석] 브라우저 캐시로 인해 이전 버전의 퀴즈 데이터가 로드되는 것을 방지하기 위해
        // 타임스탬프 기반 캐시 버스팅 파라미터를 추가합니다.
        const response = await fetch('data/quiz.json?v=' + Date.now());
        quizData = await response.json();
        console.log(`퀴즈 데이터 로드 완료: 식물 ${quizData.plant.length}문제, 동물 ${quizData.animal.length}문제`);
    } catch (error) {
        console.error("퀴즈 데이터를 불러오는데 실패했습니다.", error);
    }
}

/**
 * 배열을 Fisher-Yates 알고리즘으로 무작위로 섞습니다.
 * Math.random() 기반의 sort보다 균일한 분포를 보장합니다.
 * @param {Array} array - 섞을 배열 (원본이 변경됨)
 * @returns {Array} 섞인 배열
 */
function shuffleArray(array) {
    // [한글 주석] 배열의 뒤쪽부터 순회하며 랜덤 위치의 요소와 교환하는 Fisher-Yates 셔플 알고리즘
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 구조분해 할당으로 요소 교환
    }
    return array;
}

/**
 * 퀴즈 화면을 띄우고 퀴즈를 시작합니다.
 * 20개 문제은행에서 랜덤으로 5개를 선택하고, 각 문제의 보기 순서도 랜덤으로 섞습니다.
 * @param {string} targetCategory - 해금하려는 카테고리 ('animal' 또는 'artifact')
 */
function startQuiz(targetCategory) {
    // 퀴즈 데이터가 아직 로드되지 않은 경우 안내
    if (!quizData) {
        alert("퀴즈 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    // 퀴즈 상태 초기화
    currentQuizCategory = targetCategory;
    currentScore = 0;
    currentQuestionIndex = 0;

    // [한글 주석] 해금 목표에 맞는 퀴즈 문제 풀(카테고리) 선택
    // 동물을 해금하려면 → 식물 퀴즈를 풀어야 함
    // 유물을 해금하려면 → 동물 퀴즈를 풀어야 함
    const questionCategory = targetCategory === 'animal' ? 'plant' : 'animal';
    
    // [한글 주석] 해당 카테고리의 전체 문제은행(20문제)을 복사한 뒤 무작위로 섞기
    const allQuestions = [...quizData[questionCategory]];
    shuffleArray(allQuestions);
    
    // [한글 주석] 섞인 문제 중 앞에서 5개만 선택 (QUIZ_QUESTION_COUNT = 5)
    const selectedQuestions = allQuestions.slice(0, QUIZ_QUESTION_COUNT);

    // [한글 주석] 선택된 5개 문제 각각의 보기(options) 순서를 랜덤으로 섞고,
    // 정답 인덱스(answer)를 섞인 순서에 맞게 재계산합니다.
    currentQuestions = selectedQuestions.map(q => {
        // 원본 정답 텍스트를 미리 저장
        const correctAnswerText = q.options[q.answer];
        
        // 보기 배열을 복사한 뒤 무작위로 섞기
        const shuffledOptions = [...q.options];
        shuffleArray(shuffledOptions);
        
        // 섞인 보기 배열에서 정답 텍스트의 새로운 위치(인덱스)를 찾아 재계산
        const newAnswerIndex = shuffledOptions.indexOf(correctAnswerText);
        
        // 문제 객체를 새로운 보기 순서와 재계산된 정답 인덱스로 반환
        return {
            ...q,                        // 기존 문제 데이터(id, question, hint, related_card 등) 유지
            options: shuffledOptions,     // 섞인 보기 배열로 교체
            answer: newAnswerIndex        // 재계산된 정답 인덱스로 교체
        };
    });

    // UI 초기화 및 화면 표시
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'block';
    
    const quizScreen = document.getElementById('quiz-screen');
    quizScreen.style.display = 'flex';
    
    // 부드러운 슬라이드 인 애니메이션 적용
    setTimeout(() => {
        quizScreen.classList.add('slide-in');
    }, 10);

    // 첫 문제 렌더링
    renderQuestion();
}

/**
 * 현재 문제를 화면에 표시합니다.
 * 보기는 이미 startQuiz에서 섞여있으므로 그대로 출력합니다.
 */
function renderQuestion() {
    // 5문제를 다 풀었으면 결과 화면 표시
    if (currentQuestionIndex >= currentQuestions.length) {
        showQuizResult();
        return;
    }

    const q = currentQuestions[currentQuestionIndex];
    
    // 진행도 및 문제 텍스트 세팅
    document.getElementById('quiz-progress').textContent = `${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    document.getElementById('quiz-question').textContent = q.question;
    document.getElementById('quiz-hint-text').textContent = q.hint;
    document.getElementById('quiz-hint-text').style.display = 'none'; // 다음 문제로 넘어가면 힌트 숨김

    // [한글 주석] 보기 버튼을 동적으로 생성합니다.
    // 보기 순서는 이미 startQuiz()에서 셔플되었으므로 순서대로 표시하면 됩니다.
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    q.options.forEach((optionText, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = optionText;
        
        // [한글 주석] 클릭 시 정답 여부 확인
        // index === q.answer이면 정답 (answer는 이미 셔플된 보기 기준으로 재계산됨)
        btn.onclick = () => handleAnswer(btn, index === q.answer, q.answer);
        optionsContainer.appendChild(btn);
    });
}

/**
 * 힌트 보기 버튼을 누르면 숨겨진 힌트 텍스트를 표시합니다.
 */
function showHint() {
    document.getElementById('quiz-hint-text').style.display = 'block';
}

/**
 * 사용자가 보기를 선택했을 때 정답/오답을 판별하고 피드백을 보여줍니다.
 * @param {HTMLElement} selectedBtn - 사용자가 클릭한 버튼 요소
 * @param {boolean} isCorrect - 정답 여부
 * @param {number} correctAnswerIndex - 정답의 인덱스 (셔플 후 기준)
 */
function handleAnswer(selectedBtn, isCorrect, correctAnswerIndex) {
    // [한글 주석] 한 문제에 여러 번 클릭하는 것을 방지하기 위해 모든 보기 버튼 비활성화
    const buttons = document.querySelectorAll('.quiz-option');
    buttons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        // 정답인 경우: 초록색 강조 + 정답 피드백
        selectedBtn.classList.add('correct');
        selectedBtn.innerHTML += " <span class='quiz-feedback'>🎉 정답!</span>";
        currentScore++;
    } else {
        // 오답인 경우: 빨간색 강조 + 오답 피드백
        selectedBtn.classList.add('wrong');
        selectedBtn.innerHTML += " <span class='quiz-feedback'>❌ 틀렸어요</span>";
        
        // [한글 주석] 정답이 무엇이었는지 알려주기 위해 정답 버튼에 초록색 표시
        buttons[correctAnswerIndex].classList.add('correct');
    }

    // 1.5초(1500ms) 대기 후 다음 문제로 자동 이동
    setTimeout(() => {
        currentQuestionIndex++;
        renderQuestion();
    }, 1500);
}

/**
 * 5문제를 모두 푼 후 최종 결과를 화면에 표시하고 해금 로직을 처리합니다.
 */
function showQuizResult() {
    document.getElementById('quiz-content').style.display = 'none';
    const resultDiv = document.getElementById('quiz-result');
    resultDiv.style.display = 'flex'; // flex 레이아웃으로 변경하여 가운데 정렬

    // [한글 주석] 통과 기준(3개 이상 정답) 충족 여부 판단
    const isPass = currentScore >= QUIZ_PASS_SCORE;
    
    if (isPass) {
        // 통과 시: 축하 메시지 + 카테고리 해금 처리
        document.getElementById('quiz-result-title').innerHTML = "🎊 해금 성공! 🎊";
        document.getElementById('quiz-result-desc').textContent = `${currentScore}개 정답! 이제 ${currentQuizCategory === 'animal' ? '동물' : '유물'} 탐험이 가능해요!`;
        
        // storage.js에 퀴즈 통과 기록 저장
        setQuizPassed(currentQuizCategory); 
        
        // 메인 화면 UI 즉시 갱신 (잠금 풀림 반영)
        if (typeof window.updateMainScreenData === 'function') {
            window.updateMainScreenData();
        }
    } else {
        // 실패 시: 재도전 안내
        document.getElementById('quiz-result-title').textContent = "조금 더 공부해봐요! 😊";
        document.getElementById('quiz-result-desc').textContent = `${currentScore}개를 맞췄어요. (통과 기준: ${QUIZ_PASS_SCORE}개)`;
    }
}

/**
 * 퀴즈 화면을 닫고 메인 화면으로 돌아갑니다.
 */
function closeQuiz() {
    const quizScreen = document.getElementById('quiz-screen');
    quizScreen.classList.remove('slide-in');
    
    // 슬라이드 애니메이션 대기 후 완전 숨김
    setTimeout(() => {
        quizScreen.style.display = 'none';
    }, 300);
}

// ==========================================
// [한글 주석] 레벨업 퀴즈 시스템
// ==========================================

// [한글 주석] 레벨업 퀴즈 표시
function showLevelUpQuiz(newLevel, triggerCardId) {
  // [한글 주석] 수집한 카드 목록에서 랜덤으로 문제 카드 선택
  const collection = typeof getCollection === 'function' ? getCollection() : [];
  const allCards = window.allCardsData || [];

  // [한글 주석] 수집한 카드 중 상세 정보 있는 것만
  const collectedCards = collection
    .map(id => allCards.find(c => c.id === id))
    .filter(c => c && c.short_desc);

  if (collectedCards.length === 0) {
    // [한글 주석] 문제 낼 카드 없으면 그냥 레벨업
    _completeLevelUp(newLevel);
    return;
  }

  // [한글 주석] 랜덤으로 문제 카드 선택
  const questionCard = collectedCards[Math.floor(Math.random() * collectedCards.length)];

  // [한글 주석] 정답 포함 4지선다 보기 생성
  const choices = _generateChoices(questionCard, allCards, collection);

  // [한글 주석] 퀴즈 팝업 표시
  _showLevelQuizPopup(newLevel, questionCard, choices, triggerCardId);
}

// [한글 주석] 4지선다 보기 생성 (정답 + 오답 3개)
function _generateChoices(correctCard, allCards, collection) {
  // [한글 주석] 같은 카테고리에서 오답 3개 선택
  const sameCategory = allCards.filter(c =>
    c.category === correctCard.category &&
    c.id !== correctCard.id &&
    c.short_desc
  );

  // [한글 주석] 랜덤으로 오답 3개 선택
  const shuffled = sameCategory.sort(() => Math.random() - 0.5);
  const wrongs = shuffled.slice(0, 3);

  // [한글 주석] 정답 포함 4개 섞기
  const all = [correctCard, ...wrongs].sort(() => Math.random() - 0.5);
  return all;
}

// [한글 주석] 레벨업 퀴즈 팝업 표시
function _showLevelQuizPopup(newLevel, questionCard, choices, triggerCardId) {
  const existing = document.getElementById('levelup-quiz-overlay');
  if (existing) existing.remove();

  // [한글 주석] 카드 이미지 HTML
  const cardImgHTML = typeof getCardImageHTML === 'function'
    ? getCardImageHTML(questionCard, 90)
    : `<div style="font-size:48px;">${questionCard.emoji}</div>`;

  const rarityColors = {
    common: '#84ff00',
    rare: '#4a9eff',
    epic: '#ffd700'
  };
  const rColor = rarityColors[questionCard.rarity] || '#84ff00';

  const overlay = document.createElement('div');
  overlay.id = 'levelup-quiz-overlay';
  overlay.style.cssText = `
    position:fixed;top:0;left:0;right:0;bottom:0;
    background:rgba(0,0,0,0.92);
    z-index:99999;
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    padding:20px;
    animation:fadeIn 0.3s ease;
  `;

  overlay.innerHTML = `
    <div style="
      background:linear-gradient(135deg,#1a2234,#0f1525);
      border:2px solid #ffd700;
      border-radius:24px;
      padding:24px 20px;
      max-width:340px;width:100%;
      box-shadow:0 0 40px rgba(255,215,0,0.3);
    ">
      <!-- [한글 주석] 헤더 -->
      <div style="text-align:center;margin-bottom:16px;">
        <div style="font-size:13px;color:#ffd700;font-weight:700;margin-bottom:4px;">
          🎯 Lv.${newLevel} 달성 퀴즈!
        </div>
        <div style="font-size:11px;color:#aaa;">
          맞추면 레벨업! 틀리면 다음 기회에 도전해요
        </div>
      </div>

      <!-- [한글 주석] 카드 이미지 + 이름 -->
      <div style="
        display:flex;align-items:center;gap:14px;
        background:rgba(0,0,0,0.3);
        border:1px solid ${rColor};
        border-radius:16px;
        padding:12px;
        margin-bottom:14px;
      ">
        <div style="
          width:80px;height:80px;flex-shrink:0;
          border-radius:10px;overflow:hidden;
          display:flex;align-items:center;justify-content:center;
          background:rgba(0,0,0,0.2);
        ">${cardImgHTML}</div>
        <div>
          <div style="color:${rColor};font-size:11px;font-weight:700;margin-bottom:4px;">
            이 카드의 설명은?
          </div>
          <div style="color:#fff;font-size:16px;font-weight:900;">
            ${questionCard.name}
          </div>
        </div>
      </div>

      <!-- [한글 주석] 4지선다 보기 -->
      <div id="quiz-choices" style="display:flex;flex-direction:column;gap:8px;margin-bottom:4px;">
        ${choices.map((c, i) => `
          <button
            class="level-quiz-choice"
            data-correct="${c.id === questionCard.id}"
            data-card-id="${c.id}"
            onclick="handleLevelQuizAnswer(this, '${questionCard.id}', ${newLevel}, '${triggerCardId}')"
            style="
              background:rgba(255,255,255,0.05);
              border:1px solid rgba(255,255,255,0.15);
              border-radius:12px;
              padding:10px 14px;
              color:#f0e6c8;
              font-size:12px;
              text-align:left;
              cursor:pointer;
              transition:all 0.2s;
              line-height:1.4;
            "
          >${['①','②','③','④'][i]} ${c.short_desc}</button>
        `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

// [한글 주석] 퀴즈 답 선택 처리
function handleLevelQuizAnswer(btn, correctCardId, newLevel, triggerCardId) {
  // [한글 주석] 이미 답 선택했으면 무시
  const overlay = document.getElementById('levelup-quiz-overlay');
  if (!overlay || overlay.dataset.answered) return;
  overlay.dataset.answered = 'true';

  const isCorrect = btn.dataset.correct === 'true';
  const allBtns = overlay.querySelectorAll('.level-quiz-choice');

  // [한글 주석] 정답/오답 색상 표시
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
    overlay.remove();
    if (isCorrect) {
      // [한글 주석] 정답 → 레벨업 완료
      _completeLevelUp(newLevel);
    } else {
      // [한글 주석] 오답 → 레벨업 실패 토스트
      _showQuizFailToast();
    }
  }, 1000);
}

// [한글 주석] 레벨업 완료 처리
function _completeLevelUp(newLevel) {
  // [한글 주석] 레벨 저장
  const collection = typeof getCollection === 'function' ? getCollection() : [];
  localStorage.setItem('currentLevel', newLevel);

  // [한글 주석] 카테고리 해금 체크
  if (typeof checkCategoryUnlockByLevel === 'function') {
    const unlocked = checkCategoryUnlockByLevel(newLevel);
    if (unlocked) {
      // [한글 주석] 카테고리 해금 알림
      let msg = '';
      if (newLevel >= 10) msg = '🏺 유물 탐험이 해금됐어요!';
      else if (newLevel >= 5) msg = '🦊 동물 탐험이 해금됐어요!';
      if (msg) {
        setTimeout(() => {
          const toast = document.createElement('div');
          toast.className = 'item-unlock-toast';
          toast.textContent = msg;
          document.body.appendChild(toast);
          setTimeout(() => toast.classList.add('show'), 10);
          setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
          }, 3500);
        }, 500);
      }
    }
  }

  // [한글 주석] 아이템 해금 체크
  if (typeof checkAndUnlockItems === 'function') checkAndUnlockItems();

  // [한글 주석] 레벨업 축하 팝업
  if (typeof showLevelUpPopup === 'function') showLevelUpPopup(newLevel);

  // [한글 주석] 메인화면 업데이트
  if (typeof updateLevelBadge === 'function') updateLevelBadge();
  if (typeof window.updateMainScreenData === 'function') window.updateMainScreenData();
}

// [한글 주석] 퀴즈 실패 토스트
function _showQuizFailToast() {
  const toast = document.createElement('div');
  toast.className = 'item-unlock-toast';
  toast.style.background = 'linear-gradient(135deg,#ff4444,#cc0000)';
  toast.textContent = '❌ 아쉽! 다음 카드를 모으면 다시 도전해요!';
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

window.showLevelUpQuiz = showLevelUpQuiz;
window.handleLevelQuizAnswer = handleLevelQuizAnswer;
window._completeLevelUp = _completeLevelUp;
