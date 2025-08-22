#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Maps Business Scraper
חיפוש עסקים ישירות מ-Google Maps
"""

import time
import json
import csv
import re
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import requests
from urllib.parse import quote

class GoogleMapsScraper:
    def __init__(self, headless=True):
        """אתחול הסקרייפר"""
        self.setup_driver(headless)
        self.results = []
        
    def setup_driver(self, headless=True):
        """הגדרת Chrome driver"""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        
    def search_businesses(self, query, location="Israel", max_results=100):
        """חיפוש עסקים ב-Google Maps"""
        print(f"🔍 מחפש: {query} ב{location}")
        
        # בניית URL לחיפוש
        search_query = f"{query} {location}"
        url = f"https://www.google.com/maps/search/{quote(search_query)}"
        
        print(f"🌐 פותח: {url}")
        self.driver.get(url)
        
        # המתנה לטעינת התוצאות
        time.sleep(3)
        
        # גלילה לטעינת תוצאות נוספות
        self.scroll_for_results(max_results)
        
        # חילוץ התוצאות
        businesses = self.extract_business_data()
        
        print(f"✅ נמצאו {len(businesses)} עסקים")
        return businesses
    
    def scroll_for_results(self, max_results):
        """גלילה לטעינת תוצאות נוספות"""
        print("📜 גולל לטעינת תוצאות...")
        
        # מציאת פאנל התוצאות
        try:
            results_panel = self.wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[role="main"]'))
            )
        except TimeoutException:
            print("❌ לא נמצא פאנל תוצאות")
            return
        
        last_height = 0
        scroll_attempts = 0
        max_scroll_attempts = 20
        
        while scroll_attempts < max_scroll_attempts:
            # גלילה למטה
            self.driver.execute_script(
                "arguments[0].scrollTop = arguments[0].scrollHeight", 
                results_panel
            )
            
            time.sleep(2)
            
            # בדיקת מספר התוצאות הנוכחי
            current_results = len(self.driver.find_elements(By.CSS_SELECTOR, '[data-result-index]'))
            
            if current_results >= max_results:
                print(f"🎯 הגענו למספר התוצאות המבוקש: {current_results}")
                break
                
            # בדיקה אם יש עוד תוצאות לטעון
            new_height = self.driver.execute_script(
                "return arguments[0].scrollHeight", results_panel
            )
            
            if new_height == last_height:
                scroll_attempts += 1
                print(f"⏳ ניסיון גלילה {scroll_attempts}/{max_scroll_attempts}")
            else:
                scroll_attempts = 0
                
            last_height = new_height
            
        print(f"📊 סיימנו גלילה. נמצאו {current_results} תוצאות")
    
    def extract_business_data(self):
        """חילוץ נתוני העסקים"""
        businesses = []
        
        # מציאת כל התוצאות
        business_elements = self.driver.find_elements(By.CSS_SELECTOR, '[data-result-index]')
        
        print(f"🔄 מעבד {len(business_elements)} עסקים...")
        
        for i, element in enumerate(business_elements):
            try:
                business_data = self.extract_single_business(element, i)
                if business_data:
                    businesses.append(business_data)
                    
            except Exception as e:
                print(f"❌ שגיאה בעיבוד עסק {i}: {str(e)}")
                continue
                
        return businesses
    
    def extract_single_business(self, element, index):
        """חילוץ נתונים של עסק יחיד"""
        business = {
            'index': index + 1,
            'name': '',
            'address': '',
            'phone': '',
            'website': '',
            'rating': '',
            'reviews_count': '',
            'category': '',
            'hours': '',
            'price_level': '',
            'google_url': '',
            'scraped_at': datetime.now().isoformat()
        }
        
        try:
            # לחיצה על העסק לפתיחת הפרטים
            element.click()
            time.sleep(2)
            
            # שם העסק
            try:
                name_element = self.wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'h1'))
                )
                business['name'] = name_element.text.strip()
            except:
                business['name'] = "לא נמצא שם"
            
            # כתובת
            try:
                address_element = self.driver.find_element(
                    By.CSS_SELECTOR, '[data-item-id="address"] .fontBodyMedium'
                )
                business['address'] = address_element.text.strip()
            except:
                pass
            
            # טלפון
            try:
                phone_element = self.driver.find_element(
                    By.CSS_SELECTOR, '[data-item-id*="phone"] .fontBodyMedium'
                )
                business['phone'] = phone_element.text.strip()
            except:
                pass
            
            # אתר אינטרנט
            try:
                website_element = self.driver.find_element(
                    By.CSS_SELECTOR, '[data-item-id="authority"] a'
                )
                business['website'] = website_element.get_attribute('href')
            except:
                pass
            
            # דירוג וביקורות
            try:
                rating_element = self.driver.find_element(
                    By.CSS_SELECTOR, '.fontDisplayLarge'
                )
                business['rating'] = rating_element.text.strip()
                
                reviews_element = self.driver.find_element(
                    By.CSS_SELECTOR, '.fontBodyMedium .fontBodyMedium'
                )
                reviews_text = reviews_element.text.strip()
                # חילוץ מספר הביקורות
                reviews_match = re.search(r'(\d+)', reviews_text)
                if reviews_match:
                    business['reviews_count'] = reviews_match.group(1)
            except:
                pass
            
            # קטגוריה
            try:
                category_element = self.driver.find_element(
                    By.CSS_SELECTOR, '.fontBodyMedium .fontBodyMedium'
                )
                business['category'] = category_element.text.strip()
            except:
                pass
            
            # שעות פעילות
            try:
                hours_button = self.driver.find_element(
                    By.CSS_SELECTOR, '[data-item-id="oh"] .fontBodyMedium'
                )
                business['hours'] = hours_button.text.strip()
            except:
                pass
            
            # URL של Google Maps
            business['google_url'] = self.driver.current_url
            
            print(f"✅ {index + 1}. {business['name']} - {business['phone']}")
            
            return business
            
        except Exception as e:
            print(f"❌ שגיאה בחילוץ נתונים: {str(e)}")
            return None
    
    def save_to_csv(self, businesses, filename=None):
        """שמירה לקובץ CSV"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"google_maps_results_{timestamp}.csv"
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            if not businesses:
                print("❌ אין נתונים לשמירה")
                return
                
            fieldnames = businesses[0].keys()
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for business in businesses:
                writer.writerow(business)
        
        print(f"💾 נשמר בקובץ: {filename}")
        return filename
    
    def save_to_json(self, businesses, filename=None):
        """שמירה לקובץ JSON"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"google_maps_results_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(businesses, jsonfile, ensure_ascii=False, indent=2)
        
        print(f"💾 נשמר בקובץ: {filename}")
        return filename
    
    def close(self):
        """סגירת הדפדפן"""
        if hasattr(self, 'driver'):
            self.driver.quit()

def main():
    """פונקציה ראשית"""
    print("🚀 Google Maps Business Scraper")
    print("=" * 50)
    
    # הגדרות חיפוש
    searches = [
        {"query": "רהיטים", "location": "תל אביב", "max_results": 50},
        {"query": "עורכי דין", "location": "ירושלים", "max_results": 30},
        {"query": "מסעדות", "location": "חיפה", "max_results": 40},
    ]
    
    scraper = GoogleMapsScraper(headless=False)  # False כדי לראות את הדפדפן
    
    try:
        all_results = []
        
        for search in searches:
            print(f"\n🔍 מתחיל חיפוש: {search['query']} ב{search['location']}")
            
            results = scraper.search_businesses(
                query=search['query'],
                location=search['location'],
                max_results=search['max_results']
            )
            
            # הוספת מידע על החיפוש
            for result in results:
                result['search_query'] = search['query']
                result['search_location'] = search['location']
            
            all_results.extend(results)
            
            print(f"✅ הושלם חיפוש: {len(results)} תוצאות")
            time.sleep(5)  # המתנה בין חיפושים
        
        # שמירת התוצאות
        if all_results:
            csv_file = scraper.save_to_csv(all_results)
            json_file = scraper.save_to_json(all_results)
            
            print(f"\n🎉 סיימנו! נמצאו {len(all_results)} עסקים בסך הכל")
            print(f"📁 קבצים נשמרו: {csv_file}, {json_file}")
        else:
            print("❌ לא נמצאו תוצאות")
            
    except KeyboardInterrupt:
        print("\n⏹️ החיפוש הופסק על ידי המשתמש")
    except Exception as e:
        print(f"❌ שגיאה כללית: {str(e)}")
    finally:
        scraper.close()

if __name__ == "__main__":
    main()