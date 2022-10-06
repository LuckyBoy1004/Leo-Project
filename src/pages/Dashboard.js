import React, { useState, useEffect } from "react";
import '../styles/Dashboard.css'
import Slideshow from "../components/Slider"
import { Link, useHistory, useLocation } from "react-router-dom";
import Header from '../components/Header'
import { useAuth } from '../context/userContext'
import ProgressBar from 'react-bootstrap/ProgressBar';
import UpdateProfil from '../components/UpdateProfil'
import InterestedSellers from '../components/InterestedSellers'
import WishList from '../components/WishList'
import BlogWidget from '../components/BlogWidget'
import { CSSTransition } from 'react-transition-group'

import { ButtonSmall } from '../components/utilities/Buttons'
import Image from '../components/utilities/Image'

const Dashboard = () => {

    const { event, user, formatLabelTimePicker, getCurrentUserProfil, getSellersInDbWithUids, getSalesOfEventIdFromDB, updateEventStatus, clearEvent } = useAuth()
    const history = useHistory()

    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const [error, setError] = useState("")
    const [step, setStep] = useState(1)
    const [pourcent, setPourcent] = useState(0);

    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [moreView, setMoreView] = useState(false);

    // if (step === 3) {
    //     const WishList = import('../components/WishList')
    // }

    function isMobile() {
        if (windowsWidth > 1160) {
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
        if (event && event.status && event.status !== "passed" && event.date && event.date < Date.now()) {
            updateEventStatus("passed")
            clearEvent()
        } else {
            getSellerListFromServices()
            getPourcentBar()
        }
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))

    }, [event])

    async function getPourcentBar() {
        if (!event.status) return

        let pourcentToDisplay
        const pourcentBudget = (event.budgetLeft / event.budget) * 100
        if (event.status === "pending") {
            const sales = await getSalesOfEventIdFromDB(event.id)
            pourcentToDisplay = Math.floor(((event.date - sales[0].date) * 100) / Date.now())
        }
        pourcentToDisplay = event.status === "creating" ? pourcentBudget : pourcentToDisplay
        setPourcent(100 - pourcentToDisplay + 5)
    }

    async function handleCreateEvent() {
        const data = await getCurrentUserProfil()
        if (!user.emailVerified) {
            setError("Vous n'avez pas encore confirmé votre adresse email.")
        }
        else if (data.firstName === undefined || data.name === undefined || data.birthDate === undefined) {
            setError("Vous devez compléter votre profil pour pouvoir créer votre premier évènement.")
        }
        else {
            history.push("/creer-mon-evenement/etape-1")
        }
    }



    async function getSellerListFromServices() {
        if (event.choosedServices.length < 1 || event.status === null) return null

        let sellerIDList = []
        for (const service in event.choosedServices) {
            sellerIDList = [...sellerIDList, event.choosedServices[service].sellerId]
        }
        const sellersList = await getSellersInDbWithUids(sellerIDList)
        const uniqueSellersList = sellersList && sellersList.filter((thing, index, self) => self.findIndex(t => t.email === thing.email) === index)

        if (event.status === "creating") {
            setSellers(uniqueSellersList)
            setLoading(false)
            return
        }

        let finalSellersList = []
        uniqueSellersList.map(async seller => {
            const status = await getSaleStatus(seller.uid)
            const newSeller = { ...seller, status: status }
            finalSellersList = [...finalSellersList, newSeller]

            if (uniqueSellersList.length === finalSellersList.length) {
                setSellers(finalSellersList)
                setLoading(false)
            }
        })


        if (event.status === "pending") {
            let finalSellersList = []
            uniqueSellersList.map(async seller => {
                const status = await getSaleStatus(seller.uid)
                const newSeller = { ...seller, status: status }
                finalSellersList = [...finalSellersList, newSeller]

                if (uniqueSellersList.length === finalSellersList.length) {
                    setSellers(finalSellersList)
                    setLoading(false)
                }
            })
        }
        else if (event.status === "creating") {
            setSellers(uniqueSellersList)
            setLoading(false)
        }
    }

    async function getSaleStatus(id) {
        const sales = await getSalesOfEventIdFromDB(event.id)
        const sale = sales.filter(sale => sale.sellerID === id)
        return sale[0].status
    }

    function getDaysLeftBeforeEvent() {
        const timestampLeft = event.date - Date.now()
        const daysLeft = timestampLeft / 1000 / 86400
        return Math.ceil(daysLeft)
    }

    function more_view() {
        if (moreView) {
            setMoreView(false)
        }else {
            setMoreView(true)
        }
    }

    return (
        <div>
            <Header />
            <div className={!isMobile() ? "dashboard" : "dashboard mobile"}>
                <div className="dashboardHeader">
                    
            <CSSTransition
                in={step === 1}
                timeout={200}
                classNames="elementTransition"
                unmountOnExit
            >
                <p className="elementTransition">Content de vous revoir <span>{user.displayName}</span></p>
            </CSSTransition>
                    <div>
                        <span className={step === 1 && "active"} onClick={() => setStep(1)}>Tableau de bord</span>
                        <span className={step === 3 && "active"} onClick={() => setStep(3)}>Favoris</span>
                        <span className={step === 2 && "active"} onClick={() => setStep(2)}>Mes informations</span>
                    </div>
                </div>
                {/* {!user.emailVerified && <EmailNotVerified />} */}
                {step === 1 ? <div className={windowsWidth < 600 ? "dashboardContent mobile" : "dashboardContent"}>
                    <div className="leftSide">
                        {event && <h1>Votre évènement</h1>}
                        {event.status && event.status !== "passed" ? (
                            <div>
                                <div className="containerBudgetHeader">
                                    {event.status === "creating" && <h2>Il vous reste {event.budgetLeft < 0 ? 0 : event.budgetLeft }€ sur votre budget total de {event.budget}€</h2>}
                                    {event.status === "pending" && <h2>Plus que {getDaysLeftBeforeEvent()} jours à patienter</h2>}
                                    <div className="progressBarEvent">
                                        <ProgressBar now={pourcent} />
                                    </div>
                                    {event.status === "creating" &&
                                        <ButtonSmall
                                            onClick={(e) => history.push('/creer-mon-evenement/etape-2')}
                                            color="orange"
                                            value="Reprendre mon évènement"
                                            backgroundColor="rgba(245, 192, 67)"
                                        />
                                    }
                                </div>
                                <div className="dashboardInfo">
                                    <div className={windowsWidth < 600 ? "insetLeftSide mobile" : "insetLeftSide"}>
                                        <div className="headerDashboardInset">
                                            <h2 style={{color:'rgba(245, 192, 67)'}}>Infos évènement</h2>
                                        </div>
                                        <div className="dashboardInfoContent" style={{minHeight:'0px'}}>
                                            <div className="item">
                                                <label>Nom de l'évènement:</label>
                                                <p>{event.name}</p>
                                            </div>
                                            <div className="item">
                                                <label>Date:</label>
                                                <p>{new Date(event.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                                            </div>
                                            <div className="item">
                                                <label>Créneau:</label>
                                                <p style={{color:'rgb(239 25 136)'}}>Commence à <span>{formatLabelTimePicker(event.startAt)}</span></p>
                                                <p style={{color:'rgb(27 76 239)'}}>se termine à <span>{formatLabelTimePicker(event.endAt)}</span></p>
                                            </div>
                                            {moreView &&
                                             <div className="item">
                                                <label>Nombre de personnes:</label>
                                                <p>{event.people} personnes</p>
                                            </div>
                                            }
                                            {moreView &&
                                            <div className="item">
                                                <label>Nombre de m²:</label>
                                                <p>{event.placeSize}</p>
                                            </div>
                                            }
                                            <div className="item" style={{marginBottom:'unset'}}>
                                                <label>Afficher plus
                                                <button style={{backgroundColor:'rgba(244, 244, 244)', border:'0px', fontSize:'20px'}} onClick={() => more_view()}>{moreView ? '-' : '+'}</button></label>
                                            </div>
                                        </div>
                                        <div className="item buttonContainer">
                                            {event.status === "creating" &&
                                                <ButtonSmall
                                                    onClick={() => history.push('/creer-mon-evenement/etape-1')}
                                                    color="grey"
                                                    value="Modifier les informations"
                                                    marginTop="20px"
                                                />
                                            }
                                        </div>
                                    </div>

                                    {windowsWidth < 600 && <div className="separator"></div>}

                                    <div className="insetRightSide">
                                        {!isMobile() ?
                                            <div className="headerDashboardInset">
                                                <h2 style={{color:'rgba(245, 192, 67)'}}>Prestataires sélectionnés</h2><br/>
                                                {event.choosedServices.length > 0 ?
                                                    <p style={{color:'rgba(245, 192, 67)'}}>{sellers && sellers.length} prestataires au total</p>
                                                    : <span>Vous n'avez pas encore choisi de prestataire</span>
                                                }
                                            </div>
                                            :
                                            <div className="headerDashboardInset">
                                                <h2 style={{color:'rgba(245, 192, 67)', marginLeft:'10%'}}>Prestataires sélectionnés</h2>
                                                {sellers && sellers.length > 0 ?
                                                    <p style={{color:'rgba(245, 192, 67)'}}>{sellers && sellers.length} prestataires au total</p>
                                                    : <span>Vous n'avez pas encore choisi de prestataire</span>}
                                            </div>
                                        }
                                        <div>
                                            <Slideshow eventStatus={event.status} sellers={sellers} windowsWidth={windowsWidth} isMobile={isMobile()} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                            :
                            <div className={isMobile() ? "noEventDisplayDashboard mobile" : "noEventDisplayDashboard"}>
                                <Image url="/images/triste.png" />
                                <h2>C’est dur à croire!</h2>
                                <p>Mais il semblerait que n’ayez toujours pas planifié d’évènement sur NIVID</p>
                                <button onClick={() => handleCreateEvent()}>Créer mon premier évènement</button>
                                {error.length > 0 && <p className="errorMessage">{error}</p>}
                            </div>

                        }
                    </div>
                    {!isMobile() &&
                        <div>
                            {event.status === "creating" &&
                                <InterestedSellers />
                            }
                            <BlogWidget />
                        </div>
                    }
                </div>
                    : step === 2 ?
                        <UpdateProfil isMobile={isMobile()} />
                        : step === 3 &&
                        <WishList eventStatus={event.status} isMobile={isMobile()} />
                }

            </div>
        </div>

    )
}
export default Dashboard;
