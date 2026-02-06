// writerjoshua.com - Complete SPA Application
// Production-ready with theme toggle, markdown parsing, and full navigation
// FIXED FOR GITHUB PAGES SUBDIRECTORY DEPLOYMENT

// Base path for GitHub Pages subdirectory
const BASE_PATH = '/writerjoshua.com/';
const GITHUB_OWNER = 'writerjoshua';
const GITHUB_REPO = 'writerjoshua.com';

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

async function fetch(type, filename) {
    try {
        // First, get list of files from GitHub API
        const url = `https://api.github.com/repos/writerjoshua/writerjoshua.com/contents/assets/posts/${type}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            console.log(`No files found in ${type}`);
            return [];
        }

        const files = await response.json();
        const mdFiles = files.filter(f => f.name.endsWith('.md') && f.type === 'file');

        if (mdFiles.length === 0) return [];

        const posts = [];

        for (const file of mdFiles) {
            try {
                const raw = await fetch(`https://raw.githubusercontent.com/writerjoshua/writerjoshua.com/main/assets/posts/${type}/${file.name}`);
                if (raw.ok) {
                    const markdown = await raw.text();
                    const post = parseMarkdown(markdown, type, file.name);
                    if (post) posts.push(post);
                }
            } catch (err) {
                console.log(`Error loading ${file.name}:`, err);
            }
        }

        return posts;
    } catch (err) {
        console.log(`Error in fetchMarkdownFiles for ${type}:`, err);
        return [];
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
    const path = `assets/posts/${folder}/${filename}`;
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
  const path = `assets/posts/${pageName}.md`;
  const content = await fetchMarkdownFile(path);
  
  if (!content) {
    throw new Error(`Page ${pageName} not found`);
  }
  
  const parsed = parseMarkdown(content);
  return parsed.content;
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

function renderHero() {
  return `<div class="hero"><div class="hero-content"><h2>Josh</h2><p>Author, Researcher, Artist</p><p style="margin-top: 1.5rem; font-size: 1rem;">Exploring the intersections of art, science, and creative innovation.</p></div></div>`;
}

function renderWriteCard(post) {
  const dateStr = new Date(post.date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  return `
    <div class="card write" data-post-id="${post.id}" data-type="feed">
      <div class="card-content">
        <h2>${escapeHtml(post.title)}</h2>
        <p class="write-excerpt">${escapeHtml(post.excerpt)}</p>
        <div class="write-text">${escapeHtml(post.content).substring(0, 300)}...</div>
        <div class="card-footer">
          <span class="timestamp">${dateStr}</span>
          <div class="action-buttons">
            <button class="action-btn read-write-btn" data-post-id="${post.id}">Read Full</button>
            <button class="action-btn share-btn" data-post-id="${post.id}">Share</button>
          </div>
        </div>
        <div class="share-preview">
          <div class="share-preview-meta"><strong>writerjoshua.com</strong> — Feed</div>
          <div class="share-preview-meta">"${escapeHtml(post.title)}"</div>
        </div>
      </div>
    </div>
  `;
}

function renderBlogCard(post) {
  const dateStr = new Date(post.date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const year = new Date(post.date).getFullYear();
  
  return `
    <div class="card blog" data-post-id="${post.id}" data-type="blog" data-year="${year}">
      <div class="card-content">
        <div class="blog-date">${year}</div>
        <h2>${escapeHtml(post.title)}</h2>
        <p class="blog-excerpt">${escapeHtml(post.excerpt)}</p>
        <div class="card-footer">
          <span class="timestamp">${dateStr}</span>
          <div class="action-buttons">
            <button class="action-btn read-blog-btn" data-post-id="${post.id}">Read Post</button>
            <button class="action-btn share-btn" data-post-id="${post.id}">Share</button>
          </div>
        </div>
        <div class="share-preview">
          <div class="share-preview-meta"><strong>writerjoshua.com</strong> — Blog</div>
          <div class="share-preview-meta">"${escapeHtml(post.title)}"</div>
        </div>
      </div>
    </div>
  `;
}

function renderProjectCard(project) {
  return `
    <div class="card project" data-post-id="${project.id}" data-type="projects">
      <div class="card-content">
        <h2>${escapeHtml(project.title)}</h2>
        <p class="project-description">${escapeHtml(project.excerpt)}</p>
        <a href="#" class="project-link" data-project-id="${project.id}">View Project →</a>
      </div>
    </div>
  `;
}

// ============================================================================
// PAGE RENDERERS
// ============================================================================

async function renderHome() {
  try {
    const feedPosts = await fetchMarkdownFiles('feed');
    const latestFeed = feedPosts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 2);
    
    const feedHtml = latestFeed.length > 0 
      ? latestFeed.map(post => renderWriteCard(post)).join('')
      : '<div class="empty-state"><p>No posts yet.</p></div>';
    
    return renderHero() + `<div style="margin-top: 3rem;"><h2 class="section-title">Latest from Feed</h2><div class="feed">${feedHtml}</div></div>`;
  } catch (err) {
    console.error('Error rendering home:', err);
    throw err;
  }
}

async function renderFeed() {
  try {
    const posts = await fetchMarkdownFiles('feed');
    
    if (posts.length === 0) {
      return '<div class="empty-state"><p>No writes yet.</p></div>';
    }
    
    const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return `<h2 class="section-title">Feed</h2><div class="feed">${sortedPosts.map(post => renderWriteCard(post)).join('')}</div>`;
  } catch (err) {
    console.error('Error rendering feed:', err);
    throw err;
  }
}

async function renderBlog() {
  try {
    const posts = await fetchMarkdownFiles('blog');
    
    if (posts.length === 0) {
      return '<div class="empty-state"><p>No blog posts yet.</p></div>';
    }
    
    const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return `<h2 class="section-title">Blog</h2><div class="feed">${sortedPosts.map(post => renderBlogCard(post)).join('')}</div>`;
  } catch (err) {
    console.error('Error rendering blog:', err);
    throw err;
  }
}

async function renderProjects() {
  try {
    const projects = await fetchMarkdownFiles('projects');
    
    if (projects.length === 0) {
      return '<div class="empty-state"><p>No projects yet.</p></div>';
    }
    
    return `<h2 class="section-title">Projects</h2><div class="feed">${projects.map(project => renderProjectCard(project)).join('')}</div>`;
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

function updateMetaTags(title, description, image, twitterTitle, twitterDescription, keywords) {
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', twitterTitle || title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', twitterDescription || description);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', image);
    if (keywords) {
        document.querySelector('meta[name="keywords"]')?.setAttribute('content', keywords);
    }
}

function setActiveNavButton(page) {
  document.querySelectorAll('.side-nav-menu .nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.page === page) {
      link.classList.add('active');
    }
  });
  
  document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
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
    updateMetaTags(pageConfig.title, pageConfig.desc, 'assets/media/writerjoshua02.jpg');
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
  
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    updateThemeToggleUI('dark');
  } else {
    document.body.classList.remove('dark-theme');
    updateThemeToggleUI('light');
  }
  
  themeToggle.addEventListener('click', () => {
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
  document.querySelectorAll('.side-nav-menu .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const page = link.dataset.page;
      loadPage(page);
      closeSideNav();
    });
  });
  
  document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      loadPage(page);
    });
  });
}

function setupSideNav() {
  const sideNav = document.getElementById('side-nav');
  const menuToggle = document.getElementById('menu-toggle');
  const closeNav = document.getElementById('close-nav');
  
  if (!sideNav || !menuToggle) return;
  
  menuToggle.addEventListener('click', () => {
    sideNav.classList.add('open');
  });
  
  if (closeNav) {
    closeNav.addEventListener('click', () => {
      closeSideNav();
    });
  }
  
  document.addEventListener('click', (e) => {
    if (!sideNav.contains(e.target) && !menuToggle.contains(e.target)) {
      closeSideNav();
    }
  });
  
  document.querySelectorAll('.nav-section-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      const submenu = document.getElementById(section + '-menu');
      
      btn.classList.toggle('open');
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
  document.querySelectorAll('.read-write-btn, .read-blog-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const postId = card.dataset.postId;
      console.log('Reading post: ' + postId);
    });
  });
  
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const preview = card.querySelector('.share-preview');
      if (preview) preview.classList.toggle('visible');
    });
  });
  
  document.querySelectorAll('.project-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = link.dataset.projectId;
      console.log('Viewing project: ' + projectId);
    });
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('App initializing with BASE_PATH:', BASE_PATH);
  setupNavigation();
  setupSideNav();
  setupThemeToggle();
  loadPage('home');
  updateMetaTags('writerjoshua.com', 'Author, Researcher, Artist', 'assets/media/writerjoshua02.jpg');
});
