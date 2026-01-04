import { useParams } from "react-router-dom"

function BookDetails () {
    const d = useParams()
    console.log(d);
    return(
        <h1>Book Details</h1>
    )
} 