# KAV — ביקורת Design Director / AAAA

עודכן: 23 ביולי 2026

## פסק הדין

הגרסה המקורית הייתה חנות טובה ומלוטשת, אך לא הייתה עוברת ביקורת של מחלקת עיצוב ברמת מוצר גלובלית: ה־hero והגריד היו צפויים מדי, שלושה מוצרים חלקו שפה חזותית כמעט זהה, המובייל השתמש בחיתוך של תמונת דסקטופ, וספריות ליבה נטענו מ־CDN בזמן ריצה.

הגרסה הנוכחית מאושרת כ־**concept premium מוכן ל־handoff ולהמשך פיתוח מסחרי**. היא אינה מאושרת עדיין כחנות Production, משום שסליקה, מלאי, מפרטים, רגולציה, תוכן משפטי ונתוני מוצר הם placeholders ודורשים אימות.

## מה שודרג

- Hero edge-to-edge עם כותרת פיסולית, proof rail ותמונת קמפיין ייעודית למובייל.
- קטלוג editorial: מוצר מוביל רחב ושלישיית כרטיסים מדויקת, במקום מטריצה גנרית.
- תמונות ייחודיות ל־KAV ONE ול־KAV AIR, ללא שכפול נכס בין דגמים.
- Header שקוף מעל ה־hero ההופך למשטח קריא בגלילה.
- Quick View עם native View Transition כאשר הדפדפן תומך ו־fallback בטוח.
- progress rail מבוסס CSS Scroll Timeline, עם fallback קטן ב־JavaScript.
- parallax עדין ומוגבל למצביע מדויק; מכובה ב־reduced motion.
- Tailwind v4 בנוי מראש ו־GSAP/ScrollTrigger מקומיים; Lenis הוסר לטובת גלילה טבעית.
- ניגודיות מחוזקת, יעדי מגע 44×44, `inert` לשכבות רקע בזמן dialog ו־scroll margin לעוגנים.

## עדות חזותית

- לפני: `audit/01-before/desktop-1440.png`, `audit/01-before/mobile-500.png`.
- אחרי: `audit/02-after/desktop-1440.png`, `audit/02-after/desktop-full.png`, `audit/02-after/mobile-390.png`, `audit/02-after/mobile-full.png`.
- מצבי אינטראקציה: `audit/02-after/desktop-filter-bikes.png`, `audit/02-after/desktop-quick-view.png`, `audit/02-after/mobile-menu.png`.

## תוצאות אוטומטיות

הרצה: `npm run audit:visual` ב־Chrome headless, viewports של 1440×1100 ו־390×844.

- 0 הפרות Axe תחת WCAG 2.0/2.1/2.2 A–AA.
- 28 קבוצות בדיקה עברו; 2 בדיקות סומנו `incomplete` ודורשות ביקורת אנושית.
- קטלוג: 4 מוצרים; פילטר אופניים: 2 תוצאות.
- Quick View ותפריט מובייל נפתחו ונסגרו בהצלחה.
- 0 שגיאות Console.

אין לתאר את התוצאה כ־“WCAG AAA certified”: Axe אינה הסמכה, WCAG AAA דורש בדיקות אנושיות רחבות, ות״י 5568/הדין הישראלי דורשים תהליך נפרד. היעד העיצובי AAAA הוא רף איכות פנימי; הבסיס הנגיש נבדק אוטומטית ברמת AA ונדרש audit ידני לפני השקה.

## שערי Production שנותרו

1. חיבור CMS/commerce, מלאי, סליקה, משלוחים וקבלות.
2. החלפת כל מפרט/מחיר/ביקורת בנתון מאומת.
3. בדיקת מסמכי תקינה, אחריות, פרטיות, ביטולים ונגישות עם אנשי מקצוע.
4. Lighthouse/Web Vitals על staging אמיתי ובמכשיר Android ביניים; מדדי `file://` אינם מדדי Production.
5. audit ידני: מקלדת, screen reader, zoom 200–400%, forced colors ו־reduced motion.
6. אופטימיזציית תמונות AVIF/WebP ו־responsive `srcset`, ניטור RUM ו־error tracking.
