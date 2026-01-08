/**
 * Custom Hook: useBookNavigation
 * Provides navigation to book detail pages with error handling
 */

import { useNavigate } from 'react-router-dom';
import { fetchBookBySKU, validateSKU } from '../services/bookApi';

export const useBookNavigation = () => {
    const navigate = useNavigate();

    /**
     * Navigate to book detail page by SKU
     * @param {string} sku - Book SKU identifier
     * @param {object} options - Navigation options
     * @param {boolean} options.withState - Include book data in navigation state
     * @param {boolean} options.replace - Replace history instead of push
     * @param {string} options.ref - Referrer/source tracking
     */
    const goToBook = async (sku, options = {}) => {
        try {
            if (!sku) {
                console.error('SKU is required');
                return false;
            }

            // Validate SKU exists
            const isValid = await validateSKU(sku);
            if (!isValid) {
                console.error(`Invalid SKU: ${sku}`);
                return false;
            }

            // Build path with optional query parameters
            let path = `/bookDetail/${sku}`;
            if (options.ref) {
                path += `?ref=${encodeURIComponent(options.ref)}`;
            }

            // Fetch book data if needed for state
            let state = undefined;
            if (options.withState) {
                try {
                    const book = await fetchBookBySKU(sku);
                    state = { book };
                } catch (err) {
                    console.warn('Could not fetch book data for state:', err);
                }
            }

            // Navigate
            navigate(path, {
                replace: options.replace || false,
                state
            });

            return true;
        } catch (error) {
            console.error('Navigation error:', error);
            return false;
        }
    };

    /**
     * Navigate to book by SKU with tracking
     * @param {string} sku - Book SKU
     * @param {string} source - Traffic source (e.g., 'search', 'recommendation', 'social')
     */
    const goToBookWithTracking = (sku, source = 'direct') => {
        return goToBook(sku, { ref: source });
    };

    /**
     * Generate shareable link for a book
     * @param {string} sku - Book SKU
     * @param {object} params - Optional query parameters
     * @returns {string} Full URL with tracking parameters
     */
    const getShareLink = (sku, params = {}) => {
        if (!sku) {
            console.error('SKU is required');
            return '';
        }

        const domain = window.location.origin;
        let url = `${domain}/bookDetail/${sku}`;

        // Add query parameters if provided
        if (Object.keys(params).length > 0) {
            const queryString = Object.entries(params)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
            url += `?${queryString}`;
        }

        console.log('📤 Generated Share Link:', url);
        return url;
    };

    /**
     * Generate shareable link with tracking for a specific platform
     * @param {string} sku - Book SKU
     * @param {string} platform - Platform name (whatsapp, facebook, twitter, email, linkedin)
     * @returns {string} Full URL with platform tracking
     */
    const getShareLinkWithTracking = (sku, platform = 'direct') => {
        return getShareLink(sku, {
            utm_source: platform,
            utm_medium: 'social',
            utm_campaign: 'book_share'
        });
    };

    return {
        goToBook,
        goToBookWithTracking,
        getShareLink,
        getShareLinkWithTracking
    };
};
