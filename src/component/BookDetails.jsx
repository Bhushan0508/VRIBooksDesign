import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import styles from './BookDetails.module.css'

function BookDetails () {
    const { sku } = useParams()
    const [book, setBook] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        async function load(){
            setLoading(true)
            try{
                const res = await fetch('/api/get-books-info')
                const data = await res.json()
                if (!mounted) return
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
    }, [sku])

    if (loading) return <div className={styles.detailsWrapper}>Loading...</div>

    if (!book) return (
        <div className={styles.detailsWrapper}>
            <Link to="/" className={styles.backLink}>&larr; Back</Link>
            <h2>Book not found</h2>
        </div>
    )

    return (
        <div className={styles.detailsWrapper}>
            <Link to="/" className={styles.backLink}>&larr; Back to list</Link>
            <div className={styles.detailsGrid}>
                <div className={styles.coverBox}>
                    {book.Images?.[0] && <img src={book.Images[0]} alt={book.Title} />}
                </div>
                <div>
                    <h1 className={styles.title}>{book.Title}</h1>
                    <div className={styles.metaBox}>
                        {book.Author && <div><strong>Author:</strong> {book.Author}</div>}
                        {book.Publisher && <div><strong>Publisher:</strong> {book.Publisher}</div>}
                        {book.Language && <div><strong>Language:</strong> {book.Language}</div>}
                        {book.ISBN && <div><strong>ISBN:</strong> {book.ISBN}</div>}
                        {book.PublishedOn && <div><strong>Published:</strong> {book.PublishedOn}</div>}
                    </div>
                    <div className={styles.description} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(book.Description || '')}} />
                </div>
            </div>
        </div>
    )
}

export default BookDetails
