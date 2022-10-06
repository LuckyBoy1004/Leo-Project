import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useHistory } from 'react-router-dom'
import '../styles/Contact_Boutique.css'
import NoteWidget from '../components/NoteWidget'
import Image from '../components/utilities/Image'

import imgBloc1 from '../images/Calque2.svg'
import rappelImg1 from '../images/rapellVid1.png'
import rappelImg2 from '../images/rapellVid2.png'
import rappelImg3 from '../images/rapellVid3.png'

const Contact_Boutique = (props) => {

    const history = useHistory()

    const search = useLocation().search
    const referral = new URLSearchParams(search).get('referral')

    const [openedFAQDropdown, setOpenedFAQDropdown] = useState(0)

    useEffect(() => {
    })

    function handleAncreClicked() {
        window.scrollTo(0, 0);
    }

    return (
        <>
            <div className="contact_seller1">
                <div>
                    <h1><span>Rejoignez</span> NIVID!</h1>
                    <h2>Une plateforme au service de ses partenaires</h2>
                    <div className="contact_seller_form_bloc">
                        <p>Une question ? Demandez un rappel en remplissant le formulaire :</p>
                        <div className="contact_seller_form">

                            <div className="formLine">
                                <div className="formField">
                                    <label htmlFor="name">Votre nom *</label>
                                    <input name="name" type="text" value="" />
                                </div>
                                <div className="formField">
                                    <label htmlFor="email">Votre adresse mail *</label>
                                    <input name="email" type="text" value="" />
                                </div>
                            </div>

                            <div className="formLine">
                                <div className="formField">
                                    <label htmlFor="tel">Votre numéro de téléphone *</label>
                                    <input name="tel" type="text" value="" />
                                </div>
                                <div className="formField">
                                    <label htmlFor="domaine">Votre domaine d'activité *</label>
                                    <input name="domaine" type="text" value="" />
                                </div>
                            </div>

                            <div className="formLine">
                                <div className="formField">
                                    <label htmlFor="how">Comment avez-vous entendu parler de nous ? *</label>
                                    <input name="how" type="text" value="" />
                                </div>
                            </div>
                            <div className="contact_seller_form_button">
                                <button className="blue largeButton">Envoyer ma demande de rappel</button>
                            </div>
                        </div>
                    </div>

                </div>
                <div>
                    <img src={imgBloc1} alt="" />
                </div>
            </div>
            <div className="contact_seller2">
                <h1>Mettez en avant votre <span>savoir-faire</span>, laissez-nous faire le <span>reste</span></h1>
                {/*<div className="contact_seller2_banner1">

                </div>
                <div className="contact_seller2_banner2">

                </div> */}
            </div>
            <div className="contact_seller3">
                <div className="contact_seller3_videos">
                {/* <img src={rappelImg1} alt="" />
                    <img src={rappelImg2} alt="" /> */}
                    <img src={rappelImg2} alt="" />
                </div>
                <button onClick={() => handleAncreClicked()} className="blue largeButton">Je deviens partenaire</button>
            </div>
            <div className="contact_seller4">
                <h3>Questions fréquentes</h3>
                <div className="contact_seller4_item">
                    <h3>Quelles sont les prochaines étapes de mon inscription ?</h3>
                    <p>Pour t’inscrire sur NIVID tu dois nous donner les documents nous permettant d’identifier ton activité. En plus de cela nous organiserons une rencontre en visioconférence. Si tu réponds aux critères de qualité de NIVID, nous validerons ton inscription !</p>
                </div>
                <div className="contact_seller4_item">
                    <h3>Comment suis-je accompagné dans l’installation de ma vitrine ?</h3>
                    <p>Rassure-toi chez NIVID tu seras toujours accompagné et cela même après tes premiers pas.<br></br>
Pour installer ta vitrine, nous te mettrons à disposition des tutoriels et si besoin, tu pourras <a href="/contact">prendre rendez vous avec un membre de l’équipe NIVID.</a></p>
                </div>
                <div className="contact_seller4_item">
                    <h3>Aurais-je des contraintes a respecter en tant que partenaire NIVID ?</h3>
                    <p>Chez NIVID, nous mettons tout en œuvre pour offrir à nos partenaires et nos clients la meilleure expérience possible. Dans ce sens, nous avons mis en place les <a href="/CGU">conditions générales de service</a>, qui finalement reflètent l’état d’esprit NIVID !</p>
                </div>
                <div className="contact_seller4_item">
                    <h3>Combien coûte l’adhésion ?</h3>
                    <p>L’adhésion à la plateforme est gratuite, nous prélevons seulement une commission sur les prestations que vous vendrez grâce à NIVID !<br></br></p>
                </div>
            </div>
        </>
    )
}
export default Contact_Boutique;
