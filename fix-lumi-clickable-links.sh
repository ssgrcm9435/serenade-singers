#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
from pathlib import Path
import re

p = Path("src/app/ai/page.tsx")
s = p.read_text()

# Add Linkify helper if missing
if "function LinkifiedText" not in s:
    helper = '''
function LinkifiedText({ text }: { text: string }) {
  const urlRegex = /(https?:\\/\\/[^\\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#2563EB",
                fontWeight: 800,
                textDecoration: "underline",
                wordBreak: "break-word",
              }}
            >
              {part}
            </a>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

'''
    s = re.sub(r'(export default function LumiPage\(\))', helper + r'\1', s, count=1)

# Replace plain text renderer
s = s.replace(
    '{message.content}',
    '<LinkifiedText text={message.content} />'
)

p.write_text(s)
print("✅ Clickable links enabled.")
PY

npm run build
