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

  if (history.scrollRestoration) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // ==================== СОЦ‑КНОПКИ (БЫСТРОЕ ОТКРЫТИЕ, ПЛАВНОЕ ЗАКРЫТИЕ) ====================
  const socialBtns = $$('.social-btn');
  socialBtns.forEach(btn => {
    let closeTimeout;
    const label = btn.querySelector('.social-label');

    btn.addEventListener('mouseenter', () => {
      clearTimeout(closeTimeout);
      // Быстрое раскрытие
      btn.style.transitionDuration = '0.15s';
      if (label) label.style.transitionDuration = '0.15s';

      btn.style.maxWidth = '160px';
      btn.style.width = 'auto';
      btn.style.paddingRight = '16px';
      if (label) {
        label.style.opacity = '0.9';
        label.style.width = 'auto';
        label.style.marginLeft = '8px';
      }
    });

    btn.addEventListener('mouseleave', () => {
      // Запускаем закрытие через 400 мс
      closeTimeout = setTimeout(() => {
        // Плавное закрытие
        btn.style.transitionDuration = '0.4s';
        if (label) label.style.transitionDuration = '0.3s';

        btn.style.maxWidth = '36px';
        btn.style.width = '36px';
        btn.style.paddingRight = '10px';
        if (label) {
          label.style.opacity = '0';
          label.style.width = '0';
          label.style.marginLeft = '0';
        }
      }, 400);
    });
  });

  // ==================== ИНДИКАТОР ====================
  const header = $('header');
  const allBtns = header ? header.querySelectorAll('.glass-btn') : [];

  const ind = document.createElement('div');
  ind.style.cssText = 'position:fixed;z-index:101;pointer-events:none;border-radius:24px;opacity:0;background:linear-gradient(135deg,rgba(180,170,210,0.4) 0%,rgba(200,190,230,0.3) 20%,rgba(170,200,220,0.35) 40%,rgba(190,180,220,0.3) 60%,rgba(200,190,210,0.35) 80%,rgba(180,170,210,0.4) 100%);background-size:400% 400%;animation:flowGradient 6s ease infinite,flowDirection 8s ease infinite;box-shadow:0 0 25px rgba(180,170,210,0.25),0 0 50px rgba(180,170,210,0.1),inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -1px 0 rgba(0,0,0,0.05);transition:left .5s cubic-bezier(.25,.8,.25,1.2),width .5s cubic-bezier(.25,.8,.25,1.2),opacity .3s ease';
  document.body.appendChild(ind);

  let lastBtn = allBtns[0] || null;
  let isHovering = false;
  let indicatorReady = false;

  function updateVertical() {
    if (!allBtns.length) return;
    let minTop = Infinity, maxBottom = 0;
    allBtns.forEach(btn => {
      const r = btn.getBoundingClientRect();
      if (!r.width) return;
      minTop = Math.min(minTop, r.top);
      maxBottom = Math.max(maxBottom, r.bottom);
    });
    if (minTop === Infinity) return;
    ind.style.top = minTop + 'px';
    ind.style.height = (maxBottom - minTop) + 'px';
  }

  function applyHorizontal(btn) {
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    ind.style.left = r.left + 'px';
    ind.style.width = r.width + 'px';
  }

  function showIndicator() { updateVertical(); applyHorizontal(lastBtn); ind.style.opacity = '0.35'; indicatorReady = true; }

  function waitForHeaderAnimation() {
    if (!header) { setTimeout(showIndicator, 100); return; }
    const ha = header.getAnimations ? header.getAnimations().find(a => a.animationName === 'headerSlideDown') : null;
    if (!ha || ha.playState === 'finished') { setTimeout(showIndicator, 50); return; }
    header.addEventListener('animationend', function h() { header.removeEventListener('animationend', h); setTimeout(showIndicator, 50); }, { once: true });
  }

  if (document.readyState === 'complete') waitForHeaderAnimation();
  else window.addEventListener('load', waitForHeaderAnimation);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(waitForHeaderAnimation);

  allBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => { if (!indicatorReady) return; isHovering = true; lastBtn = btn; applyHorizontal(btn); ind.style.opacity = '1'; });
    btn.addEventListener('mouseleave', () => { if (!indicatorReady) return; isHovering = false; ind.style.opacity = '0.35'; });
  });

  window.addEventListener('resize', () => { if (!indicatorReady || !lastBtn) return; updateVertical(); applyHorizontal(lastBtn); ind.style.opacity = isHovering ? '1' : '0.35'; });

  function setTheme(dark) { body.classList.toggle('dark-theme', dark); localStorage.setItem('rossinTheme', dark ? 'dark' : 'light'); }
  const st = localStorage.getItem('rossinTheme');
  setTheme(st === 'dark' ? true : false);
  themeToggle.addEventListener('click', () => setTheme(!body.classList.contains('dark-theme')));

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('rossinLang', lang);
    const lt = langBtn.querySelector('.btn-text');
    if (lt) lt.textContent = lang.toUpperCase();
    $$('[data-ru]').forEach(el => {
      const key = `data-${lang}`;
      if (el.hasAttribute(key)) {
        if (el.tagName === 'INPUT') {
          const pk = `${key}-placeholder`;
          el.placeholder = el.hasAttribute(pk) ? el.getAttribute(pk) : el.getAttribute(key);
        } else el.textContent = el.getAttribute(key);
      }
    });
    if (loginAction) loginAction.textContent = lang === 'ru' ? 'Войти' : 'Login';
    if (registerAction) registerAction.textContent = lang === 'ru' ? 'Создать аккаунт' : 'Create account';
    const lb = $('#logoutAction');
    if (lb) lb.textContent = lang === 'ru' ? 'Выйти из аккаунта' : 'Log out';
    updateUI();
  }
  setLanguage(localStorage.getItem('rossinLang') === 'en' ? 'en' : 'ru');
  langBtn.addEventListener('click', () => setLanguage(currentLang === 'ru' ? 'en' : 'ru'));

  let passwordVisible = false;
  function updatePasswordToggles() {
    [loginPassword, registerPassword].forEach(inp => { if (inp) inp.type = passwordVisible ? 'text' : 'password'; });
    document.querySelectorAll('.password-toggle').forEach(t => t.textContent = passwordVisible ? '🙈' : '👁️');
  }
  function setupPasswordToggles() {
    ['loginPassword', 'registerPassword'].forEach(id => {
      const w = $(`#${id}`).parentElement;
      if (!w) return;
      const old = w.querySelector('.password-toggle');
      if (old) old.remove();
      const t = document.createElement('span');
      t.className = 'password-toggle';
      t.style.cssText = 'position:absolute;right:16px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:1.2rem;opacity:0.5;z-index:3;user-select:none;';
      t.textContent = passwordVisible ? '🙈' : '👁️';
      t.addEventListener('click', () => { passwordVisible = !passwordVisible; updatePasswordToggles(); });
      w.appendChild(t);
    });
    updatePasswordToggles();
  }
  setupPasswordToggles();

  function navigateTo(page) {
    tabPages.forEach(p => p.classList.remove('active'));
    const t = $(`#page-${page}`);
    if (t) { t.classList.add('active'); setLanguage(currentLang); }
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.nav === page));
    $('.nav-dots').classList.toggle('hidden', page !== 'main');
    if (page === 'main') { currentSection = 'hero'; navDots.forEach(d => d.classList.remove('active')); navDots[0].classList.add('active'); }
  }

  function scrollToTarget(dot) {
    const t = $(`#${dot.dataset.target}`);
    if (!t || dot.dataset.target === currentSection) return;
    currentSection = dot.dataset.target;
    navDots.forEach(d => d.classList.remove('active')); dot.classList.add('active');
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { const top = t.getBoundingClientRect().top; if (top < 80) window.scrollBy({ top: top - 80, behavior: 'smooth' }); }, 50);
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
  navDots.forEach(d => d.addEventListener('touchstart', e => { e.preventDefault(); isDragging = true; scrollToTarget(d); }));
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
    if (disc.getBoundingClientRect().top > innerHeight * 0.5) { navDots[0].classList.add('active'); currentSection = 'hero'; }
    else { navDots[1].classList.add('active'); currentSection = 'discography-main'; }
  });

  logoBtn.addEventListener('click', () => location.href = location.origin + location.pathname);
  navLinks.forEach(l => l.addEventListener('click', e => { e.preventDefault(); navigateTo(l.dataset.nav); }));

  function openLoginModal() {
    const lb = $('#logoutAction'); if (lb) lb.remove();
    loginAction.style.display = ''; loginEmail.style.display = ''; loginPassword.style.display = '';
    document.querySelectorAll('#loginModal .modal-input-wrapper').forEach(w => w.style.display = '');
    document.querySelectorAll('#loginModal .modal-switch').forEach(s => s.style.display = '');

    if (currentUser) {
      loginAction.style.display = 'none'; loginEmail.style.display = 'none'; loginPassword.style.display = 'none';
      document.querySelectorAll('#loginModal .modal-input-wrapper').forEach(w => w.style.display = 'none');
      document.querySelectorAll('#loginModal .modal-switch').forEach(s => s.style.display = 'none');

      const btn = document.createElement('button');
      btn.id = 'logoutAction'; btn.className = 'btn btn-accent';
      btn.style.cssText = 'width:100%;background:linear-gradient(135deg,rgba(198,40,40,0.8),rgba(255,82,82,0.6));color:#fff;border:0.5px solid rgba(255,255,255,0.3);padding:12px 28px;border-radius:28px;font-weight:700;font-size:.85rem;letter-spacing:1.5px;cursor:pointer;text-transform:uppercase;position:relative;overflow:hidden;';
      btn.textContent = currentLang === 'ru' ? 'Выйти из аккаунта' : 'Log out';
      const ripple = document.createElement('span');
      ripple.style.cssText = 'position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:rgba(255,255,255,0.3);transition:all .6s ease;transform:translate(-50%,-50%);pointer-events:none;';
      btn.appendChild(ripple);
      btn.addEventListener('mouseenter', () => { btn.style.background = 'linear-gradient(135deg,rgba(220,50,50,0.9),rgba(255,100,100,0.7))'; ripple.style.width = '400px'; ripple.style.height = '400px'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = 'linear-gradient(135deg,rgba(198,40,40,0.8),rgba(255,82,82,0.6))'; ripple.style.width = '0'; ripple.style.height = '0'; });
      btn.addEventListener('click', () => { window.firebaseAuth.signOut(); closeAllModals(); });
      loginModal.querySelector('.modal-buttons').appendChild(btn);
    }

    loginModal.classList.add('active'); registerModal.classList.remove('active');
    setupPasswordToggles(); setLanguage(currentLang);
  }

  function closeAllModals() { loginModal.classList.remove('active'); registerModal.classList.remove('active'); }

  function updateUI() {
    const bt = userMenuBtn.querySelector('.btn-text');
    if (bt) bt.textContent = currentUser ? currentUser.name : (currentLang === 'ru' ? 'Профиль' : 'Profile');
  }

  userMenuBtn.addEventListener('click', openLoginModal);
  closeLoginModal.addEventListener('click', closeAllModals);
  closeRegisterModal.addEventListener('click', closeAllModals);
  window.addEventListener('click', e => { if (e.target === loginModal || e.target === registerModal) closeAllModals(); });
  switchToRegister.addEventListener('click', () => {
    loginModal.classList.remove('active'); registerModal.classList.add('active');
    registerEmail.value = ''; registerPassword.value = ''; registerMessage.textContent = '';
    setupPasswordToggles(); setLanguage(currentLang);
  });
  switchToLogin.addEventListener('click', () => {
    registerModal.classList.remove('active'); loginModal.classList.add('active');
    loginEmail.value = ''; loginPassword.value = ''; loginMessage.textContent = '';
    setupPasswordToggles(); setLanguage(currentLang);
  });

  window.firebaseAuth.onAuthStateChanged(user => {
    currentUser = user ? { name: user.displayName || user.email.split('@')[0], email: user.email } : null;
    updateUI();
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
    const email = loginEmail.value.trim(), password = loginPassword.value.trim();
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
    const email = registerEmail.value.trim(), password = registerPassword.value.trim();
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

  updateUI();
})();