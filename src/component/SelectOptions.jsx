import styles from './SelectOptions.module.css'

function SelectOptions({ arrayList, firstOption, onChange}) {
    
    return (
        <div className={styles.dropDwonBox}>
            <select onChange={onChange}>
                <option value=''>{firstOption}</option>
                {
                    arrayList.map(el => <option value={el} key={el}>{el}</option>)
                }
            </select>
        </div>
    )
}

export default SelectOptions; 