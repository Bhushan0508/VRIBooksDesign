/**
 * Book API Service
 * Provides functions to interact with book data and navigation
 */

/**
 * Fetch book by SKU identifier
 * @param {string} sku - Book SKU identifier (e.g., 'E03', 'M01', 'E03-Pf')
 * @returns {Promise<object|null>} Book object or null if not found
 */
export const fetchBookBySKU = async (sku) => {
    try {
        if (!sku) {
            throw new Error('SKU is required');
        }

        // Try to get from sessionStorage first
        const cachedData = sessionStorage.getItem('booksData');
        if (cachedData) {
            try {
                const data = JSON.parse(cachedData);
                const book = data.find(b => String(b.SKU) === String(sku));
                if (book) {
                    return book;
                }
            } catch (err) {
                console.warn('Error parsing cached data:', err);
            }
        }

        // Fetch from API if not in cache
        const response = await fetch('/api/get-books-info');
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const book = data.find(b => String(b.SKU) === String(sku));

        // Cache the data
        sessionStorage.setItem('booksData', JSON.stringify(data));
        sessionStorage.setItem('booksDataTimestamp', Date.now().toString());

        if (!book) {
            throw new Error(`Book with SKU "${sku}" not found`);
        }

        return book;
    } catch (error) {
        console.error('Error fetching book:', error);
        throw error;
    }
};

/**
 * Fetch all books
 * @returns {Promise<array>} Array of all books
 */
export const fetchAllBooks = async () => {
    try {
        // Try to get from sessionStorage first
        const cachedData = sessionStorage.getItem('booksData');
        const cacheTimestamp = sessionStorage.getItem('booksDataTimestamp');
        const now = Date.now();
        const cacheExpiry = 30 * 60 * 1000; // 30 minutes

        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
            return JSON.parse(cachedData);
        }

        // Fetch from API
        const response = await fetch('/api/get-books-info');
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Cache the data
        sessionStorage.setItem('booksData', JSON.stringify(data));
        sessionStorage.setItem('booksDataTimestamp', now.toString());

        return data;
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
};

/**
 * Search books by title, author, or language
 * @param {string} query - Search query
 * @param {string} searchType - Type of search: 'all', 'title', 'author', 'language'
 * @returns {Promise<array>} Array of matching books
 */
export const searchBooks = async (query, searchType = 'all') => {
    try {
        if (!query) {
            return await fetchAllBooks();
        }

        const books = await fetchAllBooks();
        const lowerQuery = query.toLowerCase();

        return books.filter(book => {
            switch (searchType) {
                case 'title':
                    return book.Title?.toLowerCase().includes(lowerQuery);
                case 'author':
                    return book.Author?.toLowerCase().includes(lowerQuery);
                case 'language':
                    return book.Language?.toLowerCase().includes(lowerQuery);
                case 'all':
                default:
                    return (
                        book.Title?.toLowerCase().includes(lowerQuery) ||
                        book.Author?.toLowerCase().includes(lowerQuery) ||
                        book.Language?.toLowerCase().includes(lowerQuery) ||
                        book.SKU?.toLowerCase().includes(lowerQuery)
                    );
            }
        });
    } catch (error) {
        console.error('Error searching books:', error);
        throw error;
    }
};

/**
 * Get books available in specific language
 * @param {string} language - Language name (e.g., 'English', 'Marathi')
 * @returns {Promise<array>} Array of books in that language
 */
export const getBooksByLanguage = async (language) => {
    try {
        const books = await fetchAllBooks();
        return books.filter(book => book.Language === language);
    } catch (error) {
        console.error('Error fetching books by language:', error);
        throw error;
    }
};

/**
 * Get all unique languages available
 * @returns {Promise<array>} Array of language names
 */
export const getAvailableLanguages = async () => {
    try {
        const books = await fetchAllBooks();
        const languages = [...new Set(books.map(b => b.Language).filter(Boolean))];
        return languages.sort();
    } catch (error) {
        console.error('Error fetching languages:', error);
        throw error;
    }
};

/**
 * Get all available book SKUs
 * @returns {Promise<array>} Array of SKU strings
 */
export const getAvailableSKUs = async () => {
    try {
        const books = await fetchAllBooks();
        return books.map(b => b.SKU).filter(Boolean);
    } catch (error) {
        console.error('Error fetching SKUs:', error);
        throw error;
    }
};

/**
 * Validate if a SKU exists
 * @param {string} sku - Book SKU identifier
 * @returns {Promise<boolean>} True if SKU exists
 */
export const validateSKU = async (sku) => {
    try {
        if (!sku) return false;
        const book = await fetchBookBySKU(sku);
        return !!book;
    } catch (error) {
        return false;
    }
};

/**
 * Get books by author
 * @param {string} author - Author name
 * @returns {Promise<array>} Array of books by that author
 */
export const getBooksByAuthor = async (author) => {
    try {
        const books = await fetchAllBooks();
        return books.filter(book => book.Author === author);
    } catch (error) {
        console.error('Error fetching books by author:', error);
        throw error;
    }
};

/**
 * Get all unique authors
 * @returns {Promise<array>} Array of author names
 */
export const getAvailableAuthors = async () => {
    try {
        const books = await fetchAllBooks();
        const authors = [...new Set(books.map(b => b.Author).filter(Boolean))];
        return authors.sort();
    } catch (error) {
        console.error('Error fetching authors:', error);
        throw error;
    }
};
