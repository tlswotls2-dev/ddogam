const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// 1. Remove the wrapper tags from their current positions
content = content.replace(/  <!-- \[한글 주석\] 학생 앱 전체 래퍼.*?<div id=\"student-app-wrapper\">\n/, '');
content = content.replace(/  <\/div><!-- \[한글 주석\] student-app-wrapper 닫는 태그 -->\n/, '');

// 2. Extract scripts block
const scriptBlock1Regex = /    <!-- Leaflet.js 지도 라이브러리 JS -->[\s\S]*?<script src="js\/tutorial\.js"><\/script>\n/;
const match1 = content.match(scriptBlock1Regex);
const scriptBlock1 = match1 ? match1[0] : '';
content = content.replace(scriptBlock1Regex, '');

// 3. Extract teacher dashboard
const teacherRegex = /    <!-- ========================================== -->\n    <!-- \[한글 주석\] 📊 선생님 전용 대시보드 화면 \(PC 최적화\) -->\n    <div id="teacher-dashboard-screen"[\s\S]*?      <\/div>\n\n    <\/div>\n/;
const match2 = content.match(teacherRegex);
const teacherBlock = match2 ? match2[0] : '';
content = content.replace(teacherRegex, '');

// 4. Extract safety overlay
const safetyRegex = /    <!-- 안전 경고 오버레이 \(위험 상황 시 표시됨\) -->\n    <div id="safety-overlay"[\s\S]*?      <\/div>\n    <\/div>\n/;
const match3 = content.match(safetyRegex);
const safetyBlock = match3 ? match3[0] : '';
content = content.replace(safetyRegex, '');

// 5. Extract inline scripts (help modal script, explore script, splash script)
const scriptBlock2Regex = /    <script>\n      \/\/ \[한글 주석\] 도움말 모달 열기[\s\S]*?      }\)\(\);\n    <\/script>\n/;
const match4 = content.match(scriptBlock2Regex);
const scriptBlock2 = match4 ? match4[0] : '';
content = content.replace(scriptBlock2Regex, '');

// Now we insert the wrapper exactly around main-container and help-modal
const startTag = '  <!-- [한글 주석] 학생 앱 전체 래퍼 - 학생 화면 예시에서 통째로 프레임에 넣기 위한 컨테이너 -->\n  <div id="student-app-wrapper">\n';
content = content.replace('    <!-- 메인 탐험 화면 컨테이너', startTag + '    <!-- 메인 탐험 화면 컨테이너');

const helpModalRegex = /    <!-- \[한글 주석\] 도움말 모달 -->[\s\S]*?      <\/div>\n    <\/div>\n/;
const matchHelp = content.match(helpModalRegex);
if (matchHelp) {
    const helpIndex = content.indexOf(matchHelp[0]) + matchHelp[0].length;
    const endTag = '  </div><!-- [한글 주석] student-app-wrapper 닫는 태그 -->\n\n';

    // Put everything outside!
    content = content.substring(0, helpIndex) +
        endTag +
        scriptBlock1 + '\n' +
        teacherBlock + '\n' +
        safetyBlock + '\n' +
        scriptBlock2 + '\n' +
        content.substring(helpIndex);
}

fs.writeFileSync('index.html', content, 'utf8');
console.log('Reordering completed.');
