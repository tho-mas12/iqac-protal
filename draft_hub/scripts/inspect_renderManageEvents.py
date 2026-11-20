with open('temp_iqac_ref/app.js', 'r', encoding='utf-8') as f:
    code = f.read()

pos = code.find('function renderManageEvents')
if pos != -1:
    print(code[pos:pos+2500])
else:
    print("renderManageEvents not found")
