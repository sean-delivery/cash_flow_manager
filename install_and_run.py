#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
התקנה והרצה אוטומטית של Google Maps Scraper
"""

import subprocess
import sys
import os

def install_requirements():
    """התקנת החבילות הנדרשות"""
    print("📦 מתקין חבילות Python...")
    
    requirements = [
        "selenium==4.15.2",
        "requests==2.31.0", 
        "webdriver-manager==4.0.1"
    ]
    
    for package in requirements:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ הותקן: {package}")
        except subprocess.CalledProcessError:
            print(f"❌ שגיאה בהתקנת: {package}")
            return False
    
    return True

def download_chromedriver():
    """הורדה אוטומטית של ChromeDriver"""
    print("🌐 מוריד ChromeDriver...")
    
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        
        # הורדה והתקנה אוטומטית
        driver_path = ChromeDriverManager().install()
        print(f"✅ ChromeDriver הותקן ב: {driver_path}")
        
        # בדיקה שהדרייבר עובד
        service = Service(driver_path)
        driver = webdriver.Chrome(service=service)
        driver.quit()
        print("✅ ChromeDriver עובד תקין")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה בהורדת ChromeDriver: {str(e)}")
        return False

def create_custom_search():
    """יצירת קובץ חיפוש מותאם אישית"""
    
    print("\n🎯 הגדרת חיפוש מותאם אישית")
    print("=" * 40)
    
    searches = []
    
    while True:
        print(f"\nחיפוש #{len(searches) + 1}:")
        query = input("מה לחפש? (לדוגמה: רהיטים, עורכי דין): ").strip()
        if not query:
            break
            
        location = input("איפה לחפש? (לדוגמה: תל אביב, ירושלים): ").strip()
        if not location:
            location = "ישראל"
            
        try:
            max_results = int(input("כמה תוצאות? (ברירת מחדל: 50): ") or "50")
        except ValueError:
            max_results = 50
        
        searches.append({
            "query": query,
            "location": location, 
            "max_results": max_results
        })
        
        continue_search = input("\nהוסיף חיפוש נוסף? (y/n): ").lower()
        if continue_search != 'y':
            break
    
    if not searches:
        print("❌ לא הוגדרו חיפושים")
        return None
    
    # יצירת קובץ חיפוש מותאם
    custom_script = f'''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
חיפוש מותאם אישית - נוצר אוטומטית
"""

from google_maps_scraper import GoogleMapsScraper
import time

def main():
    print("🚀 מתחיל חיפוש מותאם אישית")
    print("=" * 50)
    
    searches = {searches}
    
    scraper = GoogleMapsScraper(headless=False)
    
    try:
        all_results = []
        
        for i, search in enumerate(searches, 1):
            print(f"\\n🔍 חיפוש {{i}}/{{len(searches)}}: {{search['query']}} ב{{search['location']}}")
            
            results = scraper.search_businesses(
                query=search['query'],
                location=search['location'],
                max_results=search['max_results']
            )
            
            for result in results:
                result['search_query'] = search['query']
                result['search_location'] = search['location']
            
            all_results.extend(results)
            print(f"✅ נמצאו {{len(results)}} תוצאות")
            
            if i < len(searches):
                print("⏳ המתנה 5 שניות לפני החיפוש הבא...")
                time.sleep(5)
        
        if all_results:
            csv_file = scraper.save_to_csv(all_results)
            json_file = scraper.save_to_json(all_results)
            
            print(f"\\n🎉 סיימנו! נמצאו {{len(all_results)}} עסקים בסך הכל")
            print(f"📁 קבצים נשמרו:")
            print(f"   📊 CSV: {{csv_file}}")
            print(f"   📋 JSON: {{json_file}}")
        else:
            print("❌ לא נמצאו תוצאות")
            
    except KeyboardInterrupt:
        print("\\n⏹️ החיפוש הופסק על ידי המשתמש")
    except Exception as e:
        print(f"❌ שגיאה: {{str(e)}}")
    finally:
        scraper.close()

if __name__ == "__main__":
    main()
'''
    
    with open("my_custom_search.py", "w", encoding="utf-8") as f:
        f.write(custom_script)
    
    print(f"✅ נוצר קובץ: my_custom_search.py")
    return "my_custom_search.py"

def main():
    """פונקציה ראשית"""
    print("🚀 Google Maps Scraper - התקנה והרצה")
    print("=" * 50)
    
    # בדיקת Python
    print(f"🐍 Python version: {sys.version}")
    
    # התקנת חבילות
    if not install_requirements():
        print("❌ שגיאה בהתקנת החבילות")
        return
    
    # הורדת ChromeDriver
    if not download_chromedriver():
        print("❌ שגיאה בהורדת ChromeDriver")
        return
    
    print("\n✅ ההתקנה הושלמה בהצלחה!")
    
    # בחירת אופן הרצה
    print("\nבחר אופן הרצה:")
    print("1. חיפוש לדוגמה (רהיטים, עורכי דין, מסעדות)")
    print("2. חיפוש מותאם אישית")
    print("3. יציאה")
    
    choice = input("\nבחירה (1-3): ").strip()
    
    if choice == "1":
        print("\n🚀 מריץ חיפוש לדוגמה...")
        subprocess.run([sys.executable, "google_maps_scraper.py"])
        
    elif choice == "2":
        custom_file = create_custom_search()
        if custom_file:
            print(f"\n🚀 מריץ חיפוש מותאם: {custom_file}")
            subprocess.run([sys.executable, custom_file])
            
    elif choice == "3":
        print("👋 להתראות!")
        
    else:
        print("❌ בחירה לא תקינה")

if __name__ == "__main__":
    main()