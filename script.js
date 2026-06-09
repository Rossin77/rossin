(function() {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  
  const body = document.body;
  const themeToggle = $('#themeToggle');
  const navLinks = $$('[data-nav]');
  const tabPages = $$('.tab-page');
  const userModal = $('#userModal');
  const userMenuBtn = $('#userMenuBtn');
  const closeModalBtn = $('#closeModal');
  const loginAction = $('#loginAction');
  const registerAction = $('#registerAction');
  const usernameInput = $('#usernameInput');
  const passwordInput = $('#passwordInput');
  const userMessage = $('#userMessage');
  const logoBtn = $('#logoBtn');
  const langBtn = $('#langBtn');
  const navDots = $$('.nav-dot');
  
  let currentUser = null;
  let currentLang = 'ru';
  let isDragging = false;
  let lastTarget = null;
  let currentSection = 'hero';

  // ==================== ИНДИКАТОР ====================
  const header = $('header');
  const allBtns = header ? header.querySelectorAll('.glass-btn') : [];
  
  const ind = document.createElement('div');
  ind.style.cssText = `
    position: fixed;
    z-index: 101;
    pointer-events: none;
    border-radius: 24px;
    opacity: 0;
    background: linear-gradient(135deg, rgba(180,170,210,0.4) 0%, rgba(200,190,230,0.3) 20%, rgba(170,200,220,0.35) 40%, rgba(190,180,220,0.3) 60%, rgba(200,190,210,0.35) 80%, rgba(180,170,210,0.4) 100%);
    background-size: 400% 400%;
    animation: flowGradient 6s ease infinite, flowDirection 8s ease infinite;
    box-shadow: 0 0 25px rgba(180,170,210,0.25), 0 0 50px rgba(180,170,210,0.1), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.05);
    transition: left .5s cubic-bezier(.25,.8,.25,1.2), width .5s cubic-bezier(.25,.8,.25,1.2), opacity .3s ease;
  `;
  document.body.appendChild(ind);
  
  let lastBtn = allBtns[0] || null;
  let isHovering = false;
  let indicatorReady = false;
  
  // Фиксирует вертикальные границы индикатора по всем кнопкам
  function updateVertical() {
    if (allBtns.length === 0) return;
    let minTop = Infinity, maxBottom = 0;
    allBtns.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      if (rect.width === 0) return;
      minTop = Math.min(minTop, rect.top);
      maxBottom = Math.max(maxBottom, rect.bottom);
    });
    if (minTop === Infinity) return;
    ind.style.top = minTop + 'px';
    ind.style.height = (maxBottom - minTop) + 'px';
  }
  
  // Устанавливает горизонтальную позицию по кнопке
  function applyHorizontal(btn) {
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    ind.style.left = rect.left + 'px';
    ind.style.width = rect.width + 'px';
  }
  
  // Окончательная инициализация индикатора
  function showIndicator() {
    updateVertical();
    applyHorizontal(lastBtn);
    ind.style.opacity = '0.35';
    indicatorReady = true;
  }
  
  // Ожидание завершения анимации header
  function waitForHeaderAnimation() {
    if (!header) {
      setTimeout(showIndicator, 100);
      return;
    }
    
    // Если анимация уже закончилась (событие animationend могло произойти раньше)
    const headerAnimation = header.getAnimations ? header.getAnimations().find(a => a.animationName === 'headerSlideDown') : null;
    if (!headerAnimation || headerAnimation.playState === 'finished') {
      // Небольшая задержка на всякий случай
      setTimeout(showIndicator, 50);
      return;
    }
    
    // Ждём конца анимации
    header.addEventListener('animationend', function handler() {
      header.removeEventListener('animationend', handler);
      setTimeout(showIndicator, 50);
    }, { once: true });
  }
  
  // Старт после полной загрузки страницы и шрифтов
  function scheduleIndicator() {
    if (document.readyState === 'complete') {
      waitForHeaderAnimation();
    } else {
      window.addEventListener('load', waitForHeaderAnimation);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(waitForHeaderAnimation);
    }
  }
  scheduleIndicator();
  
  // Наведение
  allBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (!indicatorReady) return;
      isHovering = true;
      lastBtn = btn;
      applyHorizontal(btn);
      ind.style.opacity = '1';
    });
    
    btn.addEventListener('mouseleave', () => {
      if (!indicatorReady) return;
      isHovering = false;
      ind.style.opacity = '0.35';
    });
  });
  
  // Ресайз
  window.addEventListener('resize', () => {
    if (!indicatorReady || !lastBtn) return;
    updateVertical();
    applyHorizontal(lastBtn);
    ind.style.opacity = isHovering ? '1' : '0.35';
  });

  // ==================== ТЕМА ====================
  function setTheme(dark) {
    body.classList.toggle('dark-theme', dark);
    localStorage.setItem('rossinTheme', dark ? 'dark' : 'light');
  }
  setTheme(false);
  themeToggle.addEventListener('click', () => setTheme(!body.classList.contains('dark-theme')));

  // ==================== ЯЗЫК ====================
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('rossinLang', lang);
    const langText = langBtn.querySelector('.btn-text');
    if (langText) langText.textContent = lang.toUpperCase();
    
    $$('[data-ru]').forEach(el => {
      const key = `data-${lang}`;
      if (el.hasAttribute(key)) {
        if (el.tagName === 'INPUT') {
          el.placeholder = el.getAttribute(`${key}-placeholder`) || el.getAttribute(key);
        } else {
          el.textContent = el.getAttribute(key);
        }
      }
    });
  }
  
  setLanguage(localStorage.getItem('rossinLang') === 'en' ? 'en' : 'ru');
  
  langBtn.addEventListener('click', () => {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
  });

  // ==================== НАВИГАЦИЯ ====================
  function navigateTo(page) {
    tabPages.forEach(p => p.classList.remove('active'));
    const target = $(`#page-${page}`);
    if (target) {
      target.classList.add('active');
      setLanguage(currentLang);
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.nav === page);
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateDotsVisibility(page);
    
    if (page === 'main') {
      currentSection = 'hero';
      navDots.forEach(d => d.classList.remove('active'));
      navDots[0].classList.add('active');
    }
  }
  
  function updateDotsVisibility(page) {
    const container = $('.nav-dots');
    if (page === 'main') {
      container.classList.remove('hidden');
    } else {
      container.classList.add('hidden');
    }
  }
  
  function scrollToTarget(dot) {
    const targetId = dot.dataset.target;
    const target = $(`#${targetId}`);
    
    if (!target) return;
    if (targetId === currentSection) return;
    
    lastTarget = target;
    currentSection = targetId;
    
    navDots.forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
    
    target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    setTimeout(() => {
      const headerHeight = 80;
      const targetRect = target.getBoundingClientRect();
      if (targetRect.top < headerHeight) {
        window.scrollBy({ top: targetRect.top - headerHeight, behavior: 'smooth' });
      }
    }, 50);
  }
  
  function getDotUnderPoint(x, y) {
    for (const dot of navDots) {
      const rect = dot.getBoundingClientRect();
      if (x >= rect.left - 10 && x <= rect.right + 10 && y >= rect.top - 10 && y <= rect.bottom + 10) {
        return dot;
      }
    }
    return null;
  }
  
  navDots.forEach(dot => {
    dot.addEventListener('click', function(e) {
      e.preventDefault();
      lastTarget = null;
      scrollToTarget(this);
    });
    dot.addEventListener('mousedown', function(e) {
      e.preventDefault();
      isDragging = true;
      lastTarget = null;
      scrollToTarget(this);
    });
  });
  
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    const dotUnderCursor = getDotUnderPoint(e.clientX, e.clientY);
    if (dotUnderCursor) scrollToTarget(dotUnderCursor);
  });
  
  document.addEventListener('mouseup', function() { isDragging = false; lastTarget = null; });
  
  navDots.forEach(dot => {
    dot.addEventListener('touchstart', function(e) {
      e.preventDefault();
      isDragging = true;
      lastTarget = null;
      scrollToTarget(this);
    });
  });
  
  document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dotUnderTouch = getDotUnderPoint(touch.clientX, touch.clientY);
    if (dotUnderTouch) scrollToTarget(dotUnderTouch);
  });
  
  document.addEventListener('touchend', function() { isDragging = false; lastTarget = null; });
  
  function updateActiveDot() {
    if (isDragging) return;
    const hero = $('#hero');
    const discography = $('#discography-main');
    
    if (!hero) return;
    
    if (!discography) {
      navDots.forEach(d => d.classList.remove('active'));
      navDots[0].classList.add('active');
      currentSection = 'hero';
      return;
    }
    
    const discographyTop = discography.getBoundingClientRect().top;
    
    navDots.forEach(d => d.classList.remove('active'));
    if (discographyTop > window.innerHeight * 0.5) {
      navDots[0].classList.add('active');
      currentSection = 'hero';
    } else {
      navDots[1].classList.add('active');
      currentSection = 'discography-main';
    }
  }
  
  window.addEventListener('scroll', updateActiveDot);
  
  logoBtn.addEventListener('click', () => {
    window.location.href = window.location.origin + window.location.pathname;
  });
  
  navLinks.forEach(link => link.addEventListener('click', (e) => { 
    e.preventDefault();
    navigateTo(link.dataset.nav);
  }));

  // ==================== МОДАЛЬНОЕ ОКНО ====================
  function openModal() {
    userModal.classList.add('active');
    usernameInput.value = '';
    passwordInput.value = '';
    userMessage.textContent = '';
    setLanguage(currentLang);
  }
  function closeModal() { userModal.classList.remove('active'); }
  
  userMenuBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => { if (e.target === userModal) closeModal(); });
  
  function updateUserBtn() {
    const btnText = userMenuBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = currentUser ? currentUser.name : (currentLang === 'ru' ? 'Профиль' : 'Profile');
  }
  
  registerAction.addEventListener('click', () => {
    const email = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || password.length < 6) {
      userMessage.textContent = currentLang === 'ru' ? 'Минимум 6 символов' : 'Minimum 6 characters';
      return;
    }
    
    if (!window.firebaseAuth) {
      userMessage.textContent = 'Firebase loading...';
      return;
    }
    
    window.firebaseAuth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        currentUser = { name: email.split('@')[0] };
        updateUserBtn();
        userMessage.textContent = currentLang === 'ru' ? 'Регистрация успешна!' : 'Registration successful!';
        setTimeout(closeModal, 800);
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          userMessage.textContent = currentLang === 'ru' ? 'Email уже используется' : 'Email already in use';
        } else if (error.code === 'auth/weak-password') {
          userMessage.textContent = currentLang === 'ru' ? 'Пароль слишком простой' : 'Password too weak';
        } else if (error.code === 'auth/invalid-email') {
          userMessage.textContent = currentLang === 'ru' ? 'Неверный email' : 'Invalid email';
        } else {
          userMessage.textContent = error.message;
        }
      });
  });
  
  loginAction.addEventListener('click', () => {
    const email = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
      userMessage.textContent = currentLang === 'ru' ? 'Заполните все поля' : 'Fill in all fields';
      return;
    }
    
    if (!window.firebaseAuth) {
      userMessage.textContent = 'Firebase loading...';
      return;
    }
    
    window.firebaseAuth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        currentUser = { name: email.split('@')[0] };
        updateUserBtn();
        userMessage.textContent = currentLang === 'ru' ? 'Добро пожаловать!' : 'Welcome!';
        setTimeout(closeModal, 800);
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          userMessage.textContent = currentLang === 'ru' ? 'Неверный email или пароль' : 'Wrong email or password';
        } else {
          userMessage.textContent = error.message;
        }
      });
  });
  
  userMenuBtn.addEventListener('dblclick', () => {
    if (currentUser && confirm(currentLang === 'ru' ? 'Выйти из профиля?' : 'Log out?')) {
      if (window.firebaseAuth) {
        window.firebaseAuth.signOut();
      }
      currentUser = null;
      updateUserBtn();
    }
  });
  
  updateUserBtn();
})();