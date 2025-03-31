/**
 * UI module - Handles all UI-related functionality
 * This module contains functions for rendering the repository cards,
 * pagination, stats, loading states, and error messages.
 */

/**
 * Renders repositories in the container
 * Displays a paginated list of repository cards
 */
function renderRepositories() {
    const container = document.querySelector(config.selectors.scriptsContainer);
    const noResultsElement = document.querySelector(config.selectors.noResults);
    
    const startIndex = (config.data.currentPage - 1) * config.api.perPage;
    const endIndex = startIndex + config.api.perPage;
    const repositoriesToShow = config.data.filteredRepositories.slice(startIndex, endIndex);
    
    config.data.totalPages = Math.ceil(config.data.filteredRepositories.length / config.api.perPage);
    
    container.innerHTML = '';
    
    if (config.data.filteredRepositories.length === 0) {
        noResultsElement.style.display = 'flex';
        renderPagination();
        return;
    } else {
        noResultsElement.style.display = 'none';
    }
    
    repositoriesToShow.forEach((repo, index) => {
        const card = createRepositoryCard(repo, index);
        container.appendChild(card);
    });
    
    renderPagination();
}

/**
 * Generates a repository icon based on its name
 * This doesn't require any API calls
 * @param {Object} repo - The repository
 * @param {HTMLElement} container - Where to add the generated icon
 */
function generateRepositoryIcon(repo, container) {
    const seed = getHashCode(repo.name);
    
    const colorIndex = seed % config.ui.backgroundColors.length;
    const gradient = config.ui.backgroundColors[colorIndex];
    
    const bgElement = document.createElement('div');
    bgElement.className = 'script-banner-generated';
    
    bgElement.style.background = `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`;
    
    for (let i = 0; i < 3; i++) {
        const shapeElement = document.createElement('div');
        shapeElement.className = 'script-banner-shape';
        
        const shapeIndex = (seed + i) % config.ui.backgroundShapes.length;
        const shape = config.ui.backgroundShapes[shapeIndex];
        
        const size = 120 + ((seed * (i + 1)) % 80);
        const left = ((seed * (i + 3)) % 80);
        const top = ((seed * (i + 2)) % 80);
        const rotate = ((seed * (i + 1)) % 360);
        
        shapeElement.style.width = `${size}px`;
        shapeElement.style.height = `${size}px`;
        shapeElement.style.left = `${left}%`;
        shapeElement.style.top = `${top}%`;
        shapeElement.style.transform = `translate(-50%, -50%) rotate(${rotate}deg)`;
        
        switch (shape) {
            case 'circle':
                shapeElement.style.borderRadius = '50%';
                break;
            case 'square':
                shapeElement.style.borderRadius = '4px';
                break;
            case 'triangle':
                shapeElement.style.width = '0';
                shapeElement.style.height = '0';
                shapeElement.style.borderLeft = `${size / 2}px solid transparent`;
                shapeElement.style.borderRight = `${size / 2}px solid transparent`;
                shapeElement.style.borderBottom = `${size}px solid rgba(255, 255, 255, 0.05)`;
                break;
            case 'diamond':
                shapeElement.style.transform = `translate(-50%, -50%) rotate(45deg)`;
                break;
            case 'hexagon':
                shapeElement.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
                break;
        }
        
        if (shape !== 'triangle') {
            shapeElement.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }
        
        bgElement.appendChild(shapeElement);
    }
    
    const letterElement = document.createElement('div');
    letterElement.className = 'script-banner-letter';
    letterElement.textContent = repo.name.charAt(0).toUpperCase();
    
    bgElement.appendChild(letterElement);
    container.appendChild(bgElement);
}

/**
 * Creates a card element for a repository - this version doesn't attempt to load icons from GitHub
 * @param {Object} repo - The repository data
 * @param {Number} index - Index for animation delay
 * @returns {HTMLElement} - The card element
 */
function createRepositoryCard(repo, index) {
    const template = document.querySelector('#script-card-template');
    const card = template.content.cloneNode(true);
    
    const cardElement = card.querySelector('.script-card');
    cardElement.style.animationDelay = `${index * 0.15}s`;
    
    const imageContainer = card.querySelector('.script-image-container');
    
    // Skip external API calls for icons and always use generated backgrounds
    // This is the key change to avoid rate limiting
    generateRepositoryIcon(repo, imageContainer);
    
    card.querySelector('.script-title').textContent = formatRepoName(repo.name);
    card.querySelector('.script-author').textContent = repo.owner.login;
    card.querySelector('.script-date').textContent = formatDate(repo.created_at);
    card.querySelector('.script-description').textContent = repo.description || 'No description available.';
    
    card.querySelector('.stars-value').textContent = repo.stargazers_count;
    card.querySelector('[data-metric="forks"]').textContent = repo.forks_count;
    card.querySelector('[data-metric="issues"]').textContent = repo.open_issues_count;
    card.querySelector('[data-metric="watchers"]').textContent = repo.watchers_count;
    
    const progressValue = calculateProgress(repo);
    const progressFill = card.querySelector('.progress-fill');
    const progressLabel = card.querySelector('.progress-label');
    
    progressFill.style.width = `${progressValue}%`;
    progressLabel.textContent = `${progressValue}%`;
    
    // Set progress color based on value
    if (progressValue >= 80) {
        progressFill.style.backgroundColor = 'rgb(220, 220, 255)'; // Neon white
        progressLabel.style.color = 'rgb(220, 220, 255)';
    } else if (progressValue >= 50) {
        progressFill.style.backgroundColor = 'rgb(160, 160, 180)'; // Light gray
        progressLabel.style.color = 'rgb(160, 160, 180)';
    } else {
        progressFill.style.backgroundColor = 'rgb(100, 100, 120)'; // Dark gray
        progressLabel.style.color = 'rgb(100, 100, 120)';
    }
    
    const tagsContainer = card.querySelector('.script-tags');
    const topics = repo.topics || [];
    
    // Show topics if available, otherwise show language and 'Script' tag
    let tagsToShow = [];
    if (topics.length > 0) {
        tagsToShow = topics;
    } else {
        // Add primary language if available
        if (repo.language) {
            tagsToShow.push(repo.language);
        }
        // Always add 'Script' tag for repositories without topics
        tagsToShow.push('Script');
    }
    
    tagsToShow.forEach(topic => {
        const tagElement = document.createElement('span');
        tagElement.className = 'script-tag';
        tagElement.textContent = topic;
        
        // Add active class if the tag is selected in the filter
        if (config.data.activeTags.includes(topic)) {
            tagElement.classList.add('active');
        }
        
        // Add event to filter by this tag when clicked
        tagElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!config.data.activeTags.includes(topic)) {
                config.data.activeTags.push(topic);
                updateTagsSelection();
                filterRepositories();
            }
        });
        
        tagsContainer.appendChild(tagElement);
    });
    
    const primaryButton = card.querySelector('.script-button.primary');
    const secondaryButton = card.querySelector('.script-button.secondary');
    
    primaryButton.href = `${repo.html_url}/archive/refs/heads/master.zip`;
    secondaryButton.href = repo.html_url;
    
    return card;
}

/**
 * Generates a visual background based on repository name
 * @param {Object} repo - The repository data
 * @param {HTMLElement} container - The DOM container for the background
 */
function generateBackground(repo, container) {
    const seed = getHashCode(repo.name);
    
    const colorIndex = seed % config.ui.backgroundColors.length;
    const gradient = config.ui.backgroundColors[colorIndex];
    
    const bgElement = document.createElement('div');
    bgElement.className = 'script-banner-generated';
    
    bgElement.style.background = `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`;
    
    for (let i = 0; i < 3; i++) {
        const shapeElement = document.createElement('div');
        shapeElement.className = 'script-banner-shape';
        
        const shapeIndex = (seed + i) % config.ui.backgroundShapes.length;
        const shape = config.ui.backgroundShapes[shapeIndex];
        
        const size = 120 + ((seed * (i + 1)) % 80);
        const left = ((seed * (i + 3)) % 80);
        const top = ((seed * (i + 2)) % 80);
        const rotate = ((seed * (i + 1)) % 360);
        
        shapeElement.style.width = `${size}px`;
        shapeElement.style.height = `${size}px`;
        shapeElement.style.left = `${left}%`;
        shapeElement.style.top = `${top}%`;
        shapeElement.style.transform = `translate(-50%, -50%) rotate(${rotate}deg)`;
        
        switch (shape) {
            case 'circle':
                shapeElement.style.borderRadius = '50%';
                break;
            case 'square':
                shapeElement.style.borderRadius = '4px';
                break;
            case 'triangle':
                shapeElement.style.width = '0';
                shapeElement.style.height = '0';
                shapeElement.style.borderLeft = `${size / 2}px solid transparent`;
                shapeElement.style.borderRight = `${size / 2}px solid transparent`;
                shapeElement.style.borderBottom = `${size}px solid rgba(255, 255, 255, 0.05)`;
                break;
            case 'diamond':
                shapeElement.style.transform = `translate(-50%, -50%) rotate(45deg)`;
                break;
            case 'hexagon':
                shapeElement.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
                break;
        }
        
        if (shape !== 'triangle') {
            shapeElement.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }
        
        bgElement.appendChild(shapeElement);
    }
    
    const letterElement = document.createElement('div');
    letterElement.className = 'script-banner-letter';
    letterElement.textContent = repo.name.charAt(0).toUpperCase();
    
    bgElement.appendChild(letterElement);
    container.appendChild(bgElement);
}

/**
 * Renders pagination controls
 */
function renderPagination() {
    const paginationContainer = document.querySelector(config.selectors.pagination);
    
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    if (config.data.totalPages <= 0) return;
    
    const prevButton = document.createElement('button');
    prevButton.className = `pagination-button ${config.data.currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    if (config.data.currentPage > 1) {
        prevButton.addEventListener('click', () => {
            navigateToPage(config.data.currentPage - 1);
        });
    }
    
    paginationContainer.appendChild(prevButton);
    
    let startPage = Math.max(1, config.data.currentPage - 2);
    let endPage = Math.min(config.data.totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.className = 'pagination-button';
        firstPageButton.textContent = '1';
        firstPageButton.addEventListener('click', () => {
            navigateToPage(1);
        });
        paginationContainer.appendChild(firstPageButton);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-button ${i === config.data.currentPage ? 'active' : ''}`;
        pageButton.textContent = i.toString();
        
        if (i !== config.data.currentPage) {
            pageButton.addEventListener('click', () => {
                navigateToPage(i);
            });
        }
        
        paginationContainer.appendChild(pageButton);
    }
    
    if (endPage < config.data.totalPages) {
        if (endPage < config.data.totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        
        const lastPageButton = document.createElement('button');
        lastPageButton.className = 'pagination-button';
        lastPageButton.textContent = config.data.totalPages.toString();
        lastPageButton.addEventListener('click', () => {
            navigateToPage(config.data.totalPages);
        });
        paginationContainer.appendChild(lastPageButton);
    }
    
    const nextButton = document.createElement('button');
    nextButton.className = `pagination-button ${config.data.currentPage === config.data.totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    
    if (config.data.currentPage < config.data.totalPages) {
        nextButton.addEventListener('click', () => {
            navigateToPage(config.data.currentPage + 1);
        });
    }
    
    paginationContainer.appendChild(nextButton);
}

/**
 * Navigates to the specified page
 * @param {Number} page - The page number to navigate to
 */
function navigateToPage(page) {
    if (page < 1 || page > config.data.totalPages) return;
    
    config.data.currentPage = page;
    
    const scriptsSection = document.querySelector('.scripts-section');
    if (scriptsSection) {
        scriptsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    renderRepositories();
}

/**
 * Shows or hides the loading indicator with animation
 * @param {Boolean} show - Whether to show or hide the loading indicator
 */
function showLoading(show) {
    const loadingContainer = document.querySelector(config.selectors.loadingContainer);
    
    if (loadingContainer) {
        if (show) {
            loadingContainer.style.display = 'flex';
            loadingContainer.style.opacity = '0';
            
            setTimeout(() => {
                loadingContainer.style.opacity = '1';
            }, 10);
        } else {
            loadingContainer.style.opacity = '0';
            
            setTimeout(() => {
                loadingContainer.style.display = 'none';
            }, 300);
        }
    }
}

/**
 * Shows an error message
 * @param {String} message - The error message to display
 */
function showError(message) {
    const errorContainer = document.querySelector(config.selectors.errorContainer);
    const errorMessageElement = document.querySelector(config.selectors.errorMessage);
    const retryButton = document.querySelector(config.selectors.retryButton);
    
    if (errorContainer && errorMessageElement) {
        showLoading(false);
        
        errorMessageElement.textContent = message;
        
        errorContainer.style.display = 'flex';
        errorContainer.style.opacity = '0';
        
        setTimeout(() => {
            errorContainer.style.opacity = '1';
        }, 10);
        
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                hideError();
                fetchRepositories();
            });
        }
    }
}

/**
 * Hides the error message
 */
function hideError() {
    const errorContainer = document.querySelector(config.selectors.errorContainer);
    
    if (errorContainer) {
        errorContainer.style.opacity = '0';
        
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 300);
    }
}

/**
 * Updates statistics with animation
 */
function updateStatsWithAnimation() {
    if (config.data.repositories.length > 0) {
        animateCounter(
            document.querySelector(config.selectors.repositoriesCount),
            0,
            config.data.repositories.length,
            1200
        );
        
        const uniqueContributors = new Set(
            config.data.repositories.map(repo => repo.owner.login)
        );
        animateCounter(
            document.querySelector(config.selectors.contributorsCount),
            0,
            uniqueContributors.size,
            1500
        );
        
        const totalStars = config.data.repositories.reduce(
            (sum, repo) => sum + repo.stargazers_count, 0
        );
        
        animateCounter(
            document.querySelector(config.selectors.starsCount),
            0,
            totalStars,
            1800,
            (value) => value > 1000 ? (value / 1000).toFixed(1) + 'k' : value
        );
    }
}

/**
 * Animates a counter from start to end value
 * @param {HTMLElement} element - The element to display the count
 * @param {Number} start - Start value
 * @param {Number} end - End value
 * @param {Number} duration - Animation duration in ms
 * @param {Function} formatter - Optional formatter function
 */
function animateCounter(element, start, end, duration, formatter = null) {
    if (!element) return;
    
    const startTime = performance.now();
    const diff = end - start;
    
    function update(currentTime) {
        const elapsedTime = currentTime - startTime;
        
        if (elapsedTime > duration) {
            element.textContent = formatter ? formatter(end) : end;
            return;
        }
        
        const progress = elapsedTime / duration;
        const easeOutValue = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = Math.floor(start + diff * easeOutValue);
        element.textContent = formatter ? formatter(currentValue) : currentValue;
        
        requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
}

/**
 * Initializes scroll events for animation triggers and back-to-top button
 */
function initScrollEvents() {
    const navbar = document.querySelector(config.selectors.navbar);
    const backToTopButton = document.querySelector(config.selectors.backToTop);
    
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        // Navbar appearance
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
            
            if (scrollTop > lastScrollTop && scrollTop > 300) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
        
        // Back to top button visibility
        if (scrollTop > 500) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Back to top button click handler
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Animate stats cards on scroll
    const statCards = document.querySelectorAll('.stat-card');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = entry.target.dataset.statIndex || 0;
                entry.target.style.transitionDelay = `${index * 0.15}s`;
                entry.target.classList.add('animate-script-card');
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    statCards.forEach(card => {
        statObserver.observe(card);
    });
}

/**
 * Shows a warning about rate limiting
 */
function showRateLimitWarning() {
    const warningElement = document.createElement('div');
    warningElement.className = 'rate-limit-warning';
    warningElement.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>GitHub API rate limit exceeded. Showing cached data which may not be current.</span>
        <button class="close-warning"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(warningElement);
    
    // Add event listener to close button
    const closeButton = warningElement.querySelector('.close-warning');
    closeButton.addEventListener('click', () => {
        warningElement.remove();
    });
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (document.body.contains(warningElement)) {
            warningElement.remove();
        }
    }, 10000);
}

/**
 * Creates the UI for cache settings
 */
function createCacheSettingsUI() {
    const existingDialog = document.getElementById('cache-settings-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    const dialog = document.createElement('div');
    dialog.id = 'cache-settings-dialog';
    dialog.className = 'settings-dialog';
    dialog.style.display = 'none';
    
    dialog.innerHTML = `
        <div class="settings-dialog-content">
            <div class="settings-header">
                <h3>Настройки кэша</h3>
                <button class="close-dialog" id="close-cache-settings">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="settings-body">
                <p>Выберите, как долго хранить данные репозитория в кэше:</p>
                <div class="cache-duration-options">
                    <label>
                        <input type="radio" name="cache-duration" value="short" ${cacheConfig.current === 'short' ? 'checked' : ''}>
                        <span>Короткий (30 минут)</span>
                    </label>
                    <label>
                        <input type="radio" name="cache-duration" value="medium" ${cacheConfig.current === 'medium' ? 'checked' : ''}>
                        <span>Средний (6 часов)</span>
                    </label>
                    <label>
                        <input type="radio" name="cache-duration" value="long" ${cacheConfig.current === 'long' ? 'checked' : ''}>
                        <span>Длинный (24 часа)</span>
                    </label>
                    <label>
                        <input type="radio" name="cache-duration" value="veryLong" ${cacheConfig.current === 'veryLong' ? 'checked' : ''}>
                        <span>Очень длинный (7 дней)</span>
                    </label>
                </div>
                <div class="settings-info">
                    <i class="fas fa-info-circle"></i>
                    <span>Большие сроки кэширования уменьшают количество запросов к API, но могут показывать устаревшую информацию.</span>
                </div>
            </div>
            <div class="settings-footer">
                <button class="settings-save-btn" id="save-cache-settings">Сохранить настройки</button>
                <button class="settings-clear-btn" id="clear-all-cache">Очистить кэш</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    setTimeout(() => {
        document.getElementById('close-cache-settings').addEventListener('click', function() {
            dialog.style.display = 'none';
        });
        
        document.getElementById('save-cache-settings').addEventListener('click', function() {
            saveCacheSettings();
        });
        
        document.getElementById('clear-all-cache').addEventListener('click', function() {
            clearAllCache();
        });
        
        const radios = document.querySelectorAll('input[name="cache-duration"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    cacheConfig.current = e.target.value;
                }
            });
        });
        
        dialog.addEventListener('click', function(e) {
            if (e.target === dialog) {
                dialog.style.display = 'none';
            }
        });
        
        console.log('Cache settings dialog initialized');
    }, 100);
}

function addCacheSettingsButton() {
    const indicator = document.getElementById('cache-indicator');
    if (indicator) {
        indicator.addEventListener('click', (e) => {
            // Only if clicking on the info part, not the refresh button
            if (!e.target.closest('.cache-refresh-btn')) {
                document.getElementById('cache-settings-dialog').style.display = 'block';
            }
        });
    }
}

// Export functions for use in other modules
// This is needed if using module system, but kept commented for compatibility
/*
export {
    renderRepositories,
    showLoading,
    showError,
    hideError,
    showRateLimitWarning,
    updateStatsWithAnimation,
    initScrollEvents
};
*/