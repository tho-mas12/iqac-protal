import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

artifact_dir = r"C:\Users\ajayj\.gemini\antigravity\brain\fa11b8b7-8a97-4df9-8743-fc1570ced21e"

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=1440,960")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-gpu")

driver = webdriver.Chrome(options=options)

try:
    print("Navigating to login page...")
    driver.get("http://localhost:3000/login")
    time.sleep(2)

    # Login
    username_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "username"))
    )
    username_input.clear()
    username_input.send_keys("admin")

    password_input = driver.find_element(By.NAME, "password")
    password_input.clear()
    password_input.send_keys("admin123")

    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_btn.click()
    print("Submitted login form...")
    time.sleep(3)

    # Go to Central Admin Console
    driver.get("http://localhost:3000/admin/central")
    time.sleep(3)

    # Screenshot 1: Dashboard with Concept Cards & AAA Desk Button
    p1 = os.path.join(artifact_dir, "verify_aaa_metric_desk_dashboard.png")
    driver.save_screenshot(p1)
    print(f"Saved: {p1}")

    # Click Academic Audit (AAA) in sidebar
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for b in buttons:
        if "Academic Audit (AAA)" in b.text:
            b.click()
            break
    time.sleep(2)

    # Click "⚙️ Metric & Attribute Creation Desk"
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for b in buttons:
        if "Metric & Attribute Creation Desk" in b.text:
            b.click()
            break
    time.sleep(2)

    # Screenshot 2: Metric & Attribute Creation Desk Table
    p2 = os.path.join(artifact_dir, "verify_aaa_metric_desk_table.png")
    driver.save_screenshot(p2)
    print(f"Saved: {p2}")

    # Click "+ Create New AAA Metric"
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for b in buttons:
        if "Create New AAA Metric" in b.text:
            b.click()
            break
    time.sleep(1.5)

    # Screenshot 3: Create AAA Metric Modal
    p3 = os.path.join(artifact_dir, "verify_aaa_metric_desk_modal.png")
    driver.save_screenshot(p3)
    print(f"Saved: {p3}")

    print("ALL SCREENSHOTS CAPTURED SUCCESSFULLY!")

finally:
    driver.quit()
