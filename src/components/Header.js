import React, { useState, useEffect } from 'react';
import '../styles/Header.css'
import { Link, useHistory } from "react-router-dom";
import logo from "../images/logoBlack.svg"
import logoWhite from "../images/logoWhite.svg"
import { useAuth } from "../context/userContext";
import { CSSTransition } from 'react-transition-group'
import { useLocation } from 'react-router-dom'
import { HamburgerSlider } from 'react-animated-burgers'
import disableScroll from 'disable-scroll';

const Header = ({ active }) => {

    const { logout, user, seller } = useAuth() // context
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const [isNavActive, setIsNavActive] = useState(false)
    const [isPopinActive, setIsPopinActive] = useState(false)
    const [isButtonHover, setIsButtonHover] = useState(false)
    const [isScroll, setIsScroll] = useState(false)

    const history = useHistory()
    const location = useLocation()

    const isMobile = () => (windowsWidth > 1100) ? false : true
    const handleResize = (width) => setWindowsWidth(width)

    useEffect(() => {
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))
        disableScroll.off()
    }, [])

    async function handleLogOut() {
        try {
            await logout()
        } catch {
            console.log("erreur logout")
        }
    }

    function handleBurgerClicked() {
        isScroll ? disableScroll.off() : disableScroll.on()
        setIsNavActive(!isNavActive)
        setIsScroll(!isScroll)
    }

    const accountButton = () => {
        return <div
            className="header_button_login"
            onMouseLeave={() => setTimeout(() => setIsButtonHover(false), 100)}
            onMouseOver={() => setIsButtonHover(true)}
        >
            {
                (!user && !seller) ?
                    <button
                        onClick={() => setIsPopinActive(!isPopinActive)}
                        className={(location.pathname === "/contact" || isPopinActive) ? "white margintopbutton smallButton" : "orange smallButton"}>
                        {isPopinActive ? "Fermer" : "Se connecter"}
                    </button>
                    : (user) ?
                        <>
                            <button
                                onClick={() => history.push("/compte")}
                                className={`smallButton ${location.pathname === "/contact" ? "white" : "orange"} ${isButtonHover ? "onHover" : ""}`}>
                                Mon compte
                            </button>
                            {isMobile() && <button onClick={() => handleLogOut()} className="white largeButton">Deconnexion</button>}
                            {(!isMobile() && isButtonHover) &&
                                <div className="subMenu">
                                    <a href="/" onClick={() => handleLogOut()}>Se déconnecter</a>
                                </div>
                            }
                        </>
                        : (seller) &&
                        <>
                            <button
                                onClick={() => history.push("/mon-compte-partenaire")}
                                className={location.pathname === "/contact" ? "white smallButton" : "orange smallButton"}>
                                Mon compte
                            </button>
                            {isMobile() && <button onClick={() => handleLogOut()} className="white largeButton">Deconnexion</button>}
                            {(!isMobile() && isButtonHover) &&
                                <div className="subMenu">
                                    <a href="/" onClick={() => handleLogOut()}>Se déconnecter</a>
                                </div>
                            }
                        </>
            }

            <CSSTransition
                in={isPopinActive}
                timeout={300}
                classNames="pageTransition"
                unmountOnExit
            >
                <div className="loginPopup_background">
                    <div className="loginPopup">
                        <h1 class="chooseheader">Que souhaitez-vous faire ?</h1>
                        <div className="loginChoose">
                            <div>
                                <h1>Vous êtes particulier ?</h1>
                                <p>Pour organiser votre évènement sans prise de tête c’est par ici !</p>
                                <button onClick={() => history.push('/compte')} className="orange smallButton">Je me connecte</button>
                            </div>
                            {/* {isMobile() && <div className="divider"></div>} */}
                            <div>
                                <h1>Vous êtes partenaire ?</h1>
                                <p>Boostez vos revenus en toute simplicité et entrez dans leurs fêtes !</p>
                                <button onClick={() => history.push('/acces-prestataire')} className="orange smallButton">Je me connecte</button>
                            </div>
                        </div>
                    </div>
                </div>
            </CSSTransition>
        </div>
    }

    return (
        <header
            className={`${isMobile() && "mobile"} ${location.pathname === "/" && " white"} ${location.pathname === "/contact" && "contact"}`}
        >
            <div onClick={() => history.push('/')} className="logoContainer">
                <img alt="" src={((location.pathname === "/" && !isNavActive) || location.pathname === "/contact" && !isNavActive) ? logoWhite : logo} />
            </div>
            <CSSTransition
                in={isNavActive || !isMobile()}
                timeout={300}
                classNames="pageTransition"
                unmountOnExit
            >
                <nav className={isNavActive && "active"}>
                    <ul>
                        <li className={isLinkActive("/")}>
                            <Link to="/">Accueil</Link>
                        </li>
                        <li className={isLinkActive("/qui-sommes-nous")}>
                            <Link to="/qui-sommes-nous">Qui sommes-nous ?</Link>
                        </li>
                        {seller && 
                            <li className={isLinkActive("/mon-compte-partenaire/process/description")}>
                                <Link to="/mon-compte-partenaire/process/description">Accès entreprise</Link>
                            </li>
                        }
                        <li className={isLinkActive("/blog")}>
                            <Link to="/blog">Blog</Link>
                        </li>
                        <li className={isLinkActive("/contact")}>
                            <Link to="/contact">Contact</Link>
                        </li>
                        {
                            isMobile() &&
                            <>
                                <li>
                                    <Link to="/faq">FAQ</Link>
                                </li>
                                {/* <li>
                                    <Link to="/faq">Mentions légales</Link>
                                </li>
                                <li className="socialNetwork">
                                    <span>Facebook</span>
                                    <span>Twitter</span>
                                    <span>Instagram</span>
                                </li> */}
                                {accountButton()}
                            </>

                        }
                    </ul>
                </nav>
            </CSSTransition>
            {!isMobile() && accountButton()}
            {isMobile() &&
                <div className="burgerMenuContainer">
                <style>
                    {
                    `
                    .sc-dlfnuX {
                        width: ${!isNavActive ? '25px !important' : '40px !important'};
                        background-color:${((location.pathname === "/" && !isNavActive) || location.pathname === "/contact" && !isNavActive) ? 'white !important' : 'black !important'};
                        right: 0px;
                    }
                    .sc-dlfnuX::before {
                        width: 40px !important;
                        background-color: ${((location.pathname === "/" && !isNavActive) || location.pathname === "/contact" && !isNavActive) ? 'white !important;' : 'black !important;'};
                        right: 0px;
                        }
                        
                    .sc-dlfnuX::after {
                    width: ${!isNavActive ? '33px !important' : '40px !important'};
                    background-color: ${((location.pathname === "/" && !isNavActive) || location.pathname === "/contact" && !isNavActive) ? 'white !important' : 'black !important'};
                    right: 0px;
                    }
                    `
                    }
                </style>
                    <HamburgerSlider onClick={() => handleBurgerClicked()} isActive={isNavActive} />
                </div>
            }
        </header>
    )
}

function isLinkActive(link) {
    if (link === window.location.pathname) { return "active" }
}

export default Header;