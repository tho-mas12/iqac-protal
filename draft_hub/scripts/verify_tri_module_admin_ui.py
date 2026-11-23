import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

chrome_options = Options()
chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--window-size=1440,1100")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

driver = webdriver.Chrome(options=chrome_options)

try:
    print("1. Logging in as Admin (admin / admin123)...")
    driver.get("http://localhost:3000/login")
    time.sleep(2)

    username_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='username']"))
    )
    password_field = driver.find_element(By.CSS_SELECTOR, "input[name='password']")
    
    username_field.clear()
    username_field.send_keys("admin")
    password_field.clear()
    password_field.send_keys("admin123")

    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_btn.click()

    time.sleep(3)
    print("Logged in. Current URL:", driver.current_url)

    # Screenshot 1: Unified 3-Module Command Hub
    driver.save_screenshot("verify_admin_tri_module_unified.png")
    print("1. Saved verify_admin_tri_module_unified.png")

    # Screenshot 2: Course Plans & TLE Hub
    cp_tab = driver.find_element(By.XPATH, "//button[contains(., 'Course Plans & TLE Hub')]")
    cp_tab.click()
    time.sleep(2)
    driver.save_screenshot("verify_admin_course_plan_hub.png")
    print("2. Saved verify_admin_course_plan_hub.png")

    # Screenshot 3: Event Invitations Hub
    inv_tab = driver.find_element(By.XPATH, "//button[contains(., 'Event Invitations Hub')]")
    inv_tab.click()
    time.sleep(2)
    driver.save_screenshot("verify_admin_invitations_hub.png")
    print("3. Saved verify_admin_invitations_hub.png")

    # Screenshot 4: AAA Audit & Meeting Hub
    aaa_tab = driver.find_element(By.XPATH, "//button[contains(., 'AAA Audit & Meeting Hub')]")
    aaa_tab.click()
    time.sleep(2)
    driver.save_screenshot("verify_admin_aaa_hub.png")
    print("4. Saved verify_admin_aaa_hub.png")

finally:
    driver.quit()
    print("Tri-module verification complete.")
