import re

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Remove existing wrapper lines
new_lines = []
for line in lines:
    if '<div id="student-app-wrapper">' in line or '<!-- [한글 주석] 학생 앱 전체 래퍼 - 학생 화면 예시에서 통째로 프레임에 넣기 위한 컨테이너 -->' in line:
        continue
    if '</div><!-- [한글 주석] student-app-wrapper 닫는 태그 -->' in line:
        continue
    new_lines.append(line)

content = "".join(new_lines)

# 2. Extract blocks to move
# Script block 1
s1_start = content.find('    <!-- Leaflet.js 지도 라이브러리 JS -->')
s1_end = content.find('    <!-- [한글 주석] 튜토리얼 시스템 -->\n    <script src="js/tutorial.js"></script>\n') + len('    <!-- [한글 주석] 튜토리얼 시스템 -->\n    <script src="js/tutorial.js"></script>\n')
script_block1 = content[s1_start:s1_end]
content = content[:s1_start] + content[s1_end:]

# Teacher dashboard
t_start = content.find('    <!-- ========================================== -->\n    <!-- [한글 주석] 📊 선생님 전용 대시보드 화면 (PC 최적화) -->')
t_end = content.find('      </div>\n\n    </div>\n', t_start) + len('      </div>\n\n    </div>\n')
teacher_block = content[t_start:t_end]
content = content[:t_start] + content[t_end:]

# Safety overlay
sf_start = content.find('    <!-- 안전 경고 오버레이 (위험 상황 시 표시됨) -->')
sf_end = content.find('      </div>\n    </div>\n', sf_start) + len('      </div>\n    </div>\n')
safety_block = content[sf_start:sf_end]
content = content[:sf_start] + content[sf_end:]

# Script block 2 (Inline scripts)
s2_start = content.find('    <script>\n      // [한글 주석] 도움말 모달 열기')
s2_end = content.find('      })();\n    </script>\n', s2_start) + len('      })();\n    </script>\n')
script_block2 = content[s2_start:s2_end]
content = content[:s2_start] + content[s2_end:]

# 3. Add wrapper
main_container_idx = content.find('    <!-- 메인 탐험 화면 컨테이너 (로그인 성공 시 보여짐) -->')
content = content[:main_container_idx] + '  <!-- [한글 주석] 학생 앱 전체 래퍼 - 학생 화면 예시에서 통째로 프레임에 넣기 위한 컨테이너 -->\n  <div id="student-app-wrapper">\n' + content[main_container_idx:]

help_modal_end_idx = content.find('    <!-- [한글 주석] 닫기 버튼 -->')
# Find the end of help modal which is 2 divs down
help_modal_end_idx = content.find('      </div>\n    </div>', help_modal_end_idx) + len('      </div>\n    </div>\n')

final_content = content[:help_modal_end_idx] + '  </div><!-- [한글 주석] student-app-wrapper 닫는 태그 -->\n\n' + script_block1 + teacher_block + safety_block + script_block2 + content[help_modal_end_idx:]

with open('index_reorder.html', 'w', encoding='utf-8') as f:
    f.write(final_content)
