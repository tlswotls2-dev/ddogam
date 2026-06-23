import json

with open(r'C:\Users\tlswo\.gemini\antigravity-ide\brain\960a252e-abe3-444a-a02c-18a3fa10f846\.system_generated\logs\transcript.jsonl', 'r', encoding='utf-8') as f:
    with open('scratch.txt', 'w', encoding='utf-8') as out:
        for line in f:
            try:
                data = json.loads(line)
                if data.get('type') == 'USER_INPUT':
                    out.write(data.get('content', '') + '\n---\n')
            except Exception as e:
                out.write(f'Error: {e}\n')
