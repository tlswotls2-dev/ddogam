// js/chatbot.js
// 학습 도우미 AI 챗봇의 로직을 담당하는 파일입니다. (Gemini API 사용)

let isChatbotInitialized = false;

/**
 * 챗봇 화면을 열고, 처음 열렸을 때만 환영 메시지를 띄웁니다.
 */
function showChatbot() {
    const GEMINI_API_KEY = localStorage.getItem('gemini_api_key');
    if (!GEMINI_API_KEY) {
        alert("선생님께 API 키 설정을 요청해주세요!");
        return;
    }

    const chatbotScreen = document.getElementById('chatbot-screen');
    chatbotScreen.style.display = 'flex';
    
    // 슬라이드 애니메이션
    setTimeout(() => {
        chatbotScreen.classList.add('slide-in');
    }, 10);

    // 첫 진입 시 환영 인사
    if (!isChatbotInitialized) {
        addMessage('안녕! 나는 또감 학습 도우미야 🌿\n수집한 동식물이나 유물에 대해 뭐든 물어봐!', 'ai');
        isChatbotInitialized = true;
    }
}

/**
 * 챗봇 화면을 닫고 메인으로 돌아갑니다.
 */
function hideChatbot() {
    const chatbotScreen = document.getElementById('chatbot-screen');
    chatbotScreen.classList.remove('slide-in');
    setTimeout(() => {
        chatbotScreen.style.display = 'none';
    }, 300);
}

/**
 * 사용자가 입력한 메시지를 전송하고 처리합니다.
 */
async function sendMessage() {
    const inputEl = document.getElementById('chatbot-input');
    const text = inputEl.value.trim();
    if (!text) return; // 빈 메시지는 무시

    // 입력창 초기화
    inputEl.value = '';
    
    // 1. 학생의 메시지를 화면에 추가 (초록색 말풍선)
    addMessage(text, 'user');
    
    // 2. AI 로딩 메시지 추가 (보라색 말풍선)
    const loadingId = addMessage('AI가 생각하는 중... 🤔', 'ai');
    
    // 3. API 호출
    try {
        const responseText = await callGeminiAPI(text);
        // 응답을 받으면 로딩 메시지의 텍스트를 결과로 변경
        updateMessage(loadingId, responseText);
    } catch (error) {
        console.error("챗봇 에러:", error);
        updateMessage(loadingId, '잠깐 문제가 생겼어요. 다시 시도해줘요! 😅');
    }
}

/**
 * 빠른 질문 버튼 클릭 시 작동하는 함수입니다.
 */
function sendQuickQuestion(topic) {
    const inputEl = document.getElementById('chatbot-input');
    inputEl.value = `${topic}에 대해 물어볼래!`;
    sendMessage();
}

/**
 * 키보드 엔터키를 눌렀을 때 메시지를 전송하도록 합니다.
 */
function handleChatInputKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

/**
 * Gemini API에 질문을 보내고 답변을 받아옵니다.
 * 수집 현황 컨텍스트와 시스템 프롬프트를 함께 전송합니다.
 */
async function callGeminiAPI(userMessage) {
    const GEMINI_API_KEY = localStorage.getItem('gemini_api_key');
    if (!GEMINI_API_KEY) throw new Error("API Key missing");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

    // [한글 주석] 강화된 시스템 프롬프트 - 또감 도감 300종 관련 질문만 답변
    let systemPrompt = `
너는 초등학교 3학년 학생들을 위한 또감 학습 도우미야.
반드시 아래 규칙을 지켜줘:

[답변 가능한 질문]
- 또감 도감에 수록된 식물 100종, 동물 100종, 유물 100종에 관한 질문
- 학생이 수집한 카드에 대한 질문
- 해당 동식물/유물의 특징, 서식지, 역사적 의미 등

[절대 답변 불가]
- 도감과 무관한 일상 대화, 숙제, 수학, 영어 등
- 욕설, 폭력, 부적절한 내용
- 또감 게임 공략, 치트키 등

[답변 규칙]
- 초등학교 3학년이 이해할 수 있는 쉬운 말 사용
- 3문장 이내로 짧고 명확하게
- 관련 없는 질문이면 반드시 "그 질문은 내가 답하기 어려워요! 수집한 동식물이나 유물에 대해 물어봐 주세요 🌿" 라고만 답해줘
`;
    
    // 수집한 카드 이름들을 모아서 컨텍스트 생성 (학생 맞춤형 대답을 위해)
    let collectedNames = [];
    if (typeof getCollection === 'function' && window.allCardsData) {
        const collection = getCollection();
        collectedNames = collection.map(id => {
            const card = window.allCardsData.find(c => c.id === id);
            return card ? card.name : null;
        }).filter(n => n); // null 제거
    }
    
    let contextStr = collectedNames.length > 0 
        ? `이 학생은 현재 다음 항목들을 수집했어: ${collectedNames.join(', ')}.` 
        : "이 학생은 아직 수집한 항목이 없어.";

    // [한글 주석] 도감 전체 카드 목록을 컨텍스트로 추가
    let allCardNames = '';
    if (window.allCardsData && window.allCardsData.length > 0) {
      const plantNames = window.allCardsData
        .filter(c => c.category === 'plant')
        .map(c => c.name).join(', ');
      const animalNames = window.allCardsData
        .filter(c => c.category === 'animal')
        .map(c => c.name).join(', ');
      const artifactNames = window.allCardsData
        .filter(c => c.category === 'artifact')
        .map(c => c.name).join(', ');
      allCardNames = `\n\n[또감 도감 전체 목록]\n식물: ${plantNames}\n동물: ${animalNames}\n유물: ${artifactNames}`;
    }

    // [한글 주석] 최종 프롬프트에 전체 카드 목록 추가
    const promptText = `${systemPrompt}\n${contextStr}${allCardNames}\n\n학생의 질문: ${userMessage}`;

    const requestBody = {
        contents: [{
            parts: [{ text: promptText }]
        }]
    };

    // API 요청
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    // 응답 파싱
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
    } else {
        throw new Error("예상치 못한 응답 형식");
    }
}

/**
 * 채팅 화면에 말풍선을 추가합니다.
 * @param {string} text - 메시지 내용
 * @param {string} sender - 'user' (우측) 또는 'ai' (좌측)
 * @returns {string} 생성된 메시지 div의 고유 ID
 */
function addMessage(text, sender) {
    const chatContainer = document.getElementById('chatbot-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-bubble ${sender}-bubble`;
    
    // 줄바꿈(\n)을 HTML <br>로 변환
    msgDiv.innerHTML = text.replace(/\n/g, '<br>');
    
    // 나중에 텍스트를 업데이트하기 위해 랜덤 ID 부여 (로딩 시 필요)
    const msgId = 'msg_' + Math.random().toString(36).substr(2, 9);
    msgDiv.id = msgId;
    
    chatContainer.appendChild(msgDiv);
    
    // 새 메시지가 추가되면 스크롤을 맨 아래로 내림
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    return msgId;
}

/**
 * 특정 ID를 가진 말풍선의 내용을 바꿉니다. (로딩 -> 실제 답변)
 */
function updateMessage(id, text) {
    const msgDiv = document.getElementById(id);
    if (msgDiv) {
        msgDiv.innerHTML = text.replace(/\n/g, '<br>');
        
        // 스크롤 맨 아래로
        const chatContainer = document.getElementById('chatbot-messages');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}
