
import React, { useState } from 'react'
import { CSSTransition } from 'react-transition-group';
import ReactLoading from 'react-loading';
import { useAuth } from '../context/userContext'
import { auth } from '../assets/base'

const EmailNotVerified = () => {
    const { user, updateUserEmail, setUser } = useAuth()

    const [errorResend, setErrorResend] = useState("")
    const [errorUpdateEmail, setErrorUpdateEmail] = useState("")
    const [isVerificationEmailResent, setIsVerificationEmailResent] = useState(false)
    const [isVerificationMessageDisplay, setIsVerificationMessageDisplay] = useState(true)
    const [isDisplayUpdateEmail, setIsDisplayUpdateEmail] = useState(false)
    const [email, setEmail] = useState("")
    const [loadingUpdateEmail, setLoadingUpdateEmail] = useState(false)


    function preHandleUpdateEmail() {
        setIsDisplayUpdateEmail(true)
        setErrorUpdateEmail("")
    }

    async function handleUpdateEmail() {
        if (loadingUpdateEmail === true) {
            return
        }
        else {
            setLoadingUpdateEmail(true)
            await updateUserEmail(email)
                .then(res => {
                    if (res === true) {
                        setUser({ ...user, email: email })
                        setIsDisplayUpdateEmail(false)
                        setLoadingUpdateEmail(false)
                    }
                    else if (res === "auth/invalid-email") {
                        setErrorUpdateEmail("E-mail invalide")
                        setLoadingUpdateEmail(false)
                    }
                    else if (res === "auth/email-already-in-use") {
                        setErrorUpdateEmail("E-mail déjà utilisé")
                        setLoadingUpdateEmail(false)
                    }
                    else if (res === "auth/requires-recent-login") {
                        setErrorUpdateEmail("Une erreur est servenue. Tentez de vous connecter à nouveau puis réessayez.")
                        setLoadingUpdateEmail(false)
                    }
                    else if (res === "auth/too-many-requests") {
                        setErrorUpdateEmail("Merci d'attendre quelques minutes avant de changer à nouveau votre adresse e-mail")
                        setLoadingUpdateEmail(false)
                    }
                    else {
                        console.log(res)
                        setLoadingUpdateEmail(false)
                    }
                })
        }
    }

    function handleResendEmailConfirmation() {
        setErrorResend("")
        if (user.emailVerified === false) {
            auth.currentUser.sendEmailVerification()
                .then(res => {
                    setIsVerificationEmailResent(true)
                    // setUser à faire pour actualiser le lastVerifEmailSent
                })
                .catch((error) => {
                    if (error.code = "auth/too-many-requests") {
                        setErrorResend("Merci de patienter un peu pour renvoyer un e-mail.")
                    }
                })
        }
    }

    return (
        <div>
            {isVerificationMessageDisplay && !isVerificationEmailResent &&
                <div className="emailNotVerifiedMessage">
                    <p>Merci de confirmer votre adresse email en cliquant sur le lien de confirmation que vous avez reçu à cette adresse : {user.email}</p>
                    <div className="bottomEmailNotVerified">
                        <p>Vous n'avez rien reçu ?</p>
                        <button onClick={() => handleResendEmailConfirmation()}>Renvoyer l'email de confirmation</button>
                        <button onClick={() => preHandleUpdateEmail()}>Modifier l'adresse e-mail</button>
                    </div>
                    {errorResend.length > 0 && <p>{errorResend}</p>}
                </div>
            }

            <CSSTransition
                in={isVerificationEmailResent}
                timeout={300}
                classNames="opacityTransition"
                unmountOnExit
                onEnter={() => setIsVerificationMessageDisplay(false)}
                onExited={() => setIsVerificationMessageDisplay(true)}
            >
                <div className="emailNotVerifiedMessage">
                    <p>Un nouvel email de confirmation vous a été envoyé.</p>
                    <p className="backUpdateEmail" onClick={() => setIsVerificationEmailResent(false)}>Retour</p>
                </div>
            </CSSTransition>

            <CSSTransition
                in={isDisplayUpdateEmail}
                timeout={300}
                classNames="opacityTransition"
                unmountOnExit
                onEnter={() => setIsVerificationMessageDisplay(false)}
                onExited={() => setIsVerificationMessageDisplay(true)}
            >
                <div className="emailNotVerifiedMessage">
                    <h2>Modifiez votre adresse e-mail</h2>
                    <p>Merci d'entrer une nouvelle adresse e-mail dans le champ ci-dessous. Vous recevrez ensuite un nouvel e-mail de vérification.</p>
                    <div className="formLine">
                        <div className="formField">
                            <label>Votre adresse e-mail</label>
                            <input value={email} type="email" name="email" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="formField">
                            <button className="submit" type="submit" name="submit" onClick={() => handleUpdateEmail()}>
                                {!loadingUpdateEmail ?
                                    "Valider & renvoyer un mail de validation"
                                    :
                                    <ReactLoading className="loadingSpinner button" type="spin" color="rgba(255, 255, 255)" height={20} width={20} />
                                }
                            </button>
                        </div>
                    </div>
                    {errorUpdateEmail.length > 0 && <p>{errorUpdateEmail}</p>}
                    <p className="backUpdateEmail" onClick={() => setIsDisplayUpdateEmail(false)}>Retour</p>
                </div>
            </CSSTransition>
        </div>
    )
}

export default EmailNotVerified