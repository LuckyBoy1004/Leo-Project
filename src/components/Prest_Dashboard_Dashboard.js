import { useState, useEffect } from 'react'
import { useAuth } from '../context/userContext'
import { CSSTransition } from 'react-transition-group'

import Title from './utilities/Title'
import SubTitle from './utilities/SubTitle'
import { ButtonSmall } from './utilities/Buttons'
import Image from '../components/utilities/Image'
import ModalYesNo from './utilities/ModalYesNo'

import imgwitness from '../images/witness.svg'
import imgwishlist from '../images/wishlist.svg'
import imgshooping from '../images/shopping-bag.svg'
import emptyStar from "../images/starempty.png"
import star from "../images/star.svg"
import greenTrace from "../images/greenTrace.png"

import EarningChart from '../components/EarningChart'
import NoteWidget from '../components/NoteWidget'
import Loader from './Loader'


const Prest_Dashboard_Dashboard = ({ setStep }) => {

    const [isMounted, setIsMounted] = useState(false);
    const [sales, setSales] = useState([]);
    const [monthlyEarns, setmMonthlyEarns] = useState(0);
    const [monthlySales, setmMonthlySales] = useState(0);
    const [monthlyViews, setmMonthlyViews] = useState(0);
    const [isModalOpened, setIsModalOpened] = useState(false)
    const [totalAmount, setTotalAmount] = useState(0)
    const [wishListCount, setWishListCount] = useState(0)
    const [reviews, setReviews] = useState([])
    const [position, setPosition] = useState(0)
    const [sellersCount, setSellersCount] = useState(0)

    const { seller,
        getSalesOfSellerIdFromDB,
        formateToDateWithWords,
        formateToDate,
        getViewsOfSeller,
        sendInBlue_sendPaymentRequestToAdmin,
        getTotalAmountDueToSeller,
        getWishListCountOfSeller,
        getReviewsOfSellerUid,
        getSellerPosition,
        getSellersCount } = useAuth()

    useEffect(() => {
        getSales().then(salesList => {
            getMonthlyEarns(salesList).then(res => {
                setmMonthlyEarns(res)
                getMonthlySales(salesList).then(res => {
                    setmMonthlySales(res)
                    getMonthlyViews().then(res => {
                        setmMonthlyViews(res)
                        getWishListCountOfSeller(seller.uid).then(res => {
                            setWishListCount(res)
                            getReviewsOfSellerUid(seller.uid).then(res => {
                                setReviews(res)
                                getPositionOfSeller().then(res => {
                                    getSellersCount().then(res => {
                                        setSellersCount(res)
                                        setIsMounted(true)
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    }, [])

    async function getSales() {
        const salesList = await getSalesOfSellerIdFromDB(seller.uid)
        setSales(salesList)
        return salesList
    }

    async function getMonthlyEarns(salesList) {
        const lastMonthEarns = salesList.filter(sale => sale.date > dateTodayMinusByDay(30) && sale.status === "validated" && sale.total === sale.paid)
        let earns = 0
        lastMonthEarns.map(sale => earns = earns + sale.total)
        return earns
    }

    async function getMonthlySales(salesList) {
        const lastMonthSales = salesList.filter(sale => sale.date > dateTodayMinusByDay(30) && sale.status === "validated")
        const lastMonthServices = []
        lastMonthSales.forEach(sale => {
            sale.choosedServices.forEach(service => {
                lastMonthServices.push(service)
            })
        })
        return lastMonthServices.length
    }

    async function getMonthlyViews() {
        const views = await getViewsOfSeller(seller.uid)
        const lastMonthViews = views.filter(view => view.date.seconds * 1000 > dateTodayMinusByDay(30))
        return lastMonthViews
    }

    function dateTodayMinusByDay(day) {
        const date = new Date()
        date.setHours(date.getHours() - (24 * day))
        return date
    }

    function dateTodayPlusByDay(day) {
        const date = new Date()
        date.setHours(date.getHours() + (24 * day))
        return date
    }

    function getDaysLeftBeforeSaleDelete(eventDate) {
        const daysLeftTimestamp = (eventDate.seconds * 1000 || eventDate) - Date.now()
        const daysLeft = Math.ceil(daysLeftTimestamp / 1000 / 86400)
        return daysLeft - 10 === 0 ? "aujourd'hui" : `${daysLeft - 10} jours`
    }

    async function handlePaymentRequest() {
        const amount = await getTotalAmountDueToSeller()
        setTotalAmount(amount)
        setIsModalOpened(true)
    }

    function handleYesNoRequestPayment(val) {
        if (val === "yes") {
            if (totalAmount > 10) {
                sendInBlue_sendPaymentRequestToAdmin()
            }
            else {

            }
        }
        setIsModalOpened(false)
    }

    async function getPositionOfSeller() {
        const position = await getSellerPosition(seller.uid)
        setPosition(position)
    }

    return (
        <>
            <CSSTransition
                in={!isMounted}
                timeout={300}
                classNames="pageTransition"
                unmountOnExit
            >
                <Loader />
            </CSSTransition>

            <CSSTransition
                in={isMounted}
                timeout={300}
                classNames="pageTransition"
                unmountOnExit
            >
                <div className="prest_Dashboard_Dashboard">

                    <section className="prest_dashboard_header">
                        <div className="dashboard_left_container">
                            <Title class="Revenusmois" type="h2" font="roboto-medium" value="Revenus du mois actuel" />
                            <Title type="h1" font="roboto-bold" value={`${monthlyEarns}€`} />
                            <ButtonSmall onClick={() => handlePaymentRequest()} color="blue" value="Demander un virement" />
                        </div>
                        <div className="dashboard_statsHeader_container">
                            <div className="item">
                                <div className="image blue"><span><Image url={imgwitness} /></span></div>
                                <div className="content">
                                    <Title type="h2" font="roboto-bold" value={`${monthlyViews.length}`} />
                                    <span></span>
                                    <SubTitle color="grey" type="big" font="roboto-bold" value="Nombre de vues mensuelles" />
                                </div>
                            </div>
                            <div className="item">
                                <div className="image red"><span><Image url={imgwishlist} /></span></div>
                                <div className="content">
                                    <Title type="h2" font="roboto-bold" value={wishListCount} />
                                    <span></span>
                                    <SubTitle color="grey" type="big" font="roboto-bold" value="Ajouts en wishlist" />
                                </div>
                            </div>
                            <div className="item">
                                <div className="image yellow"><span><Image url={imgshooping} /></span></div>
                                <div className="content">
                                    <Title type="h2" font="roboto-bold" value={`${monthlySales}`} />
                                    <span></span>
                                    <SubTitle color="grey" type="big" font="roboto-bold" value="Nombre de ventes mensuelles" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="prest_dashboard_1">
                        <div className="header">
                            <Title type="h2" font="roboto-medium" value="Vos commandes récentes" />
                            {sales.length > 0 &&
                                <p className="blueLink" onClick={() => setStep(2)}>Voir toutes les commandes</p>
                            }
                        </div>
                        <div className="content">

                            {sales
                                .filter(sale => sale.status !== "rejected")
                                .sort((a, b) => b.date - a.date)
                                .slice(0, 4)
                                .map((sale, key) =>
                                    <div className="item" key={key}>
                                        <div className="header">
                                            {sale.status === "pending" && <SubTitle color="#acacac" type="big" font="roboto-bold" value="Commande récente en attente de validation" />}
                                            {sale.status === "validated" && <SubTitle color="rgb(127, 207, 127)" type="big" font="roboto-bold" value="Commande validée" />}
                                        </div>
                                        <div className="content">
                                            <div className="left imagesSuperpos">
                                                {sale.choosedServices.slice(0, 3).map(service =>
                                                    <div><Image url={service.image} /></div>
                                                )}
                                            </div>
                                            <div className="right">
                                                <p className="commandTitle">Commande #{sale.id} - <span>{formateToDate(sale.date)}</span></p>
                                                <p>Montant de la commande : <span>{sale.total}€</span></p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            {sales.filter(sale => sale.status !== "rejected").length < 1 &&
                                <div className="textInEmptyQuery"><p>Aucune commande récente</p></div>
                            }

                        </div>
                    </section>
                    <section className="prest_dashboard_2">
                        <div className="header">
                            <Title type="h2" font="roboto-medium" value="Rappel" />
                        </div>
                        <div className="content">
                            <div className="left">
                                <div className="header">
                                    <SubTitle type="big" font="roboto-bold" value="Évènements prochains à préparer" />
                                </div>
                                <div className="content">

                                    {sales
                                        .filter(sale => sale.eventDate < dateTodayPlusByDay(10) && sale.status === "validated")
                                        .sort((a, b) => b.eventDate - a.eventDate)
                                        .slice(0, 3)
                                        .map((sale, key) =>
                                            <div key={key} className={`item ${sale.eventDate < dateTodayPlusByDay(5) ? "red" : "blue"}`}>
                                                <div className="left">
                                                    <p className="commandTitle">Commande #{sale.id} - <span>{formateToDate(sale.date)}</span></p>
                                                    <p className="blueLink">Voir les détails de la commande</p>
                                                </div>
                                                <div className="right">
                                                    <label>Date de l'évènement :</label>
                                                    <p>{formateToDateWithWords(sale.eventDate)}</p>
                                                </div>
                                            </div>
                                        )}
                                    {sales.filter(sale => sale.date > dateTodayMinusByDay(10) && sale.status === "validated").length < 1 &&
                                        <div className="textInEmptyQuery"><p>Aucun rappel</p></div>
                                    }

                                </div>
                            </div>
                            <div className="right">
                                <div className="header">
                                    <SubTitle type="big" font="roboto-bold" value="Commandes à valider/vérifier avant expiration" />
                                </div>
                                <div className="content">

                                    {sales
                                        .filter(sale => sale.eventDate < dateTodayPlusByDay(20) && sale.status === "pending")
                                        .sort((a, b) => b.eventDate - a.eventDate)
                                        .slice(0, 2)
                                        .map((sale, key) =>
                                            <div key={key} className="item">
                                                <div className="header">
                                                    <p>Commande toujours en attente de validation</p>
                                                    <p>Expire: <span>{getDaysLeftBeforeSaleDelete(sale.eventDate)}</span></p>
                                                </div>
                                                <div className="content">
                                                    <div className="left imagesSuperpos">
                                                        {sale.choosedServices.slice(0, 3).map(service =>
                                                            <div><Image url={service.image} /></div>
                                                        )}
                                                    </div>
                                                    <div className="right">
                                                        <p className="commandTitle">Commande #{sale.id} - <span>{formateToDate(sale.date)}</span></p>
                                                        <p className="commandTitle">Montant de la commande : <span>{sale.total}€</span></p>
                                                    </div>
                                                </div>
                                                <div className="bottom">
                                                    <div>
                                                        <label>Date de l'évènement :</label>
                                                        <p>{formateToDateWithWords(sale.eventDate)}</p>
                                                    </div>
                                                    <div>
                                                        <label>Nombre de personne :</label>
                                                        <p>{sale.people} personnes</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    {sales.filter(sale => sale.eventDate < dateTodayPlusByDay(20) && sale.status === "pending").length < 1 &&
                                        <div className="textInEmptyQuery"><p>Aucune commande à valider</p></div>
                                    }

                                </div>
                            </div>
                        </div>
                        <div className="bottom">
                            <div className="legendeContainer">
                                <label>Légende :</label>
                                <div className="blueLegend">
                                    <span></span>
                                    <p>Prochainement</p>
                                </div>
                                <div className="redLegend">
                                    <span></span>
                                    <p>Très prochainement</p>
                                </div>
                            </div>
                            {sales.length > 0 &&
                                <div className="buttonContainer">
                                    <ButtonSmall onClick={() => setStep(2)} color="blue" value="Voir toutes les commandes" />
                                </div>
                            }
                        </div>
                    </section>

                    <section className="reviewsContainer">
                        <div className="reviewsContainer__header">
                            <Title type="h2" font="roboto-medium" value="Commentaires récents" />
                        </div>
                        {reviews.length === 0 ?


                            <div className="textInEmptyQuery">
                                <p>Aucun commentaire à afficher</p>
                            </div>
                            :
                            <>
                                <div className="reviewsContainer__content">
                                    <div className="reviewsContainer__left">
                                        <Title type="h2" font="roboto-medium" value="Votre note actuelle est" />
                                        <div className="reviewsContainer__globalNoteStars">
                                            <Image url={star} />
                                            <Image url={star} />
                                            <Image url={star} />
                                            <Image url={star} />
                                            <Image url={emptyStar} />
                                        </div>

                                        <div className="reviewsContainer__globalNote">
                                            <p>{seller.note}/5</p>
                                        </div>

                                        <div className="reviewsContainer__classement">
                                            <Title type="h2" align="center" font="roboto-medium" value="Vous êtes classé*" />
                                            <div className="reviewsContainer__classementContent">
                                                <p>{position}ème<Image url={greenTrace} /></p>
                                                <span>sur {sellersCount}</span>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="reviewsContainer__right">
                                        <div className="reviewsContainer__cards__container">
                                            {reviews
                                                .sort((a, b) => {
                                                    var keyA = new Date(a.date),
                                                        keyB = new Date(b.date);
                                                    // Compare the 2 dates
                                                    if (keyA < keyB) return -1;
                                                    if (keyA > keyB) return 1;
                                                    return 0;
                                                })
                                                .slice(0, 3)
                                                .map(item =>
                                                    <div className="reviewsContainer__card">
                                                        {new Date().getDate() - 7 < new Date(item.date.seconds * 1000).getDate() &&
                                                            <span>Nouveau</span>
                                                        }
                                                        <h3>{item.name}</h3>
                                                        <p className="reviewsContainer__card__subTitle">Evènement du {formateToDate(item.eventDate.seconds * 1000)}</p>
                                                        <p className="reviewsContainer__card__content">{item.comment}</p>
                                                        <NoteWidget note={item.note} />
                                                    </div>
                                                )}

                                        </div>
                                    </div>
                                </div>
                                <div className="reviewsContainer__bottom">
                                    <div className="reviewsContainer__bottom_button">
                                        <ButtonSmall color="grey" value="Voir plus de commentaires" />
                                    </div>
                                    <p>* Ce classement est généré en fonction du type de service que vous proposez
                                        & du périmètre dans lequel vous vous trouvez par rapport aux autres préstataires</p>
                                </div>
                            </>
                        }

                    </section>

                    <section className="chartContainer">
                        <div className="chartContainer__header">
                            <Title type="h2" font="roboto-medium" value="Vos statistiques" />
                        </div>
                        <EarningChart sales={sales} />
                    </section>

                </div>
            </CSSTransition>
            <CSSTransition
                in={isModalOpened}
                timeout={200}
                classNames="pageTransition"
                unmountOnExit
            >
                <ModalYesNo
                    callback={(val) => handleYesNoRequestPayment(val)}
                    value={`Solde actuel: ${totalAmount}€`}
                    value2={totalAmount < 10 && "Impossible de demander un virement, votre solde est nul."}
                    disabled={totalAmount < 10 ? true : false}
                />
            </CSSTransition>
        </>
    )
}

export default Prest_Dashboard_Dashboard