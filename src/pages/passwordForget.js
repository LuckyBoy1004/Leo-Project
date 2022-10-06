import React, { useState, useEffect } from "react";
import "../styles/Login.css"
import { Link, useHistory } from 'react-router-dom'
import logoWhite from "../images/logoWhite.svg"
import logo from "../images/logoBlack.svg"
import { useAuth } from "../context/userContext"; // context

import { ButtonSmall, ButtonLarge } from '../components/utilities/Buttons'
import BackIcon from '@mui/icons-material/ArrowBackIosNew';
import checkedsvg from '../images/checked.png'
import Title from '../components/utilities/Title'
import Loader from "../components/Loader";

const PasswordForget = () => {

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const [isSent, setIsSent] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const { getAuthUserFromHisEmail } = useAuth() // context
    const history = useHistory()

    const isMobile = () => windowsWidth > 1100 ? false : true
    const handleResize = (width) => setWindowsWidth(width)


    useEffect(() => {
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))
    }, [])



    async function handleSendPasswordForget(e) {
        e.preventDefault()
        await getAuthUserFromHisEmail(email)
            .then(res => {
                if (res === true) {
                    setIsSending(false)
                    setIsSent(true)
                }
                else if (res === "invalid") {
                    setIsSending(false)
                    setError("Le format de l'e-mail est incorrect")
                }
                else if (res === "notexist") {
                    setIsSending(false)
                    setError("L'email que vous avez renseigné n'est associé à aucun compte.")
                }
            })
    }


    return (
        <div className="passwordForget_container">
            <header style={{ position: "relative", zIndex: "999", display: "flex", justifyContent: "space-between" }}>
                <div onClick={() => history.push("/")} className="logoContainer">
                    <img alt="" src={!isMobile() ? logoWhite : logo} />
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
            <div className="passwordForget">
                {!isMobile() && <div className="passwordForget_left"></div>}
                <div className="passwordForget_right">
                    <div className="passwordForget_form">
                        {isSending ?
                            <Loader />
                            : !isSent ?
                                <>
                                    <h1>Vous avez perdu votre mot de passe ?</h1>
                                    {error && (
                                        <div className="errorMessage">
                                            {error}
                                        </div>
                                    )}
                                    <form>
                                        <div className="formLine">
                                            <div className="formField">
                                                <label>Identifiant / Adresse email</label>
                                                <input value={email} type="email" name="email" onChange={(e) => setEmail(e.target.value)} />
                                            </div>
                                        </div>



                                        <div className="formLine">
                                            <div className="formField">
                                                <ButtonLarge
                                                    onClick={(e) => { setIsSending(true); handleSendPasswordForget(e) }}
                                                    color={"orange"}
                                                    value="Envoyer le mail de réinitialisation"
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </>
                                :
                                <>
                                    <img alt="" style={{ width: "60px" }} src={checkedsvg} />
                                    <Title value="Votre demande de réinitialisation a bien été envoyée." type="h2" font="roboto-medium" align="center" />
                                    <div className="passwordForget_form_bottom">
                                        <p>Vous n'avez pas reçu d'email de réinitialisation ?</p>
                                        <a href="" onClick={(e) => { setIsSending(true); handleSendPasswordForget(e) }}>Envoyer à nouveau</a>
                                    </div>
                                </>
                        }
                    </div>

                </div>
            </div>

        </div>
    )
}
export default PasswordForget;
