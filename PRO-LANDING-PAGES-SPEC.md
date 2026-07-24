# מפרט מערכת — דפי נחיתה לבעלי מקצוע / Google Ads 2026

## 1. מטרת המערכת

שלושה דפי נחיתה עצמאיים, מהירים וממוקדי פנייה עבור קמפיינים בישראל:

1. אופק אינסטלציה
2. פסגת מיזוג
3. פסגת חשמל

כל דף חייב להסביר בתוך המסך הראשון: מי נותן את השירות, מה הוא פותר, למה אפשר לסמוך עליו ומהי הפעולה הבאה. אין הבטחות זמן, מחיר, דירוג או הסמכה שלא סופקו על ידי הלקוח.

## 2. בסיס המחקר

- Google Ads מגדירה חוויית דף נחיתה לפי רלוונטיות ושימושיות התוכן, קלות ניווט והתאמה לציפייה שנוצרה במודעה:
  https://support.google.com/google-ads/answer/14086
- Google ממליצה להתאים במדויק מודעה, מילת חיפוש, כותרת ו־CTA; להציב מידע חשוב למעלה; לשמור על ניווט פשוט ועל יצירת קשר קלה במובייל:
  https://support.google.com/google-ads/answer/6238826
- יעד ביצועים: LCP עד 2.5 שניות, INP עד 200ms ו־CLS עד 0.1 ב־75% מהביקורים:
  https://web.dev/articles/defining-core-web-vitals-thresholds
- Hero רספונסיבי משתמש ב־`picture` ובמקור 4:5 ייעודי למובייל, ולא רק בחיתוך תמונת הדסקטופ:
  https://web.dev/learn/images/responsive-images
- WCAG 2.2: מוקד מקלדת גלוי, פעולה שאינה מוסתרת ויעדי מגע בגודל מספק:
  https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- Tailwind Play CDN אינו מיועד ל־Production. לכן Tailwind נבנה מראש לקובץ CSS סטטי ללא runtime:
  https://tailwindcss.com/docs/installation/play-cdn

## 3. ארכיטקטורת המרה

### Hero

- תמונת בעל המקצוע היא ה־LCP ומקבלת `fetchpriority="high"`.
- `picture`: מקור 16:9 לדסקטופ ומקור 4:5 אמיתי למובייל.
- כותרת תואמת כוונת חיפוש, לא סלוגן מעורפל.
- CTA ראשי: מעבר לטופס קצר; CTA משני: שיחה.
- שלוש הבטחות תהליך אמינות: אבחון, הסבר, עבודה מסודרת.
- SVG מותג חי משמש כחתימת מומחיות ולא כאייקון stock.

### גוף הדף

1. סרגל אמון קצר.
2. שירותים ממוקדים עם תמונות אמיתיות.
3. תהליך בשלושה שלבים שמקטין אי־ודאות.
4. לפני/אחרי אינטראקטיבי.
5. הצגת בעל המקצוע והרכב הממותג.
6. FAQ שמפרק התנגדויות.
7. טופס micro-commitment קצר: שם, טלפון, סוג צורך.
8. פס פעולות קבוע במובייל.

### עקרונות קופי ופסיכולוגיה

- Message match: אותה בעיה בכותרת המודעה וב־H1.
- Specificity: “איתור מקור התקלה” עדיף על “שירות מקצועי”.
- Uncertainty reduction: “בודקים → מסבירים → מתקדמים” לפני דרישת פרטים.
- Loss aversion אתית: מסבירים למה דחייה עלולה להחמיר תקלה, בלי הפחדה או לחץ כוזב.
- Cognitive fluency: משפטים קצרים, מספרים קטנים, פעולה אחת עיקרית בכל אזור.
- Commitment consistency: הטופס מבקש רק את המינימום הדרוש לתיאום.
- Proof over claims: תמונות ציוד, עבודה, רכב ולפני/אחרי במקום סופרלטיבים לא מאומתים.

## 4. מערכת חזותית

### אופק אינסטלציה

- `#071A31` — Navy / אמינות
- `#06BCE4` — Flow Cyan / מים וטכנולוגיה
- `#65E3F3` — Aqua Highlight
- `#F3FBFD` — Ice Surface
- `#FF8A5B` — Warm Action, שימוש מצומצם
- פונטים: Heebo Variable + Manrope
- שפה צורנית: זרימה, טיפות, טבעות סריקה, קצוות מעוגלים.

### פסגת מיזוג

- `#0B2847` — Alpine Navy
- `#18A9E0` — Clear Sky
- `#65D7F2` — Cool Air
- `#F5FCFF` — Clean White
- `#FF765D` — Human Warmth / CTA
- פונטים: Rubik Variable + Manrope
- שפה צורנית: זרמי אוויר, שכבות זכוכית, קשתות דקות, מרחב לבן.

### פסגת חשמל

- `#121921` — Graphite
- `#FFD21A` — Electric Yellow
- `#FFF5B8` — Soft Current
- `#F7F7F3` — Porcelain
- `#4467FF` — Diagnostic Blue
- פונטים: Heebo Variable + Space Grotesk
- שפה צורנית: מסלולי זרם, נקודות חיבור, זוויות מדויקות ואור חם.

## 5. SVG ואנימציה

- לכל מותג נבנה SVG מקורי עם gradients, depth, highlights ו־filter מתון.
- תנועה: float של 8–14px, זרימה לאורך path, פעימת אור ופרטי micro-motion.
- אין ספריית אייקונים ואין SVG גנרי.
- כל SVG כולל `title`, `desc`, `role="img"` ו־fallback ל־`prefers-reduced-motion`.
- Hover בכרטיסים: תנועת שכבה פנימית, לא רק `translateY` של הקופסה.

## 6. ביצועים ונגישות

- Tailwind נבנה מראש ומוגש מקומית.
- Google Fonts נטענים עם `preconnect` ו־`display=swap`; לפני Production ניתן לארח מקומית בכפוף לרישוי.
- לכל תמונה `width`, `height`, `loading`, `decoding` ו־`object-position` מותאם.
- תמונת Hero אינה lazy.
- כל כפתור/קישור מרכזי לפחות 44×44px; יעד פנימי 48px.
- contrast מינימלי AA; טקסטים מרכזיים מכוונים ל־AAA כאשר הפלטה מאפשרת.
- focus-visible ברור, skip link, landmarks, headings תקינים ו־ARIA לטופס/FAQ.
- אנימציות לא מסתירות תוכן ומכבדות `prefers-reduced-motion`.

## 7. אנליטיקה מוכנה לחיבור

מאפייני `data-event` יוגדרו ל:

- `hero_lead`
- `hero_call`
- `service_select`
- `before_after`
- `faq_open`
- `form_submit`
- `mobile_call`

הדמו אינו שולח נתונים החוצה. ב־Production יש לחבר Consent Mode, GA4 ו־Google Ads Conversion רק לאחר מדיניות פרטיות והסכמה מתאימה.

## 8. QA חובה

- Viewports: 1440×1000, 1024×768, 390×844, 360×800.
- Hero משתמש במקור mobile 4:5 במסכים קטנים.
- אין overflow אופקי.
- אפס שגיאות console ו־404.
- טופס, FAQ, before/after, ניווט ופס mobile עובדים.
- בדיקת מקלדת, focus, reduced motion ו־RTL.
- בדיקת תמונות: כל 10 הנכסים של כל מקצוע משולבים או מקבלים תפקיד ברור בדף.
