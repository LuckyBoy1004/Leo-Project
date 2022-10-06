import React, { useEffect, useState } from 'react'
import logo from "../images/logoWhite.svg"
import { Link, useHistory, useLocation } from 'react-router-dom'
import { useAuth } from "../context/userContext"; // context

const Footer = () => {

    const history = useHistory()
    const [email, setEmail] = useState("")
    const [isAdded, setIsAdded] = useState(false)
    const [errorNewsletter, setErrorNewsletter] = useState("")
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const location = useLocation()

    const { sendInBlue_addContactToNewsletter } = useAuth() // context

    useEffect(() => {
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))
    })
    
    const isMobile = () => (windowsWidth > 1100) ? false : true
    const handleResize = (width) => setWindowsWidth(width)

    async function handleNewsletterSubscribe() {
        const isEmailValid = await handleAddNewEmail(email)
        if (isEmailValid === true) {
            const req = await sendInBlue_addContactToNewsletter(email)
            if (req === true) {
                setEmail("")
                setIsAdded(true)
            }
            else setErrorNewsletter("Vous êtes déjà inscrit")
        }
    }

    async function handleAddNewEmail(email) {
        let containAt = email.indexOf("@")
        if (containAt < 1) return false;

        let containDot = email.indexOf(".")
        if (containDot <= containAt + 2) return false;


        if (containDot === email.length - 1) return false;

        return true
    }

    return (
        <div>
        
        {(isMobile() && (location.pathname === "/compte" || location.pathname === "/inscription")) ?
            <div className={`${isMobile() && "mobilefooter"}`}>
                {location.pathname === "/compte" ?
                    <div><p class="noAccountfooter">Tu n'as pas de compte ? </p>
                    <Link class="linkfootersignup" to="/inscription">Inscription</Link></div>
                    :
                    <div><p class="noAccountfooter">Vous avez déjà un compte ?</p>
                    <Link class="linkfootersignup" to="/compte">Connectez-vous</Link></div>
                }
                
            </div>
        :
            <div className={`footer ${isMobile() && "mobile"}`}>
                <div className="column logo">
                    <img alt="" src={logo} />
                </div>
                <div className="column newsletter">
                    <h2>Restons en contact!</h2>
                    {!isAdded ?
                        <>
                            <p>0% de spam, 100% de bon plan</p>
                            {/* <span>1 fois par semaine</span> */}
                            <div className="inputContainerNewsletter">
                                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre e-mail" />
                                <div onClick={() => handleNewsletterSubscribe()} className="arrowRightContainer">
                                    <div className="arrowRight"></div>
                                </div>
                                {
                                    errorNewsletter !== "" && <span>{errorNewsletter}</span>
                                }
                            </div>
                        </>
                        :
                        <p>Merci pour votre inscription</p>
                    }

                </div>
                <div className="column nivid">
                    <h2>A propos</h2>
                    <ul>
                        <li onClick={() => history.push('/qui-sommes-nous')}>Qui sommes-nous ?</li>
                        <li onClick={() => history.push('/faq')}>Blog</li>
                        <li onClick={() => history.push('/faq')}>FAQ</li>
                    </ul>
                </div>
                <div className="column aide">
                    <h2>Besoin d'aide ?</h2>
                    <ul>
                        <li onClick={() => history.push('/demande-de-rappel')}>Devenir partenaire</li>
                        <li onClick={() => history.push('/acces-prestataire')}>Connexion partenaire</li>
                        <li onClick={() => history.push('/contact')}>Aide & assistance</li>
                    </ul>
                </div>
                <div className="column legal">
                    <h2>Légal</h2>
                    <ul>
                        <li onClick={() => history.push('/cgv')}>CGV</li>
                        <li onClick={() => history.push('/cgu')}>CGU</li>
                        <li onClick={() => history.push('/politique')}>Politique de confidentialité</li>
                        <li onClick={() => history.push('/mention')}>Mentions légales</li>
                    </ul>
                </div>
            </div>
        }
        </div>
    )
}

export default Footer