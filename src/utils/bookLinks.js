/**
 * Utility functions for generating book detail links
 */

// Production domain
const PRODUCTION_DOMAIN = 'https://www.vridhamma.org';

/**
 * Get the full book detail page URL
 * @param {string} sku - Book SKU
 * @returns {string} Full URL to book detail page
 */
export const getBookDetailUrl = (sku) => {
    if (!sku) return '';
    return `${PRODUCTION_DOMAIN}/bookDetail/${sku}`;
};

/**
 * Get the relative route for internal React Router navigation
 * @param {string} sku - Book SKU
 * @returns {string} Route path for React Router
 */
export const getBookDetailRoute = (sku) => {
    if (!sku) return '';
    return `/bookDetail/${sku}`;
};

/**
 * Generate share URLs for social media
 * @param {object} book - Book object with SKU, Title, Author
 * @returns {object} Object with share URLs for different platforms
 */
export const getShareUrls = (book) => {
    if (!book || !book.SKU) return {};

    const pageUrl = getBookDetailUrl(book.SKU);
    const encodedUrl = encodeURIComponent(pageUrl);
    const bookTitle = book.Title || '';
    const author = book.Author ? ` by ${book.Author}` : '';
    const shareMessage = `${bookTitle}${author}`;
    const encodedMessage = encodeURIComponent(shareMessage);

    return {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedMessage}`,
        whatsapp: `https://wa.me/?text=${encodedMessage}%0A${encodedUrl}`,
        email: `mailto:?subject=${encodedMessage}&body=Check out this book:%0A${pageUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedMessage}`,
        reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedMessage}`
    };
};

/**
 * Copy book link to clipboard
 * @param {string} sku - Book SKU
 * @returns {boolean} Success status
 */
export const copyBookLinkToClipboard = async (sku) => {
    try {
        const url = getBookDetailUrl(sku);
        await navigator.clipboard.writeText(url);
        return true;
    } catch (err) {
        console.error('Failed to copy link:', err);
        return false;
    }
};

/**
 * Open share URL in new window
 * @param {string} platform - Social platform (facebook, twitter, whatsapp, etc.)
 * @param {object} book - Book object
 */
export const openShareUrl = (platform, book) => {
    const shareUrls = getShareUrls(book);
    const url = shareUrls[platform];

    if (!url) return;

    if (platform === 'whatsapp' || platform === 'email') {
        window.open(url, '_blank');
    } else {
        window.open(url, '_blank', 'width=600,height=400');
    }
};

/**
 * Generate a QR code compatible link string
 * @param {string} sku - Book SKU
 * @returns {string} Full URL suitable for QR code generation
 */
export const getQRCodeUrl = (sku) => {
    return getBookDetailUrl(sku);
};

/**
 * Get book detail link with optional parameters
 * @param {string} sku - Book SKU
 * @param {object} params - Optional query parameters
 * @returns {string} URL with query parameters
 */
export const getBookDetailUrlWithParams = (sku, params = {}) => {
    const baseUrl = getBookDetailUrl(sku);
    if (!params || Object.keys(params).length === 0) return baseUrl;

    const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return `${baseUrl}?${queryString}`;
};
