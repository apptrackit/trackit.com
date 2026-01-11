// State
let allProjects = [];
let filteredProjects = [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const techFilter = document.getElementById('techFilter');
const sortSelect = document.getElementById('sortSelect');
const projectsGrid = document.getElementById('projectsGrid');
const projectCount = document.getElementById('projectCount');

// Initialize
async function init() {
    try {
        const response = await fetch('projects.json');
        allProjects = await response.json();
        filteredProjects = [...allProjects];
        
        populateTechFilter();
        renderProjects();
        attachEventListeners();
    } catch (error) {
        console.error('Error loading projects:', error);
        showError();
    }
}

// Populate technology filter with unique technologies from projects
function populateTechFilter() {
    const technologies = [...new Set(allProjects.map(p => p.technology))].sort();
    
    technologies.forEach(tech => {
        const option = document.createElement('option');
        option.value = tech;
        option.textContent = tech;
        techFilter.appendChild(option);
    });
}

// Attach event listeners
function attachEventListeners() {
    searchInput.addEventListener('input', debounce(filterProjects, 300));
    categoryFilter.addEventListener('change', filterProjects);
    techFilter.addEventListener('change', filterProjects);
    sortSelect.addEventListener('change', filterProjects);
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Filter and sort projects
function filterProjects() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedTech = techFilter.value;
    
    // Filter
    filteredProjects = allProjects.filter(project => {
        const matchesSearch = 
            project.name.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm) ||
            project.technology.toLowerCase().includes(searchTerm);
        
        const matchesCategory = 
            selectedCategory === 'all' || project.category === selectedCategory;
        
        const matchesTech = 
            selectedTech === 'all' || project.technology === selectedTech;
        
        return matchesSearch && matchesCategory && matchesTech;
    });
    
    // Sort
    const sortBy = sortSelect.value;
    sortProjects(sortBy);
    
    renderProjects();
}

// Sort projects based on selected criteria
function sortProjects(sortBy) {
    switch (sortBy) {
        case 'priority':
            filteredProjects.sort((a, b) => a.priority - b.priority);
            break;
        case 'name':
            filteredProjects.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'date':
            filteredProjects.sort((a, b) => 
                new Date(b.lastUpdated) - new Date(a.lastUpdated)
            );
            break;
    }
}

// Render projects to the grid
function renderProjects() {
    // Update count
    const count = filteredProjects.length;
    projectCount.textContent = `${count} project${count !== 1 ? 's' : ''}`;
    
    // Clear grid
    projectsGrid.innerHTML = '';
    
    // Show empty state if no projects
    if (filteredProjects.length === 0) {
        showEmptyState();
        return;
    }
    
    // Render each project
    filteredProjects.forEach(project => {
        const card = createProjectCard(project);
        projectsGrid.appendChild(card);
    });
}

// Create project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const techClass = `tech-${project.technology.toLowerCase().replace(/\//g, '-')}`;
    const privacyBadge = project.isPrivate 
        ? '<span class="badge badge-private">Private</span>'
        : '<span class="badge badge-public">Public</span>';
    
    const formattedDate = formatDate(project.lastUpdated);
    
    card.innerHTML = `
        <div class="project-header">
            <a href="${project.githubUrl}" target="_blank" class="project-name">
                ${escapeHtml(project.name)}
            </a>
            <div class="project-badges">
                ${privacyBadge}
            </div>
        </div>
        
        <p class="project-description">${escapeHtml(project.description)}</p>
        
        <div class="project-meta">
            <div class="meta-item">
                <span class="meta-label">Category:</span>
                <span class="meta-value">${escapeHtml(project.category)}</span>
            </div>
            <div class="meta-item">
                <span class="tech-tag">
                    <span class="tech-dot ${techClass}"></span>
                    ${escapeHtml(project.technology)}
                </span>
            </div>
        </div>
        
        <div class="project-footer">
            <a href="${project.githubUrl}" target="_blank" class="github-button">
                <svg fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                View Repository
            </a>
            <span class="status-badge">${escapeHtml(project.status)}</span>
        </div>
    `;
    
    return card;
}

// Show empty state when no projects match filters
function showEmptyState() {
    projectsGrid.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3 class="empty-state-title">No projects found</h3>
            <p class="empty-state-text">Try adjusting your filters or search query</p>
        </div>
    `;
}

// Show error state
function showError() {
    projectsGrid.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3 class="empty-state-title">Error loading projects</h3>
            <p class="empty-state-text">Please check your connection and try again</p>
        </div>
    `;
}

// Format date to readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start the app
init();
