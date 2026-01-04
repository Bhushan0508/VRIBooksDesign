import Home from "./Home"
import { Routes, Route } from 'react-router-dom'
import BookDetails from './component/BookDetails'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bookDetail/:sku" element={<BookDetails />} />
        </Routes>
    )
}

export default App
