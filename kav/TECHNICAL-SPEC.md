# KAV — אפיון טכני וחוויית מוצר

## מטרת גרסת הדמו

Homepage מסחרי מלא בעברית וב־RTL שממחיש מערכת עיצוב, קטלוג, התאמת דגם, quick view, סל צדדי ואנימציות. הדמו הוא front-end בלבד; אין בו סליקה, מלאי, CMS או שליחת טפסים לשרת.

## ארכיטקטורת הדמו

```text
kav/
├── index.html
├── src/tailwind.css
├── css/tailwind.css
├── css/site.css
├── js/site.js
├── js/vendor/{gsap,ScrollTrigger}.min.js
├── scripts/visual-audit.mjs
├── audit/{01-before,02-after}/*
├── assets/images/*
├── package.json
├── RESEARCH.md
└── TECHNICAL-SPEC.md
```

## Stack

- HTML סמנטי עם `dir="rtl"` ושמות aria בעברית.
- Tailwind CSS v4 נבנה ב־CLI לקובץ סטטי וממוזער; אין Play CDN בזמן ריצה.
- CSS מותאם ל־design tokens, קומפוננטות מורכבות ו־progressive enhancement.
- GSAP + ScrollTrigger לאנימציות מבוססות גלילה.
- גלילה טבעית של הדפדפן, CSS Scroll-Driven Animation עם fallback ב־JavaScript, ו־View Transitions כ־progressive enhancement.
- JavaScript מודולרי ללא framework: נתוני מוצרים, tabs, quiz, modal, cart, menu ו־FAQ.
- Google Fonts: Assistant + Manrope.
- SVG inline מותאם אישית; אין ספריית אייקונים גנרית.

## החלטת Production

גרסאות npm נעולות ב־`package-lock.json`, Tailwind נבנה מראש ו־GSAP/ScrollTrigger מוגשים מקומית. לפני Production נותר להעביר את Google Fonts לאירוח מקומי לפי רישוי וצורך, להוסיף hashing לנכסים, CSP ללא `unsafe-inline`, CDN תמונות ו־pipeline ל־AVIF/WebP.

## Design tokens

```css
--ink: #101311;
--paper: #f1f0ea;
--signal: #d8ff36;
--cobalt: #4e63ff;
--fog: #d8dad3;
--radius-sm: 14px;
--radius-md: 24px;
--radius-lg: 36px;
--ease-out: cubic-bezier(.16,1,.3,1);
```

## Breakpoints והתנהגות

- Mobile: 360–767 — column יחיד, tabs אופקיים, סל/תפריט/quick view כ־sheet.
- Tablet: 768–1023 — grid דו־עמודי, ניווט מקוצר.
- Desktop: 1024+ — hero דו־עמודי, grid 2×2/4, mega navigation מינימלי.
- Large: 1440+ — max content width של 1440px; לא מותחים טקסט ללא גבול.

## מודל מוצר לדמו

```js
{
  id, category, name, eyebrow, price, oldPrice,
  range, weight, battery, charge, colors,
  image, description, badge
}
```

מפרטים הם placeholder ויוחלפו ממקור נתונים מאומת. ב־Production יש לשמור מפרט טכני מובנה, וריאנטים, SKU, מלאי לפי סניף, מחיר, מבצע, מדיניות אחריות ומסמכי תקינה.

## קומפוננטות

- Announcement bar
- Sticky header + mobile drawer
- Hero + trust rail
- Category tabs + product cards
- Quick-view dialog
- Cart drawer
- Ride-matcher quiz
- Editorial feature story
- Service cards
- Reviews marquee
- FAQ accordion
- Newsletter/footer
- Floating consultation action

## כללי אנימציה וביצועים

- כל התוכן קריא ונגיש גם אם JS או ספריית אנימציה לא נטענים.
- אנימציות משתמשות ב־transform/opacity בלבד ככל האפשר.
- image hero עם `fetchpriority="high"`; שאר התמונות `loading="lazy"`.
- `aspect-ratio` ו־width/height כדי למנוע CLS.
- `prefers-reduced-motion` מכבה parallax, marquee ו־transitions לא חיוניים; אין scroll hijacking.
- יעד Production: LCP מתחת 2.5s, CLS מתחת 0.1, INP מתחת 200ms על mobile mid-tier.

## נגישות

- skip link, landmarks, heading order, focus-visible ברור.
- dialogs עם focus trap, Escape והחזרת focus לטריגר.
- tabs ו־accordion עם aria state.
- status live לסל ולתוצאות השאלון.
- ללא תלות בצבע בלבד; הטקסטים והפעולות המרכזיים כוונו גם לניגודיות AAA, עם יעדי מגע של 44×44 פיקסלים.
- בדיקה אוטומטית ב־Axe/WCAG 2.2 AA בשני viewports, ובנוסף: keyboard-only, NVDA/VoiceOver, zoom 200%, reduced motion ו־RTL לפני השקה.

## אינטגרציות Production מומלצות

- Commerce: Shopify Headless / WooCommerce API / מערכת מלאי של היבואן — לפי התפעול בפועל.
- סליקה ישראלית: ספק מאושר PCI עם Apple Pay/Google Pay ותשלומים; אין לאסוף מספרי כרטיס בשרת האפליקציה.
- CRM: טופס ייעוץ, WhatsApp Business והסכמה מפורשת לדיוור.
- Analytics: GA4 + server-side events, Consent Mode, events ל־view_item, compare, quiz_complete, add_to_cart, begin_checkout ו־purchase.
- Search: Algolia/Typesense רק אם הקטלוג גדול מספיק; בקטלוג קטן עדיף פילטר מקומי מהיר.
- CMS: אזורי מדריכים, FAQ, אחריות וסניפים ניתנים לעריכה.

## Checklist לפני השקה

1. אישור שם, סימן מסחר, לוגו ופלטה.
2. צילום/מפרט אמיתי לכל SKU ואישור זכויות שימוש.
3. אימות תקינה, אחריות, מחיר, מלאי וטווח מוצהר.
4. חיבור backend, סליקה, משלוחים, מסים וקבלות.
5. מסמכים משפטיים וביקורת נגישות.
6. בדיקות E2E למסלול רכישה והחזרה.
7. ניטור שגיאות, Web Vitals, אבטחה וגיבויים.
