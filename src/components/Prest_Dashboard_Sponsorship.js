import React, { useRef, useState, useEffect } from 'react'
import { useAuth } from '../context/userContext'

import Title from './utilities/Title'
import SubTitle from './utilities/SubTitle'

import smileyOne from '../images/star-struck_1f929.png';
import smileyTwo from '../images/smiling-face-with-sunglasses_1f60e.png';
import imgParrainage from '../images/parrainage.png';
import imgParrainage1 from '../images/parrainage1.png';
import imgParrainage2 from '../images/parrainage2.png';
import imgParrainage3 from '../images/parrainage3.png';
import { FaCheck } from 'react-icons/fa'
import { CSSTransition } from 'react-transition-group'

const Prest_Dashboard_Sponsorship = () => {

    const {
        seller,
        getSellerReferralCountFromDB
    } = useAuth()

    const [isLinkCopied, setIsLinkCopied] = useState(false)

    const [isMounted, setIsMounted] = useState(false);

    const [referralCount, setReferralCount] = useState(0)

    useEffect(() => {
        getSellerReferralCountFromDB().then(count => {
            setReferralCount(count)
        })
        return setIsMounted(true)
    }, [])

    const sponsorLinkInput = useRef()

    function handleCopyLink() {
        sponsorLinkInput.current.select()
        document.execCommand("copy")
        setIsLinkCopied(true)
    }

    return (
        <CSSTransition
            in={isMounted}
            timeout={300}
            classNames="pageTransition"
            unmountOnExit
        >
            <div className="prest_Dashboard_Sponsorship">
                <div className="prest_dashboard_sponsorship_header">
                    <div className="sponsorship_header_content">
                        <img alt="" className="sponsorship_smileyOne_right" src={smileyOne} />
                        <img alt="" className="sponsorship_smileyTwo_right" src={smileyTwo} />
                        <img alt="" className="sponsorship_smallSmileyTwo_right" src={smileyTwo} />

                        <img alt="" className="sponsorship_smileyOne_left" src={smileyOne} />
                        <img alt="" className="sponsorship_smileyTwo_left" src={smileyTwo} />
                        <img alt="" className="sponsorship_smallSmileyOne_left" src={smileyOne} />

                        <Title value="Dites-leur qu'on s'amuse bien ici!" type="h2" font="roboto-medium" align="center" />
                        <SubTitle color="rgb(189, 189, 189)" type="big" font="roboto-bold" value="Dans notre programme de parrainage, tout le monde y gagne" />
                    </div>
                </div>
                <div className="prest_dashboard_sponsorship_content">
                    <img alt="" src={imgParrainage} />
                    <div className="prest_dashboard_sponsorship_content_features">
                        <div className="features_item">
                            <img alt="" src={imgParrainage1} />
                            <h2>Partagez votre lien</h2>
                            <p><FaCheck />Invitez vos amis professionnels à rejoindre NIVID en partageant votre lien unique.</p>
                        </div>
                        <div className="features_item">
                            <img alt="" src={imgParrainage2} />
                            <h2>Offrez la première prestation</h2>
                            <p><FaCheck />Dès leur inscription vos filleuls bénéficient de leur première prestation libre de commission NIVID, <br />en plus de vous être éternellement reconnaissants pour cette découverte</p>
                        </div>
                        <div className="features_item">
                            <img alt="" src={imgParrainage3} />
                            <h2>Soyez récompensé.e</h2>
                            <p><FaCheck />Lorsque vos filleuls effectuent leur première réservation, vous recevez à votre tour votre prochaine prestation libre de commission. Plus vous avez de filleuls, plus votre cagnotte augmente, vous suivez ? 😏</p>
                        </div>
                    </div>
                    <div className="prest_dashboard_sponsorship_content_sponsorCode">
                        <Title value="Partagez votre code parrain" type="h2" font="roboto-medium" align="center" />
                        <div className="sponsorCode_inputContainer">
                            <input ref={sponsorLinkInput} value={`nivid.fr/referral=${seller.referralToken}`} type="text" />
                            <span onClick={() => handleCopyLink()}>{isLinkCopied ? "Lien copié" : "Copier le lien"}</span>
                        </div>
                    </div>
                    <div className="prest_dashboard_sponsorship_content_stats">
                        <h2>Vous avez invité <span>{referralCount} personnes</span> pour le moment</h2>
                        <p>Ce décompte ne tient compte que des personnes ayant acceptés votre invitation & qui a ouvert un compte valide.</p>
                    </div>
                    <div className="prest_dashboard_sponsorship_content_video">

                    </div>
                </div>
            </div>
        </CSSTransition>
    )
}

export default Prest_Dashboard_Sponsorship