import React, { useState, useEffect } from "react";
import '../styles/Contact.css'
import LogoTransparentImg from "../images/logo_transparence_contact.svg"


const Contact = (props) => {

    return (
        <>
            <div className="contactPage">
                <div className="contactPage_header">
                    <img src={LogoTransparentImg} alt="" />
                    <h1>Contactez-nous</h1>
                    <p className="obliged">* obligatoire</p>
                </div>
                <div className="conctPage_body">
                    <div className="contactPage_form_bloc">
                        <div className="formLine">
                            <div className="formField">
                                <label htmlFor="name">Votre nom *</label>
                                <input name="name" type="text" value="" />
                            </div>
                            <div className="formField">
                                <label htmlFor="email">Votre adresse email *</label>
                                <input name="email" type="text" value="" />
                            </div>
                        </div>
                        <div className="formLine">
                            <div className="formField">
                                <label htmlFor="commandID">Votre numéro de commande</label>
                                <input name="commandID" type="text" value="" />
                            </div>
                            <div className="formField">
                                <label htmlFor="tel">Numéro de téléphone</label>
                                <input name="tel" type="text" value="" />
                            </div>
                        </div>
                        <div className="formLine">
                            <div className="formField">
                                <label htmlFor="message">Votre message *</label>
                                <textarea name="message"></textarea>
                            </div>
                        </div>
                        <div className="contactPage_form_bloc_bottom">
                            <p>En soumettant ce formulaire, vous acceptez nos <a href="/CGU">conditions générales d'utilisations</a> ainsi que notre <a href="/politique">politique de confidentialité</a>.</p>
                            <button className="blue largeButton">Envoyer le message</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Contact;
