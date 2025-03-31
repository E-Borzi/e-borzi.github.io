/**
 * Toast notification system
 * Displays temporary notifications to inform users about actions
 */

// Create a toast container if it doesn't exist yet
function ensureToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return document.getElementById('toast-container');
}

/**
 * Show a temporary toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info, warning)
 * @param {number} duration - How long to show the toast in ms
 */
function showToast(message, type = 'success', duration = 3000) {
    // Get or create the toast container
    const container = ensureToastContainer();
    
    // Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    
    // Create icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        case 'info':
        default:
            icon = '<i class="fas fa-info-circle"></i>';
            break;
    }
    
    // Set toast content
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to container
    container.appendChild(toast);
    
    // Add close button event listener
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    });
    
    // Show toast with animation
    setTimeout(() => toast.classList.add('visible'), 10);
    
    // Hide after duration
    if (duration > 0) {
        setTimeout(() => {
            // Only remove if it still exists
            if (document.body.contains(toast)) {
                toast.classList.remove('visible');
                setTimeout(() => {
                    if (document.body.contains(toast)) {
                        toast.remove();
                    }
                }, 300);
            }
        }, duration);
    }
    
    return toast;
}

/**
 * Show a success toast
 * @param {string} message - Message to display
 * @param {number} duration - How long to show the toast in ms
 */
function showSuccessToast(message, duration = 3000) {
    return showToast(message, 'success', duration);
}

/**
 * Show an error toast
 * @param {string} message - Message to display
 * @param {number} duration - How long to show the toast in ms
 */
function showErrorToast(message, duration = 4000) {
    return showToast(message, 'error', duration);
}

/**
 * Show an info toast
 * @param {string} message - Message to display
 * @param {number} duration - How long to show the toast in ms
 */
function showInfoToast(message, duration = 3000) {
    return showToast(message, 'info', duration);
}

/**
 * Show a warning toast
 * @param {string} message - Message to display
 * @param {number} duration - How long to show the toast in ms
 */
function showWarningToast(message, duration = 3500) {
    return showToast(message, 'warning', duration);
}