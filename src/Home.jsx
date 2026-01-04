import { useEffect, useState } from 'react'
import BookCards from './component/BookCards'
import SearchBar from './component/SearchBar'
import SelectOptions from './component/SelectOptions';
import styles from './App.module.css'

function Home(){
    
  const [query, setQuery] = useState('');
  const [apiData, setApiData] = useState([]);
  const [selected, setSelected] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData(){
      setLoading(true);
      try{
        const res = await fetch('/api/get-books-info');
        const data = await res.json();
        setApiData(data);
      }catch(err){
        console.error(err);
      }finally{
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Extracting unique languages
  let langData = [... new Set(apiData.map(el => el.Language))]
  const languages = [];
  for (let i = 0; i < langData.length; i++) {
    if (langData[i] !== null) {
      languages.push(langData[i])
    }
  }

  // Handling selected language
  function handleSelected(e) {
    setSelected(e.target.value.toLowerCase())
  }

  //Updating sortBy variable
  function handleSortBy (e){
    setSortBy(e.target.value.toLowerCase());
  }
  return (
    <div className={styles.appComWrapper}>
      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.topProgress} />
          <div className={styles.spinner} />
        </div>
      )}
      <h1>Worldwide Publication</h1>
      <div className={styles.filterBox}>
        <SearchBar setQuery={setQuery} />
        <SelectOptions arrayList={languages} firstOption='All Languages' onChange={handleSelected} />
        <SelectOptions arrayList={['Title(A-Z)', 'Title(Z-A)']} firstOption='Sort By' onChange={handleSortBy} />
      </div>
      <BookCards query={query} apiData={apiData} selected={selected} sortBy={sortBy} />
    </div>
  )
}

export default Home;

