import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

def run():
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')

    driver = webdriver.Chrome(options=chrome_options)
    artifacts_dir = r"C:\Users\ajayj\.gemini\antigravity\brain\fa11b8b7-8a97-4df9-8743-fc1570ced21e"

    try:
        # 1. Login as Admin
        driver.get('http://localhost:3000/login')
        time.sleep(2)
        driver.find_element(By.NAME, 'username').send_keys('admin')
        driver.find_element(By.NAME, 'password').send_keys('admin123')
        driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()
        time.sleep(3)

        # 2. Go to Central Admin
        driver.get('http://localhost:3000/admin/central')
        time.sleep(4)

        # 3. Click Rankings & Surveys tab
        buttons = driver.find_elements(By.TAG_NAME, 'button')
        for b in buttons:
            if 'Rankings & Surveys' in b.text:
                b.click()
                break
        time.sleep(2)

        # Click India Today sub-tab
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'India Today' in b.text:
                b.click()
                break
        time.sleep(2)
        driver.save_screenshot(os.path.join(artifacts_dir, 'verify_official_india_today_questions.png'))
        print("Captured verify_official_india_today_questions.png")

        # Click AISHE sub-tab
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'AISHE' in b.text:
                b.click()
                break
        time.sleep(2)
        driver.save_screenshot(os.path.join(artifacts_dir, 'verify_official_aishe_questions.png'))
        print("Captured verify_official_aishe_questions.png")

        # Click NIRF Dossier sub-tab
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'NIRF' in b.text:
                b.click()
                break
        time.sleep(2)
        # Scroll down slightly to see submetrics table
        driver.execute_script("window.scrollBy(0, 500);")
        time.sleep(1)
        driver.save_screenshot(os.path.join(artifacts_dir, 'verify_official_nirf_submetrics.png'))
        print("Captured verify_official_nirf_submetrics.png")

        # 4. Check Course Plan & TLE Inspection Modal
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(1)
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'Course Plan & TLE' in b.text:
                b.click()
                break
        time.sleep(2)

        # Click "Inspect TLE" on first course plan
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'Inspect TLE' in b.text:
                b.click()
                break
        time.sleep(2)
        driver.save_screenshot(os.path.join(artifacts_dir, 'verify_course_plan_inspect_tle_modal.png'))
        print("Captured verify_course_plan_inspect_tle_modal.png")

        # Close modal
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'Close' in b.text:
                b.click()
                break
        time.sleep(1)

        # 5. Check AAA Multi-Dimensional Filter
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'AAA Audit Console' in b.text:
                b.click()
                break
        time.sleep(2)
        driver.save_screenshot(os.path.join(artifacts_dir, 'verify_aaa_multidimensional_filter_clean.png'))
        print("Captured verify_aaa_multidimensional_filter_clean.png")

    finally:
        driver.quit()

if __name__ == '__main__':
    run()
