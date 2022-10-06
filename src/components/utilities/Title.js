const Title = ({ type, color, font, align, value, onClick, customClass }) => {
    if (type === "h1") {
        return <h1 onClick={onClick} className={`bigTitle ${customClass}`} style={{ color: color, fontFamily: font, textAlign: align }}>{value}</h1>
    }
    else if (type === "h2") {
        return <h2 onClick={onClick} className={`bigTitle ${customClass}`} style={{ color: color, fontFamily: font, textAlign: align }}>{value}</h2>
    }
    else if (type === "h3") {
        return <h3 onClick={onClick} className={`bigTitle ${customClass}`} style={{ color: color, fontFamily: font, textAlign: align }}>{value}</h3>
    }
}

export default Title;