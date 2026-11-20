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
        # 1. Login
        driver.get('http://localhost:3000/login')
        time.sleep(2)
        driver.find_element(By.NAME, 'username').send_keys('admin')
        driver.find_element(By.NAME, 'password').send_keys('admin123')
        driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()
        time.sleep(3)

        # 2. Go to Central Admin
        driver.get('http://localhost:3000/admin/central')
        time.sleep(3)

        # 3. Click "Rankings & Surveys" in sidebar
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'Rankings & Surveys' in b.text:
                b.click()
                break
        time.sleep(2)

        # 4. Click "India Today - MDRA Survey Desk" sub-tab button
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'India Today - MDRA Survey Desk' in b.text:
                b.click()
                break
        time.sleep(2)
        driver.save_screenshot(os.path.join(artifacts_dir, 'verify_official_india_today_questions.png'))
        print("Captured verify_official_india_today_questions.png")

        # 5. Click "AISHE (MoE) Survey Formatter" sub-tab button
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'AISHE (MoE) Survey Formatter' in b.text:
                b.click()
                break
        time.sleep(2)
        driver.save_screenshot(os.path.join(artifacts_dir, 'verify_official_aishe_questions.png'))
        print("Captured verify_official_aishe_questions.png")

        # 6. Click "NIRF 2027 Data Capture Dossier" sub-tab button
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'NIRF 2027 Data Capture Dossier' in b.text:
                b.click()
                break
        time.sleep(2)
        driver.execute_script("window.scrollBy(0, 450);")
        time.sleep(1)
        driver.save_screenshot(os.path.join(artifacts_dir, 'verify_official_nirf_submetrics.png'))
        print("Captured verify_official_nirf_submetrics.png")

        # 7. Click "Academic Audit (AAA)" in sidebar
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(1)
        for b in driver.find_elements(By.TAG_NAME, 'button'):
            if 'Academic Audit (AAA)' in b.text:
                b.click()
                break
        time.sleep(3)
        driver.save_screenshot(os.path.join(artifacts_dir, 'verify_aaa_multidimensional_filter_clean.png'))
        print("Captured verify_aaa_multidimensional_filter_clean.png")

    finally:
        driver.quit()

if __name__ == '__main__':
    run()
