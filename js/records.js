// ==========================================
// [한글 주석] 신체활동/랭킹 기록 화면 (records.js)
// 오늘 / 기간별 / 랭킹 3개 탭으로 구성
// 랭킹 탭은 기간(주간/월간/전체) 서브탭 + 부문(수집왕/퀴즈왕) 전환으로 구성
// ==========================================

let recordsActiveTab = 'today';
let recordsActiveRankPeriod = 'week';
let recordsActiveRankCategory = 'collection';

function recordsT(key) {
    const T = window.LANG_UI;
    const L = window.currentLang || 'ko';
    return T?.[L]?.[key] || T?.ko?.[key] || '';
}

function recordsGetDateKey(dateObj) {
    const d = dateObj || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function recordsGetWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

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
        + '  <h2 style="color:#d4c89c;margin:0 0 16px;font-size:1.2rem;">📊 ' + recordsT('recordsTitle') + '</h2>'
        + '  <div id="records-tab-buttons" style="display:flex;gap:6px;margin-bottom:16px;">'
        + '    <button onclick="recordsSwitchTab(\'today\')" class="records-tab-btn" data-tab="today" style="flex:1;padding:8px;border-radius:8px;border:1px solid #6b8e3d;background:#3d5239;color:#d4c89c;font-size:0.85rem;cursor:pointer;">' + recordsT('recordsTabToday') + '</button>'
        + '    <button onclick="recordsSwitchTab(\'period\')" class="records-tab-btn" data-tab="period" style="flex:1;padding:8px;border-radius:8px;border:1px solid #444;background:#222;color:#999;font-size:0.85rem;cursor:pointer;">' + recordsT('recordsTabPeriod') + '</button>'
        + '    <button onclick="recordsSwitchTab(\'ranking\')" id="records-rank-tab-btn" data-tab="ranking" style="flex:1;padding:8px;border-radius:8px;border:1px solid #7a5a1a;background:#3d3320;color:#e8c468;font-size:0.85rem;cursor:pointer;">🏆 ' + recordsT('recordsTabRanking') + '</button>'
        + '  </div>'
        + '  <div id="records-tab-content"></div>'
        + '</div>';

    document.body.appendChild(overlay);
    recordsActiveTab = 'today';
    recordsRenderTab();
}

function recordsSwitchTab(tab) {
    recordsActiveTab = tab;
    document.querySelectorAll('.records-tab-btn').forEach(function (btn) {
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
    // [한글 주석] 랭킹 탭 버튼은 색상 체계가 달라서(금색) 별도로 활성/비활성 처리
    const rankBtn = document.getElementById('records-rank-tab-btn');
    if (rankBtn) {
        if (tab === 'ranking') {
            rankBtn.style.background = '#4a3d1a';
            rankBtn.style.border = '1px solid #d4a017';
            rankBtn.style.color = '#ffd24d';
        } else {
            rankBtn.style.background = '#3d3320';
            rankBtn.style.border = '1px solid #7a5a1a';
            rankBtn.style.color = '#e8c468';
        }
    }
    recordsRenderTab();
}

function recordsRenderTab() {
    const container = document.getElementById('records-tab-content');
    if (!container) return;
    if (recordsActiveTab === 'today') container.innerHTML = recordsBuildTodayHTML();
    else if (recordsActiveTab === 'period') container.innerHTML = recordsBuildPeriodHTML();
    else if (recordsActiveTab === 'ranking') recordsRenderRankingTab(container);
}

function recordsBuildTodayHTML() {
    const allStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
    const today = allStats[recordsGetDateKey()] || { steps: 0, kcal: 0, meters: 0, minutes: 0, cards: 0, quizCorrect: 0 };
    const goalMinutes = 60;
    const pct = Math.min(100, Math.round((today.minutes / goalMinutes) * 100));
    const km = (today.meters / 1000).toFixed(2);
    const badge = typeof getActivityIntensityBadge === 'function' ? getActivityIntensityBadge(today.minutes) : { label: '', emoji: '', color: '#8db05c' };
    const conversionText = typeof getActivityConversionText === 'function' ? getActivityConversionText(today.kcal) : '';

    return ''
        + '<div style="background:#2c3e2d;border-radius:10px;padding:14px;margin-bottom:12px;">'
        + '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">'
        + '    <div style="color:#a8d878;font-size:0.85rem;">' + recordsT('recordsTodayMovement') + '</div>'
        + '    <div style="background:' + badge.color + '22;color:' + badge.color + ';font-size:0.7rem;padding:3px 8px;border-radius:999px;">' + badge.emoji + ' ' + badge.label + '</div>'
        + '  </div>'
        + '  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;margin-bottom:' + (conversionText ? '10px' : '0') + ';">'
        + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1.2rem;font-weight:700;">' + today.steps + '</div><div style="color:#a8d878;font-size:0.7rem;">' + recordsT('recordsUnitSteps') + '</div></div>'
        + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1.2rem;font-weight:700;">' + km + '</div><div style="color:#a8d878;font-size:0.7rem;">km</div></div>'
        + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1.2rem;font-weight:700;">' + today.kcal + '</div><div style="color:#a8d878;font-size:0.7rem;">' + recordsT('recordsUnitKcal') + '</div></div>'
        + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1.2rem;font-weight:700;">' + today.minutes + '</div><div style="color:#a8d878;font-size:0.7rem;">' + recordsT('recordsUnitMinutes') + '</div></div>'
        + '  </div>'
        + (conversionText ? '  <div style="text-align:center;color:#d4c89c;font-size:0.75rem;">' + conversionText + '</div>' : '')
        + '</div>'
        + '<div style="margin-bottom:6px;display:flex;justify-content:space-between;color:#ccc;font-size:0.8rem;">'
        + '  <span>' + recordsT('recordsDailyGoal') + '</span><span>' + today.minutes + ' / 60' + recordsT('recordsUnitMinutes') + '</span>'
        + '</div>'
        + '<div style="height:10px;background:#222;border-radius:999px;overflow:hidden;margin-bottom:14px;">'
        + '  <div style="width:' + pct + '%;height:100%;background:#639922;border-radius:999px;"></div>'
        + '</div>'
        + '<div style="background:#20304a;border-radius:10px;padding:14px;">'
        + '  <div style="color:#8ec3f0;font-size:0.85rem;margin-bottom:8px;">' + recordsT('recordsTodayKnowledge') + '</div>'
        + '  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;text-align:center;">'
        + '    <div style="background:#152238;border-radius:8px;padding:8px 4px;"><div style="color:#aad4ff;font-size:1.2rem;font-weight:700;">' + (today.cards || 0) + '</div><div style="color:#8ec3f0;font-size:0.7rem;">' + recordsT('recordsUnitCards') + '</div></div>'
        + '    <div style="background:#152238;border-radius:8px;padding:8px 4px;"><div style="color:#aad4ff;font-size:1.2rem;font-weight:700;">' + (today.quizCorrect || 0) + '</div><div style="color:#8ec3f0;font-size:0.7rem;">' + recordsT('recordsUnitQuiz') + '</div></div>'
        + '  </div>'
        + '</div>';
}

function recordsBuildPeriodHTML() {
    const allStats = JSON.parse(localStorage.getItem('dailyStats') || '{}');
    const weekStart = recordsGetWeekStart();
    const now = new Date();
    const thisMonthKey = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

    let week = { steps: 0, kcal: 0, meters: 0, minutes: 0, cards: 0, quizCorrect: 0 };
    let month = { steps: 0, kcal: 0, meters: 0, minutes: 0, cards: 0, quizCorrect: 0 };
    let total = { steps: 0, kcal: 0, meters: 0, minutes: 0, cards: 0, quizCorrect: 0 };

    Object.keys(allStats).forEach(function (dateKey) {
        const entry = allStats[dateKey];
        const entryDate = new Date(dateKey);
        ['steps', 'kcal', 'meters', 'minutes', 'cards', 'quizCorrect'].forEach(function (field) {
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
            + '  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center;margin-bottom:8px;">'
            + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1rem;font-weight:700;">' + data.steps + '</div><div style="color:#a8d878;font-size:0.65rem;">' + recordsT('recordsUnitSteps') + '</div></div>'
            + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1rem;font-weight:700;">' + data.kcal + '</div><div style="color:#a8d878;font-size:0.65rem;">' + recordsT('recordsUnitKcal') + '</div></div>'
            + '    <div style="background:#1a2818;border-radius:8px;padding:8px 4px;"><div style="color:#d4ffaa;font-size:1rem;font-weight:700;">' + data.minutes + '</div><div style="color:#a8d878;font-size:0.65rem;">' + recordsT('recordsUnitActivityMin') + '</div></div>'
            + '  </div>'
            + '  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;text-align:center;">'
            + '    <div style="background:#152238;border-radius:8px;padding:8px 4px;"><div style="color:#aad4ff;font-size:1rem;font-weight:700;">' + (data.cards || 0) + '</div><div style="color:#8ec3f0;font-size:0.65rem;">' + recordsT('recordsUnitCards') + '</div></div>'
            + '    <div style="background:#152238;border-radius:8px;padding:8px 4px;"><div style="color:#aad4ff;font-size:1rem;font-weight:700;">' + (data.quizCorrect || 0) + '</div><div style="color:#8ec3f0;font-size:0.65rem;">' + recordsT('recordsUnitQuiz') + '</div></div>'
            + '  </div>'
            + '</div>';
    }

    return periodBlock(recordsT('recordsPeriodWeek'), week)
        + periodBlock(recordsT('recordsPeriodMonth'), month)
        + periodBlock(recordsT('recordsPeriodTotal'), total);
}

// [한글 주석] 랭킹 탭 - 서버(또는 체험모드 예시)에서 {week, month, total} 구조로 데이터를 받아옴
function recordsRenderRankingTab(container) {
    if (localStorage.getItem('demoMode') === 'true' && typeof getDemoRankingData === 'function') {
        window._recordsRankingData = getDemoRankingData();
        recordsRenderRankingUI(container);
        return;
    }

    container.innerHTML = '<div style="text-align:center;color:#999;padding:30px 0;">' + recordsT('recordsLoading') + '</div>';

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const url = SCRIPT_URL + '?type=getRanking&class=' + encodeURIComponent(userData.class) + '&number=' + encodeURIComponent(userData.number);

    fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        window._recordsRankingData = data;
        recordsRenderRankingUI(container);
    }).catch(function (err) {
        container.innerHTML = '<div style="text-align:center;color:#e88;padding:30px 0;">' + recordsT('recordsLoadFail') + '</div>';
    });
}

// [한글 주석] 랭킹 탭의 뼈대(기간 서브탭 + 부문 버튼 + 표) 전체를 그림
function recordsRenderRankingUI(container) {
    const periodConfig = {
        week: { label: recordsT('rankPeriodWeek'), resetNote: recordsT('rankResetWeeklyShort') },
        month: { label: recordsT('rankPeriodMonth'), resetNote: recordsT('rankResetMonthlyShort') },
        total: { label: recordsT('rankPeriodTotal'), resetNote: recordsT('rankResetTotalShort') }
    };

    let html = '<div style="display:flex;gap:6px;margin-bottom:10px;">';
    Object.keys(periodConfig).forEach(function (key) {
        const active = key === recordsActiveRankPeriod;
        html += '<button onclick="recordsActiveRankPeriod=\'' + key + '\';recordsRenderRankingUI(document.getElementById(\'records-tab-content\'))" style="'
            + 'flex:1;padding:8px;border-radius:8px;font-size:0.8rem;cursor:pointer;'
            + (active ? 'background:#4a3d1a;border:1px solid #d4a017;color:#ffd24d;' : 'background:#2a2418;border:1px solid #5a4a28;color:#a88a4a;')
            + '">' + periodConfig[key].label + '</button>';
    });
    html += '</div>';
    html += '<div style="text-align:center;color:#777;font-size:0.7rem;margin-bottom:12px;">' + periodConfig[recordsActiveRankPeriod].resetNote + '</div>';
    html += '<div id="records-rank-body"></div>';

    container.innerHTML = html;
    recordsRenderRankingContent(document.getElementById('records-rank-body'));
}

function recordsRenderRankingContent(container) {
    const data = window._recordsRankingData;
    if (!data || !data[recordsActiveRankPeriod]) return;
    const periodData = data[recordsActiveRankPeriod];

    const catConfig = {
        collection: { label: recordsT('rankCollection'), unit: recordsT('rankUnitCards'), data: periodData.collection },
        quiz: { label: recordsT('rankQuiz'), unit: recordsT('rankUnitQuiz'), data: periodData.quiz }
    };
    const cat = catConfig[recordsActiveRankCategory];
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    let html = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">';
    Object.keys(catConfig).forEach(function (key) {
        const active = key === recordsActiveRankCategory;
        html += '<button onclick="recordsActiveRankCategory=\'' + key + '\';recordsRenderRankingContent(document.getElementById(\'records-rank-body\'))" style="'
            + 'padding:6px 12px;border-radius:999px;font-size:0.75rem;cursor:pointer;'
            + (active ? 'background:#3d5239;border:1px solid #6b8e3d;color:#d4c89c;' : 'background:#222;border:1px solid #444;color:#999;')
            + '">' + catConfig[key].label + '</button>';
    });
    html += '</div>';

    html += '<table style="width:100%;border-collapse:collapse;font-size:0.85rem;">'
        + '<thead><tr style="color:#a8d878;font-size:0.7rem;">'
        + '<td style="padding:6px 4px;"></td><td style="padding:6px 4px;"></td><td style="padding:6px 4px;text-align:right;">' + cat.label + '</td>'
        + '</tr></thead><tbody>';

    cat.data.top5.forEach(function (item, idx) {
        const isMe = item.number === String(userData.number);
        html += '<tr style="' + (isMe ? 'background:rgba(99,153,34,0.25);' : '') + 'border-top:1px solid #333;">'
            + '<td style="padding:8px 4px;color:' + (idx === 0 ? '#ffd24d' : '#ccc') + ';">' + (idx + 1) + '</td>'
            + '<td style="padding:8px 4px;display:flex;align-items:center;gap:8px;">'
            + '<span style="width:24px;height:24px;border-radius:50%;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;background:#333;">'
            + (typeof getAvatarSVG === 'function' ? getAvatarSVG(item.avatar) : '')
            + '</span>'
            + (function () {
                const lang = window.currentLang || 'ko';
                if (lang === 'ko') return userData.class + '반 ' + item.number + '번';
                if (lang === 'zh') return userData.class + '班' + item.number + '号';
                return recordsT('rankClassLabel') + userData.class + ' ' + recordsT('rankNumberLabel') + item.number;
            })()
            + '</td>'
            + '<td style="padding:8px 4px;text-align:right;color:#d4ffaa;">' + item.value + cat.unit + '</td>'
            + '</tr>';
    });

    if (cat.data.myRank > 5 || cat.data.myRank === -1) {
        html += '<tr style="background:rgba(99,153,34,0.25);border-top:2px solid #6b8e3d;">'
            + '<td style="padding:8px 4px;color:#a8d878;">' + (cat.data.myRank === -1 ? '-' : cat.data.myRank) + '</td>'
            + '<td style="padding:8px 4px;color:#a8d878;">' + recordsT('rankMe') + '</td>'
            + '<td style="padding:8px 4px;text-align:right;color:#d4ffaa;">' + cat.data.myValue + cat.unit + '</td>'
            + '</tr>';
    }

    html += '</tbody></table>'
        + '<div style="margin-top:10px;font-size:0.7rem;color:#777;text-align:center;">'
        + recordsT('rankFooter') + '<br>' + recordsT('rankRefreshNote') + '</div>';

    container.innerHTML = html;
}
