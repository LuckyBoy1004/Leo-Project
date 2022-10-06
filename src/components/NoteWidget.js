import emptyStar from "../images/starempty.png"
import star from "../images/star.svg"

const NoteWidget = ({ note }) => {
    return (
        <div className="noteWidget">
            <img alt="" src={note >= 1 ? star : emptyStar}></img>
            <img alt="" src={note >= 2 ? star : emptyStar}></img>
            <img alt="" src={note >= 3 ? star : emptyStar}></img>
            <img alt="" src={note >= 4 ? star : emptyStar}></img>
            <img alt="" src={note >= 5 ? star : emptyStar}></img>
        </div>
    )
}

export default NoteWidget