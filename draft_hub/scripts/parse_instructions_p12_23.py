with open("extracted_aaa_instructions.txt", "r", encoding="utf-8") as f:
    text = f.read()

for p in range(12, 24):
    p_str = f"--- PAGE {p} ---"
    next_p_str = f"--- PAGE {p+1} ---"
    start = text.find(p_str)
    end = text.find(next_p_str)
    if start != -1:
        page_content = text[start:end] if end != -1 else text[start:start+1200]
        first_lines = "\n".join([line for line in page_content.split("\n")[:10] if line.strip()])
        print(f"\n{p_str} Preview:\n{first_lines}")
