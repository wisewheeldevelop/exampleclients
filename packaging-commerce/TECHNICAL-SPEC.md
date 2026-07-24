# FORMA — מפרט טכני ו־handoff

## מבנה

```text
packaging-commerce/
├── index.html
├── src/tailwind.css
├── css/{tailwind,site}.css
├── js/site.js
├── js/vendor/{gsap,ScrollTrigger}.min.js
├── assets/images/*.{png,jpg}
├── scripts/visual-audit.mjs
├── audit/after/*
├── package.json
└── package-lock.json
```

## Stack

- HTML סמנטי, `dir="rtl"` ו־ARIA בעברית.
- Tailwind CSS v4.3.3 נבנה מראש דרך CLI.
- CSS מותאם למערכת העיצוב והקומפוננטות.
- JavaScript ללא framework לקטלוג, חיפוש, modal, סל, quote ו־FAQ.
- GSAP 3.15 + ScrollTrigger מקומיים.
- native View Transitions ו־CSS Scroll Timeline כ־progressive enhancement.
- Google Fonts: Assistant + Manrope.
- אייקוני SVG קוויים מותאמים; אין icon font או ספרייה גנרית.

## מודל מוצר

```js
{
  id, category, name, eyebrow, code,
  price, unit, pack, size, fit,
  image, badge, description, tiers
}
```

ב־Production יש להחליף את הנתונים ב־API/CMS עם SKU, EAN, התאמות מכסה, מלאי, מס, מדרגות מחיר, מינימום מיתוג, אישורי מגע מזון, טמפרטורה, מיקרוגל ומשלוח.

## בדיקה אוטומטית

הרצה: `npm run audit:visual` ב־Chrome headless.

- viewports: 1440×1050 ו־390×844.
- 8 מוצרים נטענו; פילטר פלסטיק החזיר מוצר אחד.
- Quick View, סל ותפריט מובייל נפתחו בהצלחה.
- Axe: 0 violations תחת WCAG 2.0/2.1/2.2 A–AA; 27 קבוצות עברו ו־1 נותרה לבדיקה אנושית.
- 0 שגיאות Console.

התוצאה אינה הסמכה. לפני השקה נדרשות בדיקות screen reader, מקלדת, zoom, forced colors, reduced motion וביקורת ת״י 5568 לפי הצורך.

## שערי Production

1. החלפת FORMA בשם, לוגו ושפה מאושרים.
2. אימות מחיר, מע״מ, כמות בקרטון, חומר, מכסה, מידות ומלאי לכל SKU.
3. חיבור commerce/backend, CRM, סליקה, מסמכים, משלוחים וקבלות.
4. מנוע מדרגות מחיר והרשאות לקוח עסקי בצד השרת.
5. CMS להצעות מיתוג, דוגמאות דפוס וזמני ייצור.
6. אירוח מקומי לפונטים לפי צורך, CSP, hashing ו־responsive AVIF/WebP.
7. Lighthouse/Web Vitals על staging ומכשיר Android ביניים; נתוני `file://` אינם מדדי Production.
