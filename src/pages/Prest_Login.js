import React, { useState, useEffect } from "react";
import "../styles/Prest_.css"
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from "../context/userContext"; // context

import { ButtonLarge } from '../components/utilities/Buttons'
import Layout from '../components/utilities/Layout'
import Title from '../components/utilities/Title'
import SubTitle from '../components/utilities/SubTitle'
import ReactLoading from 'react-loading';

import imgPrestLogin from '../images/image00002.jpeg'
import { CSSTransition } from 'react-transition-group'

const Prest_Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)

    const [buttonLoading, setButtonLoading] = useState(false)
    
    const [isMounted, setIsMounted] = useState(false);

    const { login } = useAuth() // context
    const history = useHistory()


    function handleResize(width) {
        setWindowsWidth(width)
    }


    useEffect(() => {
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))
        return setIsMounted(true)
    }, [])



    async function handleLoginForm(e) {
        e.preventDefault()
        setButtonLoading(true)
        try {
            await login(email, password)
        } catch {
            setPassword("")
            setError("Nous n'avons pas réussi à vous identifier, veuillez réessayer.")
            setButtonLoading(false)
        }
    }


    return (
        <Layout>
            <CSSTransition
                in={isMounted}
                timeout={300}
                classNames="pageTransition"
                unmountOnExit
            >
                <div className="prest-login-container">
                    <Title value="Votre nouvelle boutique vous attend" type="h1" font="roboto-medium" />
                    <div className="prest-login-flex-container">
                        <div className="prest-login-left">
                            <SubTitle value="Grâce à NIVID, recevez des réservations 24H/24 7J/7 et boostez votre chiffre d'affaires" type="big" font="roboto-regular" />
                            <div className="divider"></div>
                            {/*<Title value="Connectez-vous à Nivid" type="h2" font="roboto-medium" />*/}

                            {error && <div className="errorMessage">{error}</div>}

                            <form>
                                <div className="formLine">
                                    <div className="formField withoutMargin">
                                        <label>Identifiant / Adresse email</label>
                                        <input value={email} type="email" name="email" onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                </div>

                                <div className="formLine">
                                    <div className="formField withoutMargin">
                                        <label>Mot de passe<span onClick={() => history.push("/mot-de-passe-oublie")}>Mot de passe oublié ?</span></label>
                                        <input value={password} type="password" name="password" onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                </div>

                                <div className="formLine">
                                    <div className="formField withoutMargin">
                                        <ButtonLarge
                                            onClick={(e) => handleLoginForm(e)}
                                            color="orange"
                                            value={buttonLoading ? <ReactLoading className="loadingSpinnerButton" type="spin" color="white" height={23} width={23} /> : "C’est parti !"}
                                            backgroundColor="rgba(245, 192, 67)"
                                            marginTop="10px"
                                            disabled={buttonLoading ? "disabled" : null}
                                        />
                                    </div>
                                </div>

                                <div className="formLine">
                                    <div className="formField loginBottomBloc">
                                        <p>Vous n'avez pas de compte ?</p>
                                        <Link to="/mon-compte-partenaire/process/abonnement">Inscrivez-vous</Link>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="prest-login-right">
                            <img alt="" src={imgPrestLogin} />
                        </div>
                    </div>
                </div>
            </CSSTransition>
        </Layout>
    )
}
export default Prest_Login;
