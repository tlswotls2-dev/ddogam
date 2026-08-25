// ==========================================
// [한글 주석] 신체활동/랭킹 기록 화면 (records.js)
// 오늘 / 기간별 / 랭킹 3개 탭으로 구성
// ==========================================

let recordsActiveTab = 'today';
let recordsActiveRankCategory = 'collection';

// [한글 주석] 오늘 날짜 문자열(YYYY-MM-DD) 반환 - pedometer.js와 동일한 형식
function recordsGetDateKey(dateObj) {
    const d = dateObj || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// [한글 주석] 이번 주 월요일 Date 객체 반환
function recordsGetWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

// [한글 주석] 기록 화면 메인 진입 함수
function showRecordsScreen() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.class || !userData.number) {
        alert('로그인이 필요해요!');
        return;
    }
    const existing = document.getElementById('records-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'records-overlay';
    overlay.style.cssText = `
        position:fixed;top:0;left:0;right:0;bottom:0;
        background:rgba(0,0,0,0.92);
        z-index:99999;
        display:flex;align-items:center;justify-content:center;
        padding:20px;
    `;

    overlay.innerHTML = ''
        + '<div style="background:#1a2818;border:1px solid #4a6b3a;border-radius:16px;'
        + 'width:100%;max-width:420px;max-height:85vh;overflow-y:auto;padding:20px;position:relative;">'
        + '  <button onclick="document.getElementById(\'records-overlay\').remove()" style="'
        + '    position:absolute;top:12px;right:12px;background:none;border:none;'
        + '    color:#d4c89c;font-size:1.4rem;cursor:pointer;">✕</button>'
        + '  <h2 style="color:#d4c89c;margin:0 0 16px;font-size:1.2rem;">📊 나의 기록</h2>'
        + '  <div id="records-tab-buttons" style="display:flex;gap:6px;margin-bottom:16px;">'
        + '    <button onclick="recordsSwitchTab(\'today\')" class="records-tab-btn" data-tab="today" style="flex:1;padding:8px;border-radius:8px;border:1px solid #6b8e3d;background:#3d5239;color:#d4c89c;font-size:0.85rem;cursor:pointer;">오늘</button>'
        + '    <button onclick="recordsSwitchTab(\'period\')" class="records-tab-btn" data-tab="period" style="flex:1;padding:8px;border-radius:8px;border:1px solid #444;background:#222;color:#999;font-size:0.85rem;cursor:pointer;">기간별</button>'
        + '    <button onclick="recordsSwitchTab(\'ranking\')" class="records-tab-btn" data-tab="ranking" style="flex:1;padding:8px;border-radius:8px;border:1px solid #444;background:#222;color:#999;font-size:0.85rem;cursor:pointer;">랭킹</button>'
        + '  </div>'
        + '  <div id="records-tab-content"></div>'
        + '</div>';

    document.body.appendChild(overlay);
    recordsActiveTab = 'today';
    recordsRenderTab();
}

// [한글 주석] 탭 전환
function recordsSwitchTab(tab) {
    recordsActiveTab = tab;
    document.querySelectorAll('.records-tab-btn').forEach(function(btn) {
        if (btn.getAttribute('data-tab') === tab) {
            btn.style.background = '#3d5239';
            btn.style.border = '1px solid #6b8e3d';
            btn.style.color = '#d4c89c';
        } else {
            btn.style.background = '#222';
            btn.style.border = '1px solid #444';
            btn.style.color = '#999';
        }
    });
    recordsRenderTab();
}

// [한글 주석] 현재 탭에 맞는 내용을 그림
function recordsRenderTab() {
    const container = document.getElementById('records-tab-content');
    if (!container) return;
    if (recordsActiveTab === 'today') container.innerHTML = recordsBuildTodayHTML();
    else if (recordsActiveTab === 'period') container.innerHTML = recordsBuildPeriodHTML();
    else if (recordsActiveTab === 'ranking') recordsRenderRankingTab(container);
}

// [한글 주석] 오늘 탭 HTML 생성
function recordsBuildTodayHTML() {
    const allStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
    const today = allStats[recordsGetDateKey()] || { steps: 0, kcal: 0, meters: 0, minutes: 0, cards: 0, quizCorrect: 0 };
    const goalMinutes = 60;
    const pct = Math.min(100, Math.round((today.minutes / goalMinutes) * 100));
    const km = (today.meters / 1000).toFixed(2);

    return ''
        + '<div style="background:#2c3e2d;border-radius:10px;padding:14px;margin-bottom:12px;">'
        + '  <div style="color:#a8d878;font-size:0.85rem;margin-bottom:10px;">오늘의 움직임</div>'
        + '  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;">'
        + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1.2rem;font-weight:700;">' + today.steps + '</div><div style="color:#a8d878;font-size:0.7rem;">걸음</div></div>'
        + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1.2rem;font-weight:700;">' + km + '</div><div style="color:#a8d878;font-size:0.7rem;">km</div></div>'
        + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1.2rem;font-weight:700;">' + today.kcal + '</div><div style="color:#a8d878;font-size:0.7rem;">kcal</div></div>'
        + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1.2rem;font-weight:700;">' + today.minutes + '</div><div style="color:#a8d878;font-size:0.7rem;">분</div></div>'
        + '  </div>'
        + '</div>'
        + '<div style="margin-bottom:6px;display:flex;justify-content:space-between;color:#ccc;font-size:0.8rem;">'
        + '  <span>하루 활동 목표 60분</span><span>' + today.minutes + ' / 60분</span>'
        + '</div>'
        + '<div style="height:10px;background:#222;border-radius:999px;overflow:hidden;margin-bottom:14px;">'
        + '  <div style="width:' + pct + '%;height:100%;background:#639922;border-radius:999px;"></div>'
        + '</div>'
        + '<div style="background:#2c3e2d;border-radius:10px;padding:14px;">'
        + '  <div style="color:#a8d878;font-size:0.85rem;margin-bottom:8px;">오늘의 지식</div>'
        + '  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;text-align:center;">'
        + '    <div><div style="color:#d4ffaa;font-size:1.2rem;font-weight:700;">' + (today.cards || 0) + '</div><div style="color:#a8d878;font-size:0.7rem;">카드 수집</div></div>'
        + '    <div><div style="color:#d4ffaa;font-size:1.2rem;font-weight:700;">' + (today.quizCorrect || 0) + '</div><div style="color:#a8d878;font-size:0.7rem;">퀴즈 정답</div></div>'
        + '  </div>'
        + '</div>';
}

// [한글 주석] 기간별 탭 HTML 생성 (이번주/이번달/전체 집계)
function recordsBuildPeriodHTML() {
    const allStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
    const weekStart = recordsGetWeekStart();
    const now = new Date();
    const thisMonthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

    let week = { steps: 0, kcal: 0, meters: 0, minutes: 0, cards: 0, quizCorrect: 0 };
    let month = { steps: 0, kcal: 0, meters: 0, minutes: 0, cards: 0, quizCorrect: 0 };
    let total = { steps: 0, kcal: 0, meters: 0, minutes: 0, cards: 0, quizCorrect: 0 };

    Object.keys(allStats).forEach(function(dateKey) {
        const entry = allStats[dateKey];
        const entryDate = new Date(dateKey);
        ['steps', 'kcal', 'meters', 'minutes', 'cards', 'quizCorrect'].forEach(function(field) {
            const val = entry[field] || 0;
            total[field] += val;
            if (dateKey.indexOf(thisMonthKey) === 0) month[field] += val;
            if (entryDate >= weekStart) week[field] += val;
        });
    });

    function periodBlock(title, data) {
        return ''
            + '<div style="background:#2c3e2d;border-radius:10px;padding:14px;margin-bottom:10px;">'
            + '  <div style="color:#a8d878;font-size:0.85rem;margin-bottom:10px;">' + title + '</div>'
            + '  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center;margin-bottom:6px;">'
            + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1rem;font-weight:700;">' + data.steps + '</div><div style="color:#a8d878;font-size:0.65rem;">걸음</div></div>'
            + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1rem;font-weight:700;">' + data.kcal + '</div><div style="color:#a8d878;font-size:0.65rem;">kcal</div></div>'
            + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1rem;font-weight:700;">' + data.minutes + '</div><div style="color:#a8d878;font-size:0.65rem;">활동분</div></div>'
            + '  </div>'
            + '  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;text-align:center;">'
            + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1rem;font-weight:700;">' + (data.cards || 0) + '</div><div style="color:#a8d878;font-size:0.65rem;">카드 수집</div></div>'
            + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1rem;font-weight:700;">' + (data.quizCorrect || 0) + '</div><div style="color:#a8d878;font-size:0.65rem;">퀴즈 정답</div></div>'
            + '  </div>'
            + '</div>';
    }

    return periodBlock('이번 주 (월요일부터)', week)
        + periodBlock('이번 달', month)
        + periodBlock('또감 시작 이후 전체', total);
}

// [한글 주석] 랭킹 탭 - 서버에서 데이터를 받아온 후 그림
function recordsRenderRankingTab(container) {
    container.innerHTML = '<div style="text-align:center;color:#999;padding:30px 0;">불러오는 중...</div>';

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const url = SCRIPT_URL + '?type=getRanking&class=' + encodeURIComponent(userData.class) + '&number=' + encodeURIComponent(userData.number);

    fetch(url).then(function(r) { return r.json(); }).then(function(data) {
        window._recordsRankingData = data;
        recordsRenderRankingContent(container);
    }).catch(function(err) {
        container.innerHTML = '<div style="text-align:center;color:#e88;padding:30px 0;">랭킹을 불러오지 못했어요.<br>인터넷 연결을 확인해주세요.</div>';
    });
}

// [한글 주석] 랭킹 부문 선택 버튼 + 상위 5명 + 내 순위 렌더링
function recordsRenderRankingContent(container) {
    const data = window._recordsRankingData;
    if (!data) return;
    const catConfig = {
        collection: { label: '수집왕', unit: '장', data: data.collection, note: '이번 주' },
        steps: { label: '걸음왕', unit: '걸음', data: data.steps, note: '이번 주' },
        quiz: { label: '퀴즈왕', unit: '문제', data: data.quiz, note: '이번 주' },
        attendance: { label: '꾸준왕', unit: '일', data: data.attendance, note: '누적' }
    };
    const cat = catConfig[recordsActiveRankCategory];

    let html = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">';
    Object.keys(catConfig).forEach(function(key) {
        const active = key === recordsActiveRankCategory;
        html += '<button onclick="recordsActiveRankCategory=\'' + key + '\';recordsRenderRankingContent(document.getElementById(\'records-tab-content\'))" style="'
            + 'padding:6px 12px;border-radius:999px;font-size:0.75rem;cursor:pointer;'
            + (active ? 'background:#3d5239;border:1px solid #6b8e3d;color:#d4c89c;' : 'background:#222;border:1px solid #444;color:#999;')
            + '">' + catConfig[key].label + '</button>';
    });
    html += '</div>';

    html += '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">'
        + '<thead><tr style="color:#a8d878;font-size:0.7rem;">'
        + '<td style="padding:6px 4px;">순위</td><td style="padding:6px 4px;">반·번호</td><td style="padding:6px 4px;text-align:right;">' + cat.label + '</td>'
        + '</tr></thead><tbody>';

    cat.data.top5.forEach(function(item, idx) {
        const isMe = item.number === String(JSON.parse(localStorage.getItem('userData') || '{}').number);
        html += '<tr style="' + (isMe ? 'background:rgba(99,153,34,0.25);' : '') + 'border-top:1px solid #333;">'
            + '<td style="padding:8px 4px;color:' + (idx === 0 ? '#ffd24d' : '#ccc') + ';">' + (idx + 1) + '</td>'
            + '<td style="padding:8px 4px;display:flex;align-items:center;gap:8px;">'
            + '<span style="width:24px;height:24px;border-radius:50%;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:#333;">'
            + (typeof getAvatarSVG === 'function' ? getAvatarSVG(item.avatar) : '')
            + '</span>'
            + JSON.parse(localStorage.getItem('userData') || '{}').class + '반 ' + item.number + '번</td>'
            + '<td style="padding:8px 4px;text-align:right;color:#d4ffaa;">' + item.value + cat.unit + '</td>'
            + '</tr>';
    });

    if (cat.data.myRank > 5 || cat.data.myRank === -1) {
        html += '<tr style="background:rgba(99,153,34,0.25);border-top:2px solid #6b8e3d;">'
            + '<td style="padding:8px 4px;color:#a8d878;">' + (cat.data.myRank === -1 ? '-' : cat.data.myRank) + '</td>'
            + '<td style="padding:8px 4px;color:#a8d878;">나</td>'
            + '<td style="padding:8px 4px;text-align:right;color:#d4ffaa;">' + cat.data.myValue + cat.unit + '</td>'
            + '</tr>';
    }

    html += '</tbody></table>'
        + '<div style="margin-top:10px;font-size:0.7rem;color:#777;text-align:center;">'
        + '상위 5명 + 내 순위만 표시 (누적)<br>' + (window._recordsRankingData.updatedAt || '') + ' 기준</div>';

    container.innerHTML = html;
}
