/**
 * Utility module - Contains helper functions
 * This module provides utility functions for string manipulation,
 * date formatting, and mathematical calculations.
 */

/**
 * Updates the cache status indicator
 * @param {boolean} fromCache - If data comes from cache
 * @param {string} timestamp - Cache timestamp (if available)
 */
function updateCacheIndicator(fromCache, timestamp = null) {
    const indicator = document.getElementById('cache-indicator');
    if (!indicator) return;
    
    if (fromCache) {
        let timeAgoText = '';
        let ttlText = '';
        
        if (timestamp) {
            // Calculate time since cache was created
            const cacheDate = new Date(timestamp);
            const now = new Date();
            const diffInHours = Math.floor((now - cacheDate) / (1000 * 60 * 60));
            
            if (diffInHours < 1) {
                timeAgoText = 'несколько минут назад';
            } else if (diffInHours < 24) {
                timeAgoText = `${diffInHours} час${diffInHours > 1 ? 'а' : ''} назад`;
            } else {
                const diffInDays = Math.floor(diffInHours / 24);
                timeAgoText = `${diffInDays} день${diffInDays > 1 ? 'а' : ''} назад`;
            }
            
            // Calculate time until cache expires
            const expiryTime = cacheDate.getTime() + cacheConfig.durations[cacheConfig.current];
            const timeToExpiry = expiryTime - now.getTime();
            
            if (timeToExpiry <= 0) {
                ttlText = '(истек)';
            } else {
                const hoursToExpiry = Math.floor(timeToExpiry / (1000 * 60 * 60));
                
                if (hoursToExpiry < 1) {
                    const minutesToExpiry = Math.floor(timeToExpiry / (1000 * 60));
                    ttlText = `(истекает через ${minutesToExpiry} мин)`;
                } else if (hoursToExpiry < 24) {
                    ttlText = `(истекает через ${hoursToExpiry} ч)`;
                } else {
                    const daysToExpiry = Math.floor(hoursToExpiry / 24);
                    ttlText = `(истекает через ${daysToExpiry} д)`;
                }
            }
        }
        
        indicator.innerHTML = `
            <div class="cache-info">
                <i class="fas fa-database"></i>
                <span>Кэшированные данные: ${timeAgoText} ${ttlText}</span>
            </div>
            <button class="cache-refresh-btn" title="Обновить данные из GitHub" onclick="refreshData()">
                <i class="fas fa-sync-alt"></i>
            </button>
        `;
        indicator.classList.add('is-cached');
    } else {
        indicator.innerHTML = `
            <div class="cache-info">
                <i class="fas fa-sync-alt"></i>
                <span>Up-to-date data</span>
            </div>
        `;
        indicator.classList.remove('is-cached');
    }
}

/**
 * Force refresh data from the API, bypassing cache
 */
function refreshData() {
    // Show a loading spinner in the refresh button
    const refreshBtn = document.querySelector('.cache-refresh-btn i');
    if (refreshBtn) {
        refreshBtn.classList.add('fa-spin');
    }
    
    // Show info toast
    showInfoToast('Обновление данных из GitHub...');
    
    // Clear the repository cache specifically
    localStorage.removeItem('eluna-repositories');
    
    // Re-fetch the data
    fetchRepositories().then(() => {
        // Stop the spinner when done
        if (refreshBtn) {
            refreshBtn.classList.remove('fa-spin');
        }
        
        // Show success toast
        showSuccessToast('Данные обновлены успешно!');
    }).catch(err => {
        console.error('Failed to refresh data:', err);
        // Stop the spinner even if there's an error
        if (refreshBtn) {
            refreshBtn.classList.remove('fa-spin');
        }
        
        // Show error toast
        showErrorToast('Failed to refresh data. Please try again later.');
    });
}

/**
 * Version modifiée de processRepositoryData pour utiliser le nouvel indicateur de cache
 * @param {Object} cachResult - Résultat du cache contenant data et timestamp
 */
async function processRepositoryData(cacheResult) {
    let repositories, timestamp;
    
    // Handle both object format and direct array
    if (cacheResult && cacheResult.data) {
        repositories = cacheResult.data;
        timestamp = cacheResult.timestamp;
        // Update the cache indicator to show we're using cached data
        updateCacheIndicator(true, timestamp);
    } else {
        repositories = cacheResult;
        // Update the cache indicator to show we're using fresh data
        updateCacheIndicator(false);
    }
       
    config.data.repositories = repositories;
    config.data.filteredRepositories = [...repositories];
    
    // Extract tags and authors for filters
    extractAllTags();
    populateAuthorsFilter();
    
    // Configure stars slider
    configureStarsSlider();
    
    updateStatsWithAnimation();
    
    sortRepositories();
    config.data.currentPage = 1;
    renderRepositories();
    
    showLoading(false);
}

/**
 * Modification de la fonction checkCache pour capturer le timestamp
 * @param {string} key - La clé de cache
 * @param {boolean} ignoreExpiry - Si l'expiration doit être ignorée
 * @returns {Object|null} - Les données en cache avec leur timestamp ou null
 */
function checkCache(key, ignoreExpiry = false) {
    try {
        const cachedItem = localStorage.getItem(key);
        if (!cachedItem) return null;
        
        const { data, timestamp } = JSON.parse(cachedItem);
        const now = new Date().getTime();
        
        // Use the configured cache duration
        const cacheDuration = cacheConfig.durations[cacheConfig.current];
        
        // Check if cache has expired
        if (!ignoreExpiry && now - timestamp > cacheDuration) {
            console.log(`Cache expired for ${key} (${cacheConfig.current} TTL: ${cacheDuration}ms)`);
            return null;
        }
        
        console.log(`Using cached data for ${key} with ${data.length} items`);
        
        // Return both data and timestamp
        return {
            data,
            timestamp
        };
    } catch (e) {
        console.error('Error reading from cache:', e);
        return null;
    }
}

/**
 * Sets the cache duration
 * @param {string} duration - The duration setting (short, medium, long, veryLong)
 */
function setCacheDuration(duration) {
    if (cacheConfig.durations[duration]) {
        cacheConfig.current = duration;
        // Store the user preference
        localStorage.setItem('cache-duration-preference', duration);
        console.log(`Cache duration set to ${duration}`);
        
        // Update the UI if we currently show cached data
        const indicator = document.getElementById('cache-indicator');
        if (indicator && indicator.classList.contains('is-cached')) {
            // Re-check the cache with the new duration
            const cacheResult = checkCache('eluna-repositories');
            if (cacheResult) {
                updateCacheIndicator(true, cacheResult.timestamp);
            } else {
                // If cache is now invalid with new duration, refresh
                refreshData();
            }
        }
        
        return true;
    }
    return false;
}

/**
 * Initialize cache settings from user's previous preference
 */
function initCacheSettings() {
    const savedPreference = localStorage.getItem('cache-duration-preference');
    if (savedPreference && cacheConfig.durations[savedPreference]) {
        cacheConfig.current = savedPreference;
        console.log(`Using saved cache duration preference: ${savedPreference}`);
    }
    
    createCacheSettingsUI();

    attachCacheSettingsEvents();
}

function attachCacheSettingsEvents() {
    setTimeout(() => {
        const indicator = document.getElementById('cache-indicator');
        
        if (indicator) {
            console.log('Adding click event to cache indicator');
            
            indicator.addEventListener('click', function(e) {
                if (!e.target.closest('.cache-refresh-btn')) {
                    console.log('Opening cache settings dialog');
                    const dialog = document.getElementById('cache-settings-dialog');
                    if (dialog) {
                        dialog.style.display = 'flex';
                    } else {
                        console.error('Cache settings dialog not found');
                        showErrorToast('Could not open settings');
                    }
                }
            });
            
            indicator.style.cursor = 'pointer';
        } else {
            console.error('Cache indicator element not found');
        }
    }, 500);
}

/**
 * Save cache settings and close dialog
 */
function saveCacheSettings() {
    // Save to localStorage
    localStorage.setItem('cache-duration-preference', cacheConfig.current);
    
    // Update UI if needed
    const indicator = document.getElementById('cache-indicator');
    if (indicator && indicator.classList.contains('is-cached')) {
        const cacheResult = checkCache('eluna-repositories');
        if (cacheResult) {
            updateCacheIndicator(true, cacheResult.timestamp);
        }
    }
    
    // Close dialog
    const dialog = document.getElementById('cache-settings-dialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
    
    // Show confirmation - UPDATED
    showSuccessToast('Настройки кэша сохранены!');
}

function clearAllCache() {
    // Clear only our app's cache keys
    const appCacheKeys = ['eluna-repositories', 'eluna-repository-icons', 'cache-duration-preference'];
    appCacheKeys.forEach(key => localStorage.removeItem(key));
    
    // Close dialog
    const dialog = document.getElementById('cache-settings-dialog');
    if (dialog) {
        dialog.style.display = 'none';
    }
    
    // Show confirmation - UPDATED
    showSuccessToast('Кэш очищен успешно!');
    
    // Refresh data
    refreshData();
}

/**
 * Saves data to cache
 * @param {string} key - The cache key
 * @param {Array} data - The data to cache
 */
function saveToCache(key, data) {
    try {
        const cacheItem = {
            data,
            timestamp: new Date().getTime()
        };
        localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (e) {
        console.error('Error saving to cache:', e);
    }
}

/**
 * Formats a repository name for display
 * @param {String} name - The raw repository name
 * @returns {String} - The formatted name
 */
function formatRepoName(name) {
    name = name.replace(/[-_]/g, ' ');
    
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Formats a date for display
 * @param {String} dateString - ISO format date string
 * @returns {String} - Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Calculates a progress percentage for a repository
 * @param {Object} repo - The repository data
 * @returns {Number} - Progress percentage (0-100)
 */
function calculateProgress(repo) {
    const updatedRecently = isRecentlyUpdated(repo.updated_at) ? 30 : 0;
    const hasTopics = (repo.topics && repo.topics.length > 0) ? 20 : 0;
    const hasDescription = repo.description ? 20 : 0;
    
    const maxStats = 100;
    const starWeight = 0.5;
    const forkWeight = 0.3;
    const watchWeight = 0.2;
    
    const starScore = Math.min(repo.stargazers_count * 5, maxStats) * starWeight;
    const forkScore = Math.min(repo.forks_count * 10, maxStats) * forkWeight;
    const watchScore = Math.min(repo.watchers_count * 2, maxStats) * watchWeight;
    
    const statsScore = (starScore + forkScore + watchScore) / (maxStats * (starWeight + forkWeight + watchWeight)) * 30;
    
    const totalProgress = updatedRecently + hasTopics + hasDescription + statsScore;
    return Math.round(totalProgress);
}

/**
 * Checks if a repository was updated recently
 * @param {String} dateString - ISO format date string
 * @returns {Boolean} - True if updated within the last 3 months
 */
function isRecentlyUpdated(dateString) {
    const updateDate = new Date(dateString);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return updateDate > threeMonthsAgo;
}

/**
 * Generates a hash code for a string
 * @param {String} str - The string to hash
 * @returns {Number} - The hash code
 */
function getHashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;  // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

/**
 * Debounces a function call
 * @param {Function} func - The function to debounce
 * @param {Number} wait - Wait time in ms
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Throttles a function call
 * @param {Function} func - The function to throttle
 * @param {Number} limit - Throttle limit in ms
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}