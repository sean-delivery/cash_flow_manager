# Google Maps Business Scraper 🗺️

סקרייפר מתקדם לחיפוש עסקים ב-Google Maps עם Python.

## ✨ תכונות

- 🔍 **חיפוש מתקדם** - חיפוש עסקים לפי קטגוריה ומיקום
- 📊 **נתונים מפורטים** - שם, טלפון, כתובת, אתר, דירוגים
- 💾 **ייצוא נתונים** - CSV ו-JSON
- 🎯 **חיפוש מותאם** - הגדרת חיפושים מרובים
- 🚀 **התקנה אוטומטית** - הכל מוכן לשימוש

## 🚀 התקנה מהירה

```bash
# הורד את הקבצים
# הרץ את ההתקנה האוטומטית
python install_and_run.py
```

## 📋 דרישות מערכת

- Python 3.7+
- Google Chrome מותקן
- חיבור אינטרנט

## 🎯 שימוש

### חיפוש בסיסי
```python
from google_maps_scraper import GoogleMapsScraper

scraper = GoogleMapsScraper()
results = scraper.search_businesses("רהיטים", "תל אביב", max_results=50)
scraper.save_to_csv(results)
scraper.close()
```

### חיפוש מתקדם
```python
searches = [
    {"query": "עורכי דין", "location": "ירושלים", "max_results": 100},
    {"query": "מסעדות", "location": "חיפה", "max_results": 50},
]

scraper = GoogleMapsScraper(headless=True)
all_results = []

for search in searches:
    results = scraper.search_businesses(**search)
    all_results.extend(results)

scraper.save_to_csv(all_results, "my_businesses.csv")
scraper.close()
```

## 📊 נתונים שנאספים

- **שם העסק** - שם מלא
- **טלפון** - מספר טלפון
- **כתובת** - כתובת מלאה
- **אתר אינטרנט** - URL
- **דירוג** - כוכבים (1-5)
- **מספר ביקורות** - כמות ביקורות
- **קטגוריה** - סוג העסק
- **שעות פעילות** - זמני פתיחה
- **URL Google Maps** - קישור ישיר

## ⚙️ הגדרות מתקדמות

### מצב חשאי (Headless)
```python
scraper = GoogleMapsScraper(headless=True)  # ללא חלון דפדפן
```

### שליטה במהירות
```python
# המתנה בין חיפושים (שניות)
time.sleep(5)

# מספר תוצאות מקסימלי
max_results = 200
```

## 📁 קבצי פלט

### CSV Format
```csv
name,phone,address,website,rating,reviews_count,category,hours,google_url
"כהן רהיטים","03-1234567","רחוב הרצל 123, תל אביב","www.kohen-furniture.co.il","4.5","127","חנות רהיטים","ראשון-חמישי 9:00-18:00","https://maps.google.com/..."
```

### JSON Format
```json
{
  "name": "כהן רהיטים",
  "phone": "03-1234567",
  "address": "רחוב הרצל 123, תל אביב",
  "website": "www.kohen-furniture.co.il",
  "rating": "4.5",
  "reviews_count": "127",
  "category": "חנות רהיטים",
  "hours": "ראשון-חמישי 9:00-18:00",
  "google_url": "https://maps.google.com/...",
  "scraped_at": "2024-01-25T10:30:00"
}
```

## 🛡️ שימוש אחראי

- **קצב מתון** - המתן בין חיפושים
- **כמות סבירה** - אל תחפש יותר מדי בבת אחת
- **שימוש חוקי** - רק למטרות לגיטימיות
- **כבוד לשירות** - אל תעמיס על Google

## 🔧 פתרון בעיות

### Chrome לא נמצא
```bash
# Ubuntu/Debian
sudo apt-get install google-chrome-stable

# Windows - הורד מ:
# https://www.google.com/chrome/
```

### שגיאת ChromeDriver
```python
# הסקריפט יוריד אוטומטית, או ידנית:
from webdriver_manager.chrome import ChromeDriverManager
ChromeDriverManager().install()
```

### חיפוש לא עובד
- בדוק חיבור אינטרנט
- וודא ש-Chrome מעודכן
- נסה עם `headless=False` לראות מה קורה

## 💡 טיפים

1. **התחל קטן** - נסה עם 10-20 תוצאות קודם
2. **שמור תוצאות** - תמיד שמור ל-CSV וגם ל-JSON
3. **בדוק נתונים** - וודא שהנתונים נכונים לפני שימוש
4. **גיבוי** - שמור עותקים של התוצאות החשובות

## 📞 תמיכה

אם יש בעיות או שאלות:
1. בדוק את הלוגים בקונסול
2. וודא שכל החבילות מותקנות
3. נסה עם דוגמה פשוטה קודם

## 🎉 דוגמאות שימוש

### חיפוש עורכי דין בכל הארץ
```python
locations = ["תל אביב", "ירושלים", "חיפה", "באר שבע"]
all_lawyers = []

for location in locations:
    results = scraper.search_businesses("עורכי דין", location, 50)
    all_lawyers.extend(results)

scraper.save_to_csv(all_lawyers, "lawyers_israel.csv")
```

### חיפוש מסעדות עם פילטר דירוג
```python
restaurants = scraper.search_businesses("מסעדות", "תל אביב", 100)

# פילטר רק מסעדות עם דירוג גבוה
high_rated = [r for r in restaurants if r.get('rating') and float(r['rating']) >= 4.0]

scraper.save_to_csv(high_rated, "top_restaurants.csv")
```

---

**🚀 בהצלחה עם החיפוש! 🚀**