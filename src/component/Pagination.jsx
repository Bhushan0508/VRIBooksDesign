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
    return (
        <section className={style.paginationBox} >
            <button onClick={handlePrev} disabled={currPage === 1}>Prev</button>
            {
                Array.from({ length: noOfPages }).map((_, index) =>
                    <button key={index} onClick={() => handlePageClick(index + 1)} className={currPage === index + 1 ? style.active : ''}>{index + 1}</button>)
            }
            <button onClick={handleNext} disabled={currPage === noOfPages} >Next</button>
        </section>
    )
}

export default Pagination;