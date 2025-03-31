/**
 * Filters module - Handles all filtering and sorting functionality
 * This module contains functions for filtering repositories by various criteria
 * and for sorting the results.
 */

/**
 * Initializes all filter-related event handlers and dropdowns
 */
function initFilters() {
    initSortDropdown();
    initTagsDropdown();
    initAuthorDropdown();
    initStarsDropdown();
    initDateDropdown();
    initClearFiltersButton();
    initSearchInput();
}

/**
 * Initializes the sort dropdown functionality
 */
function initSortDropdown() {
    const sortButton = document.querySelector(config.selectors.sortButton);
    const sortOptions = document.querySelector(config.selectors.sortOptions);
    const sortOptionButtons = document.querySelectorAll('.sort-option');
    
    if (sortButton && sortOptions) {
        sortButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(sortOptions);
            closeOtherDropdowns(sortOptions);
            adjustDropdownPosition(sortOptions);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest(config.selectors.sortButton) && 
                sortOptions.classList.contains('active')) {
                sortOptions.classList.remove('active');
            }
        });
        
        // Add event handlers to sort options
        sortOptionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sortValue = button.dataset.sort;
                const sortText = button.textContent;
                
                config.data.sortOption = sortValue;
                document.querySelector(config.selectors.sortText).textContent = sortText;
                
                sortOptions.classList.remove('active');
                
                sortRepositories();
                config.data.currentPage = 1;
                renderRepositories();
            });
        });
    }
}

/**
 * Initializes the tags dropdown functionality
 */
function initTagsDropdown() {
    const tagsButton = document.querySelector(config.selectors.tagsButton);
    const tagsOptions = document.querySelector(config.selectors.tagsOptions);
    const tagsSearchInput = document.querySelector(config.selectors.tagsSearchInput);
    
    if (tagsButton && tagsOptions) {
        tagsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(tagsOptions);
            closeOtherDropdowns(tagsOptions);
            adjustDropdownPosition(tagsOptions);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest(config.selectors.tagsButton) && 
                !event.target.closest(config.selectors.tagsOptions) && 
                tagsOptions.classList.contains('active')) {
                tagsOptions.classList.remove('active');
            }
        });
        
        // Add search functionality
        if (tagsSearchInput) {
            tagsSearchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                filterTagsList(searchTerm);
            });
        }
    }
}

/**
 * Initializes the author dropdown functionality
 */
function initAuthorDropdown() {
    const authorButton = document.querySelector(config.selectors.authorButton);
    const authorOptions = document.querySelector(config.selectors.authorOptions);
    const authorSearchInput = document.querySelector(config.selectors.authorSearchInput);
    
    if (authorButton && authorOptions) {
        authorButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(authorOptions);
            closeOtherDropdowns(authorOptions);
            adjustDropdownPosition(authorOptions);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest(config.selectors.authorButton) && 
                !event.target.closest(config.selectors.authorOptions) && 
                authorOptions.classList.contains('active')) {
                authorOptions.classList.remove('active');
            }
        });
        
        // Add search functionality
        if (authorSearchInput) {
            authorSearchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                filterAuthorList(searchTerm);
            });
        }
    }
}

/**
 * Initializes the stars dropdown functionality
 */
function initStarsDropdown() {
    const starsButton = document.querySelector(config.selectors.starsButton);
    const starsOptions = document.querySelector(config.selectors.starsOptions);
    const starsOptionButtons = document.querySelectorAll('.stars-option');
    
    if (starsButton && starsOptions) {
        starsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(starsOptions);
            closeOtherDropdowns(starsOptions);
            adjustDropdownPosition(starsOptions);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest(config.selectors.starsButton) && 
                starsOptions.classList.contains('active')) {
                starsOptions.classList.remove('active');
            }
        });
        
        // Add event handlers to stars options
        starsOptionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const starsValue = parseInt(button.dataset.stars);
                const starsText = button.textContent;
                
                config.data.filters.minStars = starsValue;
                document.querySelector(config.selectors.starsText).textContent = starsText;
                
                starsOptions.classList.remove('active');
                
                filterRepositories();
            });
        });
    }
}

/**
 * Initializes the date dropdown functionality
 */
function initDateDropdown() {
    const dateButton = document.querySelector(config.selectors.dateButton);
    const dateOptions = document.querySelector(config.selectors.dateOptions);
    const dateOptionButtons = document.querySelectorAll('.date-option');
    
    if (dateButton && dateOptions) {
        dateButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(dateOptions);
            closeOtherDropdowns(dateOptions);
            adjustDropdownPosition(dateOptions);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!event.target.closest(config.selectors.dateButton) && 
                dateOptions.classList.contains('active')) {
                dateOptions.classList.remove('active');
            }
        });
        
        // Add event handlers to date options
        dateOptionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const dateValue = button.dataset.date;
                const dateText = button.textContent;
                
                config.data.filters.updatedWithin = dateValue;
                document.querySelector(config.selectors.dateText).textContent = dateText;
                
                dateOptions.classList.remove('active');
                
                filterRepositories();
            });
        });
    }
}

/**
 * Initializes the clear filters button functionality
 */
function initClearFiltersButton() {
    const clearFiltersBtn = document.querySelector(config.selectors.clearAllFilters);
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            clearFilters();
        });
    }
}

/**
 * Initializes the search input functionality
 */
function initSearchInput() {
    const searchInput = document.querySelector(config.selectors.searchInput);
    
    if (searchInput) {
        let debounceTimeout;
        
        searchInput.addEventListener('input', (event) => {
            clearTimeout(debounceTimeout);
            
            debounceTimeout = setTimeout(() => {
                config.data.searchTerm = event.target.value.trim().toLowerCase();
                config.data.currentPage = 1;
                filterRepositories();
            }, 300);
        });
    }
}

/**
 * Toggles a dropdown menu's visibility
 * @param {HTMLElement} dropdown - The dropdown element to toggle
 */
function toggleDropdown(dropdown) {
    dropdown.classList.toggle('active');
}

/**
 * Closes all dropdown menus except the specified one
 * @param {HTMLElement} exceptDropdown - The dropdown to keep open
 */
function closeOtherDropdowns(exceptDropdown) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        if (dropdown !== exceptDropdown && dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
        }
    });
}

/**
 * Filters the tag list based on a search term
 * @param {string} searchTerm - The search term to filter by
 */
function filterTagsList(searchTerm) {
    const tagElements = document.querySelectorAll('.tag-option');
    
    tagElements.forEach(tag => {
        const tagName = tag.getAttribute('data-tag').toLowerCase();
        if (tagName.includes(searchTerm) || searchTerm === '' || tagName === 'all') {
            tag.style.display = 'flex';
        } else {
            tag.style.display = 'none';
        }
    });
}

/**
 * Filters the author list based on a search term
 * @param {string} searchTerm - The search term to filter by
 */
function filterAuthorList(searchTerm) {
    const authorElements = document.querySelectorAll('.author-option');
    
    authorElements.forEach(author => {
        const authorName = author.getAttribute('data-author').toLowerCase();
        if (authorName.includes(searchTerm) || searchTerm === '' || authorName === 'all') {
            author.style.display = 'flex';
        } else {
            author.style.display = 'none';
        }
    });
}

/**
 * Renders the list of tags in the tags dropdown
 */
function renderTagsList() {
    const tagsListContainer = document.querySelector(config.selectors.tagsList);
    
    if (!tagsListContainer) return;
    
    tagsListContainer.innerHTML = '';
    
    // Add "All Tags" option first
    const allTagsOption = document.createElement('div');
    allTagsOption.className = 'tag-option' + (config.data.activeTags.length === 0 ? ' active' : '');
    allTagsOption.setAttribute('data-tag', 'all');
    allTagsOption.innerHTML = `
        <div class="tag-checkbox">
            <i class="fas fa-check"></i>
        </div>
        <span>Все теги</span>
    `;
    
    allTagsOption.addEventListener('click', () => {
        config.data.activeTags = [];
        updateTagsSelection();
        filterRepositories();
        
        // Close dropdown after selection
        const tagsOptions = document.querySelector(config.selectors.tagsOptions);
        if (tagsOptions) {
            tagsOptions.classList.remove('active');
        }
    });
    
    tagsListContainer.appendChild(allTagsOption);
    
    // Add all available tags
    config.data.allTags.forEach(tag => {
        const tagCount = config.data.tagCounts[tag] || 0;
        const isActive = config.data.activeTags.includes(tag);
        
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-option' + (isActive ? ' active' : '');
        tagElement.setAttribute('data-tag', tag);
        tagElement.innerHTML = `
            <div class="tag-checkbox">
                <i class="fas fa-check"></i>
            </div>
            <span>${tag}</span>
            <span class="tag-count">${tagCount}</span>
        `;
        
        tagElement.addEventListener('click', () => {
            toggleTag(tag);
            
            // Close dropdown after selection on mobile
            if (window.innerWidth < 768) {
                const tagsOptions = document.querySelector(config.selectors.tagsOptions);
                if (tagsOptions) {
                    tagsOptions.classList.remove('active');
                }
            }
        });
        
        tagsListContainer.appendChild(tagElement);
    });
    
    // Limit the list height on small screens
    const windowHeight = window.innerHeight;
    if (windowHeight < 700) {
        tagsListContainer.style.maxHeight = `${windowHeight * 0.4}px`;
    } else {
        tagsListContainer.style.maxHeight = '230px'; // Default value
    }
}

/**
 * Toggles a tag's active state
 * @param {string} tag - The tag to toggle
 */
function toggleTag(tag) {
    const tagIndex = config.data.activeTags.indexOf(tag);
    
    if (tagIndex === -1) {
        config.data.activeTags.push(tag);
    } else {
        config.data.activeTags.splice(tagIndex, 1);
    }
    
    updateTagsSelection();
    filterRepositories();
}

/**
 * Updates the visual representation of selected tags
 */
function updateTagsSelection() {
    // Update button text
    const tagsText = document.querySelector(config.selectors.tagsText);
    if (tagsText) {
        if (config.data.activeTags.length === 0) {
            tagsText.textContent = 'Все теги';
        } else if (config.data.activeTags.length === 1) {
            tagsText.textContent = config.data.activeTags[0];
        } else {
            tagsText.textContent = `${config.data.activeTags.length} тегов`;
        }
    }
    
    // Update checkboxes
    const tagOptions = document.querySelectorAll('.tag-option');
    tagOptions.forEach(option => {
        const tag = option.getAttribute('data-tag');
        
        if (tag === 'all') {
            option.classList.toggle('active', config.data.activeTags.length === 0);
        } else {
            option.classList.toggle('active', config.data.activeTags.includes(tag));
        }
    });
}

/**
 * Extracts and counts all unique tags from repositories
 */
function extractAllTags() {
    const allTags = new Set();
    const tagCounts = {};
    
    config.data.repositories.forEach(repo => {
        const repoTags = repo.topics || [];
        
        repoTags.forEach(tag => {
            allTags.add(tag);
            
            if (tagCounts[tag]) {
                tagCounts[tag]++;
            } else {
                tagCounts[tag] = 1;
            }
        });
    });
    
    config.data.allTags = Array.from(allTags).sort();
    config.data.tagCounts = tagCounts;
    
    renderTagsList();
}

/**
 * Sorts repositories according to the selected sort option
 */
function sortRepositories() {
    switch (config.data.sortOption) {
        case 'stars':
            config.data.filteredRepositories.sort((a, b) => b.stargazers_count - a.stargazers_count);
            break;
        case 'forks':
            config.data.filteredRepositories.sort((a, b) => b.forks_count - a.forks_count);
            break;
        case 'newest':
            config.data.filteredRepositories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'updated':
            config.data.filteredRepositories.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            break;
        default:
            config.data.filteredRepositories.sort((a, b) => b.stargazers_count - a.stargazers_count);
    }
}

/**
 * Filters repositories based on all active filters
 */
function filterRepositories() {
    // Start with all repositories
    let filtered = [...config.data.repositories];
    
    // Filter by search term
    if (config.data.searchTerm) {
        filtered = filtered.filter(repo => {
            return (
                repo.name.toLowerCase().includes(config.data.searchTerm) ||
                (repo.description && repo.description.toLowerCase().includes(config.data.searchTerm)) ||
                repo.owner.login.toLowerCase().includes(config.data.searchTerm) ||
                (repo.topics && repo.topics.some(topic => topic.toLowerCase().includes(config.data.searchTerm)))
            );
        });
    }
    
    // Filter by active tags
    if (config.data.activeTags.length > 0) {
        filtered = filtered.filter(repo => {
            const repoTags = repo.topics || [];
            return config.data.activeTags.some(tag => repoTags.includes(tag));
        });
    }
    
    // Filter by author
    if (config.data.filters.author) {
        filtered = filtered.filter(repo => repo.owner.login === config.data.filters.author);
    }
    
    // Filter by minimum stars
    if (config.data.filters.minStars > 0) {
        filtered = filtered.filter(repo => repo.stargazers_count >= config.data.filters.minStars);
    }
    
    // Filter by update date
    if (config.data.filters.updatedWithin !== 'any') {
        const now = new Date();
        let cutoffDate;
        
        switch (config.data.filters.updatedWithin) {
            case 'week':
                cutoffDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'quarter':
                cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case 'year':
                cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                cutoffDate = null;
        }
        
        if (cutoffDate) {
            filtered = filtered.filter(repo => {
                const updatedAt = new Date(repo.updated_at);
                return updatedAt >= cutoffDate;
            });
        }
    }
    
    config.data.filteredRepositories = filtered;
    sortRepositories();
    config.data.currentPage = 1;
    renderRepositories();
}

/**
 * Clears all active filters
 */
function clearFilters() {
    // Reset filter values
    config.data.filters = {
        author: '',
        minStars: 0,
        updatedWithin: 'any'
    };
    
    // Reset active tags
    config.data.activeTags = [];
    updateTagsSelection();
    
    // Clear search term
    config.data.searchTerm = '';
    const searchInput = document.querySelector(config.selectors.searchInput);
    if (searchInput) searchInput.value = '';
    
    // Reset UI elements
    document.querySelector(config.selectors.authorText).textContent = 'Все авторы';
    document.querySelector(config.selectors.starsText).textContent = 'Все звезды';
    document.querySelector(config.selectors.dateText).textContent = 'Любое время';
    
    // Apply reset filters
    filterRepositories();
}

/**
 * Adjusts a dropdown's position to ensure it's visible
 * @param {HTMLElement} dropdown - The dropdown element to adjust
 */
function adjustDropdownPosition(dropdown) {
    if (!dropdown) return;
    
    // Get dimensions and positions
    const rect = dropdown.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // Prevent dropdown from extending below viewport
    if (rect.bottom > windowHeight) {
        const overflow = rect.bottom - windowHeight;
        dropdown.style.maxHeight = `${rect.height - overflow - 20}px`; // 20px margin
    }
    
    // Center horizontally on mobile
    if (windowWidth < 768) {
        dropdown.style.left = '50%';
        dropdown.style.right = 'auto';
        dropdown.style.transform = 'translateX(-50%)';
    } else {
        // Ensure it doesn't extend beyond right edge on desktop
        if (rect.right > windowWidth) {
            dropdown.style.right = '0';
            dropdown.style.left = 'auto';
        }
    }
}

// Add window resize event listener for dropdown positioning
window.addEventListener('resize', () => {
    const activeDropdowns = document.querySelectorAll('.dropdown-menu.active');
    activeDropdowns.forEach(dropdown => {
        adjustDropdownPosition(dropdown);
    });
});

// Export functions for use in other modules
// This is needed if using module system, but kept commented for compatibility
/*
export {
    initFilters,
    sortRepositories,
    filterRepositories,
    clearFilters,
    extractAllTags,
    renderTagsList,
    updateTagsSelection
};
*/