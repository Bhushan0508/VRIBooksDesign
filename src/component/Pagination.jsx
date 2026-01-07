import { useMemo } from 'react';
import style from './Pagination.module.css'

function Pagination({noOfPages, currPage, setCurrPage}) {
    // Calculate visible page numbers with optimization for large page counts
    const getVisiblePages = useMemo(() => {
        const maxVisible = 5; // Max page buttons to show on small screens
        const pages = [];
        
        if (noOfPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= noOfPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first page
            pages.push(1);
            
            // Calculate range around current page
            let start = Math.max(2, currPage - 1);
            let end = Math.min(noOfPages - 1, currPage + 1);
            
            // Add ellipsis if needed
            if (start > 2) {
                pages.push('...');
            }
            
            // Add middle pages
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }
            
            // Add ellipsis if needed
            if (end < noOfPages - 1) {
                pages.push('...');
            }
            
            // Show last page
            pages.push(noOfPages);
        }
        
        return pages;
    }, [noOfPages, currPage]);

    // Handling Prev Button
    const handlePrev = () => {
        setCurrPage((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handling Next Button
    const handleNext = () => {
        setCurrPage((prev) => Math.min(prev + 1, noOfPages));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handling Page clicked by number
    const handlePageClick = (n) => {
        setCurrPage(n);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Early return for no pagination needed
    if (noOfPages <= 1) {
        return null;
    }

    return (
        <section className={style.paginationBox}>
            <button 
                onClick={handlePrev} 
                disabled={currPage === 1}
                className={style.navBtn}
                aria-label="Previous page"
            >
                ← Prev
            </button>
            
            <div className={style.pageNumbers}>
                {getVisiblePages.map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className={style.ellipsis}>...</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => handlePageClick(page)}
                            className={`${style.pageBtn} ${currPage === page ? style.active : ''}`}
                            aria-label={`Go to page ${page}`}
                            aria-current={currPage === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>
            
            <button 
                onClick={handleNext} 
                disabled={currPage === noOfPages}
                className={style.navBtn}
                aria-label="Next page"
            >
                Next →
            </button>
        </section>
    );
}

export default Pagination;