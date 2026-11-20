import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

artifact_dir = r"C:\Users\ajayj\.gemini\antigravity\brain\fa11b8b7-8a97-4df9-8743-fc1570ced21e"

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=1600,1200")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-gpu")

driver = webdriver.Chrome(options=options)

try:
    print("Navigating to faculty login...")
    driver.get("http://localhost:3000/login")
    time.sleep(1.5)
    driver.find_element(By.NAME, "username").send_keys("24cai51")
    driver.find_element(By.NAME, "password").send_keys("acaisjct")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(2.5)

    print("Navigating to faculty dashboard...")
    driver.get("http://localhost:3000/faculty/dashboard")
    time.sleep(2.5)

    # Click Performance Appraisal (PBAS) tab
    print("Clicking Performance Appraisal tab...")
    for b in driver.find_elements(By.TAG_NAME, "button"):
        if "Performance Appraisal" in b.text or "PBAS" in b.text:
            driver.execute_script("arguments[0].click();", b)
            break
    time.sleep(2)

    # Scroll down to PBAS Dynamic Data Campaigns & Performance Questions
    driver.execute_script("window.scrollTo(0, 600);")
    time.sleep(1)

    # Find and click "Fill Data" or "Edit Response" on first campaign
    print("Clicking Fill Data / Edit Response...")
    ans_buttons = [b for b in driver.find_elements(By.TAG_NAME, "button") if "Fill Data" in b.text or "Edit Response" in b.text or "Fill" in b.text]
    if ans_buttons:
        driver.execute_script("arguments[0].click();", ans_buttons[0])
        time.sleep(2)

        # Inside the Table format modal, click "+ Add Row" on the first sub-question table
        add_row_btns = [b for b in driver.find_elements(By.TAG_NAME, "button") if "+ Add Row" in b.text]
        if add_row_btns:
            print("Clicking + Add Row...")
            driver.execute_script("arguments[0].click();", add_row_btns[0])
            time.sleep(1)

        # Enter sample data in row 1 cells
        inputs = driver.find_elements(By.CSS_SELECTOR, "table input[type='text']")
        if len(inputs) >= 3:
            inputs[0].send_keys("B.Sc. Computer Science")
            inputs[1].send_keys("24UCS3201")
            inputs[2].send_keys("Artificial Intelligence & Neural Networks")

        p = os.path.join(artifact_dir, "verify_faculty_performance_questions_table_format.png")
        driver.save_screenshot(p)
        print(f"Saved: {p}")

    print("VERIFICATION COMPLETE!")

finally:
    driver.quit()
