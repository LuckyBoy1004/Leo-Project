import React, { useEffect, useState } from "react";
import { useFirebase } from "../assets/base-context";
import ReactLoading from 'react-loading';
import { useAuth } from "../context/userContext"; // context
import { items } from "../components/servicesData";
import { useHistory } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group'
import ModalYesNo from '../components/utilities/ModalYesNo'

import { ButtonLarge } from '../components/utilities/Buttons'

const Recapitulatif = (props) => {
    
    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()

    const { event, setCurrentStepProcess, updateQuantityService, formatLabelTimePicker, checkoutStart } = useAuth() // context
    const [services, setServices] = useState([])
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const [loading, setLoading] = useState(true)

    const [isModalOpened, setIsModalOpened] = useState(false);
    const [currentServiceID, setCurrentServiceID] = useState("");

    const history = useHistory()

    function isMobile() {
        if (windowsWidth > 1090) {
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
        setCurrentStepProcess(3)
        getAllChoosedServicesFromDB()
    }, [event.choosedServices])

    async function handleDeleteClick(id) {
        setCurrentServiceID(id)
        setIsModalOpened(true)
    }

    async function handleModalYesNoReturn(val) {
        setIsModalOpened(false)
        if (val === "no") return

        handleQuantityChanged(currentServiceID, 0)
    }

    async function getAllChoosedServicesFromDB() {
        const refServices = firestore.collection("events").doc(event.id).collection('services')
        const allServicesQuery = await refServices.get();
        const allServices = []
        allServicesQuery.forEach(doc => {
            allServices.push({ ...doc.data(), uid: doc.id })
        })
        setServices(allServices)
        setLoading(false)
    }


    function getTotalPrice() {
        let total = 0;
        event.choosedServices.forEach(service => {
            let price = service.price
            if (service.variations && service.variations.length > 0) {
                price = service.variations.filter(vari => vari.name === service.variation)[0].price
            }
            total += price * service.quantity
        })
        total = Number.parseFloat(total).toFixed(2);
        return total
    }


    const filteredServices = (key) => services.filter(service => service.category === key);

    function handleQuantityChanged(serviceID, quantity) {
        updateQuantityService(serviceID, quantity)
    }

    return (
        <>
            <div className={!isMobile() ? "recapContainer" : "recapContainer mobile"}>
                <div className="recapHeader">
                    <p className='title'>Récapitulatif panier</p>
                    <p className='subtitle'>{services.length} offres sélectionnées au total</p>
                </div>
                <div className="recapContent">
                    {loading ?
                        <div className="recapServicesList">
                            <ReactLoading className="loadingSpinner" type="spin" color="rgba(245, 192, 67)" height={50} width={50} />
                        </div>
                        :
                        <div className="recapServicesList">
                            {
                                Object.entries(items).map(([key, item]) => {
                                    return (
                                        <div className="recapServicesCategory">
                                            <p className="title">
                                                {key === "decorations" && "Décoration"}
                                                {key === "ambiance" && "Ambiance/Activité"}
                                                {key === "nourriture" && "Nourriture & boisson"}
                                                {/* {key === "service" && "Service sur place"} */}
                                            </p>
                                            {
                                                filteredServices(key).length > 0 ?
                                                    filteredServices(key).map(service => {
                                                        return (
                                                            <div onClick={() => history.push(`/creer-mon-evenement/etape-2/prestataires/${service.sellerId}`)} className="recapServiceItem">
                                                                <div className="imgRecapServiceItem">
                                                                    <img alt="" src={service.images[0].url} />
                                                                </div>
                                                                <div className="textRecapServiceItem">
                                                                    <span>
                                                                        {(service.variations && service.variations.length > 0) ?
                                                                            service.variations.filter(vari => vari.name === service.variation)[0].price + "€"
                                                                            : service.price + "€"
                                                                        }
                                                                    </span>
                                                                    <p>{service.name}</p>
                                                                    <p>{(service.variations && service.variations.length > 0) && service.variation}</p>
                                                                    <p onClick={(e) => e.stopPropagation(e)}>Quantité
                                                                        <select
                                                                            onChange={(e) => handleQuantityChanged(service.uid, e.target.value)}
                                                                            name="quantity"
                                                                            id="quantity"
                                                                        >
                                                                            <option selected={service.quantity === 1 && "selected"} value="1">1</option>
                                                                            <option selected={service.quantity === 2 && "selected"} value="2">2</option>
                                                                            <option selected={service.quantity === 3 && "selected"} value="3">3</option>
                                                                            <option selected={service.quantity === 4 && "selected"} value="4">4</option>
                                                                            <option selected={service.quantity === 5 && "selected"} value="5">5</option>
                                                                            <option selected={service.quantity === 6 && "selected"} value="6">6</option>
                                                                        </select>
                                                                    </p>
                                                                    <div onClick={(e) => (e.stopPropagation(), handleDeleteClick(service.uid))} className="deleteButtonRecapeServiceItem">
                                                                        <img alt="" src="/images/trashRed.png" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                    :
                                                    <p className="grey">Aucune offre sélectionnée</p>
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    }
                    <div className="recapInfo">
                        <div className="recapInfoTop">
                            <div className="recapInfoTopItem">
                                <span>Nom de l'évènement:</span>
                                <p>{event.name}</p>
                            </div>
                            <div className="recapInfoTopItem">
                                <span>Date:</span>
                                <p>{new Date(event.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                            </div>
                            <div className="recapInfoTopItem">
                                <span>Créneau:</span>
                                <p className="coloredText1">Commence à {formatLabelTimePicker(event.startAt)}</p>
                                <p className="coloredText2">Se termine à {formatLabelTimePicker(event.endAt)}</p>
                            </div>
                            <div className="recapInfoTopItem">
                                <span>Nombre de personnes:</span>
                                <p>{event.people}</p>
                            </div>
                            <div className="recapInfoTopItem">
                                <span>Nombre de m²:</span>
                                <p>{event.placeSize}</p>
                            </div>
                            <div className="recapInfoTopItem">
                                <span>Adresse:</span>
                                <p>{event.place}</p>
                            </div>
                        </div>
                        <div className="recapInfoBottom">
                            <div className="pricesRecapInfoBottom">
                                <div>
                                    <p>Total:</p>
                                    <span>{getTotalPrice()}€</span>
                                </div>
                                <div>
                                    <p>Acompte:</p>
                                    <span>{Number.parseFloat(getTotalPrice() / 3).toFixed(2)}€</span>
                                </div>
                            </div>
                            <div className="paymentRecapInfoBottom">
                                <img alt="" src="/images/paymentMethode.png" />
                                <ButtonLarge
                                    onClick={() => checkoutStart(Number.parseFloat(getTotalPrice() / 3).toFixed(2))}
                                    // history.push('/creer-mon-evenement/etape-3/confirmation')
                                    color="orange"
                                    value="Passer au paiement"
                                    disabled={services.length < 1 && "disabled"}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CSSTransition
                in={isModalOpened}
                timeout={200}
                classNames="pageTransition"
                unmountOnExit
            >
                <ModalYesNo
                    callback={(val) => handleModalYesNoReturn(val)}
                    value=""
                />
            </CSSTransition>
        </>
    )
}

export default Recapitulatif;