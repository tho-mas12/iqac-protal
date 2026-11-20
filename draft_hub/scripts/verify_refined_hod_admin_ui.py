import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

chrome_options = Options()
chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--window-size=1440,1050")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

driver = webdriver.Chrome(options=chrome_options)

try:
    print("1. Loading Login Page...")
    driver.get("http://localhost:3000/login")
    time.sleep(2)
    driver.save_screenshot("verify_refined_login.png")
    print("Login screenshot saved.")

    # Login as Dr. S. Britto Ramesh Kumar (12fcs01 / 123)
    print("2. Logging in as HOD Dr. S. Britto Ramesh Kumar (12fcs01)...")
    username_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='username']"))
    )
    password_field = driver.find_element(By.CSS_SELECTOR, "input[name='password']")
    
    username_field.clear()
    username_field.send_keys("12fcs01")
    password_field.clear()
    password_field.send_keys("123")

    submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
    submit_btn.click()

    time.sleep(3)
    print("Current URL after HOD login:", driver.current_url)
    driver.save_screenshot("verify_refined_hod_dashboard.png")
    print("HOD Dashboard screenshot saved.")

    # Click on 'Review & Approve' to show modal
    try:
        review_btn = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Review & Approve')]"))
        )
        review_btn.click()
        time.sleep(1.5)
        driver.save_screenshot("verify_refined_hod_review_modal.png")
        print("HOD Review Modal screenshot saved.")
        close_btn = driver.find_element(By.XPATH, "//button[contains(., 'Close')]")
        close_btn.click()
        time.sleep(1)
    except Exception as e:
        print("Review button modal test note:", e)

    # Click on 'Department Faculty Status Roster' tab
    try:
        roster_tab = driver.find_element(By.XPATH, "//button[contains(., 'Department Faculty Status Roster')]")
        roster_tab.click()
        time.sleep(1.5)
        driver.save_screenshot("verify_refined_hod_roster_tab.png")
        print("HOD Roster Tab screenshot saved.")
    except Exception as e:
        print("Roster tab test note:", e)

    # Click on 'My Teaching Courses' tab
    try:
        my_courses_tab = driver.find_element(By.XPATH, "//button[contains(., 'My Teaching Courses')]")
        my_courses_tab.click()
        time.sleep(1.5)
        driver.save_screenshot("verify_refined_hod_my_courses_tab.png")
        print("HOD My Courses Tab screenshot saved.")
    except Exception as e:
        print("My courses tab test note:", e)

    # Sign out and log in as Admin
    print("3. Logging out...")
    signout_btn = driver.find_element(By.XPATH, "//button[contains(., 'Sign Out')]")
    signout_btn.click()
    time.sleep(2)

    print("4. Logging in as Admin (admin / admin123)...")
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
    print("Current URL after Admin login:", driver.current_url)
    driver.save_screenshot("verify_refined_admin_dashboard.png")
    print("Admin Dashboard screenshot saved.")

    # Click on 'Inspect TLE' button in Admin
    try:
        inspect_btn = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Inspect TLE')]"))
        )
        inspect_btn.click()
        time.sleep(1.5)
        driver.save_screenshot("verify_refined_admin_inspect_tle_modal.png")
        print("Admin Inspect TLE modal screenshot saved.")
    except Exception as e:
        print("Admin inspect TLE note:", e)

finally:
    driver.quit()
    print("Verification complete.")
