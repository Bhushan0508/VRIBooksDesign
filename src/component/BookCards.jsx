import { useState } from "react";
import style from './BookCards.module.css';
import Pagination from "./pagination";
import Modal from './Modal';
import { Link } from "react-router-dom";
// import infoIcon from './public/image/infoIcon.jpg'

function BookCards({ query, apiData, selected, sortBy }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    // Filtering Data
    const filteredData = apiData.filter((el) => {
        return Array.isArray(el.Images) && el.Images.length > 0 &&
            el.Title.toLowerCase().includes(query) &&
            el.Language?.toLowerCase().includes(selected);
    });

    //Pagination logic and variables
    const cardsPerPage = 50;
    const [currPage, setCurrPage] = useState(1);
    const indexOfLastItem = cardsPerPage * currPage;
    const indexOfFirstItem = indexOfLastItem -  cardsPerPage;
    const noOfPages = Math.ceil(filteredData.length/cardsPerPage);

    // Sorting data by title
    if (sortBy === 'title(a-z)') {
        filteredData.sort((a, b) => a.Title.localeCompare(b.Title));
    } else if (sortBy === 'title(z-a)') {
        filteredData.sort((a, b) => b.Title.localeCompare(a.Title));
    }
    
    return (
        <>
            <div className={style.cardsWrapper}>
                {
                    // Rendring Cards
                    filteredData && filteredData.slice(indexOfFirstItem, indexOfLastItem).map((el) => {
                        
                        return <div className={style.cards} key={el.ID}>
                            <Link to={`/bookDetail/${el.SKU}`} className={style.linkCards} >
                                <div className={style.cardImgBox}>
                                    <img src={el.Images?.[0] ?? ''} alt={el.BookType} />
                                </div>
                                <div className={style.cardText}>
                                    <h4>{el.Title}</h4>
                                </div>
                            </Link>
                            <div className={style.infoIcon}>
                                <span className={style.lang}>{el.Language}</span>&nbsp;&nbsp;
                            
                            
                                <span
                                    className={style.icon}
                                    title="Click to see the details"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        setSelectedBook(el);
                                        setIsModalOpen(true);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            setSelectedBook(el);
                                            setIsModalOpen(true);
                                        }
                                    }}
                                >
                                    <img src='image/infoGif4.gif' />
                                </span>
                            </div>
                        </div>
                    })
                    
                }
            </div>
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                book={selectedBook}
            />
            <Pagination currPage={currPage} setCurrPage={setCurrPage} noOfPages={noOfPages} />
        </>
    )
}

export default BookCards;