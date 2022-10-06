import React, { useState, useEffect } from "react";
import "../styles/Login.css"
import { Link, useHistory } from 'react-router-dom'
import logo from "../images/logoBlack.svg"
import { ButtonSmall, ButtonLarge } from '../components/utilities/Buttons'
import BackIcon from '@mui/icons-material/ArrowBackIosNew';
import checkedsvg from '../images/checked.png'
import Title from '../components/utilities/Title'

const ConfirmSubscribe = () => {
    
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)

    function isMobile() {
        if (windowsWidth > 1100) {
            return false
        }
        else {
            return true
        }
    }

    function handleResize(width) {
        setWindowsWidth(width)
    }


    useEffect(() => {
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))
    }, [])

    const history = useHistory()


    return (
        <div className="ConfirmSubscribe_container">
        <header style={{ position: "relative", zIndex: "999", display: "flex", justifyContent: "space-between" }}>
            <div onClick={() => history.push("/")} className="logoContainer">
                <img alt="" src={logo} />
            </div>
            <div className="LoginBackLink">
                <ButtonSmall
                    color="orange"
                    onClick={() => history.push("/")}
                    value="Revenir à l'accueil"
                    iconMUIStart={<BackIcon sx={{ fontSize: 16 }} />}
                    classname="flex"
                />
            </div>
        </header>
            <div className="ConfirmSubscribe">
                <div className="loginContainer">
                    <img alt="" style={{width: "60px"}} src={checkedsvg} />
                    <Title value="Merci pour votre inscription." type="h2" font="roboto-medium" align="center" />
                    <p>Un email de confirmation vient d'être envoyé à l'adresse email que vous avez renseigné. Merci de cliquer sur le lien de validation.</p>
                </div>
            </div>

        </div>
    )
}
export default ConfirmSubscribe;
