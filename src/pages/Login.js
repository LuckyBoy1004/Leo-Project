import React, { useState, useEffect } from "react";
import "../styles/Login.css"
import { Link, useHistory } from 'react-router-dom'
import logo from "../images/logoBlack.svg"
import { useAuth } from "../context/userContext"; // context
import footer from "../components/Footer"

import { ButtonLarge } from '../components/utilities/Buttons'

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const [loginFlag, setLoginFlag] = useState(0)
    const { login, signInWithGoogle } = useAuth() // context
    const history = useHistory()
    const isMobile = () => (windowsWidth > 1100) ? false : true


    async function handleLoginForm(e) {
        e.preventDefault()
        try {
            const res = await login(email, password)
            if (res === false) {
                setPassword("")
                setError("Merci de confirmer votre adresse email.")
            }
            else {
                history.push('/dashboard')
            }
        } catch {
            setPassword("")
            setError("Nous n'avons pas réussi à vous identifier, veuillez réessayer.")
        }
    }

    const loginF = (flag) => {
        setLoginFlag(flag)
    }
    return (
        <div className="loginSubscribeContainer">
            <header>
                <div className="logoContainer">
                    <img alt="" src={logo} />
                </div>
                <div className="blocLoginTopRight">
                    <Link to="/"><img alt="" src={'/images/backArrow.png'} />Revenir à l'accueil</Link>
                </div>
            </header>
            <div className="loginPageContainer">
                <div className="loginContainer">
                    <h1>Connectez-vous à Nivid</h1>
                    <p>Gérez votre compte, consultez vos événements et bien plus encore.</p>
                    {error && (
                        <div className="errorMessage">
                            {error}
                        </div>
                    )}
                    <div style={{position:'relative',opacity:loginFlag == 0 ? 1 : 0, zIndex:loginFlag == 0 ? '1' : '0', transition:'all 0.5s'}}>
                        <div className="googleSignInContainer">
                            <buttton className="googleSignInButton" onClick={() => signInWithGoogle()}>
                                <div className="googleSignInButtonImageContainer">
                                    <img alt="" src={'/images/google.png'} />
                                </div>
                                <span>Connectez-vous avec Google</span>
                            </buttton>
                        </div>
                        <div className="googleSignInContainer">
                            <buttton className="googleSignInButton" onClick={() => loginF(1)}>
                                <div className="googleSignInButtonImageContainer">
                                    <img alt="" src={'/images/user.png'} />
                                </div>
                                <span>Utiliser mon e-mail</span>
                            </buttton>
                        </div>
                    </div>
                    <form class="formsignin" style={{position:'absolute',opacity:loginFlag == 1 ? 1 : 0, zIndex:loginFlag == 1 ? '1' : '0', transition:'all 0.5s'}}>
                        <div className="formLine">
                            <div className="formField">
                                <label>Identifiant / Adresse email</label>
                                <input value={email} type="email" name="email" onChange={(e) => setEmail(e.target.value)} />
                            </div>
                        </div>

                        <div className="formLine">
                            <div className="formField">
                                <label>Mot de passe<span onClick={() => history.push("/mot-de-passe-oublie")}>Mot de passe oublié ?</span></label>
                                <input value={password} type="password" name="password" onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>

                        <div className="formLine">
                            <div className="formField">
                                <ButtonLarge
                                    onClick={(e) => handleLoginForm(e)}
                                    color="orange"
                                    value="C’est parti !"
                                    backgroundColor="rgba(245, 192, 67)"
                                    marginTop="10px"
                                />
                            </div>
                        </div>

                        <div className="formLine">
                            {/* <div className="formField loginBottomBloc">
                                <p>Rejoindre par d'autres ?</p>
                                <Link onClick={() => loginF(0)}>retour</Link>
                    </div> */}
                        </div>
                    </form>

                    {/* <div className="LoginDiviserContainer">
                        <div className="LoginDiviser">
                            <p>ou</p>
                        </div>
                    </div> */}
                    
                </div>
            </div>

        </div>
    )
}
export default Login;
