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

  const lastHoveredBtns = new Map();

  const glassContainers = $$('.glass-container');
  glassContainers.forEach(container => {
    const indicator = document.createElement('div');
    indicator.className = 'flow-indicator';
    indicator.style.opacity = '0';
    indicator.style.transition = 'all .5s cubic-bezier(.25,.8,.25,1.2)';
    container.appendChild(indicator);
    
    const buttons = container.querySelectorAll('.glass-btn');
    
    const activeBtn = container.querySelector('.glass-btn.active');
    if (activeBtn) {
      lastHoveredBtns.set(container, activeBtn);
    }
    
    function moveIndicatorTo(btn, instant = false) {
      if (!btn) return;
      const btnRect = btn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      if (instant) {
        indicator.style.transition = 'none';
      } else {
        indicator.style.transition = 'all .5s cubic-bezier(.25,.8,.25,1.2)';
      }
      
      indicator.style.left = (btnRect.left - containerRect.left) + 'px';
      indicator.style.width = btnRect.width + 'px';
      indicator.style.opacity = '1';
      
      if (instant) {
        indicator.offsetHeight;
        setTimeout(() => {
          indicator.style.transition = 'all .5s cubic-bezier(.25,.8,.25,1.2)';
        }, 50);
      }
    }
    
    container.addEventListener('mouseenter', () => {
      const lastBtn = lastHoveredBtns.get(container);
      const target = lastBtn || activeBtn || buttons[0];
      if (target) {
        moveIndicatorTo(target, false);
      }
    });
    
    container.addEventListener('mouseleave', () => {
      indicator.style.transition = 'opacity .15s ease';
      indicator.style.opacity = '0';
    });
    
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', function() {
        lastHoveredBtns.set(container, this);
        moveIndicatorTo(this, false);
      });
    });
    
    if (activeBtn) {
      setTimeout(() => {
        moveIndicatorTo(activeBtn, true);
        indicator.style.opacity = '0.35';
      }, 300);
    }
  });

  // Функция обновления всех индикаторов
  function updateAllIndicators() {
    glassContainers.forEach(container => {
      const indicator = container.querySelector('.flow-indicator');
      if (!indicator) return;
      
      // Находим активную кнопку или последнюю наведённую
      const activeBtn = container.querySelector('.glass-btn.active');
      const lastBtn = lastHoveredBtns.get(container);
      const target = lastBtn || activeBtn;
      
      if (target) {
        const btnRect = target.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        indicator.style.transition = 'none';
        indicator.style.left = (btnRect.left - containerRect.left) + 'px';
        indicator.style.width = btnRect.width + 'px';
        indicator.offsetHeight;
        indicator.style.transition = 'all .5s cubic-bezier(.25,.8,.25,1.2)';
      }
    });
  }

  function setTheme(dark) {
    body.classList.toggle('dark-theme', dark);
    localStorage.setItem('rossinTheme', dark ? 'dark' : 'light');
  }
  setTheme(false);
  themeToggle.addEventListener('click', () => setTheme(!body.classList.contains('dark-theme')));

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
    
    // Обновляем индикаторы после смены языка (текст изменился → ширина кнопок изменилась)
    setTimeout(updateAllIndicators, 100);
  }
  
  setLanguage(localStorage.getItem('rossinLang') === 'en' ? 'en' : 'ru');
  
  langBtn.addEventListener('click', () => {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
  });

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
    
    // Обновляем индикаторы после смены вкладки
    setTimeout(updateAllIndicators, 100);
    
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
  
  loginAction.addEventListener('click', () => {
    const n = usernameInput.value.trim();
    if (!n || !passwordInput.value.trim()) {
      userMessage.textContent = currentLang === 'ru' ? 'Заполните все поля' : 'Fill in all fields';
      return;
    }
    currentUser = { name: n };
    updateUserBtn();
    userMessage.textContent = currentLang === 'ru' ? `Добро пожаловать, ${n}` : `Welcome, ${n}`;
    setTimeout(closeModal, 800);
  });
  
  registerAction.addEventListener('click', () => {
    const n = usernameInput.value.trim();
    if (!n || passwordInput.value.trim().length < 3) {
      userMessage.textContent = currentLang === 'ru' ? 'Минимум 3 символа в пароле' : 'Minimum 3 characters in password';
      return;
    }
    currentUser = { name: n };
    updateUserBtn();
    userMessage.textContent = currentLang === 'ru' ? 'Регистрация успешна!' : 'Registration successful!';
    setTimeout(closeModal, 800);
  });
  
  userMenuBtn.addEventListener('dblclick', () => {
    if (currentUser && confirm(currentLang === 'ru' ? 'Выйти из профиля?' : 'Log out?')) {
      currentUser = null;
      updateUserBtn();
    }
  });
  
  updateUserBtn();
})();