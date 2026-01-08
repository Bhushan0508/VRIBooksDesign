# Book Navigation API Documentation

This document describes how to use the Book Navigation API to navigate to book detail pages by SKU identifier.

## Overview

The Book Navigation API provides multiple ways to navigate to book pages:

1. **Direct Navigation** - Using React Router with SKU
2. **API Service** - Using the `bookApi.js` service
3. **Custom Hook** - Using the `useBookNavigation` hook
4. **Query Parameters** - Using URL query strings

---

## 1. Direct Navigation (Simplest)

### Basic Navigation

```javascript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleGoToBook = (sku) => {
    navigate(`/bookDetail/${sku}`);
  }
  
  return (
    <button onClick={() => handleGoToBook('E03')}>
      View Art of Living
    </button>
  )
}
```

### Navigation with Tracking

```javascript
const handleGoToBook = (sku, source) => {
  navigate(`/bookDetail/${sku}?utm_source=${source}&utm_medium=direct`);
}

// Usage
handleGoToBook('E03', 'home_page');
```

---

## 2. Using Book API Service

The `bookApi.js` service provides server-side book operations.

### Import

```javascript
import {
  fetchBookBySKU,
  fetchAllBooks,
  searchBooks,
  validateSKU,
  getBooksByLanguage,
  getBooksByAuthor,
  getAvailableLanguages,
  getAvailableAuthors,
  getAvailableSKUs
} from '@/services/bookApi';
```

### Fetch Book by SKU

```javascript
// Get book data
const book = await fetchBookBySKU('E03');
console.log(book.Title); // "Art of Living (Paperback, English)"
```

### Validate SKU

```javascript
// Check if SKU exists before navigating
const exists = await validateSKU('E03');
if (exists) {
  navigate(`/bookDetail/E03`);
} else {
  alert('Book not found');
}
```

### Search Books

```javascript
// Search all fields
const results = await searchBooks('Art of Living', 'all');

// Search specific field
const byAuthor = await searchBooks('William Hart', 'author');
const byLanguage = await searchBooks('English', 'language');
const byTitle = await searchBooks('Meditation', 'title');
```

### Get Books by Language

```javascript
const englishBooks = await getBooksByLanguage('English');
const marathiBooks = await getBooksByLanguage('Marathi');
```

### Get Books by Author

```javascript
const williamHartBooks = await getBooksByAuthor('William Hart');
```

### Get Available Languages

```javascript
const languages = await getAvailableLanguages();
// Returns: ['English', 'Hindi', 'Marathi', 'Spanish', 'Tamil', 'Urdu', ...]
```

### Get Available Authors

```javascript
const authors = await getAvailableAuthors();
// Returns: ['U Ko Lay', 'William Hart', 'Vipassana Research Institute', ...]
```

### Get All Available SKUs

```javascript
const skus = await getAvailableSKUs();
// Returns: ['E01', 'E02', 'E03', 'E03-Pf', 'E03-Eb', 'M01', ...]
```

---

## 3. Using Custom Hook (Recommended for React Components)

The `useBookNavigation` hook provides convenient navigation methods.

### Import

```javascript
import { useBookNavigation } from '@/hooks/useBookNavigation';
```

### Basic Navigation

```javascript
function BookCard({ book }) {
  const { goToBook } = useBookNavigation();
  
  const handleClick = async () => {
    const success = await goToBook(book.SKU);
    if (!success) {
      alert('Failed to navigate to book');
    }
  }
  
  return (
    <button onClick={handleClick}>
      View Details
    </button>
  )
}
```

### Navigation with State (Pre-load Data)

```javascript
function SearchResults({ book }) {
  const { goToBook } = useBookNavigation();
  
  const handleClick = async () => {
    await goToBook(book.SKU, { withState: true });
  }
  
  return <button onClick={handleClick}>View Book</button>
}
```

### Navigation with Tracking

```javascript
function HomePage() {
  const { goToBookWithTracking } = useBookNavigation();
  
  const handleFeaturedBookClick = async () => {
    await goToBookWithTracking('E03', 'featured_section');
  }
  
  const handleRecommendedClick = async () => {
    await goToBookWithTracking('M01', 'recommendations');
  }
  
  return (
    <>
      <button onClick={handleFeaturedBookClick}>Featured Book</button>
      <button onClick={handleRecommendedClick}>Recommended</button>
    </>
  )
}
```

### Advanced Options

```javascript
const { goToBook } = useBookNavigation();

await goToBook('E03', {
  withState: true,        // Include book data in state
  replace: true,          // Replace history instead of push
  ref: 'search_results'   // Track referrer
});
```

---

## 4. Complete Examples

### Example 1: Search and Navigate

```javascript
import { useState } from 'react';
import { useBookNavigation } from '@/hooks/useBookNavigation';
import { searchBooks } from '@/services/bookApi';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { goToBookWithTracking } = useBookNavigation();
  
  const handleSearch = async () => {
    const books = await searchBooks(query);
    setResults(books);
  }
  
  const handleSelectBook = async (sku) => {
    await goToBookWithTracking(sku, 'search_results');
  }
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search books..."
      />
      <button onClick={handleSearch}>Search</button>
      
      <div>
        {results.map(book => (
          <div key={book.SKU} onClick={() => handleSelectBook(book.SKU)}>
            {book.Title} - {book.Author}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Example 2: Language Filter

```javascript
import { useState, useEffect } from 'react';
import { useBookNavigation } from '@/hooks/useBookNavigation';
import { getBooksByLanguage, getAvailableLanguages } from '@/services/bookApi';

function LanguageBooks() {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [books, setBooks] = useState([]);
  const { goToBook } = useBookNavigation();
  
  useEffect(() => {
    const loadLanguages = async () => {
      const langs = await getAvailableLanguages();
      setLanguages(langs);
      setSelectedLanguage(langs[0]);
    }
    loadLanguages();
  }, []);
  
  useEffect(() => {
    const loadBooks = async () => {
      const books = await getBooksByLanguage(selectedLanguage);
      setBooks(books);
    }
    if (selectedLanguage) loadBooks();
  }, [selectedLanguage]);
  
  return (
    <div>
      <select 
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
      >
        {languages.map(lang => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
      
      <div>
        {books.map(book => (
          <button 
            key={book.SKU}
            onClick={() => goToBook(book.SKU)}
          >
            {book.Title}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Example 3: Quick Navigation from External Links

```javascript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validateSKU } from '@/services/bookApi';

function QuickNavigate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const sku = searchParams.get('sku');
    if (sku) {
      const goToBook = async () => {
        const isValid = await validateSKU(sku);
        if (isValid) {
          navigate(`/bookDetail/${sku}`);
        } else {
          alert(`Book not found: ${sku}`);
          navigate('/');
        }
      }
      goToBook();
    }
  }, [searchParams, navigate]);
  
  return <div>Loading book...</div>
}

// Usage:
// http://localhost:5173/?sku=E03
// http://localhost:5173/?sku=M01
```

---

## 5. Supported SKU Formats

The API accepts all valid book SKUs:

### English
- `E01` - Sayagyi U Ba Khin Journal (Paperback)
- `E02` - Essence of Tipitaka (Paperback)
- `E03` - Art of Living (Paperback)
- `E03-Pf` - Art of Living (PDF)
- `E03-Eb` - Art of Living (eBook/ePUB)

### Marathi
- `M01` - Art of Living (Paperback)
- `M01-Pf` - Art of Living (PDF)
- `M01-Eb` - Art of Living (eBook)

### Spanish
- `Sp02` - Art of Living (Paperback)
- `Sp02-Pf` - Art of Living (PDF)

### Hindi
- `H66` - Jine ki kala (Paperback)
- `H66-Pf` - Jine ki kala (PDF)

### Tamil
- `T01` - Art of Living (Paperback)

---

## 6. Error Handling

### Best Practices

```javascript
async function safNavigate(sku) {
  try {
    const isValid = await validateSKU(sku);
    
    if (!isValid) {
      console.error(`Invalid SKU: ${sku}`);
      alert('Book not found');
      return false;
    }
    
    navigate(`/bookDetail/${sku}`);
    return true;
  } catch (error) {
    console.error('Navigation failed:', error);
    alert('Error loading book. Please try again.');
    return false;
  }
}
```

---

## 7. Query Parameters

Navigate with tracking parameters:

```javascript
// Basic
navigate(`/bookDetail/E03`);

// With tracking
navigate(`/bookDetail/E03?utm_source=home&utm_campaign=featured`);

// With multiple parameters
navigate(`/bookDetail/E03?ref=search&source=organic&campaign=promo`);
```

---

## 8. API Reference

### bookApi.js

| Function | Params | Returns | Description |
|----------|--------|---------|-------------|
| `fetchBookBySKU(sku)` | string | Promise<book> | Fetch single book by SKU |
| `fetchAllBooks()` | none | Promise<array> | Fetch all books |
| `searchBooks(query, type)` | string, string | Promise<array> | Search books |
| `getBooksByLanguage(lang)` | string | Promise<array> | Get books by language |
| `getBooksByAuthor(author)` | string | Promise<array> | Get books by author |
| `getAvailableLanguages()` | none | Promise<array> | Get all languages |
| `getAvailableAuthors()` | none | Promise<array> | Get all authors |
| `getAvailableSKUs()` | none | Promise<array> | Get all SKUs |
| `validateSKU(sku)` | string | Promise<boolean> | Check if SKU exists |

### useBookNavigation.js

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `goToBook(sku, options)` | string, object | Promise<boolean> | Navigate to book |
| `goToBookWithTracking(sku, source)` | string, string | Promise<boolean> | Navigate with tracking |

---

## Summary

✅ **Use when:**
- **Direct navigation** - Simple navigation within your app
- **API service** - Need detailed book data and searching
- **Custom hook** - Building React components with navigation
- **Query parameters** - External links and tracking

✅ **All methods support:**
- SKU validation
- Caching
- Error handling
- Tracking parameters
- Multiple SKU formats
