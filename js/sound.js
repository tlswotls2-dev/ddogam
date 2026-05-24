// ==========================================
// [한글 주석] 또감 사운드 시스템
// Web Audio API로 직접 생성 - 저작권 무료
// ==========================================

let _audioCtx = null;
let _isMuted = false;
let _bgmGain = null;
let _bgmSource = null;
let _bgmPlaying = false;

// [한글 주석] AudioContext 초기화 (첫 사용자 인터랙션 후 호출)
function initAudio() {
  if (_audioCtx) return;
  try {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    _bgmGain = _audioCtx.createGain();
    _bgmGain.gain.value = 0.18;
    _bgmGain.connect(_audioCtx.destination);
  } catch(e) {
    console.log('[사운드] AudioContext 초기화 실패:', e);
  }
}

// [한글 주석] 음소거 상태 불러오기
function loadMuteState() {
  _isMuted = localStorage.getItem('soundMuted') === 'true';
}

// [한글 주석] 음소거 토글
function toggleMute() {
  _isMuted = !_isMuted;
  localStorage.setItem('soundMuted', _isMuted ? 'true' : 'false');
  _updateMuteBtn();
  if (_isMuted) {
    stopBGM();
  } else {
    playMainBGM();
  }
}

// [한글 주석] 음소거 버튼 UI 업데이트
function _updateMuteBtn() {
  const btn = document.getElementById('mute-btn');
  if (!btn) return;
  btn.textContent = _isMuted ? '🔇' : '🔊';
  btn.title = _isMuted ? '소리 켜기' : '소리 끄기';
}

// ==========================================
// [한글 주석] 배경음 - 자연 환경음 (오실레이터 조합)
// ==========================================

// [한글 주석] 메인 배경음 재생 (잔잔한 자연 느낌)
function playMainBGM() {
  if (_isMuted || !_audioCtx || _bgmPlaying) return;
  _bgmPlaying = true;
  _playNatureBGM();
}

// [한글 주석] 자연 배경음 생성 (새소리 + 바람 느낌)
function _playNatureBGM() {
  if (!_audioCtx || _isMuted) return;

  // [한글 주석] 부드러운 바람 소리 (화이트 노이즈 필터링)
  const bufferSize = _audioCtx.sampleRate * 3;
  const buffer = _audioCtx.createBuffer(1, bufferSize, _audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }

  const windSource = _audioCtx.createBufferSource();
  windSource.buffer = buffer;
  windSource.loop = true;

  const windFilter = _audioCtx.createBiquadFilter();
  windFilter.type = 'bandpass';
  windFilter.frequency.value = 400;
  windFilter.Q.value = 0.5;

  const windGain = _audioCtx.createGain();
  windGain.gain.value = 0.04;

  windSource.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(_bgmGain);
  windSource.start();

  // [한글 주석] 잔잔한 멜로디 (펜타토닉 스케일)
  const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
  let noteIdx = 0;

  function playNextNote() {
    if (!_bgmPlaying || _isMuted || !_audioCtx) return;

    const osc = _audioCtx.createOscillator();
    const gainNode = _audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = notes[noteIdx % notes.length];
    gainNode.gain.setValueAtTime(0, _audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, _audioCtx.currentTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 1.8);

    osc.connect(gainNode);
    gainNode.connect(_bgmGain);
    osc.start(_audioCtx.currentTime);
    osc.stop(_audioCtx.currentTime + 2.0);

    noteIdx = (noteIdx + Math.floor(Math.random() * 3) + 1) % notes.length;
    const delay = 1500 + Math.random() * 2000;
    if (_bgmPlaying) {
      setTimeout(playNextNote, delay);
    }
  }

  playNextNote();
  _bgmSource = windSource;
}

// [한글 주석] 배경음 정지
function stopBGM() {
  _bgmPlaying = false;
  if (_bgmSource) {
    try { _bgmSource.stop(); } catch(e) {}
    _bgmSource = null;
  }
}

// [한글 주석] 탐험 배경음 (발걸음 리듬감 있는 자연음)
function playExploreBGM() {
  stopBGM();
  if (_isMuted || !_audioCtx) return;
  _bgmPlaying = true;

  // [한글 주석] 밝고 경쾌한 탐험 멜로디
  const melody = [392.00, 440.00, 392.00, 329.63, 392.00, 440.00, 523.25, 440.00];
  let idx = 0;

  function playExploreNote() {
    if (!_bgmPlaying || _isMuted || !_audioCtx) return;
    const osc = _audioCtx.createOscillator();
    const gainNode = _audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = melody[idx % melody.length];
    gainNode.gain.setValueAtTime(0, _audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.07, _audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.4);
    osc.connect(gainNode);
    gainNode.connect(_bgmGain);
    osc.start(_audioCtx.currentTime);
    osc.stop(_audioCtx.currentTime + 0.5);
    idx++;
    if (_bgmPlaying) setTimeout(playExploreNote, 500);
  }
  playExploreNote();
}

// [한글 주석] 배틀 배경음 (긴장감)
function playBattleBGM() {
  stopBGM();
  if (_isMuted || !_audioCtx) return;
  _bgmPlaying = true;

  const battleNotes = [220.00, 246.94, 261.63, 220.00, 196.00, 220.00];
  let idx = 0;

  function playBattleNote() {
    if (!_bgmPlaying || _isMuted || !_audioCtx) return;
    const osc = _audioCtx.createOscillator();
    const gainNode = _audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = battleNotes[idx % battleNotes.length];
    gainNode.gain.setValueAtTime(0.08, _audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.3);
    osc.connect(gainNode);
    gainNode.connect(_bgmGain);
    osc.start(_audioCtx.currentTime);
    osc.stop(_audioCtx.currentTime + 0.35);
    idx++;
    if (_bgmPlaying) setTimeout(playBattleNote, 350);
  }
  playBattleNote();
}

// ==========================================
// [한글 주석] 효과음들
// ==========================================

// [한글 주석] 카드 출현 효과음 (반짝임)
function playSfxCardAppear() {
  if (_isMuted || !_audioCtx) return;
  const freqs = [523.25, 659.25, 783.99, 1046.50];
  freqs.forEach((freq, i) => {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, _audioCtx.currentTime + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.15, _audioCtx.currentTime + i * 0.08 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + i * 0.08 + 0.4);
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.start(_audioCtx.currentTime + i * 0.08);
    osc.stop(_audioCtx.currentTime + i * 0.08 + 0.5);
  });
}

// [한글 주석] 카드 획득 효과음 (밝은 수집음)
function playSfxCardGet() {
  if (_isMuted || !_audioCtx) return;
  const freqs = [392.00, 523.25, 659.25, 783.99, 1046.50];
  freqs.forEach((freq, i) => {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, _audioCtx.currentTime + i * 0.06);
    gain.gain.linearRampToValueAtTime(0.12, _audioCtx.currentTime + i * 0.06 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + i * 0.06 + 0.3);
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.start(_audioCtx.currentTime + i * 0.06);
    osc.stop(_audioCtx.currentTime + i * 0.06 + 0.4);
  });
}

// [한글 주석] 레벨업 효과음 (팡파레)
function playSfxLevelUp() {
  if (_isMuted || !_audioCtx) return;
  const melody = [
    {freq: 523.25, t: 0.0},
    {freq: 659.25, t: 0.15},
    {freq: 783.99, t: 0.30},
    {freq: 1046.50, t: 0.45},
    {freq: 783.99, t: 0.60},
    {freq: 1046.50, t: 0.70},
  ];
  melody.forEach(({freq, t}) => {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, _audioCtx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + t + 0.25);
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.start(_audioCtx.currentTime + t);
    osc.stop(_audioCtx.currentTime + t + 0.3);
  });
}

// [한글 주석] 퀴즈 정답 효과음
function playSfxCorrect() {
  if (_isMuted || !_audioCtx) return;
  [{freq:523.25,t:0},{freq:659.25,t:0.12},{freq:783.99,t:0.24}].forEach(({freq,t}) => {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, _audioCtx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + t + 0.3);
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.start(_audioCtx.currentTime + t);
    osc.stop(_audioCtx.currentTime + t + 0.35);
  });
}

// [한글 주석] 퀴즈 오답 효과음
function playSfxWrong() {
  if (_isMuted || !_audioCtx) return;
  [{freq:220.00,t:0},{freq:196.00,t:0.15}].forEach(({freq,t}) => {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, _audioCtx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + t + 0.4);
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.start(_audioCtx.currentTime + t);
    osc.stop(_audioCtx.currentTime + t + 0.5);
  });
}

// [한글 주석] 복주머니 두구두구 효과음
function playSfxBagDrumroll() {
  if (_isMuted || !_audioCtx) return;
  let t = 0;
  let interval = 0.18;
  for (let i = 0; i < 12; i++) {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 120 + i * 8;
    gain.gain.setValueAtTime(0.1, _audioCtx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + t + interval * 0.8);
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.start(_audioCtx.currentTime + t);
    osc.stop(_audioCtx.currentTime + t + interval);
    t += interval;
    interval *= 0.88; // [한글 주석] 점점 빠르게
  }
}

// [한글 주석] 복주머니 오픈 효과음
function playSfxBagOpen() {
  if (_isMuted || !_audioCtx) return;
  const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
  freqs.forEach((freq, i) => {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, _audioCtx.currentTime + i * 0.07);
    gain.gain.linearRampToValueAtTime(0.18, _audioCtx.currentTime + i * 0.07 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + i * 0.07 + 0.5);
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.start(_audioCtx.currentTime + i * 0.07);
    osc.stop(_audioCtx.currentTime + i * 0.07 + 0.6);
  });
}

// [한글 주석] 버튼 클릭 효과음 (가벼운 틱)
function playSfxClick() {
  if (_isMuted || !_audioCtx) return;
  const osc = _audioCtx.createOscillator();
  const gain = _audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 800;
  gain.gain.setValueAtTime(0.08, _audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(_audioCtx.destination);
  osc.start(_audioCtx.currentTime);
  osc.stop(_audioCtx.currentTime + 0.1);
}

// [한글 주석] 매칭 성공 효과음
function playSfxMatched() {
  if (_isMuted || !_audioCtx) return;
  [{freq:440,t:0},{freq:554.37,t:0.1},{freq:659.25,t:0.2},{freq:880,t:0.3}].forEach(({freq,t}) => {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.13, _audioCtx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + t + 0.3);
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.start(_audioCtx.currentTime + t);
    osc.stop(_audioCtx.currentTime + t + 0.35);
  });
}

// [한글 주석] 배틀 승리 효과음
function playSfxBattleWin() {
  if (_isMuted || !_audioCtx) return;
  const melody = [
    {freq:523.25,t:0},{freq:659.25,t:0.1},{freq:783.99,t:0.2},
    {freq:1046.50,t:0.35},{freq:783.99,t:0.5},{freq:1046.50,t:0.6},{freq:1318.51,t:0.75}
  ];
  melody.forEach(({freq,t}) => {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, _audioCtx.currentTime + t);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + t + 0.2);
    osc.connect(gain);
    gain.connect(_audioCtx.destination);
    osc.start(_audioCtx.currentTime + t);
    osc.stop(_audioCtx.currentTime + t + 0.25);
  });
}

// [한글 주석] 탭 전환 효과음
function playSfxTab() {
  if (_isMuted || !_audioCtx) return;
  const osc = _audioCtx.createOscillator();
  const gain = _audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 660;
  gain.gain.setValueAtTime(0.07, _audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(_audioCtx.destination);
  osc.start(_audioCtx.currentTime);
  osc.stop(_audioCtx.currentTime + 0.15);
}

// [한글 주석] 전역 노출
window.initAudio = initAudio;
window.toggleMute = toggleMute;
window.loadMuteState = loadMuteState;
window.playMainBGM = playMainBGM;
window.stopBGM = stopBGM;
window.playExploreBGM = playExploreBGM;
window.playBattleBGM = playBattleBGM;
window.playSfxCardAppear = playSfxCardAppear;
window.playSfxCardGet = playSfxCardGet;
window.playSfxLevelUp = playSfxLevelUp;
window.playSfxCorrect = playSfxCorrect;
window.playSfxWrong = playSfxWrong;
window.playSfxBagDrumroll = playSfxBagDrumroll;
window.playSfxBagOpen = playSfxBagOpen;
window.playSfxClick = playSfxClick;
window.playSfxMatched = playSfxMatched;
window.playSfxBattleWin = playSfxBattleWin;
window.playSfxTab = playSfxTab;
