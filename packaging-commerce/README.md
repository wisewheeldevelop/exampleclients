# FORMA — איקומרס אריזות לעסקים בישראל

קונספט front-end מלא בעברית וב־RTL לחנות B2B של קרטוני פיצה, אריזות מזון מהיר, קופסאות פלסטיק, קראפט, שקיות, סלים רב־פעמיים וכוסות.

## הפעלה

אפשר לפתוח את `index.html` ישירות בדפדפן. נדרש אינטרנט רק ל־Google Fonts; Tailwind, GSAP ו־ScrollTrigger מוגשים מקומית.

```powershell
npm install
npm run build:css
npm run audit:visual
```

## מה עובד

- ניווט Product-first ופסיפס צילום לפי שש קטגוריות מוצר.
- שמונה מוצרי עוגן עם כמות בקרטון, מחיר ליחידה, מידה והתאמה.
- Quick View עם מדרגות מחיר ו־View Transition.
- חיפוש מקומי, סל הנשמר ב־localStorage וכמויות קרטונים.
- טופס הצעת מחיר למיתוג, FAQ ותפריט מובייל.
- GSAP/ScrollTrigger, CSS scroll progress ו־reduced motion.
- focus trap, `inert`, ARIA, ניווט מקלדת ויעדי מגע 44×44.

## חשוב לפני Production

FORMA הוא שם ומיתוג placeholder. כל מחירים, זמני אספקה, משקלים, כמויות, אישורי חומר ומפרטים בדמו חייבים אימות מול הלקוח והספק. אין סליקה, מלאי, CRM או שליחת טפסים לשרת.

## מסמכים

- `RESEARCH-ISRAEL.md` — מחקר מוצר ושוק ישראלי.
- `COLOR-SYSTEM.md` — פלטה, טיפוגרפיה וטוקנים.
- `ASSET-PROMPTS.md` — סט התמונות והפרומפטים.
- `DESIGN-AUDIT-v2.md` — benchmark, ארכיטקטורה, motion ותוצאות ה־audit.
- `TECHNICAL-SPEC.md` — מבנה, בדיקות ושערי Production.
