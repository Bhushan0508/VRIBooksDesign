import { useParams, Link, useLocation, useSearchParams } from "react-router-dom"
import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import styles from './BookDetails.module.css'
import purchaseLinksMap from '../purchaseLinksMap.json'
import { useBookNavigation } from '../hooks/useBookNavigation'

function BookDetails () {
    const { sku } = useParams()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const { getShareLinkWithTracking } = useBookNavigation()
    const [book, setBook] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [allBooks, setAllBooks] = useState([])
    const [isZoomed, setIsZoomed] = useState(false)
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
    const [showMagnifier, setShowMagnifier] = useState(false)
    const [trackingSource, setTrackingSource] = useState('')

    // Helper: Get query parameters for tracking
    const getTrackingParams = () => {
        const params = {};
        for (let [key, value] of searchParams.entries()) {
            params[key] = value;
        }
        if (Object.keys(params).length > 0) {
            setTrackingSource(params.utm_source || params.ref || 'direct');
        }
        return params;
    };

    // Helper: Normalize ISBN for matching
    const normalizeISBN = (isbn) => {
        if (!isbn) return '';
        return isbn.replace(/[-\s]/g, '');
    };

    // Helper: Get purchase links by ISBN from sessionStorage
    const getPurchaseLinks = (isbn) => {
        if (!isbn) return [];

        const purchaseLinksData = JSON.parse(sessionStorage.getItem('purchaseLinksMap') || '{}');
        
        // Try exact match
        let links = purchaseLinksData[isbn];

        // Try normalized match
        if (!links) {
            const normalized = normalizeISBN(isbn);
            for (const key in purchaseLinksData) {
                if (normalizeISBN(key) === normalized) {
                    links = purchaseLinksData[key];
                    break;
                }
            }
        }

        return links || [];
    };

    // Helper: Format price
    const formatPrice = (price) => {
        if (!price) return 'Price not available';
        return `₹${(price / 100).toFixed(2)}`;
    };

    // Helper: Estimate file size
    const estimateFileSize = (pages) => {
        if (!pages) return 'N/A';
        const sizeKB = Math.round(pages * 0.5);
        if (sizeKB > 1024) {
            return `${(sizeKB / 1024).toFixed(1)} MB`;
        }
        return `${sizeKB} KB`;
    };

    // Helper: Get file format from URL
    const getFileFormat = (url) => {
        if (!url) return 'FILE';
        const extension = url.toLowerCase().split('.').pop().split('?')[0];
        if (extension === 'pdf') return 'PDF';
        if (extension === 'epub') return 'EPUB';
        return extension.toUpperCase() || 'FILE';
    };

    // Helper: Get related books
    const getRelatedBooks = (currentBook, allBooks) => {
        return allBooks
            .filter(b =>
                b.SKU !== currentBook.SKU &&
                (b.Language === currentBook.Language || b.Author === currentBook.Author) &&
                b.Images && b.Images.length > 0
            )
            .slice(0, 6);
    };

    // Helper: Extract base ISBN (remove format suffix like -Pf, -Eb)
    const getBaseISBN = (isbn) => {
        if (!isbn) return '';
        // Normalize by removing hyphens and taking the main part
        return isbn.replace(/[-\s]/g, '').trim();
    };

    // Helper: Extract base title (remove format and language info in parentheses)
    const getBaseTitle = (title) => {
        if (!title) return '';
        return title.replace(/\s*\([^)]*\)\s*$/g, '').trim();
    };

    // Helper: Get available languages for current book (unique by language)
    const getAvailableLanguages = (currentBook, allBooks) => {
        // Match by author and similar base title (first word match)
        const currentWords = getBaseTitle(currentBook.Title).toLowerCase().split(/\s+/);
        const firstWord = currentWords[0];
        
        const sameBooks = allBooks.filter(b => {
            const otherTitle = getBaseTitle(b.Title);
            const otherWords = otherTitle.toLowerCase().split(/\s+/);
            return b.Author === currentBook.Author && otherWords[0] === firstWord;
        });
        
        // Remove duplicates by language, keeping only one per language
        const languageMap = {};
        sameBooks.forEach(book => {
            if (book.Language && !languageMap[book.Language]) {
                languageMap[book.Language] = book;
            }
        });
        
        const uniqueBooks = Object.values(languageMap);
        uniqueBooks.sort((a, b) => (a.Language || '').localeCompare(b.Language || ''));
        return uniqueBooks;
    };

    // Helper: Handle share with tracking parameters using useBookNavigation
    const handleShare = (platform, book) => {
        console.log(`📤 Share clicked for ${platform}:`, book);
        
        // Get share link with platform tracking from hook
        const shareUrl = getShareLinkWithTracking(book.SKU, platform);
        console.log('🔗 Share URL:', shareUrl);
        
        const encodedUrl = encodeURIComponent(shareUrl);
        console.log('📝 Encoded URL:', encodedUrl);
        
        const bookTitle = book.Title;
        const author = book.Author ? ` by ${book.Author}` : '';
        const shareMessage = `${bookTitle}${author}`;
        const encodedMessage = encodeURIComponent(shareMessage);
        console.log('💬 Share Message:', shareMessage);

        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedMessage}`,
            whatsapp: `https://wa.me/?text=${encodedMessage}%0A${encodedUrl}`,
            email: `mailto:?subject=${encodedMessage}&body=Check out this book:%0A${shareUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedMessage}`,
            reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedMessage}`
        };

        console.log('🌐 Platform URLs:', shareUrls);
        console.log(`📲 Opening ${platform} with:`, shareUrls[platform]);

        if (shareUrls[platform]) {
            if (platform === 'whatsapp' || platform === 'email') {
                window.open(shareUrls[platform], '_blank');
            } else {
                window.open(shareUrls[platform], '_blank', 'width=600,height=400');
            }
        }
    };

    // Helper: Handle copy link using useBookNavigation
    const handleCopyLink = async (withTracking = false) => {
        let urlToCopy;
        if (withTracking) {
            urlToCopy = getShareLinkWithTracking(book.SKU, 'copy_paste');
        } else {
            // Copy basic link without tracking
            const domain = window.location.origin;
            urlToCopy = `${domain}/bookDetail/${book.SKU}`;
        }
        
        try {
            await navigator.clipboard.writeText(urlToCopy);
            alert('Link copied to clipboard!');
        } catch (err) {
            alert('Failed to copy link');
        }
    };

    // Helper: Handle image zoom on mouse move
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    useEffect(() => {
        let mounted = true

        // Check if data was passed via navigation state
        if (location.state?.book && location.state?.allBooks) {
            console.log('✅ Using book data from navigation state');
            setBook(location.state.book)
            setAllBooks(location.state.allBooks)
            setLoading(false)
            setSelectedImage(0) // Reset image selection
            return
        }

        // Try to get data from sessionStorage first
        const cachedData = sessionStorage.getItem('booksData');
        const cacheTimestamp = sessionStorage.getItem('booksDataTimestamp');
        const now = Date.now();
        const cacheExpiry = 30 * 60 * 1000; // 30 minutes

        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < cacheExpiry) {
            try {
                console.log('✅ Using cached data from sessionStorage');
                const data = JSON.parse(cachedData);
                setAllBooks(data);
                const found = data.find(b => String(b.SKU) === String(sku));
                if (found) {
                    setBook(found);
                    setLoading(false);
                    setSelectedImage(0);
                    return;
                } else {
                    console.warn(`⚠️  Book with SKU ${sku} not found in cache, fetching from API...`);
                }
            } catch (err) {
                console.error('❌ Error parsing cached data:', err);
            }
        }

        // Fallback: Fetch data from API if not in cache or not found
        async function load() {
            setLoading(true);
            let retryCount = 0;
            const maxRetries = 3;

            const fetchBooks = async () => {
                try {
                    console.log(`📡 Fetching books from API (attempt ${retryCount + 1}/${maxRetries})...`);
                    const res = await fetch('/api/get-books-info');
                    
                    if (!res.ok) {
                        throw new Error(`API returned status ${res.status}`);
                    }
                    
                    const data = await res.json();
                    
                    if (!Array.isArray(data)) {
                        throw new Error('API returned invalid data format');
                    }
                    
                    if (!mounted) return;

                    console.log(`✅ Successfully fetched ${data.length} books from API`);
                    
                    // Store in sessionStorage
                    sessionStorage.setItem('booksData', JSON.stringify(data));
                    sessionStorage.setItem('booksDataTimestamp', now.toString());
                    // Store purchase links in sessionStorage
                    sessionStorage.setItem('purchaseLinksMap', JSON.stringify(purchaseLinksMap));

                    setAllBooks(data);
                    const found = data.find(b => String(b.SKU) === String(sku));
                    
                    if (found) {
                        console.log(`✅ Found book with SKU: ${sku}`);
                        setBook(found);
                    } else {
                        console.error(`❌ Book with SKU ${sku} not found in API response`);
                        console.warn(`Available SKUs: ${data.slice(0, 10).map(b => b.SKU).join(', ')}...`);
                        setBook(null);
                    }
                    
                    return true; // Success
                } catch (err) {
                    console.error(`❌ API fetch error (attempt ${retryCount + 1}):`, err.message);
                    return false; // Failed
                }
            };

            // Try to fetch with retries
            while (retryCount < maxRetries) {
                const success = await fetchBooks();
                if (success) {
                    break;
                }
                retryCount++;
                
                if (retryCount < maxRetries) {
                    const delay = 1000 * Math.pow(2, retryCount); // Exponential backoff
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            
            if (!mounted) return;
            setLoading(false);
        }
        
        load();
        return () => { mounted = false };
    }, [sku, location.state])

    if (loading) return (
        <div className={styles.detailsWrapper}>
            <Link to="/" className={styles.backLink}>&larr; Back</Link>
            <div style={{padding: '20px', textAlign: 'center'}}>
                <p>Loading book details...</p>
                <p style={{fontSize: '0.9rem', color: '#666'}}>Fetching from API...</p>
            </div>
        </div>
    )

    if (!book) return (
        <div className={styles.detailsWrapper}>
            <Link to="/" className={styles.backLink}>&larr; Back</Link>
            <div style={{padding: '20px'}}>
                <h2>❌ Book not found</h2>
                <p style={{marginTop: '10px', color: '#666'}}>
                    The book with SKU "<strong>{sku}</strong>" could not be found.
                </p>
                <details style={{marginTop: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '4px'}}>
                    <summary style={{cursor: 'pointer', fontWeight: '600'}}>🔍 Troubleshooting</summary>
                    <ul style={{marginTop: '10px', marginLeft: '20px'}}>
                        <li>Check if the SKU is spelled correctly</li>
                        <li>Verify the book exists in the database</li>
                        <li>Try navigating from the home page</li>
                        <li>Check browser console (F12) for error messages</li>
                    </ul>
                </details>
                <div style={{marginTop: '20px'}}>
                    <Link to="/" style={{color: '#1f85da', textDecoration: 'underline'}}>
                        Return to home page
                    </Link>
                </div>
            </div>
        </div>
    )

    const purchaseLinks = getPurchaseLinks(book.ISBN);
    const relatedBooks = getRelatedBooks(book, allBooks);
    const availableLanguages = getAvailableLanguages(book, allBooks);
    const images = book.Images || [];

    return (
        <div className={styles.detailsWrapper}>
            <Link to="/" className={styles.backLink}>&larr; Back to list</Link>

            <div className={styles.threeColumnGrid}>
                {/* LEFT COLUMN - Image Gallery */}
                <div className={styles.imageSection}>
                    {images.length > 0 && (
                        <>
                            <div
                                className={styles.imageZoomContainer}
                                onMouseEnter={() => setShowMagnifier(true)}
                                onMouseLeave={() => setShowMagnifier(false)}
                                onMouseMove={handleMouseMove}
                            >
                                <img
                                    src={images[selectedImage]}
                                    alt={book.Title}
                                    className={styles.mainImage}
                                />
                            </div>
                            {images.length > 1 && (
                                <div className={styles.thumbnailGrid}>
                                    {images.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`${book.Title} - Image ${index + 1}`}
                                            className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
                                            onClick={() => setSelectedImage(index)}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* MAGNIFIER PANEL - Shows enlarged view on hover */}
                {showMagnifier && images.length > 0 && (
                    <div className={styles.magnifierPanel}>
                        <div
                            className={styles.magnifiedImage}
                            style={{
                                backgroundImage: `url(${images[selectedImage]})`,
                                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                backgroundSize: '250%',
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                    </div>
                )}

                {/* MIDDLE COLUMN - Content */}
                <div className={styles.contentSection}>
                    <h1 className={styles.title}>{book.Title}</h1>
                    {book.Author && <p className={styles.author}>by {book.Author}</p>}

                    {/* Product Details Table */}
                    <h2 className={styles.sectionHeading}>Product Details</h2>
                    <table className={styles.metaTable}>
                        <tbody>
                            {book.Pages && (
                                <tr>
                                    <td className={styles.metaKey}>Print Length</td>
                                    <td className={styles.metaValue}>{book.Pages} pages</td>
                                </tr>
                            )}
                            {book.Language && (
                                <tr>
                                    <td className={styles.metaKey}>Language</td>
                                    <td className={styles.metaValue}>{book.Language}</td>
                                </tr>
                            )}
                            {availableLanguages.length > 1 && (
                                <tr>
                                    <td className={styles.metaKey}>Available in</td>
                                    <td className={styles.metaValue}>
                                        <div className={styles.languageTags}>
                                            {availableLanguages.map((langBook, index) => (
                                                <Link
                                                    key={index}
                                                    to={`/bookDetail/${langBook.SKU}`}
                                                    className={`${styles.languageTag} ${langBook.SKU === book.SKU ? styles.active : ''}`}
                                                    state={{ book: langBook, allBooks: allBooks }}
                                                >
                                                    {langBook.Language}
                                                </Link>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {(book.PublishedOn || book.PublicationYear) && (
                                <tr>
                                    <td className={styles.metaKey}>Publication Date</td>
                                    <td className={styles.metaValue}>{book.PublishedOn || book.PublicationYear}</td>
                                </tr>
                            )}
                            {book.Publisher && (
                                <tr>
                                    <td className={styles.metaKey}>Publisher</td>
                                    <td className={styles.metaValue}>{book.Publisher}</td>
                                </tr>
                            )}
                            {book.ISBN && (
                                <tr>
                                    <td className={styles.metaKey}>ISBN</td>
                                    <td className={styles.metaValue}>{book.ISBN}</td>
                                </tr>
                            )}
                            {book.Pages && (
                                <tr>
                                    <td className={styles.metaKey}>File Size</td>
                                    <td className={styles.metaValue}>{estimateFileSize(book.Pages)}</td>
                                </tr>
                            )}
                            <tr>
                                <td className={styles.metaKey}>Accessibility</td>
                                <td className={styles.metaValue}>Text-to-Speech: Enabled</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* About the Book */}
                    {book.Description && (
                        <>
                            <h2 className={styles.sectionHeading}>About the Book</h2>
                            <div className={styles.description} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(book.Description)}} />
                        </>
                    )}

                    {/* Share Section with URL */}
                    <div className={styles.shareSection}>
                        <h2 className={styles.sectionHeading}>Share This Book</h2>
                        
                        {/* Shareable URL */}
                        <div className={styles.shareableLink}>
                            <label>📋 Book Link:</label>
                            
                            {/* Basic URL */}
                            <div className={styles.linkContainer}>
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={getShareLinkWithTracking(book.SKU, 'direct')}
                                    className={styles.linkInput}
                                />
                                <button 
                                    className={styles.copyBtn}
                                    onClick={() => handleCopyLink(false)}
                                    title="Copy link to clipboard"
                                >
                                    📋 Copy
                                </button>
                            </div>
                        </div>
                        
                        {/* Share Buttons with Tracking */}
                        <div className={styles.shareButtons}>
                            <span style={{fontWeight: 600, marginRight: '8px', display: 'block', marginBottom: '8px', width: '100%'}}>📤 Share on:</span>
                            <button className={styles.shareBtn} onClick={() => handleShare('facebook', book)}>📱 Facebook</button>
                            <button className={styles.shareBtn} onClick={() => handleShare('twitter', book)}>𝕏 Twitter</button>
                            <button className={styles.shareBtn} onClick={() => handleShare('whatsapp', book)}>💬 WhatsApp</button>
                            <button className={styles.shareBtn} onClick={() => handleShare('email', book)}>✉️ Email</button>
                            <button className={styles.shareBtn} onClick={() => handleShare('linkedin', book)}>in LinkedIn</button>
                        </div>

                        {/* Info about tracking */}
                        {trackingSource && (
                            <div style={{
                                marginTop: '12px',
                                padding: '8px 12px',
                                background: '#f0f9ff',
                                borderLeft: '3px solid #1f85da',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                color: '#1f85da'
                            }}>
                                📊 You reached this page from: <strong>{trackingSource}</strong>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN - Buy Options */}
                <div className={styles.buySection}>
                    {/* Price */}
                    {book.Price && (
                        <div className={styles.price}>{formatPrice(book.Price)}</div>
                    )}

                    {/* Purchase Buttons */}
                    {purchaseLinks.length > 0 && (
                        <div className={styles.purchaseButtons}>
                            {purchaseLinks.map((link, index) => {
                                const platformName = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
                                return (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.purchaseButton}
                                    >
                                        Buy on {platformName}
                                    </a>
                                );
                            })}
                        </div>
                    )}

                    {/* Preview/Download Link */}
                    {purchaseLinks.find(l => l.platform.toLowerCase() === 'free') && (
                        <a
                            href={purchaseLinks.find(l => l.platform.toLowerCase() === 'free').url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.previewLink}
                        >
                            📄 Download Free {getFileFormat(purchaseLinks.find(l => l.platform.toLowerCase() === 'free').url)}
                        </a>
                    )}

                    {/* Cart Section */}
                    <div className={styles.cartSection}>
                        <label htmlFor="quantity">Qty: </label>
                        <input
                            id="quantity"
                            type="number"
                            min="1"
                            max="99"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                            className={styles.qtyInput}
                        />
                        <button
                            className={styles.btn}
                            onClick={() => alert('Cart functionality coming soon!')}
                        >
                            Add to Cart
                        </button>
                    </div>
                    <button
                        className={styles.btn}
                        style={{width: '100%', marginTop: '8px'}}
                        onClick={() => alert('Buy Now functionality coming soon!')}
                    >
                        Buy Now
                    </button>
                </div>
            </div>

            {/* Related Books Section */}
            {relatedBooks.length > 0 && (
                <div className={styles.relatedSection}>
                    <h2>Related Books</h2>
                    <div className={styles.relatedList}>
                        {relatedBooks.map(relatedBook => (
                            <Link
                                key={relatedBook.SKU}
                                to={`/bookDetail/${relatedBook.SKU}`}
                                className={styles.relatedItem}
                                state={{ book: relatedBook, allBooks: allBooks }}
                            >
                                <div className={styles.relatedThumb}>
                                    <img src={relatedBook.Images?.[0]} alt={relatedBook.Title} />
                                </div>
                                <div className={styles.relatedTitle}>{relatedBook.Title}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default BookDetails
