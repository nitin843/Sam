/* ===================================================
   Boundless Moments — script.js
   =================================================== */

'use strict';

/* ===================================================
   1. NAVIGATION — Sticky & Active Page Highlight
   =================================================== */
(function initNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // Mobile hamburger toggle
  const toggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      toggle.querySelectorAll('span').forEach((s, i) => {
        if (isOpen) {
          if (i === 0) s.style.transform = 'rotate(45deg) translate(5px, 5px)';
          if (i === 1) s.style.opacity = '0';
          if (i === 2) s.style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
          s.style.transform = '';
          s.style.opacity = '';
        }
      });
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }
})();


/* ===================================================
   2. PORTFOLIO — Filter Buttons
   =================================================== */
(function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card[data-category]');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button and aria-pressed state
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hide');
          card.style.animation = 'fadeIn .35s ease forwards';
        } else {
          card.classList.add('hide');
        }
      });
    });
  });

  // Activate "All" by default
  const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
  if (allBtn) allBtn.classList.add('active');
})();


/* ===================================================
   3. CONTACT FORM — Validation & localStorage
   =================================================== */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  const msgEl = document.getElementById('formMessage');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name     = form.querySelector('#fullName').value.trim();
    const email    = form.querySelector('#emailAddr').value.trim();
    const phone    = form.querySelector('#phone').value.trim();
    const service  = form.querySelector('#service').value;
    const date     = form.querySelector('#eventDate').value;
    const message  = form.querySelector('#message').value.trim();

    // Basic validation
    if (!name || !email || !phone || !service || !date || !message) {
      showMessage(msgEl, 'Please fill in all required fields.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showMessage(msgEl, 'Please enter a valid email address.', 'error');
      return;
    }
    if (!isValidPhone(phone)) {
      showMessage(msgEl, 'Please enter a valid phone number.', 'error');
      return;
    }

    // Save to localStorage
    const submission = { name, email, phone, service, date, message, submittedAt: new Date().toISOString() };
    const existing = JSON.parse(localStorage.getItem('bm_enquiries') || '[]');
    existing.push(submission);
    localStorage.setItem('bm_enquiries', JSON.stringify(existing));

    showMessage(msgEl, 'Thank you! Your enquiry has been submitted successfully. We\'ll be in touch soon.', 'success');
    form.reset();
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function isValidPhone(phone) {
    return /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
  }
  function showMessage(el, text, type) {
    el.textContent = text;
    el.className = 'form-message ' + type;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
})();


/* ===================================================
   4. ADMIN — Login & Dashboard
   =================================================== */
(function initAdmin() {
  const loginSection    = document.getElementById('adminLogin');
  const dashSection     = document.getElementById('adminDashboard');
  const loginForm       = document.getElementById('loginForm');
  const loginError      = document.getElementById('loginError');
  const logoutBtn       = document.getElementById('logoutBtn');
  const totalEl         = document.getElementById('totalEnquiries');
  const newEl           = document.getElementById('newEnquiries');
  const todayEl         = document.getElementById('todayEnquiries');
  const tableBody       = document.getElementById('enquiriesBody');
  const notesArea       = document.getElementById('adminNotes');

  if (!loginForm) return;

  const ADMIN_EMAIL    = 'admin@boundlessmoments.com';
  const ADMIN_PASSWORD = 'admin123';
  const SESSION_KEY    = 'bm_admin_session';

  // Check if already logged in
  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    showDashboard();
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email    = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      loginError.textContent = '';
      showDashboard();
    } else {
      loginError.textContent = 'Invalid credentials. Please try again.';
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_KEY);
      dashSection.classList.add('hidden');
      loginSection.classList.remove('hidden');
      loginForm.reset();
    });
  }

  function showDashboard() {
    loginSection.classList.add('hidden');
    dashSection.classList.remove('hidden');
    loadEnquiries();
    loadNotes();
  }

  function loadEnquiries() {
    const data = JSON.parse(localStorage.getItem('bm_enquiries') || '[]');
    const total = data.length;
    const today = new Date().toDateString();
    const todayCount = data.filter(d => new Date(d.submittedAt).toDateString() === today).length;

    if (totalEl) totalEl.textContent = total;
    if (newEl)   newEl.textContent   = todayCount;
    if (todayEl) todayEl.textContent = todayCount;

    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (total === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="no-data">No enquiries submitted yet.</td></tr>';
      return;
    }

    data.slice().reverse().forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escHtml(item.name)}</td>
        <td>${escHtml(item.email)}</td>
        <td>${escHtml(item.phone || '—')}</td>
        <td>${escHtml(capitalise(item.service))}</td>
        <td>${escHtml(item.date || '—')}</td>
        <td>${escHtml(item.message)}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function loadNotes() {
    if (!notesArea) return;
    notesArea.value = localStorage.getItem('bm_admin_notes') || '';
    notesArea.addEventListener('input', () => {
      localStorage.setItem('bm_admin_notes', notesArea.value);
    });
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function capitalise(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }
})();
