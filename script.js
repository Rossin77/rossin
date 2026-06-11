(function() {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  
  const body = document.body;
  const themeToggle = $('#themeToggle');
  const navLinks = $$('[data-nav]');
  const tabPages = $$('.tab-page');
  const loginModal = $('#loginModal');
  const registerModal = $('#registerModal');
  const userMenuBtn = $('#userMenuBtn');
  const closeLoginModal = $('#closeLoginModal');
  const closeRegisterModal = $('#closeRegisterModal');
  const loginAction = $('#loginAction');
  const registerAction = $('#registerAction');
  const loginEmail = $('#loginEmail');
  const loginPassword = $('#loginPassword');
  const registerEmail = $('#registerEmail');
  const registerPassword = $('#registerPassword');
  const loginMessage = $('#loginMessage');
  const registerMessage = $('#registerMessage');
  const logoBtn = $('#logoBtn');
  const langBtn = $('#langBtn');
  const navDots = $$('.nav-dot');
  const switchToRegister = $('#switchToRegister');
  const switchToLogin = $('#switchToLogin');
  
  let currentUser = null;
  let currentLang = 'ru';
  let isDragging = false;
  let currentSection = 'hero';

  // Сбрасываем скролл до того как браузер восстановит позицию
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

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
  
  function applyHorizontal(btn) {
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    ind.style.left = rect.left + 'px';
    ind.style.width = rect.width + 'px';
  }
  
  function showIndicator() {
    updateVertical();
    applyHorizontal(lastBtn);
    ind.style.opacity = '0.35';
    indicatorReady = true;
  }
  
  function waitForHeaderAnimation() {
    if (!header) { setTimeout(showIndicator, 100); return; }
    const headerAnimation = header.getAnimations ? header.getAnimations().find(a => a.animationName === 'headerSlideDown') : null;
    if (!headerAnimation || headerAnimation.playState === 'finished') { setTimeout(showIndicator, 50); return; }
    header.addEventListener('animationend', function handler() {
      header.removeEventListener('animationend', handler);
      setTimeout(showIndicator, 50);
    }, { once: true });
  }
  
  function scheduleIndicator() {
    if (document.readyState === 'complete') { waitForHeaderAnimation(); }
    else { window.addEventListener('load', waitForHeaderAnimation); }
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(waitForHeaderAnimation); }
  }
  scheduleIndicator();
  
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
  
  window.addEventListener('resize', () => {
    if (!indicatorReady || !lastBtn) return;
    updateVertical();
    applyHorizontal(lastBtn);
    ind.style.opacity = isHovering ? '1' : '0.35';
  });

  // ==================== ТЕМА ====================
  function setTheme(dark) { body.classList.toggle('dark-theme', dark); localStorage.setItem('rossinTheme', dark ? 'dark' : 'light'); }
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
        if (el.tagName === 'INPUT') { el.placeholder = el.getAttribute(`${key}-placeholder`) || el.getAttribute(key); }
        else { el.textContent = el.getAttribute(key); }
      }
    });
    if (loginAction) loginAction.textContent = lang === 'ru' ? 'Войти' : 'Login';
    if (registerAction) registerAction.textContent = lang === 'ru' ? 'Создать аккаунт' : 'Create account';
    updateUserBtn();
  }
  setLanguage(localStorage.getItem('rossinLang') === 'en' ? 'en' : 'ru');
  langBtn.addEventListener('click', () => setLanguage(currentLang === 'ru' ? 'en' : 'ru'));

  // ==================== НАВИГАЦИЯ ====================
  function navigateTo(page) {
    tabPages.forEach(p => p.classList.remove('active'));
    const target = $(`#page-${page}`);
    if (target) { target.classList.add('active'); setLanguage(currentLang); }
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.nav === page));
    updateDotsVisibility(page);
    if (page === 'main') { currentSection = 'hero'; navDots.forEach(d => d.classList.remove('active')); navDots[0].classList.add('active'); }
  }
  
  function updateDotsVisibility(page) {
    const container = $('.nav-dots');
    if (page === 'main') { container.classList.remove('hidden'); }
    else { container.classList.add('hidden'); }
  }
  
  function scrollToTarget(dot) {
    const target = $(`#${dot.dataset.target}`);
    if (!target || dot.dataset.target === currentSection) return;
    currentSection = dot.dataset.target;
    navDots.forEach(d => d.classList.remove('active')); dot.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { const top = target.getBoundingClientRect().top; if (top < 80) window.scrollBy({ top: top - 80, behavior: 'smooth' }); }, 50);
  }
  
  navDots.forEach(dot => {
    dot.addEventListener('click', e => { e.preventDefault(); scrollToTarget(dot); });
    dot.addEventListener('mousedown', e => { e.preventDefault(); isDragging = true; scrollToTarget(dot); });
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dot = [...navDots].find(d => { const r = d.getBoundingClientRect(); return e.clientX >= r.left-10 && e.clientX <= r.right+10 && e.clientY >= r.top-10 && e.clientY <= r.bottom+10; });
    if (dot) scrollToTarget(dot);
  });
  document.addEventListener('mouseup', () => isDragging = false);
  navDots.forEach(dot => dot.addEventListener('touchstart', e => { e.preventDefault(); isDragging = true; scrollToTarget(dot); }));
  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const t = e.touches[0];
    const dot = [...navDots].find(d => { const r = d.getBoundingClientRect(); return t.clientX >= r.left-10 && t.clientX <= r.right+10 && t.clientY >= r.top-10 && t.clientY <= r.bottom+10; });
    if (dot) scrollToTarget(dot);
  });
  document.addEventListener('touchend', () => isDragging = false);
  
  window.addEventListener('scroll', () => {
    if (isDragging) return;
    const disc = $('#discography-main');
    if (!disc) { navDots.forEach(d => d.classList.remove('active')); navDots[0].classList.add('active'); currentSection = 'hero'; return; }
    navDots.forEach(d => d.classList.remove('active'));
    if (disc.getBoundingClientRect().top > window.innerHeight * 0.5) { navDots[0].classList.add('active'); currentSection = 'hero'; }
    else { navDots[1].classList.add('active'); currentSection = 'discography-main'; }
  });
  
  logoBtn.addEventListener('click', () => location.href = location.origin + location.pathname);
  navLinks.forEach(link => link.addEventListener('click', e => { e.preventDefault(); navigateTo(link.dataset.nav); }));

  // ==================== МОДАЛЬНЫЕ ОКНА ====================
  function openLoginModal() {
    loginModal.classList.add('active');
    registerModal.classList.remove('active');
    loginEmail.value = '';
    loginPassword.value = '';
    loginMessage.textContent = '';
    setLanguage(currentLang);
  }
  
  function closeAllModals() {
    loginModal.classList.remove('active');
    registerModal.classList.remove('active');
  }
  
  userMenuBtn.addEventListener('click', openLoginModal);
  closeLoginModal.addEventListener('click', closeAllModals);
  closeRegisterModal.addEventListener('click', closeAllModals);
  window.addEventListener('click', e => { if (e.target === loginModal || e.target === registerModal) closeAllModals(); });
  switchToRegister.addEventListener('click', () => {
    loginModal.classList.remove('active');
    registerModal.classList.add('active');
    registerEmail.value = '';
    registerPassword.value = '';
    registerMessage.textContent = '';
    setLanguage(currentLang);
  });
  switchToLogin.addEventListener('click', openLoginModal);
  
  function updateUserBtn() {
    const btnText = userMenuBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = currentUser ? currentUser.name : (currentLang === 'ru' ? 'Профиль' : 'Profile');
  }

  // ==================== FIREBASE ====================
  window.firebaseAuth.onAuthStateChanged(user => {
    currentUser = user ? { name: user.displayName || user.email.split('@')[0], email: user.email } : null;
    updateUserBtn();
  });

  const authMessages = {
    'auth/invalid-credential': ['Неверный email или пароль', 'Wrong email or password'],
    'auth/user-not-found': ['Пользователь не найден', 'User not found'],
    'auth/wrong-password': ['Неверный пароль', 'Wrong password'],
    'auth/invalid-email': ['Неверный email', 'Invalid email'],
    'auth/too-many-requests': ['Слишком много попыток. Подождите', 'Too many attempts. Wait'],
    'auth/email-already-in-use': ['Email уже используется', 'Email already in use'],
    'auth/weak-password': ['Пароль слишком простой', 'Password too weak']
  };

  loginAction.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    if (!email || !password) { loginMessage.textContent = currentLang === 'ru' ? 'Заполните все поля' : 'Fill in all fields'; return; }
    loginAction.disabled = true; loginAction.textContent = '...';
    try {
      await window.firebaseAuth.signInWithEmailAndPassword(email, password);
      loginMessage.textContent = currentLang === 'ru' ? 'Добро пожаловать!' : 'Welcome!';
      setTimeout(closeAllModals, 800);
    } catch (error) {
      const msg = authMessages[error.code];
      loginMessage.textContent = msg ? msg[currentLang === 'ru' ? 0 : 1] : error.message;
    } finally { loginAction.disabled = false; setLanguage(currentLang); }
  });

  registerAction.addEventListener('click', async () => {
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    if (!email || !password) { registerMessage.textContent = currentLang === 'ru' ? 'Заполните все поля' : 'Fill in all fields'; return; }
    if (password.length < 6) { registerMessage.textContent = currentLang === 'ru' ? 'Минимум 6 символов' : 'Minimum 6 characters'; return; }
    registerAction.disabled = true; registerAction.textContent = '...';
    try {
      await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
      registerMessage.textContent = currentLang === 'ru' ? 'Регистрация успешна!' : 'Registration successful!';
      setTimeout(closeAllModals, 800);
    } catch (error) {
      const msg = authMessages[error.code];
      registerMessage.textContent = msg ? msg[currentLang === 'ru' ? 0 : 1] : error.message;
    } finally { registerAction.disabled = false; setLanguage(currentLang); }
  });

  userMenuBtn.addEventListener('dblclick', () => {
    if (currentUser && confirm(currentLang === 'ru' ? 'Выйти из профиля?' : 'Log out?')) window.firebaseAuth.signOut();
  });
  
  updateUserBtn();
})();