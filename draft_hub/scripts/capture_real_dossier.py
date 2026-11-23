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

    # Click Faculty Evaluation in sidebar
    for b in driver.find_elements(By.TAG_NAME, "button"):
        if "Faculty Evaluation" in b.text:
            b.click()
            break
    time.sleep(1.5)

    # Click Derived Reports button
    for b in driver.find_elements(By.TAG_NAME, "button"):
        if "Derived Reports" in b.text:
            b.click()
            break
    time.sleep(3)

    # Check if a faculty dossier is loaded
    driver.execute_script("window.scrollTo(0, 300);")
    time.sleep(1)

    p1 = os.path.join(artifact_dir, "verify_real_faculty_dossier_top.png")
    driver.save_screenshot(p1)
    print(f"Saved: {p1}")

    driver.execute_script("window.scrollTo(0, 750);")
    time.sleep(1)

    p2 = os.path.join(artifact_dir, "verify_real_faculty_dossier_table.png")
    driver.save_screenshot(p2)
    print(f"Saved: {p2}")

finally:
    driver.quit()
