import pypdf

reader = pypdf.PdfReader(r"iqac_aaa\Templates_AAA_2026-2027\AAA_2026_2027_Instructions.pdf")
print("Total PDF pages:", len(reader.pages))

full_text = []
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    full_text.append(f"--- PAGE {i+1} ---\n{text}")

all_instructions = "\n".join(full_text)
with open("extracted_aaa_instructions.txt", "w", encoding="utf-8") as f:
    f.write(all_instructions)

print("Saved instructions. Length:", len(all_instructions))
print("First 1500 chars:\n", all_instructions[:1500])
