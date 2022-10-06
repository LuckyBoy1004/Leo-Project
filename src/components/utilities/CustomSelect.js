const CustomSelect = ({ options, callback, currentValue }) => {

    return (
        <div className="customSelect">
        <select className="" onChange={callback} value={currentValue} name="pets" id="pet-select">
            {options.map(item => {
                return <option value={item.name}>{item.name}</option>
            })}
        </select>
        </div>
    )
}

export default CustomSelect