import React, { useState, useEffect } from "react";
import '../styles/Pepites.css'
import imgTest from '../images/CARREMENT-FLEUR-FLEURISTE-FRANCHISE-BOUTIQUE-MAGASIN__7_.png'
import Image from '../components/utilities/Image'
import { useAuth } from "../context/userContext";
import { useHistory } from 'react-router-dom'


const Pepites = (props) => {
    const history = useHistory()
    const { homeSellersDisplay } = useAuth() // context

    useEffect(() => {
        homeSellersDisplay.length === 0 && history.push('/')
    })

    return (
        <>
            <div className="pepitesPage">
                <h1>Les <span>pépites</span> de votre quartier</h1>
                <p>En plus de la grande qualité de services et produits qu’ils offrent, nos prestataires sont sélectionnés selon nos critères écologiques et sociétaux.</p>
                <div className="pepitesPage_content">
                    {
                        homeSellersDisplay
                        .slice(0, 4)
                        .map(item => {
                            return <div className="pepitesPage_item">
                                <div className="pepitesPage_item_top">
                                    <div className="pepitesPage_item_top_img">
                                        <Image url={item.image_path.url} />
                                    </div>
                                </div>
                                <div className="pepitesPage_item_bottom">
                                    <h4>{item.companyName}</h4>
                                    <p>{item.subcategory}</p>

                                </div>
                            </div>
                        })
                    }
                </div>
                <div className="pepitesPage_bottom">
                    <h3>Ça vous inspire ?</h3>
                    <button onClick={() => history.push('/dashboard')} className="green largeButton">Je commence mon évènement</button>
                </div>
            </div>
        </>
    )
}
export default Pepites;
