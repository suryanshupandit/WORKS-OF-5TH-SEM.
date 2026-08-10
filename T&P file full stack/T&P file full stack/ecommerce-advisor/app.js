/* ============================================================
   SHOPMATCH — APP LOGIC
   ============================================================ */

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
const answers = { q1: null, q2: null, q3: null };

// ─────────────────────────────────────────────
// PARTICLE SYSTEM
// ─────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.4 + 0.05;
      this.color = ['rgba(167,139,250,', 'rgba(56,189,248,', 'rgba(244,114,182,'][Math.floor(Math.random() * 3)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ─────────────────────────────────────────────
// SCREEN MANAGEMENT
// ─────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active', 'visible');
  });
  const target = document.getElementById(id);
  target.classList.add('active');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => target.classList.add('visible'));
  });
}

// Initial hero reveal
window.addEventListener('DOMContentLoaded', () => {
  showScreen('screen-hero');
  initOptionCards();
});

// ─────────────────────────────────────────────
// OPTION CARD INTERACTIONS
// ─────────────────────────────────────────────
function initOptionCards() {
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      const q = card.dataset.q;
      const val = card.dataset.val;

      // Deselect siblings
      document.querySelectorAll(`.option-card[data-q="${q}"]`).forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      // Check the radio
      card.querySelector('input[type="radio"]').checked = true;

      // Save answer
      answers[`q${q}`] = val;

      // Enable next button
      const nextBtn = document.getElementById(`next-${q}`);
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.removeAttribute('disabled');
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'all';
      }

      // Ripple effect
      createRipple(card);
    });
  });
}

function createRipple(el) {
  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position:absolute; border-radius:50%; 
    background:rgba(124,58,237,0.25);
    width:300px; height:300px;
    top:50%; left:50%;
    transform:translate(-50%,-50%) scale(0);
    animation: ripple 0.6s ease-out forwards;
    pointer-events:none; z-index:0;
  `;
  const style = document.createElement('style');
  style.textContent = `@keyframes ripple { to { transform:translate(-50%,-50%) scale(1); opacity:0; } }`;
  document.head.appendChild(style);
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────
function startQuiz() {
  showScreen('screen-quiz');
  setTimeout(() => showQuestion(1), 100);
}

function showQuestion(num) {
  document.querySelectorAll('.question').forEach(q => {
    q.classList.remove('active', 'visible');
  });
  const q = document.getElementById(`q${num}`);
  q.classList.add('active');
  requestAnimationFrame(() => requestAnimationFrame(() => q.classList.add('visible')));
  updateProgress(num);
}

function nextQuestion(from) {
  if (!answers[`q${from}`]) return;
  const q = document.getElementById(`q${from}`);
  q.classList.add('exit-left');
  setTimeout(() => {
    q.classList.remove('active', 'visible', 'exit-left');
    showQuestion(from + 1);
  }, 350);
}

function prevQuestion(from) {
  const q = document.getElementById(`q${from}`);
  q.style.opacity = '0';
  q.style.transform = 'translateX(40px)';
  setTimeout(() => {
    q.classList.remove('active', 'visible');
    q.style.opacity = '';
    q.style.transform = '';
    showQuestion(from - 1);
  }, 300);
}

function goHome() {
  showScreen('screen-hero');
}

function updateProgress(qNum) {
  const pct = ((qNum - 1) / 3) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('q-current').textContent = qNum;
  document.getElementById('progress-pct').textContent = Math.round(pct) + '% Complete';

  [1, 2, 3].forEach(n => {
    const dot = document.getElementById(`dot-${n}`);
    dot.classList.remove('active', 'done');
    if (n === qNum) dot.classList.add('active');
    else if (n < qNum) dot.classList.add('done');
  });
  [1, 2].forEach(n => {
    const line = document.getElementById(`line-${n}-${n + 1}`);
    if (n < qNum) line.classList.add('done');
    else line.classList.remove('done');
  });
}

// ─────────────────────────────────────────────
// RECOMMENDATION ENGINE
// ─────────────────────────────────────────────
const RECOMMENDATIONS = {
  // Physical + Zero Budget
  'physical-zero-beginner': {
    name: 'Facebook Marketplace + Carousell',
    tagline: 'Free, social-powered selling with zero setup',
    match: 91,
    why: [
      'Completely free to list and sell — no monthly fees ever',
      'Built-in audience of millions ready to buy locally',
      'No coding or website setup required — just photos and a description',
      'Ideal for getting your first sale within 24 hours',
    ],
    features: [
      { icon: '🆓', label: 'Always Free' },
      { icon: '📸', label: 'Photo Listings' },
      { icon: '💬', label: 'Built-in Messaging' },
      { icon: '📍', label: 'Local Delivery' },
      { icon: '⭐', label: 'Seller Reviews' },
      { icon: '📱', label: 'Mobile App' },
    ],
    pricing: [
      { plan: 'Basic Listing', val: '$0/mo' },
      { plan: 'Promoted Listings', val: 'From $1' },
    ],
    priceNote: 'Facebook Marketplace charges 5% selling fee (or $0.40 min) per shipment.',
    alts: [
      { icon: '🛒', label: 'eBay' },
      { icon: '🏪', label: 'Amazon Handmade' },
      { icon: '🎨', label: 'Craigslist' },
    ],
    url: 'https://www.facebook.com/marketplace',
    cta: 'Start Selling Free',
  },
  'physical-zero-comfortable': {
    name: 'WooCommerce (Self-Hosted)',
    tagline: 'Full-featured free e-commerce on WordPress',
    match: 88,
    why: [
      'WooCommerce plugin is 100% free — only pay for hosting (~$5/mo)',
      'Complete control over your store design and data',
      'Massive ecosystem of free themes and plugins available',
      'Perfect for growing a brand without platform lock-in',
    ],
    features: [
      { icon: '🔌', label: 'Free Plugin' },
      { icon: '🎨', label: '1000s of Themes' },
      { icon: '📦', label: 'Inventory Mgmt' },
      { icon: '💳', label: 'Payment Gateways' },
      { icon: '📊', label: 'Analytics Built-in' },
      { icon: '🌍', label: 'Multi-currency' },
    ],
    pricing: [
      { plan: 'WooCommerce Plugin', val: 'Free' },
      { plan: 'Budget Hosting', val: '~$5/mo' },
      { plan: 'Domain Name', val: '~$12/yr' },
    ],
    priceNote: 'Total cost can be under $10/month with shared hosting like Hostinger or Bluehost.',
    alts: [
      { icon: '🏪', label: 'Ecwid (Free tier)' },
      { icon: '🛒', label: 'BigCartel' },
      { icon: '🌐', label: 'Weebly Free' },
    ],
    url: 'https://woocommerce.com',
    cta: 'Get WooCommerce Free',
  },
  'physical-zero-advanced': {
    name: 'Medusa.js (Open Source)',
    tagline: 'Open-source, headless commerce — zero fees ever',
    match: 94,
    why: [
      'Completely free and open-source — self-host on any server',
      'Full API-first architecture for total customization',
      'No transaction fees — keep 100% of every sale',
      'Built with Node.js and React — perfect for advanced developers',
    ],
    features: [
      { icon: '⚡', label: 'Headless API' },
      { icon: '🔧', label: 'Fully Customizable' },
      { icon: '☁️', label: 'Self-Hosted' },
      { icon: '🛒', label: 'Cart & Checkout' },
      { icon: '📦', label: 'Order Management' },
      { icon: '🌐', label: 'Multi-region' },
    ],
    pricing: [
      { plan: 'Medusa.js', val: 'Free forever' },
      { plan: 'VPS Hosting', val: '~$5–20/mo' },
    ],
    priceNote: 'Pair with Railway, Render, or Fly.io for cheap hosting. Use Stripe for payments (2.9% + 30¢).',
    alts: [
      { icon: '⚛️', label: 'Saleor (GraphQL)' },
      { icon: '🔧', label: 'Reaction Commerce' },
      { icon: '🛍️', label: 'Vendure' },
    ],
    url: 'https://medusajs.com',
    cta: 'Explore Medusa.js',
  },

  // Physical + Low Budget
  'physical-low-beginner': {
    name: 'Shopify',
    tagline: 'The world\'s most popular e-commerce platform',
    match: 97,
    why: [
      'Drag-and-drop store builder — no coding skills required at all',
      'Handles payments, shipping, and taxes automatically for you',
      'Beautiful professional themes ready to launch in minutes',
      'World-class 24/7 support to guide you through every step',
    ],
    features: [
      { icon: '🖱️', label: 'Drag & Drop' },
      { icon: '💳', label: 'Built-in Payments' },
      { icon: '🚚', label: 'Shipping Labels' },
      { icon: '📱', label: 'Mobile Optimized' },
      { icon: '📊', label: 'Sales Reports' },
      { icon: '🛡️', label: 'SSL & Security' },
    ],
    pricing: [
      { plan: 'Basic Shopify', val: '$29/mo' },
      { plan: 'Shopify Plan', val: '$79/mo' },
      { plan: 'Free Trial', val: '$1 for 3 months' },
    ],
    priceNote: 'Basic plan includes everything you need to start. Transaction fee waived when using Shopify Payments.',
    alts: [
      { icon: '🌐', label: 'Wix eCommerce' },
      { icon: '🏠', label: 'Squarespace' },
      { icon: '🛒', label: 'BigCommerce' },
    ],
    url: 'https://shopify.com',
    cta: 'Start Free Trial on Shopify',
  },
  'physical-low-comfortable': {
    name: 'Wix eCommerce',
    tagline: 'Flexible all-in-one website and store builder',
    match: 89,
    why: [
      'Hundreds of stunning templates to customize with ease',
      'Built-in marketing tools: SEO, email, and social media',
      'App Market with 300+ integrations for shipping and inventory',
      'Affordable plans with no hidden transaction fees',
    ],
    features: [
      { icon: '🎨', label: '800+ Templates' },
      { icon: '📧', label: 'Email Marketing' },
      { icon: '🔍', label: 'Built-in SEO' },
      { icon: '💳', label: 'Multi-payment' },
      { icon: '📦', label: 'Inventory Tracking' },
      { icon: '📱', label: 'Mobile App' },
    ],
    pricing: [
      { plan: 'Core', val: '$17/mo' },
      { plan: 'Business', val: '$25/mo' },
      { plan: 'Business Elite', val: '$35/mo' },
    ],
    priceNote: '0% transaction fees on all plans. Includes hosting and SSL certificate.',
    alts: [
      { icon: '🛍️', label: 'Shopify Basic' },
      { icon: '🏠', label: 'Squarespace' },
      { icon: '🎯', label: 'Webflow Commerce' },
    ],
    url: 'https://wix.com/upgrade/website',
    cta: 'Explore Wix eCommerce',
  },
  'physical-low-advanced': {
    name: 'WordPress + WooCommerce',
    tagline: 'The gold standard for flexible, scalable stores',
    match: 93,
    why: [
      'Unmatched flexibility — customize every pixel of your store',
      'WooCommerce plugin powers 28% of all online stores worldwide',
      'Thousands of premium and free plugins for any feature you need',
      'Own your data completely — no vendor lock-in',
    ],
    features: [
      { icon: '🔌', label: 'Plugin Ecosystem' },
      { icon: '🎨', label: 'Theme Builder' },
      { icon: '🛒', label: 'Full Cart System' },
      { icon: '📊', label: 'Advanced Reports' },
      { icon: '🔗', label: 'REST API' },
      { icon: '🌍', label: 'Multi-language' },
    ],
    pricing: [
      { plan: 'Managed Hosting (WP Engine)', val: '$20–30/mo' },
      { plan: 'WooCommerce Plugin', val: 'Free' },
      { plan: 'Premium Theme', val: 'One-time $50–80' },
    ],
    priceNote: 'Budget hosting options (Hostinger, SiteGround) start from $3–6/mo for small stores.',
    alts: [
      { icon: '🛍️', label: 'Shopify' },
      { icon: '🔧', label: 'Magento Open Source' },
      { icon: '🛒', label: 'PrestaShop' },
    ],
    url: 'https://woocommerce.com',
    cta: 'Start with WooCommerce',
  },

  // Physical + High Budget
  'physical-high-beginner': {
    name: 'Shopify Plus',
    tagline: 'Enterprise e-commerce for serious sellers',
    match: 96,
    why: [
      'Dedicated merchant success manager assigned to your account',
      'Unlimited staff accounts and advanced store customization',
      'Handles millions of orders — built for rapid scaling',
      'Premium themes and design partners available on demand',
    ],
    features: [
      { icon: '🏆', label: 'Enterprise Grade' },
      { icon: '👥', label: 'Unlimited Staff' },
      { icon: '⚡', label: '10,000 checkouts/min' },
      { icon: '🌍', label: 'Multi-storefront' },
      { icon: '🔗', label: 'ERP Integrations' },
      { icon: '🛡️', label: 'Advanced Fraud' },
    ],
    pricing: [
      { plan: 'Shopify Plus', val: 'From $2,300/mo' },
      { plan: 'Revenue-based', val: '0.25% of monthly sales' },
    ],
    priceNote: 'Pricing negotiated based on volume. Ideal for stores doing $500K+/year.',
    alts: [
      { icon: '🛒', label: 'BigCommerce Enterprise' },
      { icon: '🏢', label: 'Salesforce Commerce' },
      { icon: '🔧', label: 'Adobe Commerce' },
    ],
    url: 'https://shopify.com/plus',
    cta: 'Contact Shopify Plus Sales',
  },
  'physical-high-comfortable': {
    name: 'BigCommerce',
    tagline: 'Powerful SaaS platform built for growth',
    match: 92,
    why: [
      'No transaction fees on any plan — keep more of your money',
      'Advanced built-in features: B2B, multi-channel, faceted search',
      'Headless commerce options for custom frontend experiences',
      'Excellent for multi-channel selling across Amazon, eBay, and more',
    ],
    features: [
      { icon: '💰', label: 'No Transaction Fees' },
      { icon: '🏪', label: 'Multi-channel' },
      { icon: '🔍', label: 'Faceted Search' },
      { icon: '📦', label: 'Advanced Shipping' },
      { icon: '🌍', label: 'B2B Tools' },
      { icon: '📊', label: 'In-depth Analytics' },
    ],
    pricing: [
      { plan: 'Standard', val: '$39/mo' },
      { plan: 'Plus', val: '$105/mo' },
      { plan: 'Pro', val: '$399/mo' },
    ],
    priceNote: '15-day free trial available. All plans include unlimited products and bandwidth.',
    alts: [
      { icon: '🛍️', label: 'Shopify' },
      { icon: '🎯', label: 'Webflow Commerce' },
      { icon: '🔧', label: 'WooCommerce' },
    ],
    url: 'https://bigcommerce.com',
    cta: 'Start BigCommerce Trial',
  },
  'physical-high-advanced': {
    name: 'Shopify + Custom Storefront (Hydrogen)',
    tagline: 'React-based headless commerce for total control',
    match: 95,
    why: [
      'Shopify Hydrogen: React framework built for headless storefronts',
      'Use Shopify\'s backend (payments, inventory) with any custom frontend',
      'Deploy on Oxygen (Shopify\'s edge CDN) or Vercel/Netlify',
      'Perfect for unique brand experiences that stand out from competitors',
    ],
    features: [
      { icon: '⚛️', label: 'React / Remix' },
      { icon: '⚡', label: 'Edge Deployment' },
      { icon: '🛒', label: 'Shopify Backend' },
      { icon: '🎨', label: 'Full Design Freedom' },
      { icon: '🔗', label: 'Storefront API' },
      { icon: '📈', label: 'Extreme Performance' },
    ],
    pricing: [
      { plan: 'Shopify Basic', val: '$29/mo' },
      { plan: 'Shopify Advanced', val: '$299/mo' },
      { plan: 'Developer Time', val: 'Variable' },
    ],
    priceNote: 'Hydrogen is free and open-source. Development cost depends on complexity.',
    alts: [
      { icon: '🔷', label: 'Next.js + Commerce.js' },
      { icon: '🛒', label: 'Medusa.js' },
      { icon: '🔧', label: 'Saleor + Storefront' },
    ],
    url: 'https://shopify.dev/docs/custom-storefronts/hydrogen',
    cta: 'Explore Hydrogen Framework',
  },

  // Digital Products
  'digital-zero-beginner': {
    name: 'Gumroad',
    tagline: 'Sell digital products in minutes — completely free',
    match: 96,
    why: [
      'No monthly fees — create your account and sell for free instantly',
      'Handles file delivery, payments, and licensing automatically',
      'Built-in audience discovery — buyers already browse Gumroad',
      'Super simple setup: upload file → set price → share your link',
    ],
    features: [
      { icon: '🆓', label: 'Free to Start' },
      { icon: '📧', label: 'Email Delivery' },
      { icon: '🔑', label: 'License Keys' },
      { icon: '📊', label: 'Sales Dashboard' },
      { icon: '🏷️', label: 'Discount Codes' },
      { icon: '🎁', label: 'Pay-what-you-want' },
    ],
    pricing: [
      { plan: 'Free Plan', val: '$0/mo' },
      { plan: 'Transaction Fee', val: '10% on free plan' },
      { plan: 'Gumroad Pro', val: '$10/mo (5% fee)' },
    ],
    priceNote: 'Free plan takes 10% per transaction. Upgrade to Pro ($10/mo) for lower 5% fees.',
    alts: [
      { icon: '📦', label: 'Payhip' },
      { icon: '💻', label: 'Sellfy' },
      { icon: '🎨', label: 'Lemon Squeezy' },
    ],
    url: 'https://gumroad.com',
    cta: 'Start Selling on Gumroad',
  },
  'digital-zero-comfortable': {
    name: 'Payhip',
    tagline: 'Zero monthly fees, powerful digital storefront',
    match: 93,
    why: [
      'Free forever plan with no monthly fees — only 5% transaction fee',
      'Sell e-books, software, courses, memberships all from one place',
      'Built-in affiliate program to grow your sales with zero effort',
      'EU VAT compliance handled automatically — great for global sales',
    ],
    features: [
      { icon: '📚', label: 'E-books & PDFs' },
      { icon: '💻', label: 'Software Licenses' },
      { icon: '🎓', label: 'Online Courses' },
      { icon: '🤝', label: 'Affiliate Program' },
      { icon: '🌍', label: 'VAT Compliance' },
      { icon: '📊', label: 'Analytics' },
    ],
    pricing: [
      { plan: 'Free Plan', val: '$0/mo + 5% fee' },
      { plan: 'Plus', val: '$29/mo + 2% fee' },
      { plan: 'Pro', val: '$99/mo + 0% fee' },
    ],
    priceNote: 'Free plan is genuinely functional. Upgrade when monthly revenue justifies the fee reduction.',
    alts: [
      { icon: '💰', label: 'Gumroad' },
      { icon: '🟡', label: 'SendOwl' },
      { icon: '🧾', label: 'Lemon Squeezy' },
    ],
    url: 'https://payhip.com',
    cta: 'Try Payhip Free',
  },
  'digital-zero-advanced': {
    name: 'Lemon Squeezy',
    tagline: 'Modern merchant of record with powerful APIs',
    match: 94,
    why: [
      'Acts as merchant of record — they handle all global tax compliance',
      'Powerful API for integrating digital sales into any app or SaaS',
      'Subscription billing, license keys, and usage-based pricing built in',
      'Developer-friendly webhooks and SDK for custom integrations',
    ],
    features: [
      { icon: '🔑', label: 'License Keys API' },
      { icon: '🔄', label: 'Subscription Billing' },
      { icon: '🌍', label: 'Global Tax Handled' },
      { icon: '🔗', label: 'Webhooks & API' },
      { icon: '📊', label: 'Revenue Analytics' },
      { icon: '🛡️', label: 'Fraud Protection' },
    ],
    pricing: [
      { plan: 'Free to start', val: '$0/mo' },
      { plan: 'Transaction Fee', val: '5% + $0.50 per sale' },
    ],
    priceNote: 'All-in-one fee covers payment processing, tax handling, and platform costs.',
    alts: [
      { icon: '💳', label: 'Paddle' },
      { icon: '🧾', label: 'Gumroad' },
      { icon: '🛒', label: 'FastSpring' },
    ],
    url: 'https://www.lemonsqueezy.com',
    cta: 'Explore Lemon Squeezy',
  },
  'digital-low-beginner': {
    name: 'Teachable',
    tagline: 'Beautiful course platform — zero tech skills needed',
    match: 95,
    why: [
      'Drag-and-drop course builder with stunning, ready-made layouts',
      'Built-in video hosting, quizzes, and student progress tracking',
      'Automated email sequences keep students engaged without extra tools',
      'One dashboard for courses, coaching, and digital downloads',
    ],
    features: [
      { icon: '🎬', label: 'Video Hosting' },
      { icon: '📝', label: 'Quizzes & Certs' },
      { icon: '📧', label: 'Email Automation' },
      { icon: '👥', label: 'Student Portal' },
      { icon: '📱', label: 'Mobile App' },
      { icon: '💳', label: 'Instant Payouts' },
    ],
    pricing: [
      { plan: 'Basic', val: '$59/mo' },
      { plan: 'Pro', val: '$159/mo' },
      { plan: 'Free Trial', val: '14 days' },
    ],
    priceNote: 'Basic plan allows unlimited courses. 5% transaction fee on Basic, 0% on Pro.',
    alts: [
      { icon: '🎓', label: 'Thinkific' },
      { icon: '🌐', label: 'Podia' },
      { icon: '📚', label: 'Kajabi' },
    ],
    url: 'https://teachable.com',
    cta: 'Try Teachable Free',
  },
  'digital-low-comfortable': {
    name: 'Podia',
    tagline: 'All-in-one creator platform for digital products',
    match: 91,
    why: [
      'Sell courses, downloads, memberships, and webinars from one place',
      'Beautiful storefront with zero transaction fees on paid plans',
      'Built-in email marketing saves you $30+/mo on separate tools',
      'Excellent for creators building an audience-driven business',
    ],
    features: [
      { icon: '🎓', label: 'Online Courses' },
      { icon: '📧', label: 'Email Marketing' },
      { icon: '💬', label: 'Community Forum' },
      { icon: '🔴', label: 'Live Webinars' },
      { icon: '📥', label: 'Digital Downloads' },
      { icon: '🎁', label: 'Membership Sites' },
    ],
    pricing: [
      { plan: 'Mover', val: '$39/mo' },
      { plan: 'Shaker', val: '$89/mo' },
    ],
    priceNote: '0% transaction fees on all paid plans. Includes email marketing for up to 100 subscribers.',
    alts: [
      { icon: '🎓', label: 'Teachable' },
      { icon: '🌟', label: 'Thinkific' },
      { icon: '🚀', label: 'Kajabi' },
    ],
    url: 'https://podia.com',
    cta: 'Start with Podia',
  },
  'digital-low-advanced': {
    name: 'Shopify + SendOwl',
    tagline: 'Full-stack digital delivery with total control',
    match: 90,
    why: [
      'SendOwl automates digital file delivery and license key generation',
      'Integrate with any platform via powerful REST API',
      'Webhooks for custom post-purchase workflows and integrations',
      'Handles PDF stamping, video streaming, and drip content delivery',
    ],
    features: [
      { icon: '🔑', label: 'License Generation' },
      { icon: '📼', label: 'Video Streaming' },
      { icon: '🔗', label: 'API & Webhooks' },
      { icon: '📄', label: 'PDF Stamping' },
      { icon: '💧', label: 'Drip Content' },
      { icon: '📊', label: 'Detailed Analytics' },
    ],
    pricing: [
      { plan: 'SendOwl Starter', val: '$18/mo' },
      { plan: 'Growth', val: '$37/mo' },
    ],
    priceNote: 'Pair with any payment gateway. Shopify Basic ($29/mo) + SendOwl ($18/mo) = full stack.',
    alts: [
      { icon: '🍋', label: 'Lemon Squeezy' },
      { icon: '💳', label: 'Paddle' },
      { icon: '⚡', label: 'Gumroad Pro' },
    ],
    url: 'https://www.sendowl.com',
    cta: 'Try SendOwl',
  },
  'digital-high-beginner': {
    name: 'Kajabi',
    tagline: 'The all-in-one business platform for creators',
    match: 97,
    why: [
      'Everything you need in ONE platform — no duct-taping tools together',
      'Beautiful automated marketing funnels and email sequences',
      'Live coaching, communities, podcasts, and courses in one dashboard',
      'World-class templates — launch a professional product in 1 hour',
    ],
    features: [
      { icon: '🚀', label: 'Complete Platform' },
      { icon: '🎯', label: 'Marketing Funnels' },
      { icon: '📧', label: 'Email Automation' },
      { icon: '🎓', label: 'Courses & Coaching' },
      { icon: '🎙️', label: 'Podcast Hosting' },
      { icon: '👥', label: 'Community Tools' },
    ],
    pricing: [
      { plan: 'Kickstarter', val: '$69/mo' },
      { plan: 'Basic', val: '$149/mo' },
      { plan: 'Growth', val: '$199/mo' },
    ],
    priceNote: '0% transaction fees on all plans. 14-day free trial available. Annual plans save 20%.',
    alts: [
      { icon: '📚', label: 'Thinkific Plus' },
      { icon: '🎓', label: 'Teachable Pro' },
      { icon: '🌐', label: 'Podia Shaker' },
    ],
    url: 'https://kajabi.com',
    cta: 'Try Kajabi Free for 14 Days',
  },
  'digital-high-comfortable': {
    name: 'Thinkific Plus',
    tagline: 'Scalable course platform with enterprise features',
    match: 92,
    why: [
      'White-label your academy — your brand, your domain, zero Thinkific branding',
      'Advanced student segmentation and automated learning paths',
      'Bulk enrollment and B2B corporate training capabilities',
      'API access for custom integrations with your existing tools',
    ],
    features: [
      { icon: '🏷️', label: 'White Label' },
      { icon: '🔄', label: 'Learning Paths' },
      { icon: '👥', label: 'Bulk Enrollment' },
      { icon: '🏢', label: 'B2B Sales' },
      { icon: '🔗', label: 'API Access' },
      { icon: '📊', label: 'Advanced Reports' },
    ],
    pricing: [
      { plan: 'Start', val: '$49/mo' },
      { plan: 'Grow', val: '$99/mo' },
      { plan: 'Plus', val: 'Custom pricing' },
    ],
    priceNote: '0% transaction fees. Custom pricing for Thinkific Plus with a dedicated account manager.',
    alts: [
      { icon: '🚀', label: 'Kajabi' },
      { icon: '🎓', label: 'Teachable Business' },
      { icon: '🌐', label: 'LearnDash (WordPress)' },
    ],
    url: 'https://thinkific.com',
    cta: 'Explore Thinkific Plus',
  },
  'digital-high-advanced': {
    name: 'Custom Next.js + Stripe',
    tagline: 'Bespoke digital product platform — your stack, your rules',
    match: 98,
    why: [
      'Complete control: build your exact checkout and delivery flow',
      'Stripe handles payments, subscriptions, and invoice tax compliance',
      'Edge-deployed with Next.js for instant global performance',
      'Integrate with any CRM, analytics, or fulfillment service you choose',
    ],
    features: [
      { icon: '⚛️', label: 'Next.js App Router' },
      { icon: '💳', label: 'Stripe Payments' },
      { icon: '🔑', label: 'Custom Licensing' },
      { icon: '🔗', label: 'Webhooks & APIs' },
      { icon: '⚡', label: 'Edge CDN' },
      { icon: '🗄️', label: 'Database Control' },
    ],
    pricing: [
      { plan: 'Stripe Processing Fee', val: '2.9% + 30¢/sale' },
      { plan: 'Vercel Hosting', val: '$0–20/mo' },
      { plan: 'Database (PlanetScale)', val: '$0–39/mo' },
    ],
    priceNote: 'Most cost-effective at scale. Consider Lemon Squeezy for tax handling until revenue justifies custom.',
    alts: [
      { icon: '🍋', label: 'Lemon Squeezy API' },
      { icon: '💳', label: 'Paddle API' },
      { icon: '🛒', label: 'Medusa.js' },
    ],
    url: 'https://stripe.com',
    cta: 'Start Building with Stripe',
  },

  // Services / Booking
  'services-zero-beginner': {
    name: 'Calendly (Free)',
    tagline: 'Zero-friction appointment scheduling for free',
    match: 93,
    why: [
      'Free plan handles unlimited 1-on-1 appointments perfectly',
      'Share your link and clients pick a time — zero back-and-forth',
      'Syncs with Google Calendar and Outlook automatically',
      'Embed your calendar on any existing website or social bio',
    ],
    features: [
      { icon: '📅', label: 'Smart Scheduling' },
      { icon: '🔔', label: 'Reminders' },
      { icon: '🔗', label: 'Shareable Link' },
      { icon: '📊', label: 'Basic Analytics' },
      { icon: '🌍', label: 'Timezone Detection' },
      { icon: '📱', label: 'Mobile App' },
    ],
    pricing: [
      { plan: 'Free Plan', val: '$0/mo' },
      { plan: 'Standard', val: '$10/mo' },
      { plan: 'Teams', val: '$16/mo' },
    ],
    priceNote: 'Free plan includes 1 event type. Upgrade for multiple event types, group bookings, and payments.',
    alts: [
      { icon: '📆', label: 'Cal.com (open source)' },
      { icon: '🗓️', label: 'Savvycal' },
      { icon: '⏰', label: 'YouCanBook.me' },
    ],
    url: 'https://calendly.com',
    cta: 'Create Free Calendly Account',
  },
  'services-zero-comfortable': {
    name: 'Cal.com (Self-Hosted)',
    tagline: 'Open-source Calendly alternative — 100% free forever',
    match: 91,
    why: [
      'Fully open-source — host on your own server for $0/month',
      'All the features of premium scheduling tools at zero cost',
      'Connect Stripe/PayPal for paid bookings with no platform fee',
      'Advanced workflows, routing forms, and team scheduling built-in',
    ],
    features: [
      { icon: '🔓', label: 'Open Source' },
      { icon: '💳', label: 'Paid Bookings' },
      { icon: '🔄', label: 'Workflows' },
      { icon: '👥', label: 'Team Scheduling' },
      { icon: '🌐', label: 'Embed Anywhere' },
      { icon: '🔗', label: 'API Access' },
    ],
    pricing: [
      { plan: 'Self-Hosted (Free)', val: '$0/mo' },
      { plan: 'Cal.com Cloud', val: '$12/mo' },
    ],
    priceNote: 'Self-host on Railway.app or Render for ~$5/mo. Stripe integration is free to set up.',
    alts: [
      { icon: '📅', label: 'Calendly' },
      { icon: '🗓️', label: 'Acuity Scheduling' },
      { icon: '📆', label: 'Squarespace Scheduling' },
    ],
    url: 'https://cal.com',
    cta: 'Try Cal.com Free',
  },
  'services-zero-advanced': {
    name: 'Cal.com API + Custom UI',
    tagline: 'Build a fully branded booking experience from scratch',
    match: 94,
    why: [
      'Cal.com\'s open API lets you build any booking UI you can imagine',
      'Stripe integration gives you full control over payment flows',
      'Self-host everything for true $0 platform cost',
      'Custom webhooks trigger any business automation you need',
    ],
    features: [
      { icon: '🔗', label: 'Full REST API' },
      { icon: '🎨', label: 'Custom UI Freedom' },
      { icon: '💳', label: 'Custom Checkout' },
      { icon: '🔔', label: 'Webhook Events' },
      { icon: '☁️', label: 'Self-Hosted' },
      { icon: '🔑', label: 'OAuth Support' },
    ],
    pricing: [
      { plan: 'Cal.com Self-Hosted', val: 'Free' },
      { plan: 'Stripe Processing', val: '2.9% + 30¢' },
    ],
    priceNote: 'Consider Next.js App Router + Cal.com Atoms for a seamless embedded scheduling experience.',
    alts: [
      { icon: '📅', label: 'Calendly API' },
      { icon: '🛒', label: 'Stripe Billing' },
      { icon: '⚡', label: 'Supabase + custom' },
    ],
    url: 'https://cal.com/docs/api',
    cta: 'Explore Cal.com API',
  },
  'services-low-beginner': {
    name: 'Squarespace Scheduling',
    tagline: 'Stunning websites with powerful booking built-in',
    match: 94,
    why: [
      'Gorgeous website builder + professional booking on one platform',
      'Clients can book, reschedule, and pay without calling you',
      'Automated email/text reminders reduce no-shows dramatically',
      'Sell packages, gift cards, and subscriptions from day one',
    ],
    features: [
      { icon: '🎨', label: 'Beautiful Templates' },
      { icon: '💳', label: 'Online Payments' },
      { icon: '📱', label: 'Client App' },
      { icon: '📧', label: 'Email Reminders' },
      { icon: '📦', label: 'Package Booking' },
      { icon: '🎁', label: 'Gift Cards' },
    ],
    pricing: [
      { plan: 'Personal', val: '$16/mo' },
      { plan: 'Business', val: '$23/mo' },
      { plan: 'Commerce', val: '$28/mo' },
    ],
    priceNote: 'Acuity Scheduling (owned by Squarespace) starts at $16/mo with a 7-day free trial.',
    alts: [
      { icon: '🌐', label: 'Wix Bookings' },
      { icon: '📅', label: 'Calendly Standard' },
      { icon: '📆', label: 'SimplyBook.me' },
    ],
    url: 'https://squarespace.com',
    cta: 'Start Squarespace Free Trial',
  },
  'services-low-comfortable': {
    name: 'Acuity Scheduling',
    tagline: 'Professional scheduling with serious customization',
    match: 90,
    why: [
      'Deeply customizable intake forms collect client info before each session',
      'Integrates with 500+ tools: Zoom, Stripe, Mailchimp, Zapier, and more',
      'HIPAA-compliant option available for healthcare and wellness providers',
      'Group classes, series, and workshops supported out of the box',
    ],
    features: [
      { icon: '📋', label: 'Intake Forms' },
      { icon: '🔗', label: '500+ Integrations' },
      { icon: '🏥', label: 'HIPAA Compliant' },
      { icon: '👥', label: 'Group Classes' },
      { icon: '🎁', label: 'Gift Certificates' },
      { icon: '📊', label: 'Business Reports' },
    ],
    pricing: [
      { plan: 'Emerging', val: '$16/mo' },
      { plan: 'Growing', val: '$27/mo' },
      { plan: 'Powerhouse', val: '$49/mo' },
    ],
    priceNote: '7-day free trial. Growing plan supports 6 calendars — perfect for small teams.',
    alts: [
      { icon: '🏠', label: 'Squarespace Scheduling' },
      { icon: '📅', label: 'Calendly' },
      { icon: '🗓️', label: 'HoneyBook' },
    ],
    url: 'https://acuityscheduling.com',
    cta: 'Try Acuity Free for 7 Days',
  },
  'services-low-advanced': {
    name: 'HoneyBook',
    tagline: 'CRM + booking + invoicing for freelancers & agencies',
    match: 91,
    why: [
      'Combines scheduling, contracts, invoicing, and CRM into one platform',
      'Smart automations send proposals and follow-ups on autopilot',
      'Track every client from inquiry to final payment in one pipeline',
      'Perfect for photographers, designers, consultants, and agencies',
    ],
    features: [
      { icon: '📄', label: 'Smart Contracts' },
      { icon: '💰', label: 'Online Invoices' },
      { icon: '🤖', label: 'Automations' },
      { icon: '📈', label: 'Client Pipeline' },
      { icon: '🔗', label: 'Zapier Integration' },
      { icon: '📅', label: 'Scheduling' },
    ],
    pricing: [
      { plan: 'Starter', val: '$19/mo' },
      { plan: 'Essentials', val: '$39/mo' },
      { plan: 'Premium', val: '$79/mo' },
    ],
    priceNote: 'Often has promotions with 2 months free. 7-day free trial always available.',
    alts: [
      { icon: '🌐', label: 'Dubsado' },
      { icon: '📅', label: 'Acuity Scheduling' },
      { icon: '📊', label: '17hats' },
    ],
    url: 'https://honeybook.com',
    cta: 'Try HoneyBook Free',
  },
  'services-high-beginner': {
    name: 'Dubsado',
    tagline: 'Full-service CRM and booking for premium businesses',
    match: 92,
    why: [
      'Completely white-labeled — clients see your brand, never Dubsado\'s',
      'Canned emails, questionnaires, and proposals save hours every week',
      'Workflow automations send documents and invoices without touching anything',
      'Custom client portals give a luxury, premium-feel experience',
    ],
    features: [
      { icon: '🏷️', label: 'White Label' },
      { icon: '🤖', label: 'Full Automation' },
      { icon: '👤', label: 'Client Portals' },
      { icon: '📄', label: 'E-Signatures' },
      { icon: '💳', label: 'Payment Plans' },
      { icon: '📊', label: 'Lead Capture' },
    ],
    pricing: [
      { plan: 'Starter', val: '$200/yr ($16.67/mo)' },
      { plan: 'Premier', val: '$400/yr ($33.33/mo)' },
    ],
    priceNote: 'Unlimited projects, clients, and workflows on all plans. Annual billing only.',
    alts: [
      { icon: '🍯', label: 'HoneyBook Premium' },
      { icon: '📊', label: '17hats' },
      { icon: '🏢', label: 'Practice by Booking.com' },
    ],
    url: 'https://dubsado.com',
    cta: 'Try Dubsado Free',
  },
  'services-high-comfortable': {
    name: 'Kajabi + Booking Integration',
    tagline: 'Premium coaching platform for high-ticket services',
    match: 93,
    why: [
      'Sell high-ticket coaching programs alongside group memberships',
      'Fully automated funnels nurture leads until they\'re ready to buy',
      'Branded mobile app for clients gives a world-class experience',
      'Kajabi 1:1 coaching product handles scheduling and payments together',
    ],
    features: [
      { icon: '🎯', label: 'Sales Funnels' },
      { icon: '📱', label: 'Branded App' },
      { icon: '👥', label: 'Community' },
      { icon: '🎓', label: 'Course + Coaching' },
      { icon: '📧', label: 'Email Sequences' },
      { icon: '📊', label: 'Revenue Dashboard' },
    ],
    pricing: [
      { plan: 'Kickstarter', val: '$69/mo' },
      { plan: 'Basic', val: '$149/mo' },
      { plan: 'Growth', val: '$199/mo' },
    ],
    priceNote: '0% transaction fees. 14-day free trial. Ideal when your service + content = your business.',
    alts: [
      { icon: '🌐', label: 'Mighty Networks' },
      { icon: '📅', label: 'Acuity + Teachable' },
      { icon: '🚀', label: 'Circle.so' },
    ],
    url: 'https://kajabi.com',
    cta: 'Try Kajabi for 14 Days',
  },
  'services-high-advanced': {
    name: 'Custom Platform (Next.js + Stripe + Cal.com)',
    tagline: 'Build your own premium service business tool',
    match: 97,
    why: [
      'Cal.com Atoms embed fully-branded scheduling into your custom app',
      'Stripe billing handles subscriptions, payment plans, and invoicing',
      'Build any client portal, dashboard, or reporting tool you can dream up',
      'Own your entire tech stack — no per-seat fees, no feature gates',
    ],
    features: [
      { icon: '⚛️', label: 'Next.js App' },
      { icon: '📅', label: 'Cal.com Atoms' },
      { icon: '💳', label: 'Stripe Billing' },
      { icon: '🗄️', label: 'Custom Database' },
      { icon: '🤖', label: 'AI Automation' },
      { icon: '🔗', label: 'Any Integration' },
    ],
    pricing: [
      { plan: 'Cal.com Cloud', val: '$12/mo or self-hosted free' },
      { plan: 'Stripe Processing', val: '2.9% + 30¢' },
      { plan: 'Vercel + DB', val: '$0–50/mo' },
    ],
    priceNote: 'Largest upfront investment, but lowest ongoing cost per client at scale. Worth it at $10K+/mo revenue.',
    alts: [
      { icon: '🍯', label: 'HoneyBook API' },
      { icon: '📅', label: 'Calendly API' },
      { icon: '⚡', label: 'Supabase + N8N' },
    ],
    url: 'https://cal.com/docs/developing/cal-atoms',
    cta: 'Explore Cal.com Atoms',
  },
};

// Default fallback
function getRecommendation(q1, q2, q3) {
  const key = `${q1}-${q2}-${q3}`;
  return RECOMMENDATIONS[key] || RECOMMENDATIONS['physical-low-beginner'];
}

// ─────────────────────────────────────────────
// SHOW RESULTS
// ─────────────────────────────────────────────
function showResults() {
  if (!answers.q3) return;
  showScreen('screen-loading');
  runLoadingAnimation();
  setTimeout(() => buildResultsAndShow(), 2800);
}

function runLoadingAnimation() {
  const steps = ['lstep-1', 'lstep-2', 'lstep-3', 'lstep-4'];
  steps.forEach((id, i) => {
    setTimeout(() => {
      document.getElementById(id).classList.add('active');
    }, i * 600);
  });
}

function buildResultsAndShow() {
  const rec = getRecommendation(answers.q1, answers.q2, answers.q3);

  // Platform Name & Tagline
  document.getElementById('result-platform-name').textContent = rec.name;
  document.getElementById('result-tagline').textContent = rec.tagline;

  // Match Score Animation
  const matchNum = document.getElementById('match-num');
  const arc = document.querySelector('.match-arc');
  const circumference = 327;
  const score = rec.match;
  const offset = circumference - (circumference * score / 100);

  matchNum.textContent = '0';
  showScreen('screen-results');

  setTimeout(() => {
    arc.style.strokeDashoffset = offset;
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= score) { matchNum.textContent = score; clearInterval(interval); }
      else matchNum.textContent = current;
    }, 20);
  }, 300);

  // Why List
  const whyList = document.getElementById('why-list');
  whyList.innerHTML = rec.why.map(w => `<li>${w}</li>`).join('');

  // Features
  const featGrid = document.getElementById('features-grid');
  featGrid.innerHTML = rec.features.map(f =>
    `<div class="feature-chip"><span class="f-icon">${f.icon}</span><span>${f.label}</span></div>`
  ).join('');

  // Pricing
  const pricingBar = document.getElementById('pricing-bar');
  pricingBar.innerHTML = rec.pricing.map(p =>
    `<div class="price-item"><span class="price-plan">${p.plan}</span><span class="price-val">${p.val}</span></div>`
  ).join('') + `<div class="price-note">💡 ${rec.priceNote}</div>`;

  // Alternatives
  const altPlats = document.getElementById('alt-platforms');
  altPlats.innerHTML = rec.alts.map(a =>
    `<div class="alt-chip"><span>${a.icon}</span><span>${a.label}</span></div>`
  ).join('');

  // CTA
  document.getElementById('result-cta-btn').href = rec.url;
  document.getElementById('result-cta-text').textContent = rec.cta;
}

// ─────────────────────────────────────────────
// RETAKE
// ─────────────────────────────────────────────
function retakeQuiz() {
  // Reset answers
  answers.q1 = null; answers.q2 = null; answers.q3 = null;

  // Reset UI
  document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
  ['next-1', 'next-2', 'next-3'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) { btn.disabled = true; btn.setAttribute('disabled', ''); }
  });

  // Reset loading steps
  document.querySelectorAll('.lstep').forEach(l => l.classList.remove('active'));

  // Reset arc
  document.querySelector('.match-arc').style.strokeDashoffset = '327';

  showScreen('screen-quiz');
  setTimeout(() => showQuestion(1), 100);
}
