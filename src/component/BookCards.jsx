import { useState } from "react";
import style from './BookCards.module.css';
import Pagination from "./Pagination";
import Modal from './Modal';
import { Link } from "react-router-dom";
import purchaseLinksData from '../purchaseLinksMap.json';
// import infoIcon from './public/image/infoIcon.jpg'

function BookCards({ query, apiData, selected, sortBy }) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    // Function to normalize ISBN (remove hyphens and spaces)
    const normalizeISBN = (isbn) => {
        if (!isbn) return '';
        return isbn.replace(/[-\s]/g, '');
    };

    // Function to get purchase links by ISBN
    const getPurchaseLinks = (isbn) => {
        if (!isbn) return [];

        // Try exact match first
        let links = purchaseLinksData[isbn];

        // If no match, try with normalized ISBN
        if (!links) {
            const normalized = normalizeISBN(isbn);
            // Search through all keys to find a match
            for (const key in purchaseLinksData) {
                if (normalizeISBN(key) === normalized) {
                    links = purchaseLinksData[key];
                    break;
                }
            }
        }

        return links || [];
    };

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
                        const purchaseLinks = getPurchaseLinks(el.ISBN);

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
                            {purchaseLinks.length > 0 && (
                                <div className={style.purchaseButtons}>
                                    {purchaseLinks.map((link, index) => {
                                        // Capitalize and format platform name
                                        const platformName = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);

                                        return (
                                            <a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={style.purchaseButton}
                                            >
                                                {platformName}
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
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