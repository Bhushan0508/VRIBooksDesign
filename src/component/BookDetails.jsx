import { useParams, Link, useLocation } from "react-router-dom"
import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import styles from './BookDetails.module.css'
import purchaseLinksMap from '../purchaseLinksMap.json'
import { openShareUrl, getBookDetailUrl, copyBookLinkToClipboard } from '../utils/bookLinks'

function BookDetails () {
    const { sku } = useParams()
    const location = useLocation()
    const [book, setBook] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [allBooks, setAllBooks] = useState([])
    const [isZoomed, setIsZoomed] = useState(false)
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
    const [showMagnifier, setShowMagnifier] = useState(false)

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

    // Helper: Handle share
    const handleShare = (platform, book) => {
        openShareUrl(platform, book);
    };

    // Helper: Handle copy link
    const handleCopyLink = async () => {
        const success = await copyBookLinkToClipboard(book.SKU);
        if (success) {
            alert('Link copied to clipboard!');
        } else {
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
                const data = JSON.parse(cachedData);
                setAllBooks(data);
                const found = data.find(b => String(b.SKU) === String(sku));
                setBook(found || null);
                setLoading(false);
                setSelectedImage(0);
                return;
            } catch (err) {
                console.error('Error parsing cached data:', err);
            }
        }

        // Fallback: Fetch data from API if not in cache
        async function load(){
            setLoading(true)
            try{
                const res = await fetch('/api/get-books-info')
                const data = await res.json()
                if (!mounted) return

                // Store in sessionStorage
                sessionStorage.setItem('booksData', JSON.stringify(data));
                sessionStorage.setItem('booksDataTimestamp', now.toString());
                // Store purchase links in sessionStorage
                sessionStorage.setItem('purchaseLinksMap', JSON.stringify(purchaseLinksMap));

                setAllBooks(data)
                const found = data.find(b => String(b.SKU) === String(sku))
                setBook(found || null)
            }catch(err){
                console.error(err)
            }finally{
                setLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [sku, location.state])

    if (loading) return <div className={styles.detailsWrapper}>Loading...</div>

    if (!book) return (
        <div className={styles.detailsWrapper}>
            <Link to="/" className={styles.backLink}>&larr; Back</Link>
            <h2>Book not found</h2>
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
                            <label>Shareable Link:</label>
                            <div className={styles.linkContainer}>
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={getBookDetailUrl(book.SKU)}
                                    className={styles.linkInput}
                                />
                                <button 
                                    className={styles.copyBtn}
                                    onClick={handleCopyLink}
                                    title="Copy link to clipboard"
                                >
                                    📋 Copy
                                </button>
                            </div>
                        </div>
                        
                        {/* Share Buttons */}
                        <div className={styles.shareButtons}>
                            <span style={{fontWeight: 600, marginRight: '8px', display: 'block', marginBottom: '8px'}}>Share on:</span>
                            <button className={styles.shareBtn} onClick={() => handleShare('facebook', book)}>📱 Facebook</button>
                            <button className={styles.shareBtn} onClick={() => handleShare('twitter', book)}>𝕏 Twitter</button>
                            <button className={styles.shareBtn} onClick={() => handleShare('whatsapp', book)}>💬 WhatsApp</button>
                            <button className={styles.shareBtn} onClick={() => handleShare('email', book)}>✉️ Email</button>
                            <button className={styles.shareBtn} onClick={() => handleShare('linkedin', book)}>in LinkedIn</button>
                        </div>
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
