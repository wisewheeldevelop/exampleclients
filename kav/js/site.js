(() => {
  'use strict';

  const products = [
    {
      id: 'fold', category: 'bike', name: 'KAV FOLD', eyebrow: 'CITY COMMUTER',
      subtitle: 'היומם המתקפל', price: 4890, oldPrice: 5290, range: 'עד 65 ק״מ', weight: '24.8 ק״ג', battery: '48V / 20Ah', charge: '6–8 שעות',
      colors: ['#1b1d1c', '#d2d0c8', '#4e63ff'], image: 'assets/images/kav-fold-bike.jpg', badge: 'הנמכר ביותר',
      description: 'אופניים מתקפלים ויציבים ליום עירוני מלא. סוללה נשלפת, תאורה מובנית, בלמים הידראוליים ומתלה אחורי לציוד.'
    },
    {
      id: 'one', category: 'bike', name: 'KAV ONE', eyebrow: 'LONG RANGE',
      subtitle: 'ליום הארוך', price: 6290, oldPrice: null, range: 'עד 80 ק״מ', weight: '27.2 ק״ג', battery: '48V / 25Ah', charge: '7–9 שעות',
      colors: ['#111312', '#6e746c'], image: 'assets/images/kav-one-v2.jpg', badge: 'טווח ארוך',
      description: 'גרסת הטווח למי שלא רוצה לחשוב על המטען באמצע היום. תנוחת רכיבה יציבה, סוללה גדולה ומעטפת שירות לרוכבים כבדים.'
    },
    {
      id: 's1', category: 'scooter', name: 'KAV S1', eyebrow: 'URBAN CONTROL',
      subtitle: 'העירוני המאוזן', price: 3490, oldPrice: 3790, range: 'עד 50 ק״מ', weight: '22.5 ק״ג', battery: '48V / 18Ah', charge: '6–7 שעות',
      colors: ['#161817', '#d8ff36'], image: 'assets/images/kav-s1-scooter.jpg', badge: 'בחירת הצוות',
      description: 'קורקינט עירוני עם שיכוך כפול, צמיגים פנאומטיים, משטח עמידה רחב ואיתותים מובנים — נוחות ושליטה לכביש הישראלי.'
    },
    {
      id: 'air', category: 'scooter', name: 'KAV AIR', eyebrow: 'LIGHT COMMUTE',
      subtitle: 'קל, מתקפל, מדויק', price: 2390, oldPrice: null, range: 'עד 35 ק״מ', weight: '16.8 ק״ג', battery: '36V / 10Ah', charge: '4–5 שעות',
      colors: ['#202322', '#c7c9c4', '#4e63ff'], image: 'assets/images/kav-air-v2.jpg', badge: 'משקל קל',
      description: 'לרכבת, למשרד ולמעלית. דגם קל לנשיאה עם קיפול מהיר, תאורה היקפית ומידות מדויקות לחיים בדירה.'
    }
  ];

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const formatPrice = value => `${new Intl.NumberFormat('he-IL').format(value)} ₪`;
  const productById = id => products.find(product => product.id === id);
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const productGrid = $('#product-grid');
  const cartLayer = $('[data-cart-layer]');
  const productLayer = $('[data-product-layer]');
  const searchLayer = $('[data-search-layer]');
  const toast = $('[data-toast]');
  let cart = [];
  let activeProduct = null;
  let returnFocus = null;
  let toastTimer = null;

  const withViewTransition = update => {
    if (prefersReducedMotion || !document.startViewTransition) {
      update();
      return null;
    }
    return document.startViewTransition(update);
  };

  try { cart = JSON.parse(localStorage.getItem('kav-cart') || '[]'); } catch (_) { cart = []; }

  const productCard = product => `
    <article class="product-card reveal" data-category="${product.category}" data-id="${product.id}" data-tilt>
      <div class="product-visual" data-view-product="${product.id}">
        <span class="product-badge">${product.badge}</span>
        <img src="${product.image}" alt="${product.category === 'bike' ? 'אופניים חשמליים מתקפלים' : 'קורקינט חשמלי'} מדגם ${product.name}" width="1024" height="1280" loading="lazy">
        <button class="product-quick" type="button" data-view-product="${product.id}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
          מבט מהיר
        </button>
      </div>
      <div class="product-info">
        <div class="product-topline"><span class="product-eyebrow">${product.eyebrow}</span><span class="color-dots" aria-label="${product.colors.length} צבעים">${product.colors.map(color => `<i style="--dot:${color}"></i>`).join('')}</span></div>
        <h3>${product.name}</h3><p class="product-subtitle">${product.subtitle}</p>
        <div class="product-specs" aria-label="מפרט מקוצר">
          <div class="product-spec"><span>${product.range.replace('עד ', '')}</span><small>טווח מוצהר</small></div>
          <div class="product-spec"><span>${product.weight}</span><small>משקל</small></div>
          <div class="product-spec"><span>${product.battery.split(' / ')[0]}</span><small>מערכת</small></div>
        </div>
        <div class="product-bottom">
          <div class="product-price"><strong>${formatPrice(product.price)}</strong>${product.oldPrice ? `<del>${formatPrice(product.oldPrice)}</del>` : '<small>מחיר השקה</small>'}</div>
          <button class="add-button" type="button" data-add-cart="${product.id}" aria-label="הוספת ${product.name} לסל"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/><path d="M12 11v6M9 14h6"/></svg></button>
        </div>
      </div>
    </article>`;

  function renderProducts(filter = 'all') {
    const visible = filter === 'all' ? products : products.filter(product => product.category === filter);
    productGrid.innerHTML = visible.map(productCard).join('');
    productGrid.dataset.count = String(visible.length);
    productGrid.setAttribute('aria-labelledby', filter === 'all' ? 'tab-all' : filter === 'bike' ? 'tab-bikes' : 'tab-scooters');
    requestAnimationFrame(() => $$('.reveal', productGrid).forEach((item, index) => {
      item.style.transitionDelay = `${index * 70}ms`;
      item.classList.add('is-visible');
    }));
    initProductMotion();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }

  function persistCart() {
    localStorage.setItem('kav-cart', JSON.stringify(cart));
    updateCart();
  }

  function updateCart() {
    const count = cart.length;
    $$('.cart-count').forEach(node => node.textContent = count);
    $$('.cart-trigger').forEach(button => button.setAttribute('aria-label', `פתיחת סל הקניות, ${count} פריטים`));
    const items = $('[data-cart-items]');
    const empty = $('[data-cart-empty]');
    const summary = $('[data-cart-summary]');
    if (!count) {
      items.innerHTML = '';
      empty.hidden = false;
      summary.hidden = true;
      return;
    }
    empty.hidden = true;
    summary.hidden = false;
    items.innerHTML = cart.map((id, index) => {
      const product = productById(id);
      return `<article class="cart-item"><img src="${product.image}" alt=""><div><h3>${product.name}</h3><p>${formatPrice(product.price)}</p></div><button class="cart-remove" type="button" data-remove-cart="${index}" aria-label="הסרת ${product.name}">הסרה</button></article>`;
    }).join('');
    const total = cart.reduce((sum, id) => sum + productById(id).price, 0);
    $('[data-cart-total]').textContent = formatPrice(total);
  }

  function addToCart(id) {
    const product = productById(id);
    if (!product) return;
    cart.push(id);
    persistCart();
    showToast(`${product.name} נוסף לסל`);
  }

  function focusable(layer) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]', layer).filter(el => !el.hidden && el.offsetParent !== null);
  }

  function setPageInert(active) {
    $$('body > .announcement, body > header, body > main, body > footer, body > .consult-fab').forEach(element => {
      element.inert = active;
    });
  }

  function openLayer(layer, focusTarget) {
    returnFocus = document.activeElement;
    layer.hidden = false;
    document.body.classList.add('is-locked');
    setPageInert(true);
    requestAnimationFrame(() => (focusTarget || $('[role="dialog"]', layer))?.focus());
  }

  function closeLayer(layer) {
    layer.hidden = true;
    if (![cartLayer, productLayer, searchLayer].some(item => !item.hidden)) {
      document.body.classList.remove('is-locked');
      setPageInert(false);
    }
    returnFocus?.focus?.();
  }

  function openCart() { openLayer(cartLayer, $('.cart-drawer', cartLayer)); }

  function openProduct(id) {
    const product = productById(id);
    if (!product) return;
    activeProduct = product;
    const modalImage = $('[data-modal-image]');
    const sourceImage = $(`.product-card[data-id="${id}"] .product-visual img`);
    modalImage.src = product.image;
    modalImage.alt = `${product.category === 'bike' ? 'אופניים חשמליים' : 'קורקינט חשמלי'} ${product.name}`;
    $('[data-modal-eyebrow]').textContent = product.eyebrow;
    $('[data-modal-name]').textContent = product.name;
    $('[data-modal-description]').textContent = product.description;
    $('[data-modal-price]').textContent = formatPrice(product.price);
    $('[data-modal-specs]').innerHTML = `<div><strong>${product.range}</strong><span>טווח מוצהר</span></div><div><strong>${product.weight}</strong><span>משקל</span></div><div><strong>${product.charge}</strong><span>זמן טעינה</span></div>`;
    if (sourceImage) sourceImage.style.viewTransitionName = 'product-photo';
    const transition = withViewTransition(() => {
      if (sourceImage) sourceImage.style.viewTransitionName = 'none';
      modalImage.style.viewTransitionName = 'product-photo';
      openLayer(productLayer, $('.product-modal', productLayer));
    });
    transition?.finished.finally(() => { if (sourceImage) sourceImage.style.viewTransitionName = ''; });
  }

  function closeProduct() {
    const modalImage = $('[data-modal-image]');
    const targetImage = activeProduct ? $(`.product-card[data-id="${activeProduct.id}"] .product-visual img`) : null;
    modalImage.style.viewTransitionName = 'product-photo';
    const transition = withViewTransition(() => {
      modalImage.style.viewTransitionName = 'none';
      if (targetImage) targetImage.style.viewTransitionName = 'product-photo';
      closeLayer(productLayer);
    });
    transition?.finished.finally(() => {
      modalImage.style.viewTransitionName = '';
      if (targetImage) targetImage.style.viewTransitionName = '';
    });
  }

  function renderSearch(query = '') {
    const normalized = query.trim().toLowerCase();
    const results = normalized ? products.filter(product => `${product.name} ${product.subtitle} ${product.description} ${product.range}`.toLowerCase().includes(normalized)) : products;
    $('[data-search-results]').innerHTML = results.length ? results.map(product => `<button class="search-result" type="button" data-search-product="${product.id}"><img src="${product.image}" alt=""><span><strong>${product.name}</strong><span>${product.subtitle} · ${formatPrice(product.price)}</span></span></button>`).join('') : '<p>לא מצאנו דגם כזה. נסו “קל”, “טווח” או “עירוני”.</p>';
  }

  function setActiveTab(button) {
    $$('[data-filter]').forEach(tab => {
      tab.setAttribute('aria-selected', String(tab === button));
      tab.tabIndex = tab === button ? 0 : -1;
    });
    withViewTransition(() => renderProducts(button.dataset.filter));
  }

  function initProductMotion() {
    if (prefersReducedMotion || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('[data-tilt]', productGrid).forEach(card => {
      const image = $('img', card);
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        image.style.transform = `scale(1.045) translate(${x * -9}px, ${y * -7}px)`;
      });
      card.addEventListener('pointerleave', () => { image.style.transform = ''; });
    });
  }

  function initQuiz() {
    const answers = {};
    let step = 1;
    const steps = $$('.quiz-step');
    const result = $('[data-result]');
    const progress = $('[data-progress]');
    const label = $('[data-step-label]');

    const showStep = next => {
      step = next;
      steps.forEach(panel => {
        const active = Number(panel.dataset.step) === step;
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
      });
      result.hidden = true;
      progress.style.width = `${step * 33.333}%`;
      label.textContent = `שאלה ${step} מתוך 3`;
      $('button', steps[step - 1])?.focus();
    };

    const getMatch = () => {
      if (answers.storage === 'stairs' || answers.priority === 'light') return answers.distance === 'long' ? productById('fold') : productById('air');
      if (answers.distance === 'long' || answers.priority === 'range') return productById('one');
      if (answers.priority === 'comfort') return productById('s1');
      return productById('fold');
    };

    const showResult = () => {
      const match = getMatch();
      steps.forEach(panel => panel.hidden = true);
      result.hidden = false;
      result.dataset.product = match.id;
      $('[data-result-name]').textContent = match.name;
      $('[data-result-copy]').textContent = `${match.subtitle}: ${match.description} הטווח המוצהר הוא ${match.range} והמשקל ${match.weight}.`;
      progress.style.width = '100%';
      label.textContent = 'ההתאמה מוכנה';
      $('[data-result-view]').focus();
    };

    $$('[data-answer]').forEach(button => button.addEventListener('click', () => {
      answers[button.dataset.answer] = button.dataset.value;
      if (step < 3) showStep(step + 1); else showResult();
    }));
    $('[data-quiz-reset]').addEventListener('click', () => { Object.keys(answers).forEach(key => delete answers[key]); showStep(1); });
    $('[data-result-view]').addEventListener('click', () => openProduct(result.dataset.product));
  }

  function initFaq() {
    $$('.faq-item button').forEach(button => button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const answer = button.closest('.faq-item').querySelector('.faq-answer');
      button.setAttribute('aria-expanded', String(!expanded));
      answer.hidden = expanded;
    }));
  }

  function initMotion() {
    const revealItems = $$('.reveal');
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      }), { threshold: .12, rootMargin: '0px 0px -40px' });
      revealItems.forEach(item => revealObserver.observe(item));
    } else revealItems.forEach(item => item.classList.add('is-visible'));

    const countObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.count);
      const start = performance.now();
      const duration = prefersReducedMotion ? 1 : 1100;
      const tick = now => {
        const progress = Math.min(1, (now - start) / duration);
        node.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(node);
    }), { threshold: .6 });
    $$('[data-count]').forEach(node => countObserver.observe(node));

    if (prefersReducedMotion) return;

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.from('[data-hero-copy] > *', { y: 34, duration: 1, stagger: .11, ease: 'power3.out', delay: .2, clearProps: 'transform' });
      gsap.to('.hero-media img', { scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.fromTo('.story-image img', { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.story-section', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('[data-marquee]', { xPercent: 8, ease: 'none', scrollTrigger: { trigger: '.reviews-section', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    }
  }

  function initEvents() {
    document.addEventListener('click', event => {
      const filter = event.target.closest('[data-filter]');
      if (filter) setActiveTab(filter);

      const add = event.target.closest('[data-add-cart]');
      if (add) addToCart(add.dataset.addCart);

      const view = event.target.closest('[data-view-product]');
      if (view) openProduct(view.dataset.viewProduct);

      const remove = event.target.closest('[data-remove-cart]');
      if (remove) { cart.splice(Number(remove.dataset.removeCart), 1); persistCart(); }

      if (event.target.closest('[data-open-cart]')) openCart();
      if (event.target.closest('[data-close-cart]')) closeLayer(cartLayer);
      if (event.target.closest('[data-close-product]')) closeProduct();

      if (event.target.closest('[data-open-search]')) {
        renderSearch();
        openLayer(searchLayer, $('[data-search-input]'));
      }
      if (event.target.closest('[data-close-search]')) closeLayer(searchLayer);

      const searchProduct = event.target.closest('[data-search-product]');
      if (searchProduct) { closeLayer(searchLayer); openProduct(searchProduct.dataset.searchProduct); }

      if (event.target.closest('[data-consult]')) showToast('בדמו המלא כאן ייפתח WhatsApp לייעוץ אישי');
      if (event.target.closest('[data-safety]')) showToast('מדריך הבטיחות יחובר ל־CMS לפני ההשקה');
      if (event.target.closest('[data-checkout]')) showToast('זהו דמו — תהליך הסליקה אינו פעיל');
      if (event.target.closest('[data-scroll-matcher]')) $('#matcher').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });

      if (event.target.closest('[data-go-models]')) setTimeout(() => $('#models').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }), 50);
    });

    $('[data-modal-add]').addEventListener('click', () => {
      if (!activeProduct) return;
      addToCart(activeProduct.id);
      closeLayer(productLayer);
      openCart();
    });

    $('[data-search-input]').addEventListener('input', event => renderSearch(event.target.value));

    const menuButton = $('[data-menu-toggle]');
    const mobileMenu = $('#mobile-menu');
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menuButton.setAttribute('aria-label', open ? 'פתיחת תפריט' : 'סגירת תפריט');
      mobileMenu.hidden = open;
    });
    $$('a', mobileMenu).forEach(link => link.addEventListener('click', () => { mobileMenu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); }));

    $$('[role="tab"]').forEach((tab, index, tabs) => tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else next = (index + (event.key === 'ArrowLeft' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus(); setActiveTab(tabs[next]);
    }));

    document.addEventListener('keydown', event => {
      const open = [productLayer, cartLayer, searchLayer].find(layer => !layer.hidden);
      if (!open) return;
      if (event.key === 'Escape') { open === productLayer ? closeProduct() : closeLayer(open); return; }
      if (event.key !== 'Tab') return;
      const nodes = focusable(open);
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    $('[data-newsletter]').addEventListener('submit', event => {
      event.preventDefault();
      showToast('נרשמתם לעדכוני KAV — בדמו לא נשמר מידע');
      event.currentTarget.reset();
    });

    const header = $('#site-header');
    const supportsScrollTimeline = CSS.supports?.('animation-timeline: scroll()');
    const onScroll = () => {
      header.classList.toggle('is-scrolled', scrollY > 24);
      if (!supportsScrollTimeline) {
        const max = document.documentElement.scrollHeight - innerHeight;
        document.documentElement.style.setProperty('--scroll-progress', max > 0 ? Math.min(1, scrollY / max) : 0);
      }
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  renderProducts();
  updateCart();
  initQuiz();
  initFaq();
  initEvents();
  initMotion();
})();
