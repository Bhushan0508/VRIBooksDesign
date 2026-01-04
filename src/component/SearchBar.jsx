import styels from './SearchBar.module.css'
function SearchBar ({setQuery}){
    return(
        <div className={styels.inputBox}>
            <input 
                type="text" 
                placeholder="Search by Keywords" 
                onChange={(e) => setQuery(e.target.value.toLowerCase())}
            />
        </div>
    );
}
export default  SearchBar;
