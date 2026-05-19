// js/quiz.js
// 해금 퀴즈 시스템을 담당하는 파일입니다.
// 20개 문제은행에서 랜덤 5문제를 선택하고, 보기 순서도 섞어 출제합니다.

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
