/**
 * Main application entry point
 * Initializes the application and handles document ready events
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    initScrollEvents();
    initFilters();
    initCacheSettings();
    
    // Fetch repositories data
    fetchRepositories();

    // Add window resize handler for responsive adjustments
    window.addEventListener('resize', debounce(() => {
        const activeDropdowns = document.querySelectorAll('.dropdown-menu.active');
        activeDropdowns.forEach(dropdown => {
            adjustDropdownPosition(dropdown);
        });
    }, 200));
});