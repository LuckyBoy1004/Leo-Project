const SubTitle = ({ type, color, font, align, value }) => {
    if (type === "big") {
        return <p className="bigSubTitle" style={{ color: color, fontFamily: font, textAlign: align }}>{value}</p>
    }
    else if (type === "normal") {
        return <p className="normalSubTitle" style={{ color: color, fontFamily: font, textAlign: align }}>{value}</p>
    }
}

export default SubTitle;