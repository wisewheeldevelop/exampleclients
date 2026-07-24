# FORMA v2 — Design audit וארכיטקטורת Product-first

## מסקנת האבחון

הגרסה הראשונה הייתה נקייה ופונקציונלית, אבל פתחה את מסע הקנייה בארבעה כרטיסי אייקון לפי סוג עסק. זו היררכיה שמתאימה למערכת SaaS יותר מאשר לחנות: היא הסתירה את סט התמונות, הוסיפה שלב החלטה לא נחוץ והקטינה את תחושת המוצר.

הגרסה השנייה מתחילה במוצר עצמו. ה־Hero מציג את משפחת האריזות בגודל מלא, ואחריו פסיפס צילום של שש קולקציות. כל צילום הוא גם ניווט וגם פילטר מסחרי.

## מחקר benchmark

- [Packlane](https://packlane.com/) פותחת מבחירת סגנון האריזה, מציגה מוצר לפני תהליך ומחברת את הבחירה להצעת מחיר ולהתאמה.
- [Packhelp](https://packhelp.com/) מציגה קטלוג אוצר, מידות והתאמה, עורך עיצוב ותמחור לכמויות.
- [Arka](https://www.arka.com/) מדגישה best sellers, התאמה מלאה, MOQ נמוך, מחיר/Proof ותהליך קצר מבחירת אריזה עד אספקה.
- [Shopify Enterprise theme](https://themes.shopify.com/themes/enterprise/presets/enterprise) מרכזת את דפוסי המסחר העדכניים: תמונות ברזולוציה גבוהה, image hotspot, quick view, פילטרים, sticky navigation, quick buy ו־slide-out cart.
- [Shopify Search & Discovery](https://www.shopify.com/search-and-discovery) מגדירה taxonomy, פילטרים ויזואליים וחיפוש כמערכת גילוי מוצר — לא כתוספת צדדית.

הלקח המשותף: visual merchandising, taxonomy ונתוני מוצר הם הממשק. אנימציה אמורה לחזק את המעבר בין המצבים, לא להחליף את המוצר.

## ארכיטקטורת המידע החדשה

1. Hero מוצרי עם CTA לקטגוריות.
2. פסיפס של שש קטגוריות:
   - קרטוני פיצה
   - המבורגר וצ׳יפס
   - קופסאות פלסטיק
   - קופסאות קראפט
   - שקיות וסלים
   - כוסות ומכסים
3. קטלוג מסונן עם תמונה, כמות בקרטון, מידה/נפח, התאמה ומחיר ליחידה.
4. Quick View עם מדרגות כמות.
5. מידע רכש B2B.
6. מיתוג והדפסה.
7. תהליך, הצעת מחיר, FAQ ו־footer.

אין חלוקה לפי פיצרייה, בית קפה או סופר. סוג העסק נשאר מידע CRM אפשרי בלבד ואינו מכתיב את חוויית הגילוי.

## שפה ויזואלית

- רקע Porcelain במקום לבן קר או Dark UI.
- Ink ירוק עמוק לטיפוגרפיה, Cobalt לפעולה, Terracotta למותג ו־Pistachio לאישור/ערך.
- גריד א־סימטרי של 12 עמודות ב־Desktop; קולקציות אנכיות ב־Mobile.
- צילום ברזולוציה גבוהה הוא רוב שטח ה־Hero, הקטגוריות וכרטיסי המוצר.
- שכבות טקסט על צילום משתמשות בגרדיאנט מקומי בלבד, בלי wash שמסתיר את המוצר.
- פינות 22–32px, קווים עדינים, צללים קצרים וריווח רחב. אין glassmorphism כקישוט; blur מופיע רק בניווט הדביק ובתגים פונקציונליים.

## Motion ו־frontier layer

- GSAP ו־ScrollTrigger ל־Hero ולסקציית המיתוג.
- Native View Transitions במעבר בין פילטרים וב־Quick View.
- מנהל transition מונע race בין לחיצות קטגוריה מהירות; ה־state והתמונה נשארים מסונכרנים.
- Scroll progress נתמך natively עם fallback.
- `prefers-reduced-motion` מכבה תנועה לא הכרחית.
- Hover של הקולקציות חושף CTA ומבצע scale עדין בלבד; במובייל ה־CTA גלוי מראש.

## מדיניות תמונות

- Hero נטען מראש לפי breakpoint.
- שש תמונות הקטגוריה נטענות eager כדי שהניווט הוויזואלי לא יהיה ריק.
- שלוש תמונות המוצר הראשונות נטענות eager; המשך הקטלוג lazy.
- לכל תמונת קטגוריה alt המתאר את המוצר הישראלי בפועל.
- ה־audit בודק `naturalWidth`, מידות DOM ו־opacity לאחר סיום אנימציה.

## נגישות ואיכות

“AAAA” הוא רף איכות פנימי ולא דרגת תקן רשמית. תקן WCAG מגדיר A, AA ו־AAA. בגרסה הנוכחית:

- 0 הפרות ב־axe עבור WCAG 2 A/AA, WCAG 2.1 AA ו־WCAG 2.2 AA.
- 27 בדיקות עברו; בדיקה אחת נשארה incomplete ודורשת בדיקה אנושית.
- תמיכה מלאה במקלדת, focus trap, `inert`, Escape, reduced motion ויעדי מגע.
- אין שגיאות Console בריצת ה־audit.

## צילומי מסך ובדיקות

- `audit/before-category-redesign/desktop-1440.png`
- `audit/after/desktop-1440.png`
- `audit/after/desktop-categories.png`
- `audit/after/desktop-filter-plastic.png`
- `audit/after/desktop-quick-view.png`
- `audit/after/mobile-390.png`
- `audit/after/mobile-categories.png`
- `audit/after/mobile-full.png`
- `audit/after/audit-report.json`

## לפני Production

יש לאמת מול ספק אמיתי מחירים, יחידות בקרטון, מידות, התאמת מכסים, עומסי נשיאה, הצהרות מגע במזון, MOQ, זמני אספקה ומע״מ. יש לחבר CMS/PIM, מלאי, Checkout, CRM, חיפוש שרת, אנליטיקה ומדיניות פרטיות/נגישות מלאה.
