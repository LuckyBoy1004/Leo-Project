import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useHistory } from 'react-router-dom'
import '../styles/Home.css'
import marker from '../images/orange_marker.png'
import articleImage from '../images/Menu-gastronomique-facile.png';
import NoteWidget from '../components/NoteWidget'
import Image from '../components/utilities/Image'
import { FaPlus } from 'react-icons/fa';
import { Zoom } from "react-slideshow-image";
import 'react-slideshow-image/dist/styles.css'
import feature1 from '../images/confetti.svg'
import SimpleImageSlider from "react-simple-image-slider";
import feature2 from '../images/invitation-danniversaire.svg'
import feature3 from '../images/best-seller.svg'
import LocationSearchInput from "../components/autocompletePlaces"
import { useFirebase } from "../assets/base-context";
import { GoogleApiWrapper } from 'google-maps-react';
import { useAuth } from "../context/userContext";

import backgroundHome from '../images/homepage1-2.jpeg'
import imgTest from '../images/homepage1-2.jpeg'
import imgTest2 from '../images/rapellVid3.png'
import { padding } from "@mui/system";

const Home = (props) => {
    const zoomOutProperties = {
        duration: 5000,
        transitionDuration: 500,
        infinite: true,
        indicators: false,
        scale: 0.4,
        arrows: true
    };
    const isMobilenvir = () => (windowsWidth > 1160) ? false : true
    const slides = [
            {
                img: feature1,
                head: "De A à ",
                span: 'Z',
                para: "Commandez et réservez vos produits et prestations sur NIVID.fr gratuitement, sans bouger de votre canapé.",
            },
            {
                img: feature2,
                head: "Sans ",
                span: "devis",
                para: "Parce que l’on veut vous simplifier la vie, et vous aider à gérer votre budget.",
            },
            {
                img: feature3,
                head: "Autour de chez ",
                span: "vous",
                para: "Grâce à nos partenaires de proximité sélectionnés selon nos critères de qualités.",
            }
        ];
    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()

    const history = useHistory()
    const { setHomeSellersDisplay } = useAuth() // context

    const search = useLocation().search
    const referral = new URLSearchParams(search).get('referral')

    const [openedFAQDropdown, setOpenedFAQDropdown] = useState(0)

    const [city, setCity] = useState("")
    const [latLng, setLatLng] = useState("")
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const [activeSlide, setActiveSlide] = useState(1)
    const [errorSearchCity, setErrorSearchCity] = useState(false)

    useEffect(() => {
        if (referral !== null && referral.length > 1) {
            history.push(`/inscription-prestataire?referral=${referral}`)
        }

        window.addEventListener("resize", (e) => handleResize(window.innerWidth))
        
        // const interval = setInterval(() => {
        //     setActiveSlide(activeSlide => activeSlide === 3 ? 1 : activeSlide + 1)
        // }, 4000)
        // return () => clearInterval(interval);
    })
    const isMobile = () => (windowsWidth > 1100) ? false : true
    const handleResize = (width) => setWindowsWidth(width)

    function handleCityChanged(city, latLng) {
        setCity(city)
        latLng !== undefined && setLatLng(latLng)
    }


    async function handleGetRandomSellers() {
        if (latLng === "") return 

        const refSellers = firestore.collection("sellers");

        // On va choper TOUT les sellers à moins de 5km pour ensuite faire le tri avec les category
        const categorySellers = await refSellers
            .where("status", "==", "opened")
            .get();
        const results = []

        categorySellers.forEach(doc => results.push({ ...doc.data(), id: doc.id }))
        if (results.length > 0) {
            const sellersFilteredByDistance = await filterSellersByDistance(results)
            const newSellers = sellersFilteredByDistance.filter(item => item.firstName).map(item => item)
            setHomeSellersDisplay(newSellers)
            newSellers.length > 0 ? history.push('/pepites') : history.push('/dashboard')
        }
        else return setErrorSearchCity(true)
    }

    async function filterSellersByDistance(data) {
        return Promise.all(
            data.map(item => {
                return getDistanceBetweenTwoPoints(latLng, item.latLng)
                    .then((result) => {
                        if ((result / 1000) < 10) return item
                        else return []
                    })
            })
        )
    }

    async function getDistanceBetweenTwoPoints(searchPos, sellerPos) {
        var origin = new props.google.maps.LatLng(searchPos.lat, searchPos.lng);
        var destination = new props.google.maps.LatLng(sellerPos.lat, sellerPos.lng);

        var service = new props.google.maps.DistanceMatrixService();
        return new Promise(resolve => {
            service.getDistanceMatrix(
                {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: 'DRIVING',
                }, (response, status) => {
                    resolve(response.rows[0].elements[0].distance.value)
                }
            )
        });
    }

    return (
        <>
            <div className={`home_slider ${isMobile() && "mobile"}`}>
                <div className="home_slider_form">
                    <h1>Fêtes <span>rêvées !</span></h1>
                    <h3>Grâce à la première plateforme d’organisation d’évènement de A à Z</h3>
                    <div className="inputWithButton">
                        <LocationSearchInput placeholder="Où se déroule votre évènement ? (ville)" placeType="(cities)" value={city} onChanged={handleCityChanged} />
                        <img src={marker} />
                        <button onClick={() => handleGetRandomSellers()} className="Home smallButton orange">Rechercher</button>
                        {errorSearchCity && <p style={{color: !isMobile() ? "white" : "black", fontFamily:"roboto-medium"}}>Aucun prestataire dans cette ville pour le moment.</p>}
                    </div>
                </div>
            </div>
            <div className="home_section1">
                <h1>Créez l'évènement qui vous <span>rassemble</span>.</h1>
                {/* <p><NoteWidget note={4} /> 4/5 sur trustpilot</p> */}
                {isMobilenvir() ? 
                    <Zoom {...zoomOutProperties}>
                        {slides.map((each, index) => (
                        <div className="home_features">
                            <div style={{border: "solid 3px rgb(245, 192,67)", borderRadius: "5%", padding: '5%', maxHeight: "400px"}}>
                                <img src={each.img} alt="" />
                                <h2>{each.head}<span style={{color: 'rgb(245, 192, 67)', fontFamily: "Roboto-medium"}}>{each.span}</span></h2>
                                <p>{each.para}</p>
                            </div>
                        </div>
                        ))}
                    </Zoom>
                    :
                    <div className="home_features">
                        <div>
                            <img src={feature1} alt="" />
                            <h2>De <span>A</span> à <span>Z</span></h2>
                            <p>Commandez et réservez vos produits et prestations sur NIVID.fr gratuitement, sans bouger de votre canapé.</p>
                        </div>
                        <div>
                            <img src={feature2} alt="" />
                            <h2>Sans <span>devis</span></h2>
                            <p>Parce que l’on veut vous simplifier la vie, et vous aider à gérer votre budget.</p>
                        </div>
                        <div>
                            <img src={feature3} alt="" />
                            <h2>Autour de chez <span>vous</span></h2>
                            <p>Grâce à nos partenaires de proximité sélectionnés selon nos critères de qualités.</p>
                        </div>
                    </div>
                    }
                <div className="home_section1_bottom">
                    <h2>Alors, <span className="yellowtext robotomedium">convaincu.e</span> ?</h2>
                    <button onClick={() => history.push("/dashboard")} className="orange largeButton">J'organise mon évènement</button>
                </div>
                <div className="dividerspace"></div>
            </div>
            <div className="home_section3">
               <h2>En attendant, ces articles pourraient vous intéresser...</h2>
                <div className="blogContainer">
                    <div className="articleContainer">
                        <div className="articleContent">
                        <div className="imageContainer">
                                <Image url={articleImage} />
                            </div>
                            <h3>7 Façons de Faire la Promotion de Votre Évènement Hors Ligne</h3>
                            <p>le 21 Septembre 2020</p>
                        </div>
                    </div>
                    <div className="articleContainer">
                        <div className="articleContent">
                        <div className="imageContainer">
                                <Image url={articleImage} />
                            </div>
                            <h3>7 Façons de Faire la Promotion de Votre Évènement Hors Ligne</h3>
                            <p>le 21 Septembre 2020</p>
                        </div>
                    </div>
                    <div className="articleContainer">
                        <div className="articleContent">
                        <div className="imageContainer">
                                <Image url={articleImage} />
                            </div>
                            <h3>7 Façons de Faire la Promotion de Votre Évènement Hors Ligne</h3>
                            <p>le 21 Septembre 2020</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => {window.location.href = "#"}} className="orange smallButton">Voir le blog</button>
                <div className="dividerspace"></div>
            </div>
            <div className="home_section4">
                <div className="left_FAQ">
                    <h1>Un événement réussi est un événement <span>préparé...</span></h1>
                    <div className="disabled_home">
                    <h3 className="robotomedium" >Pour encore plus de réponses, visitez notre FAQ</h3>
                    <button onClick={() => history.push('faq')} className="blue smallButton">Voir la FAQ</button>
                </div>
                </div>
                <div className="right_FAQ">
                    <div className="home_dropdown_faq">
                        <div onClick={() => setOpenedFAQDropdown(openedFAQDropdown === 1 ? 0 : 1)}>
                            <div className="dropdown_faq_header">
                                <p>Comment est réalisé le paiement de mon évènement ?</p><FaPlus />
                            </div>
                            <span className={openedFAQDropdown === 1 && "active"}>
                            Le paiement est entièrement réalisé sur NIVID.fr. Dès validation de votre évènement, nous vous demanderons un acompte de 30%. Le jour de l’évènement, vous serez prélevé du restant dû de la commande avec le même moyen de paiement utilisé pour l’acompte.
                            Les moyens de paiement sont : Visa, MasterCard, autres Cartes Bancaires, ApplePay, Paypal.
                            </span>
                        </div>
                        <div onClick={() => setOpenedFAQDropdown(openedFAQDropdown === 2 ? 0 : 2)}>
                            <div className="dropdown_faq_header">
                                <p>Quel évènement puis-je organiser sur NIVID.fr ?</p><FaPlus />
                            </div>
                            <span className={openedFAQDropdown === 2 && "active"}>
                            Sur NIVID.fr vous pouvez organiser tous types d’évènements, de la babyshower à l’anniversaire en passant par le diner en amoureux, sans oublier la soirée entre amis ou en famille. Laissez votre imagination vous guider et éclatez-vous !</span>
                        </div>
                        <div onClick={() => setOpenedFAQDropdown(openedFAQDropdown === 3 ? 0 : 3)}>
                            <div className="dropdown_faq_header">
                                <p>Comment gérer mon évènement en période de crise sanitaire ?</p><FaPlus />
                            </div>
                            <span className={openedFAQDropdown === 3 && "active"}>
                            Nous veillons à la bonne exécution des gestes barrières de la part des partenaires NIVID. Il en est de votre responsabilité d’en faire de même le jour de votre évènement pour la sécurité de tous. Nous communiquerons quelques jours avant votre évènement, une note des bonnes pratiques à mettre en place.
                            </span>
                        </div>
                    </div>
                </div>
                <div className="enabled_home">
                    <h3 className="robotomedium" >Pour encore plus de réponses, visitez notre FAQ</h3>
                    <button onClick={() => history.push('faq')} className="blue smallButton">Voir la FAQ</button>
                </div>
            </div>
            <div className="home_section2">
                <h2>Vous souhaitez proposer vos services ou produits ? Soyez visible auprès de nos communauté <span>gratuitement !</span></h2>
                <button onClick={() => history.push('/demande-de-rappel')} className="orange largeButton">Je me renseigne</button>
            </div>
        </>
    )
}

export default GoogleApiWrapper({
    apiKey: ("AIzaSyDOQ_vau2uT4Gx_iLMVq2XfsUK3BPULVnY")
})(Home)
