// GitHub Projects Integration
const GITHUB_USERNAME = 'kartikbhai23'; // Replace with your GitHub username
const GITHUB_API = `https://api.github.com/users/kartikbhai23/repos`;

let allRepositories = [];
let currentFilter = 'all';

// Fetch repositories from GitHub
async function fetchGitHubRepos() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    try {
        const response = await fetch(`${GITHUB_API}?sort=updated&per_page=100`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const repos = await response.json();
        allRepositories = repos;
        
        displayProjects(repos);
        setupFilters();
        setupSearch();
        
    } catch (error) {
        console.error('Error fetching repositories:', error);
        projectsGrid.innerHTML = `
            <div class="no-projects">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load projects</h3>
                <p>Please check your GitHub username in github-projects.js</p>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">
                    Current username: <code style="color: var(--primary-color);">kartikbhai23</code>
                </p>
            </div>
        `;
    }
}

// Display projects in the grid
function displayProjects(repos) {
    const projectsGrid = document.getElementById('projectsGrid');
    
    if (repos.length === 0) {
        projectsGrid.innerHTML = `
            <div class="no-projects">
                <i class="fas fa-folder-open"></i>
                <h3>No projects found</h3>
                <p>No repositories match your current filter</p>
            </div>
        `;
        return;
    }
    
    projectsGrid.innerHTML = repos.map(repo => {
        const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        return `
            <div class="project-card" data-visibility="${repo.private ? 'private' : 'public'}">
                <div class="project-header">
                    <div class="project-icon">
                        <i class="fas fa-${repo.private ? 'lock' : 'folder'}"></i>
                    </div>
                    <div class="project-links">
                        <a href="${repo.html_url}" target="_blank" class="project-link" title="View on GitHub">
                            <i class="fab fa-github"></i>
                        </a>
                        ${repo.homepage ? `
                            <a href="${repo.homepage}" target="_blank" class="project-link" title="Live Demo">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        ` : ''}
                    </div>
                </div>
                
                <div class="project-info">
                    <h3>${repo.name}</h3>
                </div>
                
                <p class="project-description">
                    ${repo.description || 'No description available'}
                </p>
                
                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        <span>${repo.stargazers_count}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-code-branch"></i>
                        <span>${repo.forks_count}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-${repo.private ? 'lock' : 'globe'}"></i>
                        <span>${repo.private ? 'Private' : 'Public'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${updatedDate}</span>
                    </div>
                </div>
                
                ${repo.language ? `
                    <div class="project-language">
                        <span class="language-dot"></span>
                        <span>${repo.language}</span>
                    </div>
                ` : ''}
                
                ${repo.topics && repo.topics.length > 0 ? `
                    <div class="project-topics">
                        ${repo.topics.slice(0, 5).map(topic => `
                            <span class="topic-tag">${topic}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Setup filter buttons
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter projects
            currentFilter = this.dataset.filter;
            filterProjects();
        });
    });
}

// Filter projects based on visibility
function filterProjects() {
    const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    let filtered = allRepositories;
    
    // Apply visibility filter
    if (currentFilter === 'public') {
        filtered = filtered.filter(repo => !repo.private);
    } else if (currentFilter === 'private') {
        filtered = filtered.filter(repo => repo.private);
    }
    
    // Apply search filter
    if (searchQuery) {
        filtered = filtered.filter(repo => 
            repo.name.toLowerCase().includes(searchQuery) ||
            (repo.description && repo.description.toLowerCase().includes(searchQuery)) ||
            (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(searchQuery)))
        );
    }
    
    displayProjects(filtered);
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterProjects();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('projectsGrid')) {
        fetchGitHubRepos();
    }
});