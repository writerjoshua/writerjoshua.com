// writerjoshua.com — SPA with Theme Toggle
// Add this to app_fixed.js or use as reference

// THEME TOGGLE SETUP (Add to initialization)
function setupThemeToggle() {
const themeToggle = document.getElementById(‘theme-toggle’);
const htmlElement = document.documentElement;
const savedTheme = localStorage.getItem(‘theme’) || ‘light’;

```
// Set initial theme
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    updateThemeToggleUI('dark');
}

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    const isDarkTheme = document.body.classList.toggle('dark-theme');
    const newTheme = isDarkTheme ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    updateThemeToggleUI(newTheme);
});
```

}

function updateThemeToggleUI(theme) {
const themeToggle = document.getElementById(‘theme-toggle’);
const icon = themeToggle.querySelector(’.theme-icon’);
const label = themeToggle.querySelector(’.theme-label’);

```
if (theme === 'dark') {
    icon.textContent = '☀️';
    label.textContent = 'Light';
} else {
    icon.textContent = '🌙';
    label.textContent = 'Dark';
}
```

}

// FEED PAGE (Like Sentiment cards)
async function renderFeed() {
try {
const posts = await fetchMarkdownFiles(‘feed’);

```
    if (posts.length === 0) {
        return `<div class="empty-state"><p>No writes yet. 💭</p></div>`;
    }

    const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    return `
        <h2 class="section-title">Feed</h2>
        <div class="feed">${sortedPosts.map(post => renderWriteCard(post)).join('')}</div>
    `;
} catch (err) {
    console.error('Error rendering feed:', err);
    throw err;
}
```

}

function renderWriteCard(post) {
const { id, title, date, excerpt, content } = post;
const dateStr = new Date(date).toLocaleDateString(‘en-US’, { year: ‘numeric’, month: ‘short’, day: ‘numeric’ });

```
return `
    <div class="card write" data-post-id="${id}" data-type="feed">
        <div class="card-content">
            <h2>${escapeHtml(title)}</h2>
            <p class="write-excerpt">${escapeHtml(excerpt)}</p>
            <div class="write-text">${escapeHtml(content).substring(0, 300)}...</div>
            <div class="card-footer">
                <span class="timestamp">${dateStr}</span>
                <div class="action-buttons">
                    <button class="action-btn read-write-btn">Read Full</button>
                    <button class="action-btn share-btn">Share</button>
                </div>
            </div>
            <div class="share-preview">
                <div class="share-preview-meta"><strong>writerjoshua.com</strong> — Feed</div>
                <div class="share-preview-meta">"${escapeHtml(title)}"</div>
            </div>
        </div>
    </div>
`;
```

}

// BLOG PAGE (Card feed organized by year via metadata)
async function renderBlog() {
try {
const posts = await fetchMarkdownFiles(‘blog’);

```
    if (posts.length === 0) {
        return `<div class="empty-state"><p>No blog posts yet. 📝</p></div>`;
    }

    // Sort by date, newest first
    const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return `
        <h2 class="section-title">Blog</h2>
        <div class="feed">${sortedPosts.map(post => renderBlogCard(post)).join('')}</div>
    `;
} catch (err) {
    console.error('Error rendering blog:', err);
    throw err;
}
```

}

function renderBlogCard(post) {
const { id, title, date, excerpt } = post;
const dateStr = new Date(date).toLocaleDateString(‘en-US’, { year: ‘numeric’, month: ‘short’, day: ‘numeric’ });
const year = new Date(date).getFullYear();

```
return `
    <div class="card blog" data-post-id="${id}" data-type="blog" data-year="${year}">
        <div class="card-content">
            <div class="blog-date">${year}</div>
            <h2>${escapeHtml(title)}</h2>
            <p class="blog-excerpt">${escapeHtml(excerpt)}</p>
            <div class="card-footer">
                <span class="timestamp">${dateStr}</span>
                <div class="action-buttons">
                    <button class="action-btn read-blog-btn">Read Post</button>
                    <button class="action-btn share-btn">Share</button>
                </div>
            </div>
            <div class="share-preview">
                <div class="share-preview-meta"><strong>writerjoshua.com</strong> — Blog</div>
                <div class="share-preview-meta">"${escapeHtml(title)}"</div>
            </div>
        </div>
    </div>
`;
```

}

// PROJECTS PAGE
async function renderProjects() {
try {
const projects = await fetchMarkdownFiles(‘projects’);

```
    if (projects.length === 0) {
        return `<div class="empty-state"><p>No projects yet. 🔨</p></div>`;
    }

    return `
        <h2 class="section-title">Projects</h2>
        <div class="feed">${projects.map(project => renderProjectCard(project)).join('')}</div>
    `;
} catch (err) {
    console.error('Error rendering projects:', err);
    throw err;
}
```

}

function renderProjectCard(project) {
const { id, title, excerpt } = project;

```
return `
    <div class="card project" data-post-id="${id}" data-type="projects">
        <div class="card-content">
            <h2>${escapeHtml(title)}</h2>
            <p class="project-description">${escapeHtml(excerpt)}</p>
            <a href="#" class="project-link" data-project-id="${id}">View Project →</a>
        </div>
    </div>
`;
```

}

// HOME PAGE (Hero + featured content)
async function renderHome() {
try {
const [feedPosts, blogPosts, projects] = await Promise.all([
fetchMarkdownFiles(‘feed’),
fetchMarkdownFiles(‘blog’),
fetchMarkdownFiles(‘projects’)
]);

```
    const latestFeed = feedPosts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2);

    return `
        ${renderHero()}
        
        <div style="margin-top: 3rem;">
            <h2 class="section-title">Latest from Feed</h2>
            <div class="feed">
                ${latestFeed.length > 0 ? latestFeed.map(post => renderWriteCard(post)).join('') : '<div class="empty-state"><p>No posts yet. 💭</p></div>'}
            </div>
        </div>
    `;
} catch (err) {
    console.error('Error rendering home:', err);
    throw err;
}
```

}

function renderHero() {
return `<div class="hero"> <div class="hero-content"> <h2>Josh</h2> <p>Author, Researcher, Artist</p> <p style="margin-top: 1.5rem; font-size: 1rem;">Exploring the intersections of art, science, and creative innovation.</p> </div> </div>`;
}

// ABOUT PAGE
async function renderAbout() {
try {
return await fetchMarkdownPage(‘about-josh’);
} catch (err) {
console.error(‘Error loading about page:’, err);
throw err;
}
}

// CONTACT PAGE
async function renderContact() {
try {
return await fetchMarkdownPage(‘contact’);
} catch (err) {
console.error(‘Error loading contact page:’, err);
throw err;
}
}

// UPDATE loadPage() to handle new pages
// Replace the else-if section with:
/*
else if (page === ‘feed’) {
renderFeed().then(html => {
contentEl.innerHTML = html;
setupPostInteractions();
window.scrollTo(0, 0);
}).catch(err => {
handleError(contentEl, err, ‘Error loading feed’);
});
} else if (page === ‘blog’) {
renderBlog().then(html => {
contentEl.innerHTML = html;
setupPostInteractions();
window.scrollTo(0, 0);
}).catch(err => {
handleError(contentEl, err, ‘Error loading blog’);
});
} else if (page === ‘projects’) {
renderProjects().then(html => {
contentEl.innerHTML = html;
setupPostInteractions();
window.scrollTo(0, 0);
}).catch(err => {
handleError(contentEl, err, ‘Error loading projects’);
});
} else if (page === ‘about-josh’ || page === ‘contact’) {
(page === ‘about-josh’ ? renderAbout() : renderContact()).then(html => {
contentEl.innerHTML = html;
setupPostInteractions();
window.scrollTo(0, 0);
}).catch(err => {
handleError(contentEl, err, ‘Error loading page’);
});
}
*/

// Add theme toggle setup to DOMContentLoaded
/*
document.addEventListener(‘DOMContentLoaded’, () => {
setupNavigation();
setupSideNav();
setupThemeToggle();  // ADD THIS LINE
loadPage(‘home’);
updateMetaTags(‘writerjoshua.com’, ‘Author, Researcher, Artist’, ‘/assets/media/writerjoshua02.jpg’);
});
*/