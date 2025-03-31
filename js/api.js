/**
 * API module - Handles all API interactions
 * This module contains functions for fetching data from the GitHub API
 * Optimized version to reduce API calls and improve performance
 */

/**
 * Fetches repositories from the GitHub API with caching
 * Simplified to prioritize performance and avoid rate limits
 */
async function fetchRepositories() {
    try {
        showLoading(true);
        hideError();
        
        // Check cache first
        const cacheResult = checkCache('eluna-repositories');
        if (cacheResult) {
            processRepositoryData(cacheResult);
            return;
        }
        
        // Construct the search query
        const query = `user:${config.api.githubUser} fork:true`;
        const url = new URL(config.api.githubApiUrl);
        url.searchParams.append('q', query);
        url.searchParams.append('sort', 'updated');
        url.searchParams.append('order', 'desc');
        url.searchParams.append('per_page', config.api.perPage);
        
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error('Failed to fetch repositories from GitHub API');
        }
        
        const data = await response.json();
        const repositories = data.items || [];
        
        if (!repositories || repositories.length === 0) {
            throw new Error('No repositories found.');
        }
        
        // Get additional data for each repository
        const enrichedRepositories = await Promise.all(repositories.map(async (repo) => {
            try {
                // Get languages
                const languagesUrl = `https://api.github.com/repos/${repo.owner.login}/${repo.name}/languages`;
                const languagesResponse = await fetch(languagesUrl);
                const languages = await languagesResponse.json();
                
                // Get topics
                const topicsUrl = `https://api.github.com/repos/${repo.owner.login}/${repo.name}/topics`;
                const topicsResponse = await fetch(topicsUrl, {
                    headers: {
                        'Accept': 'application/vnd.github.mercy-preview+json'
                    }
                });
                const topicsData = await topicsResponse.json();
                
                return {
                    ...repo,
                    languages,
                    topics: topicsData.names || []
                };
            } catch (error) {
                console.error(`Error fetching additional data for ${repo.name}:`, error);
                return {
                    ...repo,
                    languages: {},
                    topics: []
                };
            }
        }));
        
        // Save to cache
        saveToCache('eluna-repositories', enrichedRepositories);
        
        // Process the data
        processRepositoryData({ 
            data: enrichedRepositories,
            timestamp: new Date().getTime()
        });
        
    } catch (error) {
        console.error('Error fetching repositories:', error);
        // Try to use cached data on error
        const expiredCacheResult = checkCache('eluna-repositories', true);
        if (expiredCacheResult) {
            processRepositoryData(expiredCacheResult);
            showRateLimitWarning();
        } else {
            showError(error.message);
        }
    } finally {
        showLoading(false);
    }
}

/**
 * Configures the stars slider based on repository data
 */
function configureStarsSlider() {
    const starsSlider = document.querySelector('#stars-slider');
    if (!starsSlider) return;
    
    // Find the maximum number of stars
    const maxStars = Math.max(...config.data.repositories.map(repo => repo.stargazers_count));
    
    // Round up to the nearest 10
    const roundedMax = Math.ceil(maxStars / 10) * 10;
    
    // Update slider max attribute
    starsSlider.setAttribute('max', roundedMax);
    starsSlider.setAttribute('step', Math.max(1, Math.floor(roundedMax / 100)));
}

/**
 * Populates the authors filter with unique repository authors
 */
function populateAuthorsFilter() {
    const authorList = document.querySelector(config.selectors.authorList);
    if (!authorList) return;
    
    // Extract unique authors
    const authors = new Set();
    config.data.repositories.forEach(repo => {
        if (repo.owner && repo.owner.login) {
            authors.add(repo.owner.login);
        }
    });
    
    // Sort alphabetically
    const sortedAuthors = Array.from(authors).sort();
    
    // Clear the list
    authorList.innerHTML = '';
    
    // Add "All Authors" option
    const allAuthorsOption = document.createElement('div');
    allAuthorsOption.className = 'author-option active';
    allAuthorsOption.setAttribute('data-author', 'all');
    allAuthorsOption.innerHTML = `
        <div class="author-checkbox">
            <i class="fas fa-check"></i>
        </div>
        <span>All Authors</span>
    `;
    
    allAuthorsOption.addEventListener('click', () => {
        config.data.filters.author = '';
        document.querySelector(config.selectors.authorText).textContent = 'All Authors';
        
        // Update UI
        document.querySelectorAll('.author-option').forEach(option => {
            option.classList.toggle('active', option.getAttribute('data-author') === 'all');
        });
        
        filterRepositories();
        
        // Close dropdown
        const authorOptions = document.querySelector(config.selectors.authorOptions);
        if (authorOptions) {
            authorOptions.classList.remove('active');
        }
    });
    
    authorList.appendChild(allAuthorsOption);
    
    // Add all authors
    sortedAuthors.forEach(author => {
        const authorOption = document.createElement('div');
        authorOption.className = 'author-option';
        authorOption.setAttribute('data-author', author);
        authorOption.innerHTML = `
            <div class="author-checkbox">
                <i class="fas fa-check"></i>
            </div>
            <span>${author}</span>
        `;
        
        authorOption.addEventListener('click', () => {
            config.data.filters.author = author;
            document.querySelector(config.selectors.authorText).textContent = author;
            
            // Update UI
            document.querySelectorAll('.author-option').forEach(option => {
                option.classList.toggle('active', option.getAttribute('data-author') === author);
            });
            
            filterRepositories();
            
            // Close dropdown
            const authorOptions = document.querySelector(config.selectors.authorOptions);
            if (authorOptions) {
                authorOptions.classList.remove('active');
            }
        });
        
        authorList.appendChild(authorOption);
    });
}