import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import "../styles/Slider.css"
import { useAuth } from '../context/userContext'

import { ButtonSmall } from './utilities/Buttons'



const Slideshow = ({ sellers, eventStatus, windowsWidth, isMobile }) => {

    const [currentPageOffer, setCurrentPageOffer] = useState(0);
    const { event } = useAuth()

    const history = useHistory()

    useEffect(() => {

    }, [])



    const container = isMobile ? windowsWidth - (windowsWidth * 0.1) : windowsWidth - 660
    const itemWidth = windowsWidth < 600 ? windowsWidth - (windowsWidth * 0.20) : 243
    const itemHeight = itemWidth * 1.4

    function handlePaginationItem(val) {
        const count = sellers && sellers.length; // 5 pour exemple
        const maxPage = Math.ceil(count - (container / (itemWidth))); // 4
        if (val <= maxPage && val >= 0 && (count - maxPage) >= 1) { setCurrentPageOffer(val) }
    }

    function isButtonDisabled(val) {
        const count = sellers && sellers.length; // 5 pour exemple
        const maxPage = Math.ceil(count - (container / (itemWidth))); // 4
        if (val <= maxPage && val >= 0 && (count - maxPage) >= 1) { return null }
        else { return "disabled" }
    }

    function sellerClicked(sellerID) {
        if (eventStatus === "creating") {
            history.push(`/creer-mon-evenement/etape-2/prestataires/${sellerID}`)
        }
    }

    return !isMobile ?
        <div>
            <div style={{ marginLeft: -(currentPageOffer * itemWidth) }} className="detailsServiceItemContainer">
                {sellers && sellers.length > 0 && sellers.map((item, key) => {
                    return (

                        <div
                            key={key}
                            className={`itemPrestataireDashboard ${eventStatus === "creating" && "clickable"}`}
                            onClick={() => sellerClicked(item.uid)}
                            style={{
                                width:320,
                                height:480,
                                backgroundImage: (item && item.image_path) && `url(${item.image_path.url})`
                            }}
                        >
                            <span className="bottom">
                                <p>{(item && item.companyName) && item.companyName}</p>
                                {
                                    eventStatus === "creating" && <p>+ en savoir plus</p>
                                }
                            </span>
                            <span className="top">
                                {eventStatus !== "creating" && (
                                    <div>
                                        { item.status === "validated" && <p className="validPrestation">Prestation validée</p>}
                                        {item.status === "pending" && <p className="checkingPrestation">En attente de validation</p>}
                                    </div>
                                )
                                }
                            </span>
                        </div>
                    )
                })}
            </div>
            {sellers && sellers.length > 0 &&
                <div>
                    <div className="buttonDuoDashboard">
                        {/* <ButtonSmall
                            onClick={() => handlePaginationItem(currentPageOffer - 1)}
                            color="grey"
                            value="Précédent"
                            marginRight="20px"
                            disabled={isButtonDisabled(currentPageOffer - 1)}
                        />

                        <ButtonSmall
                            onClick={() => handlePaginationItem(currentPageOffer + 1)}
                            color="grey"
                            value="Suivant"
                            disabled={isButtonDisabled(currentPageOffer + 1)}
                        /> */}
                    </div>
                </div>
            }
        </div>

        : windowsWidth < 600 ?
            <div>
                <div style={{ marginLeft: -(currentPageOffer * (windowsWidth - windowsWidth * 0.17)) + windowsWidth * 0.035 }} className="detailsServiceItemContainer">
                    <button style={{backgroundColor:'white', border:'0px'}} onClick={() => handlePaginationItem(currentPageOffer + 1)}>
                        <svg width="36" height="36" viewBox="0 0 24 24">
                            <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z"></path>
                        </svg>
                    </button>
                    {sellers && sellers.length > 0 && sellers.map((item, key) => {
                        
                        return (
                            <div>
                                <div
                                    key={key}
                                    className="itemPrestataireDashboard mobile"
                                    style={{
                                        width:'80%',
                                        height:480,
                                        marginRight: windowsWidth * 0.030,
                                        backgroundImage: (item && item.image_path) && `url(${item.image_path.url})`
                                    }}
                                >
                                    <span className="bottom">
                                        <p>{(item && item.companyName) && item.companyName}</p>
                                        <p>+ en savoir plus</p>
                                    </span>
                                    <span className="top">
                                        {eventStatus !== "creating" &&
                                            <div>
                                                {item.status === "validated" && <p className="validPrestation">Prestation validée</p>}
                                                {item.status === "pending" && <p className="checkingPrestation">En attente de validation</p>}
                                            </div>
                                        }
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                    <button style={{backgroundColor:'white', border:'0px'}} onClick={() => handlePaginationItem(currentPageOffer - 1)}>
                        <svg width="36" height="36" viewBox="0 0 24 24">
                            <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z"></path>
                        </svg>
                    </button>
                </div>
                {sellers && sellers.length > 0 &&
                    <div style={{textAlign:'center',fontSize:'25px'}}>
                        <p><b>Le paiement de <br/>l'acompte a été <span style={{color:'rgb(85 233 32)'}}>validé</span></b></p>
                        <p><b>Reste a payer: {event.budget}€</b> <br/> Le jour de l'événement</p>
                    </div>
                } 
            </div>

            : (windowsWidth > 600 && isMobile) &&
            <div>
                <div style={{ marginLeft: -(currentPageOffer * (itemWidth + 25)) }} className="detailsServiceItemContainer">
                    {sellers && sellers.length > 0 && sellers.map((item, key) => {
                        return (
                            <div
                                key={key}
                                className="itemPrestataireDashboard"
                                style={{
                                    minWidth: itemWidth,
                                    maxWidth: itemWidth,
                                    marginRight: '25px',
                                    backgroundImage: (item && item.image_path) && `url(${item.image_path.url})`
                                }}
                            >
                                <span className="bottom">
                                    <p>{(item && item.companyName) && item.companyName}</p>
                                    <p>+ en savoir plus</p>
                                </span>
                                <span className="top">
                                    {eventStatus !== "creating" &&
                                        <div>
                                            {item.status === "validated" && <p className="validPrestation">Prestation validée</p>}
                                            {item.status === "pending" && <p className="checkingPrestation">En attente de validation</p>}
                                        </div>
                                    }
                                </span>
                            </div>
                        )
                    })}
                </div>
                {sellers && sellers.length > 0 &&
                    <div>
                        <div className="buttonDuoDashboard mobileLight">

                            <ButtonSmall
                                onClick={() => handlePaginationItem(currentPageOffer - 1)}
                                color="grey"
                                value="Précédent"
                                marginRight="20px"
                                disabled={isButtonDisabled(currentPageOffer - 1)}
                            />

                            <ButtonSmall
                                onClick={() => handlePaginationItem(currentPageOffer + 1)}
                                color="grey"
                                value="Suivant"
                                disabled={isButtonDisabled(currentPageOffer + 1)}
                            />
                        </div>
                    </div>
                }
            </div>




}

export default Slideshow;