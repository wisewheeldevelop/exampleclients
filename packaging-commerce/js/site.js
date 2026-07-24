(() => {
  'use strict';

  const products = [
    { id:'pizza36', category:'pizza', name:'קרטון פיצה 36', eyebrow:'PIZZA / KRAFT', code:'PZ-036', price:145, unit:'₪2.90 ליח׳', pack:'50 יח׳', size:'36×36 ס״מ', fit:'פיצה בינונית', image:'assets/images/pizza-boxes.jpg', badge:'נמכר במיוחד', description:'קרטון גלי לפיצה עם לשוניות נעילה וקווי קיפול מדויקים. מתאים למוצר מדף חלק או לייצור ממותג בכמות.', tiers:[['1–4 קרטונים','₪145 לקרטון'],['5–9 קרטונים','₪136 לקרטון'],['10+ קרטונים','הצעת מחיר']] },
    { id:'burger15', category:'fast', name:'צדפת המבורגר 15', eyebrow:'BURGER / BIO', code:'BG-150', price:183, unit:'₪0.61 ליח׳', pack:'300 יח׳', size:'15×15 ס״מ', fit:'חם + אוורור', image:'assets/images/burger-fries.jpg', badge:'בחירת שפים', description:'צדפת קראפט עבה עם נעילה קדמית ופתחי שחרור אדים, למשלוחים ולהגשה מהירה.', tiers:[['1–3 קרטונים','₪183 לקרטון'],['4–8 קרטונים','₪174 לקרטון'],['9+ קרטונים','הצעת מחיר']] },
    { id:'fries', category:'fast', name:'מארז צ׳יפס קראפט', eyebrow:'FRIES / GREASE SAFE', code:'FR-080', price:250, unit:'₪0.25 ליח׳', pack:'1,000 יח׳', size:'8×13 ס״מ', fit:'עמיד לשמן', image:'assets/images/burger-fries.jpg', badge:'מחיר נפח', description:'אריזת scoop פתוחה עם חזית נמוכה, גב גבוה וציפוי פנימי שמסייע להפחית מעבר שמן.', tiers:[['1–2 קרטונים','₪250 לקרטון'],['3–5 קרטונים','₪238 לקרטון'],['6+ קרטונים','הצעת מחיר']] },
    { id:'pp500', category:'plastic', name:'מיכל שקוף 500', eyebrow:'PP / CLEAR', code:'PP-500', price:164, unit:'₪0.66 ליח׳', pack:'250 יח׳', size:'500 מ״ל', fit:'מכסה תואם', image:'assets/images/clear-containers.jpg', badge:'נערם בבטחה', description:'מיכל PP מלבני שקוף עם מכסה snap תואם. להצגת מזון, אחסון ומשלוח.', tiers:[['1–4 קרטונים','₪164 לקרטון'],['5–9 קרטונים','₪156 לקרטון'],['10+ קרטונים','הצעת מחיר']] },
    { id:'kraft1000', category:'kraft', name:'קערת קראפט 1000', eyebrow:'KRAFT / PP LID', code:'KR-1000', price:280, unit:'₪0.93 ליח׳', pack:'300 יח׳', size:'1,000 מ״ל', fit:'מכסה כלול', image:'assets/images/kraft-takeaway.jpg', badge:'משלוחים', description:'קערת קראפט מרובעת עם מכסה PP שקוף וסגירה שמתאימה לטייק אווי. התאמת חום דורשת אימות ספק.', tiers:[['1–3 קרטונים','₪280 לקרטון'],['4–7 קרטונים','₪267 לקרטון'],['8+ קרטונים','הצעת מחיר']] },
    { id:'nonwoven', category:'bags', name:'סל סופר רב־פעמי', eyebrow:'NONWOVEN / REUSE', code:'NW-3640', price:490, unit:'₪4.90 ליח׳', pack:'100 יח׳', size:'36×10×40', fit:'עד 20 ק״ג*', image:'assets/images/reusable-supermarket-bag.jpg', badge:'למיתוג', description:'תיק אל־בד עמוק עם בסיס גאסט וידיות מחוזקות, מהסוג שנמכר בקופות וברשתות שיווק.', tiers:[['1–4 קרטונים','₪490 לקרטון'],['5–9 קרטונים','₪465 לקרטון'],['מיתוג 5K+','הצעת מחיר']] },
    { id:'paperbag', category:'bags', name:'שקית נייר גדולה', eyebrow:'PAPER / CARRY', code:'PB-3137', price:189, unit:'₪0.76 ליח׳', pack:'250 יח׳', size:'31×17×37', fit:'ידית מסובבת', image:'assets/images/carry-bags.jpg', badge:'מוצר מדף', description:'שקית קראפט בעלת תחתית מלבנית, דפנות צד וידיות נייר מסובבות. מתאימה למשלוח ולאיסוף.', tiers:[['1–4 קרטונים','₪189 לקרטון'],['5–9 קרטונים','₪179 לקרטון'],['מיתוג 5K+','הצעת מחיר']] },
    { id:'cup8', category:'cups', name:'כוס נייר 8oz + מכסה', eyebrow:'HOT CUP / 8OZ', code:'CP-08B', price:285, unit:'₪0.29 לסט', pack:'1,000 סטים', size:'8oz', fit:'מכסה כלול', image:'assets/images/cups.jpg', badge:'קפה וטייק אווי', description:'כוס נייר לשתייה חמה עם מכסה sip תואם. מוצגת כמערכת כדי לצמצם טעויות התאמה.', tiers:[['1–2 קרטונים','₪285 לקרטון'],['3–5 קרטונים','₪272 לקרטון'],['6+ קרטונים','הצעת מחיר']] }
  ];

  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const money = value => new Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS',maximumFractionDigits:0}).format(value);
  const productGrid = $('[data-product-grid]');
  const resultCount = $('[data-result-count]');
  const toast = $('[data-toast]');
  const productLayer = $('[data-product-layer]');
  const cartLayer = $('[data-cart-layer]');
  const searchLayer = $('[data-search-layer]');
  const quoteLayer = $('[data-quote-layer]');
  const inertTargets = $$('body > :not(.layer):not(.toast)');
  let activeFilter = 'all';
  let activeProduct = null;
  let lastTrigger = null;
  let toastTimer;
  let viewTransitionActive = false;
  let cart = JSON.parse(localStorage.getItem('forma-cart') || '{}');

  const withTransition = callback => {
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (viewTransitionActive) { callback(); return null; }
      viewTransitionActive = true;
      const transition = document.startViewTransition(callback);
      transition.finished.catch(()=>{}).finally(()=>{ viewTransitionActive=false; });
      return transition;
    }
    callback();
    return null;
  };

  function productTemplate(p,index=0,allowFeature=false) {
    return `<article class="product-card reveal${allowFeature && index === 0 ? ' product-card--featured' : ''}" data-category="${p.category}" data-id="${p.id}">
      <div class="product-media"><img src="${p.image}" alt="${p.name}" width="1254" height="1254" loading="${index < 3 ? 'eager' : 'lazy'}" decoding="async"><span class="product-badge">${p.badge}</span><button class="product-view" type="button" data-view-product="${p.id}" aria-label="צפייה מהירה: ${p.name}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button></div>
      <div class="product-body"><span class="product-eyebrow">${p.eyebrow}</span><div class="product-title-row"><h3>${p.name}</h3><span class="product-code">${p.code}</span></div><div class="product-specs"><span><strong>${p.pack}</strong>בקרטון</span><span><strong>${p.size}</strong>מידה / נפח</span><span><strong>${p.fit}</strong>התאמה</span></div><div class="product-buy"><div class="product-price"><strong>${money(p.price)}</strong><small>${p.unit}</small></div><button class="add-button" type="button" data-add-product="${p.id}" aria-label="הוספת ${p.name} לסל"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3M12 12v5M9.5 14.5h5"/></svg></button></div></div>
    </article>`;
  }

  function renderProducts(filter=activeFilter) {
    activeFilter = filter;
    const list = filter === 'all' ? products : products.filter(p => p.category === filter);
    withTransition(() => {
      productGrid.innerHTML = list.map((product,index) => productTemplate(product,index,filter === 'all')).join('');
      productGrid.dataset.count = String(list.length);
      resultCount.textContent = `${list.length} מוצרים`;
      requestAnimationFrame(() => $$('.reveal', productGrid).forEach((item,index) => setTimeout(() => item.classList.add('is-visible'), index*55)));
    });
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'),2600);
  }

  function saveCart() { localStorage.setItem('forma-cart',JSON.stringify(cart)); updateCart(); }
  function addToCart(id) { cart[id] = (cart[id] || 0) + 1; saveCart(); showToast('קרטון נוסף לסל העסקי'); }
  function changeCart(id,delta) { cart[id] = (cart[id] || 0) + delta; if (cart[id] <= 0) delete cart[id]; saveCart(); }

  function updateCart() {
    const count = Object.values(cart).reduce((sum,n) => sum+n,0);
    $$('.cart-count').forEach(node => node.textContent = count);
    const trigger = $('.cart-trigger');
    trigger?.setAttribute('aria-label',`פתיחת סל הקניות, ${count} פריטים`);
    const items = $('[data-cart-items]');
    const empty = $('[data-cart-empty]');
    const summary = $('[data-cart-summary]');
    if (!count) { items.innerHTML=''; empty.hidden=false; summary.hidden=true; return; }
    empty.hidden=true; summary.hidden=false;
    items.innerHTML = Object.entries(cart).map(([id,qty]) => { const p=products.find(x=>x.id===id); return `<article class="cart-item"><img src="${p.image}" alt=""><div><strong>${p.name}</strong><span>${money(p.price)} לקרטון · ${p.pack}</span></div><div class="cart-qty"><button type="button" data-cart-delta="-1" data-cart-id="${id}" aria-label="הפחתת כמות">−</button><b>${qty}</b><button type="button" data-cart-delta="1" data-cart-id="${id}" aria-label="הגדלת כמות">+</button></div></article>`; }).join('');
    const total = Object.entries(cart).reduce((sum,[id,qty]) => sum + products.find(p=>p.id===id).price*qty,0);
    $('[data-cart-total]').textContent=money(total);
  }

  function setBackgroundInert(value) { inertTargets.forEach(el => { if (value) el.setAttribute('inert',''); else el.removeAttribute('inert'); }); }
  function openLayer(layer,trigger) { lastTrigger=trigger || document.activeElement; layer.hidden=false; document.body.classList.add('is-locked'); setBackgroundInert(true); requestAnimationFrame(() => $('.modal-close, input, button',layer)?.focus()); }
  function closeLayer(layer) { layer.hidden=true; document.body.classList.remove('is-locked'); setBackgroundInert(false); lastTrigger?.focus?.(); }

  function openProduct(id,trigger) {
    const p=products.find(item=>item.id===id); if(!p) return; activeProduct=p;
    const sourceImg = trigger?.closest('.product-card')?.querySelector('.product-media img');
    if (sourceImg) sourceImg.style.viewTransitionName='product-photo';
    withTransition(() => {
      if (sourceImg) sourceImg.style.viewTransitionName='';
      $('[data-modal-image]').src=p.image; $('[data-modal-image]').alt=p.name; $('[data-modal-image]').style.viewTransitionName='product-photo';
      $('[data-modal-eyebrow]').textContent=p.eyebrow; $('[data-modal-title]').textContent=p.name; $('[data-modal-description]').textContent=p.description;
      $('[data-modal-specs]').innerHTML=`<div><strong>${p.pack}</strong><span>כמות בקרטון</span></div><div><strong>${p.size}</strong><span>מידה / נפח</span></div><div><strong>${p.fit}</strong><span>התאמה</span></div>`;
      $('[data-tier-table]').innerHTML=p.tiers.map(row=>`<div class="tier-row"><span>${row[0]}</span><strong>${row[1]}</strong></div>`).join('');
      $('[data-modal-price]').textContent=money(p.price); $('[data-modal-unit]').textContent=p.unit; openLayer(productLayer,trigger);
    });
    setTimeout(() => { $('[data-modal-image]').style.viewTransitionName=''; },600);
  }

  function closeProduct() { $('[data-modal-image]').style.viewTransitionName=''; closeLayer(productLayer); activeProduct=null; }

  function renderSearch(value='') {
    const query=value.trim().toLowerCase();
    const matches=query ? products.filter(p => `${p.name} ${p.eyebrow} ${p.code} ${p.size}`.toLowerCase().includes(query)) : products.slice(0,4);
    $('[data-search-results]').innerHTML = matches.length ? matches.map(p=>`<button class="search-result" type="button" data-search-product="${p.id}"><img src="${p.image}" alt=""><span><strong>${p.name}</strong><span>${p.pack} · ${p.size}</span></span><b>${money(p.price)}</b></button>`).join('') : '<p>לא מצאנו מוצר. נסו “פיצה”, “קראפט” או “כוס”.</p>';
  }

  document.addEventListener('click',event => {
    const filter=event.target.closest('[data-filter]');
    if(filter){ $$('[data-filter]').forEach(btn=>btn.setAttribute('aria-selected','false')); filter.setAttribute('aria-selected','true'); renderProducts(filter.dataset.filter); }
    const categoryJump=event.target.closest('[data-category-jump]');
    if(categoryJump){ const key=categoryJump.dataset.categoryJump; $$('[data-filter]').forEach(btn=>btn.setAttribute('aria-selected',String(btn.dataset.filter===key))); renderProducts(key); requestAnimationFrame(()=>$('#catalog').scrollIntoView({behavior:'smooth'})); }
    const view=event.target.closest('[data-view-product]'); if(view) openProduct(view.dataset.viewProduct,view);
    const add=event.target.closest('[data-add-product]'); if(add) addToCart(add.dataset.addProduct);
    const delta=event.target.closest('[data-cart-delta]'); if(delta) changeCart(delta.dataset.cartId,Number(delta.dataset.cartDelta));
    if(event.target.closest('[data-open-cart]')) openLayer(cartLayer,event.target.closest('[data-open-cart]'));
    if(event.target.closest('[data-close-cart]')) closeLayer(cartLayer);
    if(event.target.closest('[data-close-product]')) closeProduct();
    if(event.target.closest('[data-open-search]')) { renderSearch(); openLayer(searchLayer,event.target.closest('[data-open-search]')); }
    if(event.target.closest('[data-close-search]')) closeLayer(searchLayer);
    if(event.target.closest('[data-open-quote]')) openLayer(quoteLayer,event.target.closest('[data-open-quote]'));
    if(event.target.closest('[data-close-quote]')) closeLayer(quoteLayer);
    const searchProduct=event.target.closest('[data-search-product]'); if(searchProduct){ closeLayer(searchLayer); setTimeout(()=>openProduct(searchProduct.dataset.searchProduct,document.querySelector(`[data-view-product="${searchProduct.dataset.searchProduct}"]`)),50); }
    if(event.target.closest('[data-modal-add]') && activeProduct) addToCart(activeProduct.id);
    if(event.target.closest('[data-demo-checkout]')) showToast('הדמו מוכן לחיבור למסלול Checkout עסקי');
  });

  $('[data-search-input]').addEventListener('input',event=>renderSearch(event.target.value));
  $('[data-quote-form]').addEventListener('submit',event=>{ event.preventDefault(); closeLayer(quoteLayer); event.target.reset(); showToast('הבקשה נקלטה בדמו — נחבר אותה ל־CRM ב־Production'); });

  const menuButton=$('[data-menu-toggle]'); const mobileMenu=$('#mobile-menu');
  menuButton.addEventListener('click',()=>{ const open=menuButton.getAttribute('aria-expanded')==='true'; menuButton.setAttribute('aria-expanded',String(!open)); mobileMenu.hidden=open; });
  $$('#mobile-menu a').forEach(link=>link.addEventListener('click',()=>{ mobileMenu.hidden=true; menuButton.setAttribute('aria-expanded','false'); }));

  $$('[data-faq] article button').forEach(button=>button.addEventListener('click',()=>{ const open=button.getAttribute('aria-expanded')==='true'; $$('[data-faq] article button').forEach(other=>{other.setAttribute('aria-expanded','false'); other.nextElementSibling.hidden=true;}); if(!open){button.setAttribute('aria-expanded','true'); button.nextElementSibling.hidden=false;} }));

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){ if(!productLayer.hidden) closeProduct(); else if(!cartLayer.hidden) closeLayer(cartLayer); else if(!searchLayer.hidden) closeLayer(searchLayer); else if(!quoteLayer.hidden) closeLayer(quoteLayer); }
    if(event.key==='Tab'){ const layer=[productLayer,cartLayer,searchLayer,quoteLayer].find(item=>!item.hidden); if(!layer) return; const focusable=$$('button:not([disabled]),a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',layer).filter(el=>!el.hidden); if(!focusable.length) return; const first=focusable[0],last=focusable.at(-1); if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();} else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();} }
  });

  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{ if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);} }),{threshold:.08});
  $$('.reveal').forEach(el=>observer.observe(el));

  const onScroll=()=>{ $('[data-header]').classList.toggle('is-scrolled',scrollY>12); if(!CSS.supports('animation-timeline: scroll()')) document.documentElement.style.setProperty('--scroll-progress',Math.min(1,scrollY/(document.documentElement.scrollHeight-innerHeight))); };
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  if(window.gsap && window.ScrollTrigger && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('[data-hero-copy] > *',{y:30,opacity:0,duration:.9,stagger:.1,ease:'power3.out',delay:.15});
    gsap.to('.hero-media img',{scale:1.06,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.fromTo('.branding-media img',{scale:1.07},{scale:1,ease:'none',scrollTrigger:{trigger:'.branding-section',start:'top bottom',end:'bottom top',scrub:true}});
  }

  renderProducts(); updateCart();
})();
