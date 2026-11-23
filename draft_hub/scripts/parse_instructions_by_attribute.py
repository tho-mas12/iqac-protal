with open("extracted_aaa_instructions.txt", "r", encoding="utf-8") as f:
    text = f.read()

import re

# find all page headers or attribute sections
sections = re.findall(r"(Attribute\s+[IVX]+[^\n]*)", text, re.IGNORECASE)
print("Found Attribute occurrences in PDF:", len(sections))
for s in set(sections):
    print(" •", s.strip())

# Print sample pages
for p in range(1, 12):
    p_str = f"--- PAGE {p} ---"
    next_p_str = f"--- PAGE {p+1} ---"
    start = text.find(p_str)
    end = text.find(next_p_str)
    if start != -1:
        page_content = text[start:end] if end != -1 else text[start:start+1000]
        first_lines = "\n".join([line for line in page_content.split("\n")[:8] if line.strip()])
        print(f"\n{p_str} Preview:\n{first_lines}")
