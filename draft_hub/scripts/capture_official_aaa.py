import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

artifact_dir = r"C:\Users\ajayj\.gemini\antigravity\brain\fa11b8b7-8a97-4df9-8743-fc1570ced21e"

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=1440,1100")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-gpu")

driver = webdriver.Chrome(options=options)

try:
    driver.get("http://localhost:3000/login")
    time.sleep(1.5)
    driver.find_element(By.NAME, "username").send_keys("admin")
    driver.find_element(By.NAME, "password").send_keys("admin123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(2.5)

    driver.get("http://localhost:3000/admin/central")
    time.sleep(2)

    # Click Academic Audit (AAA)
    for b in driver.find_elements(By.TAG_NAME, "button"):
        if "Academic Audit (AAA)" in b.text:
            b.click()
            break
    time.sleep(1.5)

    # Click Metric & Attribute Creation Desk
    for b in driver.find_elements(By.TAG_NAME, "button"):
        if "Metric & Attribute Creation Desk" in b.text:
            b.click()
            break
    time.sleep(1.5)

    # Screenshot 1: Full top view with 64 metrics badge, PDF button, and Common Instructions
    p1 = os.path.join(artifact_dir, "verify_aaa_official_instructions_banner.png")
    driver.save_screenshot(p1)
    print(f"Saved: {p1}")

    # Scroll down to reveal table with supportive documents and guidelines
    driver.execute_script("window.scrollTo(0, 480);")
    time.sleep(1)

    p2 = os.path.join(artifact_dir, "verify_aaa_official_questions_table.png")
    driver.save_screenshot(p2)
    print(f"Saved: {p2}")

    # Filter by Attribute IX (Research)
    for b in driver.find_elements(By.TAG_NAME, "button"):
        if "Attr IX" in b.text:
            b.click()
            break
    time.sleep(1)

    p3 = os.path.join(artifact_dir, "verify_aaa_attribute_ix_filtered.png")
    driver.save_screenshot(p3)
    print(f"Saved: {p3}")

    print("ALL OFFICIAL AAA VERIFICATIONS CAPTURED SUCCESSFULLY!")

finally:
    driver.quit()
