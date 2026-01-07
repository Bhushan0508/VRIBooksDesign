import style from './Pagination.module.css'
function Pagination({noOfPages, currPage, setCurrPage}) {
     //Handling Prev Button
    const handlePrev = () => {
        setCurrPage((prev) => Math.max(prev-1, 1));
    }
    //Handling Next Button
    const handleNext = () => {
        setCurrPage((prev) => Math.min(prev+1, noOfPages));
    }
    //Handling Page clicked by number
    function handlePageClick(n){
        setCurrPage(n)
    }

    const renderPageNumbers = () => {
        const pageNumbers = [];

        if (noOfPages <= 7) {
            for (let i = 1; i <= noOfPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always show first page
            pageNumbers.push(1);

            if (currPage > 3) {
                pageNumbers.push('...');
            }

            let start = Math.max(2, currPage - 1);
            let end = Math.min(noOfPages - 1, currPage + 1);

            if (currPage <= 3) {
                end = 4;
            }
            if (currPage >= noOfPages - 2) {
                start = noOfPages - 3;
            }

            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            if (currPage < noOfPages - 2) {
                pageNumbers.push('...');
            }

            // Always show last page
            pageNumbers.push(noOfPages);
        }

        return pageNumbers.map((num, index) => (
            num === '...' 
                ? <span key={`ellipsis-${index}`} className={style.ellipsis}>...</span>
                : <button key={num} onClick={() => handlePageClick(num)} className={`${style.pageBtn} ${currPage === num ? style.active : ''}`}>{num}</button>
        ));
    };

    return (
        <section className={style.paginationBox} >
            <button className={style.navBtn} onClick={handlePrev} disabled={currPage === 1}>Prev</button>
            <div className={style.numbersWrapper}>
                {renderPageNumbers()}
            </div>
            <button className={style.navBtn} onClick={handleNext} disabled={currPage === noOfPages} >Next</button>
        </section>
    )
}

export default Pagination;