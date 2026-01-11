let projects = [];

async function init() {
    try {
        const response = await fetch('projects.json');
        projects = await response.json();
        renderProjects();
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderProjects() {
    const tree = document.getElementById('projectsTree');
    tree.innerHTML = '';
    
    projects.forEach(project => {
        const groupEl = createProjectGroup(project);
        tree.appendChild(groupEl);
    });
}

function createProjectGroup(project) {
    const group = document.createElement('div');
    group.className = 'project-group';
    
    const header = document.createElement('div');
    header.className = 'project-header';
    header.onclick = () => group.classList.toggle('expanded');
    
    header.innerHTML = `
        <span class="expand-icon">▶</span>
        <div class="project-info">
            <div class="project-name">${escapeHtml(project.name)}</div>
            <div class="project-desc">${escapeHtml(project.description)}</div>
        </div>
        <span class="repo-count">${project.repos.length} ${project.repos.length === 1 ? 'repo' : 'repos'}</span>
    `;
    
    const reposContainer = document.createElement('div');
    reposContainer.className = 'repos';
    
    project.repos.forEach(repo => {
        const repoEl = createRepoItem(repo);
        reposContainer.appendChild(repoEl);
    });
    
    group.appendChild(header);
    group.appendChild(reposContainer);
    
    return group;
}

function createRepoItem(repo) {
    const item = document.createElement('div');
    item.className = 'repo-item';
    
    const techClass = `tech-${repo.technology.toLowerCase().replace(/\//g, '').replace(/\s/g, '')}`;
    const privacyBadge = repo.isPrivate 
        ? '<span class="privacy-badge badge-private">Private</span>'
        : '<span class="privacy-badge badge-public">Public</span>';
    
    item.innerHTML = `
        <div class="repo-details">
            <a href="${repo.githubUrl}" target="_blank" class="repo-name">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>
                </svg>
                ${escapeHtml(repo.name)}
            </a>
            <div class="repo-description">${escapeHtml(repo.description)}</div>
        </div>
        <div class="repo-meta">
            <span class="tech-badge">
                <span class="tech-dot ${techClass}"></span>
                ${escapeHtml(repo.technology)}
            </span>
            ${privacyBadge}
        </div>
    `;
    
    return item;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
