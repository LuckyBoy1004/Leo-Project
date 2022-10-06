import React, { useState, useEffect } from "react";
import "../styles/Login.css"
import { Link, useHistory } from 'react-router-dom'
import logo from "../images/Logo Nivid - Noir.png"
import { useAuth } from "../context/userContext"; // context

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import frLocale from 'date-fns/locale/fr';
import MobileDatePicker from '@mui/lab/MobileDatePicker';

import { ButtonLarge } from '../components/utilities/Buttons'

const Subscribe = () => {

    const [firstName, setFirstName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [emailConfirm, setEmailConfirm] = useState("");
    const [tel, setTel] = useState("");
    const [birthDate, setBirthDate] = useState(new Date('January 1, 1989'));
    const [gender, setGender] = useState("h");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");
    const [fieldError, setFieldError] = useState("");

    const [signinFlag, setSigninFlag] = useState(0)

    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const [isCalendarOpened, setIsCalendarOpened] = useState(false);


    const { subscribe, signInWithGoogle } = useAuth() // context
    const history = useHistory()


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

    async function handleSubscribeForm(e) {
        e.preventDefault()
        const valid = await isValid()
        if (valid === true) {
            const res = await subscribe(email, password, firstName, name, tel, gender, birthDate)
            if (res === "auth/email-already-in-use") {
                setError("Cet email est déjà utilisé")
            }
            else if (res === true) {
                history.push('/confirmation')
            }
        }
    }

    async function isValid() {
        // else if(birthDate !== 0) {setError("Veuillez renseigner votre nom")} A faire avec la date de naissance
        if (firstName.length > 1) {
            if (name.length > 1) {
                if (tel.toString().length === 0 || (tel.toString().length === 10)) {
                    if (password.length >= 8) {
                        if (password === passwordConfirm) {
                            if (email === emailConfirm) {
                                return true
                            }
                            else {
                                setError("La confirmation de l'email ne correspond pas")
                                setFieldError("emailconfirm")
                            }
                        }
                        else {
                            setError("La confirmation du mot de passe ne correspond pas")
                            setFieldError("passwordconfirm")
                        }
                    }
                    else {
                        setError("Votre mot de passe doit contenir au moins 8 caractères")
                        setFieldError("password")
                    }
                }
                else {
                    setError("Veuillez renseigner un numéro de téléphone valide")
                    setFieldError("tel")
                }
            }
            else {
                setError("Veuillez renseigner votre nom")
                setFieldError("nom")
            }
        }
        else {
            setError("Veuillez renseigner votre prénom")
            setFieldError("prenom")
        }
    }

    function handleOnChangeInputs(name, value) {
        if (name === fieldError) {
            setFieldError("")
        }
        if (name === "prenom") { setFirstName(value) }
        else if (name === "nom") { setName(value) }
        else if (name === "birthDate") { setBirthDate(value); setIsCalendarOpened(false) }
        else if (name === "sexe") { setGender(value) }
        else if (name === "tel") { setTel(value) }
        else if (name === "email") { setEmail(value) }
        else if (name === "emailconfirm") { setEmailConfirm(value) }
        else if (name === "password") { setPassword(value) }
        else if (name === "passwordconfirm") { setPasswordConfirm(value) }
    }

    const loginF = (flag) => {
        setSigninFlag(flag)
    }

    return (
        <div className="loginSubscribeContainer">
            <header>
                <div className="logoContainer">
                    <img alt="" src={logo} />
                </div>
            </header>
            <div className="blocLoginTopRight">
                {!isMobile() &&
                    <div className="LoginBackLink">
                        <Link to="/">Revenir à l'accueil</Link>
                    </div>
                }
                {/*<p>Vous avez déjà un compte ?</p> */}
                <Link to="/">Revenir à l'accueil</Link>
            </div>
            <div className={!isMobile() ? "subscribePageContainer" : "subscribePageContainer moblie"}>
                {!isMobile() &&
                    <div className="marketingBlocForm">
                        <div className="marketingItem">
                            <h2>Inscris-toi</h2>
                            <p>gratuitement en 1 minute pour créer ton évènement et découvrir les offres de partenaires autour de chez toi.</p>
                        </div>
                        <div className="marketingItem">
                            <h3>Imagine</h3>
                            <p>ton évènement en choisissant ce dont tu as envie, en gérant habilement ton budget</p>
                        </div>
                        <div className="marketingItem">
                            <h3>Que la fête commence !</h3>
                            {/* <p>En vous inscrivant, vous accéderez à des tarifs spécialement négociés pour vous, et que vous ne trouverez nulle part ailleurs.</p> */}
                        </div>
                    </div>
                }
                <div className="subscribeContainer">
                    <h1>Inscris-toi à Nivid</h1>
                    <p>Gérez votre compte, consultez vos événements et bien plus encore.</p>
                    <div>
                        {(!signinFlag || !isMobile()) &&
                            <div className="googleSignInContainer">
                                <buttton className="googleSignInButton" onClick={() => signInWithGoogle()}>
                                    <div className="googleSignInButtonImageContainer">
                                        <img alt="" src={'/images/google.png'} />
                                    </div>
                                    <span>Inscrivez-vous avec Google</span>
                                </buttton>
                            </div>
                        }
                        {(isMobile() && !signinFlag) && 
                            <div className="googleSignInContainer">
                                <buttton className="googleSignInButton" onClick={() => loginF(1)}>
                                    <div className="googleSignInButtonImageContainer">
                                        <img alt="" src={'/images/user.png'} />
                                    </div>
                                    <span>Utiliser mon e-mail</span>
                                </buttton>
                            </div>
                        }
                    </div>
                    {(!isMobile() || signinFlag===1) &&
                        <form style={{opacity:signinFlag == 1 ? 1 : 0, transition:'all 0.5s'}}>
                            <div className="formLine">
                                <div className={fieldError === "prenom" ? "formField error" : "formField"}>
                                    <label>Prénom</label>
                                    <input value={firstName} type="text" name="prenom" onChange={(e) => handleOnChangeInputs("prenom", e.target.value)} />
                                </div>
                                <div className={fieldError === "nom" ? "formField error" : "formField"}>
                                    <label>Nom</label>
                                    <input value={name} type="text" name="nom" onChange={(e) => handleOnChangeInputs("nom", e.target.value)} />
                                </div>
                            </div>

                            <div className="formLine">
                                <div className={fieldError === "birthDate" ? "formFieldSpecialDate error" : "formFieldSpecialDate"}>
                                    <label>Date de naissance</label>
                                    <div
                                        onClick={() => setIsCalendarOpened(!isCalendarOpened)}
                                        className="etape1DatePicker subscribe"
                                    >
                                        {new Date(birthDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
                                    </div>
                                    {isCalendarOpened &&
                                        <div className="calendarContainerAbsolute">
                                            <LocalizationProvider style={{ position: "relative!important" }} locale={frLocale} dateAdapter={AdapterDateFns}>
                                                {isMobile() ?
                                                    <MobileDatePicker
                                                        label="Date de l'évènement"
                                                        open={isCalendarOpened}
                                                        onClose={() => setIsCalendarOpened(false)}
                                                        value={birthDate}
                                                        onChange={(val) => handleOnChangeInputs("birthDate", val)}
                                                        renderInput={() => null}
                                                    />
                                                    :
                                                    <DatePicker
                                                        open={isCalendarOpened}
                                                        onClose={() => setIsCalendarOpened(false)}
                                                        value={birthDate}
                                                        onChange={(val) => handleOnChangeInputs("birthDate", val)}
                                                        renderInput={() => null}
                                                    />
                                                }
                                            </LocalizationProvider>
                                        </div>
                                    }
                                </div>
                                <div className={fieldError === "sexe" ? "formField error" : "formField"}>
                                    <label>Sexe</label>
                                    <select value={gender} onChange={(e) => handleOnChangeInputs("sexe", e.target.value)}>
                                        <option value="h">Homme</option>
                                        <option value="f">Femme</option>
                                    </select>
                                </div>
                            </div>

                            <div className="formLine">
                                <div className={fieldError === "tel" ? "formField error" : "formField"}>
                                    <label>Numéro de téléphone (facultatif)</label>
                                    <input value={tel} type="tel" name="numero" onChange={(e) => handleOnChangeInputs("tel", e.target.value)} pattern="[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}" />
                                </div>
                            </div>

                            <div className="formLine">
                                <div className={fieldError === "email" ? "formField error" : "formField"}>
                                    <label>Email</label>
                                    <input value={email} type="email" name="email" onChange={(e) => handleOnChangeInputs("email", e.target.value)} />
                                </div>
                                <div className={fieldError === "password" ? "formField error" : "formField"}>
                                    <label>Mot de passe</label>
                                    <input value={password} type="password" name="password" onChange={(e) => handleOnChangeInputs("password", e.target.value)} />
                                </div>
                            </div>

                            <div className="formLine">
                                <div className={fieldError === "emailconfirm" ? "formField error" : "formField"}>
                                    <label>Confirmation d'email</label>
                                    <input value={emailConfirm} type="email" name="emailconfirm" onChange={(e) => handleOnChangeInputs("emailconfirm", e.target.value)} />
                                </div>
                                <div className={fieldError === "passwordconfirm" ? "formField error" : "formField"}>
                                    <label>Confirmation mot de passe</label>
                                    <input value={passwordConfirm} type="password" name="passwordconfirm" onChange={(e) => handleOnChangeInputs("passwordconfirm", e.target.value)} />
                                </div>
                            </div>
                        </form>
                    }
                </div>
            </div>
            
            {/* <div className="LoginDiviserContainer">
                <div className="LoginDiviser">
                    <p>ou</p>
                </div>
            </div>
            <p className="errorMessage">{error}</p> */}
            {signinFlag===1 && 
                <div className="bottomSubscribeContainer">
                    <div className="formField conditionsGenerales">
                        <p>En créant un compte chez Nivid, vous acceptez les <a href="CGU">conditions générales</a> du site.</p>
                    </div>
                    <div className="formField">
                        <ButtonLarge
                            onClick={(e) => handleSubscribeForm(e)}
                            color="orange"
                            value="S'inscrire"
                            backgroundColor="rgba(245, 192, 67)"
                            marginTop="10px"
                        />
                    </div>
                </div>
            }
        </div>
    )
}
export default Subscribe;
