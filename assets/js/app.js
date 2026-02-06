// writerjoshua.com - Complete SPA Application
// Production-ready with theme toggle, markdown parsing, and full navigation

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Parse YAML frontmatter from markdown
function parseMarkdown(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { meta: {}, content: content };
  }
  
  const [, frontmatter, body] = match;
  const meta = {};
  
  // Parse YAML frontmatter
  frontmatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      meta[key.trim()] = value;
    }
  });
  
  return { meta, content: body.trim() };
}

// Generate slug from filename
function generateSlug(filename) {
  return filename.replace(/\.md$/, '');
}

// Handle errors gracefully
function handleError(element, error, message) {
  message = message || 'Error loading content';
  console.error(message, error);
  element.innerHTML = `
    <div class="empty-state">
      <p style="color: #d4af37;">Error: ${escapeHtml(message)}</p>
      <p style="font-size: 0.9rem; color: #888;">Please try again or contact support.</p>
    </div>
  `;
}

// ============================================================================
// FILE FETCHING & PARSING
// ============================================================================

async function fetchMarkdownFile(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return await response.text();
  } catch (err) {
    console.error('Failed to fetch ' + path + ':', err);
    return null;
  }
}

async function fetchMarkdownFiles(folder) {
  // Map folder names to file lists based on your structure
  const fileMap = {
    'feed': ['write1.md', 'write2.md', 'write3.md'],
    'blog': ['blog-post1.md', 'blog-post2.md', 'blog-post3.md'],
    'projects': ['ai-architecture-lab.md', 'soulseesbest.md', 'seejoshsphotos.md', 'beau-holliday.md']
  };
  
  const files = fileMap[folder] || [];
  const posts = [];
  
  for (const filename of files) {
    const path = 'assets/posts/' + folder + '/' + filename;
    const content = await fetchMarkdownFile(path);
    
    if (content) {
      const parsed = parseMarkdown(content);
      posts.push({
        id: generateSlug(filename),
        filename: filename,
        title: parsed.meta.title || 'Untitled',
        date: parsed.meta.date || new Date().toISOString(),
        excerpt: parsed.meta.excerpt || parsed.content.substring(0, 150),
        content: parsed.content,
        meta: parsed.meta
      });
    }
  }
  
  return posts;
}

async function fetchMarkdownPage(pageName) {
  const path = 'assets/posts/' + pageName + '.md';
  const content = await fetchMarkdownFile(path);
  
  if (!content) {
    throw new Error('Page ' + pageName + ' not found');
  }
  
  const parsed = parseMarkdown(content);
  return parsed.content;
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

function renderHero() {
  return '<div class="hero"><div class="hero-content"><h2>Josh</h2><p>Author, Researcher, Artist</p><p style="margin-top: 1.5rem; font-size: 1rem;">Exploring the intersections of art, science, and creative innovation.</p></div></div>';
}

function renderWriteCard(post) {
  const id = post.id;
  const title = post.title;
  const date = post.date;
  const excerpt = post.excerpt;
  const content = post.content;
  
  const dateStr = new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  return '<div class="card write" data-post-id="' + id + '" data-type="feed"><div class="card-content"><h2>' + escapeHtml(title) + '</h2><p class="write-excerpt">' + escapeHtml(excerpt) + '</p><div class="write-text">' + escapeHtml(content).substring(0, 300) + '...</div><div class="card-footer"><span class="timestamp">' + dateStr + '</span><div class="action-buttons"><button class="action-btn read-write-btn" data-post-id="' + id + '">Read Full</button><button class="action-btn share-btn" data-post-id="' + id + '">Share</button></div></div><div class="share-preview"><div class="share-preview-meta"><strong>writerjoshua.com</strong> — Feed</div><div class="share-preview-meta">"' + escapeHtml(title) + '"</div></div></div></div>';
}

function renderBlogCard(post) {
  const id = post.id;
  const title = post.title;
  const date = post.date;
  const excerpt = post.excerpt;
  
  const dateStr = new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const year = new Date(date).getFullYear();
  
  return '<div class="card blog" data-post-id="' + id + '" data-type="blog" data-year="' + year + '"><div class="card-content"><div class="blog-date">' + year + '</div><h2>' + escapeHtml(title) + '</h2><p class="blog-excerpt">' + escapeHtml(excerpt) + '</p><div class="card-footer"><span class="timestamp">' + dateStr + '</span><div class="action-buttons"><button class="action-btn read-blog-btn" data-post-id="' + id + '">Read Post</button><button class="action-btn share-btn" data-post-id="' + id + '">Share</button></div></div><div class="share-preview"><div class="share-preview-meta"><strong>writerjoshua.com</strong> — Blog</div><div class="share-preview-meta">"' + escapeHtml(title) + '"</div></div></div></div>';
}

function renderProjectCard(project) {
  const id = project.id;
  const title = project.title;
  const excerpt = project.excerpt;
  
  return '<div class="card project" data-post-id="' + id + '" data-type="projects"><div class="card-content"><h2>' + escapeHtml(title) + '</h2><p class="project-description">' + escapeHtml(excerpt) + '</p><a href="#" class="project-link" data-project-id="' + id + '">View Project →</a></div></div>';
}

// ============================================================================
// PAGE RENDERERS
// ============================================================================

async function renderHome() {
  try {
    const feedPosts = await fetchMarkdownFiles('feed');
    const latestFeed = feedPosts
      .sort(function(a, b) { return new Date(b.date) - new Date(a.date); })
      .slice(0, 2);
    
    const feedHtml = latestFeed.length > 0 
      ? latestFeed.map(function(post) { return renderWriteCard(post); }).join('')
      : '<div class="empty-state"><p>No posts yet. </p></div>';
    
    return renderHero() + '<div style="margin-top: 3rem;"><h2 class="section-title">Latest from Feed</h2><div class="feed">' + feedHtml + '</div></div>';
  } catch (err) {
    console.error('Error rendering home:', err);
    throw err;
  }
}

async function renderFeed() {
  try {
    const posts = await fetchMarkdownFiles('feed');
    
    if (posts.length === 0) {
      return '<div class="empty-state"><p>No writes yet. </p></div>';
    }
    
    const sortedPosts = posts.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    return '<h2 class="section-title">Feed</h2><div class="feed">' + sortedPosts.map(function(post) { return renderWriteCard(post); }).join('') + '</div>';
  } catch (err) {
    console.error('Error rendering feed:', err);
    throw err;
  }
}

async function renderBlog() {
  try {
    const posts = await fetchMarkdownFiles('blog');
    
    if (posts.length === 0) {
      return '<div class="empty-state"><p>No blog posts yet. </p></div>';
    }
    
    const sortedPosts = posts.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    return '<h2 class="section-title">Blog</h2><div class="feed">' + sortedPosts.map(function(post) { return renderBlogCard(post); }).join('') + '</div>';
  } catch (err) {
    console.error('Error rendering blog:', err);
    throw err;
  }
}

async function renderProjects() {
  try {
    const projects = await fetchMarkdownFiles('projects');
    
    if (projects.length === 0) {
      return '<div class="empty-state"><p>No projects yet. </p></div>';
    }
    
    return '<h2 class="section-title">Projects</h2><div class="feed">' + projects.map(function(project) { return renderProjectCard(project); }).join('') + '</div>';
  } catch (err) {
    console.error('Error rendering projects:', err);
    throw err;
  }
}

async function renderAbout() {
  try {
    return await fetchMarkdownPage('about-josh');
  } catch (err) {
    console.error('Error loading about page:', err);
    throw err;
  }
}

async function renderContact() {
  try {
    return await fetchMarkdownPage('contact');
  } catch (err) {
    console.error('Error loading contact page:', err);
    throw err;
  }
}

// ============================================================================
// NAVIGATION & PAGE LOADING
// ============================================================================

function updateMetaTags(title, description, image) {
  document.title = title;
  var ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
  
  var ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);
  
  var ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.setAttribute('content', image);
  
  var twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', title);
  
  var twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) twitterDesc.setAttribute('content', description);
  
  var twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (twitterImage) twitterImage.setAttribute('content', image);
}

function setActiveNavButton(page) {
  var sideLinks = document.querySelectorAll('.side-nav-menu .nav-link');
  sideLinks.forEach(function(link) {
    link.classList.remove('active');
    if (link.dataset.page === page) {
      link.classList.add('active');
    }
  });
  
  var bottomBtns = document.querySelectorAll('.bottom-nav-btn');
  bottomBtns.forEach(function(btn) {
    btn.classList.remove('active');
    if (btn.dataset.page === page) {
      btn.classList.add('active');
    }
  });
}

async function loadPage(page) {
  const contentEl = document.getElementById('content');
  const pageMap = {
    'home': { render: renderHome, title: 'writerjoshua.com', desc: 'Author, Researcher, Artist' },
    'feed': { render: renderFeed, title: 'Feed - writerjoshua.com', desc: 'Latest writes and thoughts' },
    'blog': { render: renderBlog, title: 'Blog - writerjoshua.com', desc: 'Articles and essays' },
    'projects': { render: renderProjects, title: 'Projects - writerjoshua.com', desc: 'Creative and research projects' },
    'about-josh': { render: renderAbout, title: 'About - writerjoshua.com', desc: 'About Josh' },
    'contact': { render: renderContact, title: 'Contact - writerjoshua.com', desc: 'Get in touch' }
  };
  
  const pageConfig = pageMap[page];
  if (!pageConfig) {
    handleError(contentEl, new Error('Page not found'), 'Page not found');
    return;
  }
  
  try {
    contentEl.innerHTML = '<div class="loading">Loading...</div>';
    const html = await pageConfig.render();
    contentEl.innerHTML = html;
    setupPostInteractions();
    setActiveNavButton(page);
    updateMetaTags(pageConfig.title, pageConfig.desc, '/assets/media/writerjoshua02.jpg');
    window.scrollTo(0, 0);
  } catch (err) {
    handleError(contentEl, err, 'Error loading page');
  }
}

// ============================================================================
// THEME TOGGLE
// ============================================================================

function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  const savedTheme = localStorage.getItem('theme') || 'light';
  
  // Set initial theme
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    updateThemeToggleUI('dark');
  } else {
    document.body.classList.remove('dark-theme');
    updateThemeToggleUI('light');
  }
  
  // Toggle theme on button click
  themeToggle.addEventListener('click', function() {
    const isDarkTheme = document.body.classList.toggle('dark-theme');
    const newTheme = isDarkTheme ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    updateThemeToggleUI(newTheme);
  });
}

function updateThemeToggleUI(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  const icon = themeToggle.querySelector('.theme-icon');
  const label = themeToggle.querySelector('.theme-label');
  
  if (theme === 'dark') {
    icon.textContent = 'sun';
    label.textContent = 'Light';
  } else {
    icon.textContent = 'moon';
    label.textContent = 'Dark';
  }
}

// ============================================================================
// NAVIGATION SETUP
// ============================================================================

function setupNavigation() {
  var sideLinks = document.querySelectorAll('.side-nav-menu .nav-link');
  sideLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      const page = this.dataset.page;
      loadPage(page);
      closeSideNav();
    });
  });
  
  var bottomBtns = document.querySelectorAll('.bottom-nav-btn');
  bottomBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const page = this.dataset.page;
      loadPage(page);
    });
  });
}

function setupSideNav() {
  const sideNav = document.getElementById('side-nav');
  const menuToggle = document.getElementById('menu-toggle');
  const closeNav = document.getElementById('close-nav');
  
  if (!sideNav || !menuToggle) return;
  
  menuToggle.addEventListener('click', function() {
    sideNav.classList.add('open');
  });
  
  if (closeNav) {
    closeNav.addEventListener('click', function() {
      closeSideNav();
    });
  }
  
  document.addEventListener('click', function(e) {
    if (!sideNav.contains(e.target) && !menuToggle.contains(e.target)) {
      closeSideNav();
    }
  });
  
  var sectionBtns = document.querySelectorAll('.nav-section-btn');
  sectionBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const section = this.dataset.section;
      const submenu = document.getElementById(section + '-menu');
      
      this.classList.toggle('open');
      if (submenu) submenu.classList.toggle('open');
    });
  });
}

function closeSideNav() {
  const sideNav = document.getElementById('side-nav');
  if (sideNav) sideNav.classList.remove('open');
}

// ============================================================================
// POST INTERACTIONS (Read More, Share, etc.)
// ============================================================================

function setupPostInteractions() {
  var readBtns = document.querySelectorAll('.read-write-btn, .read-blog-btn');
  readBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const card = this.closest('.card');
      const postId = card.dataset.postId;
      console.log('Reading post: ' + postId);
    });
  });
  
  var shareBtns = document.querySelectorAll('.share-btn');
  shareBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const card = this.closest('.card');
      const preview = card.querySelector('.share-preview');
      if (preview) preview.classList.toggle('visible');
    });
  });
  
  var projectLinks = document.querySelectorAll('.project-link');
  projectLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const projectId = this.dataset.projectId;
      console.log('Viewing project: ' + projectId);
    });
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  setupNavigation();
  setupSideNav();
  setupThemeToggle();
  loadPage('home');
  updateMetaTags('writerjoshua.com', 'Author, Researcher, Artist', '/assets/media/writerjoshua02.jpg');
});
