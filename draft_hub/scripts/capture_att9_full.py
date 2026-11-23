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

    # Filter by Attribute IX (Research)
    for b in driver.find_elements(By.TAG_NAME, "button"):
        if "Attr IX" in b.text:
            b.click()
            break
    time.sleep(1)

    # Scroll down to show table rows with evidence
    driver.execute_script("window.scrollTo(0, 520);")
    time.sleep(1)

    p = os.path.join(artifact_dir, "verify_aaa_attribute_ix_rows_with_evidence.png")
    driver.save_screenshot(p)
    print(f"Saved: {p}")

finally:
    driver.quit()
