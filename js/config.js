/**
 * Global configuration object for the Eluna Scripts application
 * Contains all the configuration parameters, selectors, and state variables
 */
const config = {
    // API Configuration
    api: {
        githubApiUrl: 'https://api.github.com/search/repositories',
        githubUser: 'ElementoBorzi',
        perPage: 100
    },
    
    // Repository data storage
    data: {
        repositories: [],
        filteredRepositories: [],
        currentPage: 1,
        totalPages: 1,
        searchTerm: '',
        sortOption: 'stars',
        
        // Tag-related data
        activeTags: [],
        allTags: [],
        tagCounts: {},
        
        // Filter settings
        filters: {
            author: null,
            minStars: 0,
            updatedWithin: 'any'
        }
    },
    
    // Visual elements configuration
    ui: {
        // Repository icon patterns to look for
        iconPatterns: [
            'icon.png', 'icon.jpg', 'icon.jpeg', 'icon.webp', 
            'logo.png', 'logo.jpg', 'logo.jpeg', 'logo.webp',
            'preview.png', 'preview.jpg', 'preview.jpeg', 'preview.webp', 
            'screenshot.png', 'screenshot.jpg', 'screenshot.jpeg', 'screenshot.webp'
        ],
        
        // Background color gradients for generated backgrounds
        backgroundColors: [
            // Blue-gray gradients
            ['#1a1a2e', '#16213e'],
            ['#0f0f1a', '#1f2037'],
            ['#171720', '#21212f'],
            ['#1e222a', '#252b34'],
            ['#121218', '#1a1a24'],
            // Silver-gray gradients
            ['#1e1e24', '#2d2d35'],
            ['#16161a', '#26262e'],
            ['#101018', '#202030'],
            ['#1c1c22', '#2a2a32'],
            ['#131320', '#1f1f30']
        ],
        
        // Shape options for generated backgrounds
        backgroundShapes: [
            'circle',
            'square',
            'triangle',
            'diamond',
            'hexagon'
        ]
    },
    
    // DOM selectors
    selectors: {
        // Navigation
        navbar: '#navbar',
        mobileMenuToggle: '#menu-toggle',
        mobileMenu: '#mobile-menu',
        
        // Search and filtering
        searchInput: '#search-input',
        sortButton: '#sort-button',
        sortOptions: '#sort-options',
        sortText: '#sort-text',
        tagsButton: '#tags-button',
        tagsOptions: '#tags-options',
        tagsText: '#tags-text',
        tagsList: '#tags-list',
        tagsSearchInput: '#tags-search-input',
        authorButton: '#author-button',
        authorOptions: '#author-options',
        authorText: '#author-text',
        authorList: '#author-list',
        authorSearchInput: '#author-search-input',
        starsButton: '#stars-button',
        starsOptions: '#stars-options',
        starsText: '#stars-text',
        dateButton: '#date-button',
        dateOptions: '#date-options',
        dateText: '#date-text',
        
        // Filter section
        filtersSection: '#filters-section',
        filtersContent: '#filters-content',
        clearAllFilters: '#clear-all-filters',
        
        // Main content
        scriptsContainer: '#scripts-container',
        loadingContainer: '#loading-container',
        errorContainer: '#error-container',
        errorMessage: '#error-message',
        retryButton: '#retry-button',
        noResults: '#no-results',
        pagination: '#pagination',
        
        // Statistics
        repositoriesCount: '#repositories-count',
        contributorsCount: '#contributors-count',
        starsCount: '#stars-count',
        
        // Misc
        backToTop: '#back-to-top'
    }
};

const cacheConfig = {
    durations: {
        short: 30 * 60 * 1000,              // 30 minutes
        medium: 6 * 60 * 60 * 1000,         // 6 hours
        long: 24 * 60 * 60 * 1000,          // 24 hours (1 day)
        veryLong: 7 * 24 * 60 * 60 * 1000   // 7 days
    },

    // Current setting (defaults to medium)
    current: 'medium'
};

// Export the config object for use in other modules
// This is needed if using module system, but kept commented for compatibility
// export default config;