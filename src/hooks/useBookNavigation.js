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

    return {
        goToBook,
        goToBookWithTracking
    };
};
