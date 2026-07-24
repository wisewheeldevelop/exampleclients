# KAV — Premium electric mobility ecommerce concept

דמו front-end מלא לחנות אופניים וקורקינטים חשמליים בישראל, בעברית וב־RTL.

האתר רץ כ־HTML/CSS/JavaScript סטטי לחלוטין: אין React, אין JSX, אין hydration ואין bundler בצד הלקוח. קובצי npm משמשים רק ככלי פיתוח אופציונליים לבניית Tailwind ולביקורת חזותית; הם אינם נדרשים לפתיחת האתר או להפעלתו.

## פתיחה

פתחו את `index.html` בדפדפן. קובצי Tailwind ו־GSAP בנויים ומקומיים; נדרש חיבור אינטרנט רק לטעינת Google Fonts.

לבניית CSS ולריצת ביקורת המסכים האוטומטית:

```powershell
npm install
npm run build:css
npm run audit:visual
```

לבדיקה דרך שרת מקומי:

```powershell
python -m http.server 8080 -d kav
```

ואז פתחו `http://localhost:8080`.

## מה עובד בדמו

- קטלוג וסינון בין אופניים לקורקינטים
- quick view לכל דגם
- סל צדדי הנשמר ב־localStorage
- חיפוש מקומי
- שאלון התאמת כלי
- תפריט מובייל, FAQ וטופס הרשמה מדומה
- GSAP ScrollTrigger מקומי, View Transitions והתקדמות גלילה native, עם תמיכה ב־reduced motion
- ניווט מקלדת, focus trap ו־ARIA ל־dialogs/tabs/accordion

## לפני Production

זהו קונספט ולא אתר מכירה פעיל. כל שמות הדגמים, המחירים, הטווחים, תנאי האחריות והביקורות הם תוכן הדגמה. יש לפעול לפי checklist ההשקה ב־`TECHNICAL-SPEC.md` ולבצע אימות מסחרי, רגולטורי ומשפטי.

## מסמכים

- `RESEARCH.md` — מחקר שוק, קהלים, מתחרים, רגולציה וכיוון מותגי.
- `TECHNICAL-SPEC.md` — ארכיטקטורה, stack, נגישות, ביצועים ואינטגרציות.
- `ASSET-PROMPTS.md` — מפרט יצירת התמונות והנכסים המקוריים.
- `AAAA-AUDIT.md` — החלטת מנהל עיצוב, עקרונות השדרוג ותוצאות ביקורת המסכים.
