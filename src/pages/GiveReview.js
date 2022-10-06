import { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/userContext"; // context
import { CSSTransition } from 'react-transition-group'
import { useHistory } from "react-router-dom";
import { ButtonSmall } from '../components/utilities/Buttons';

import Loader from '../components/Loader'

import { FaStar } from 'react-icons/fa';

const GiveReview = () => {

    const search = useLocation().search
    const eventId = new URLSearchParams(search).get('id')

    const history = useHistory()

    const [sellers, setSellers] = useState([])
    const [isMounted, setIsMounted] = useState(false)
    const [error, setError] = useState("")

    const {
        user,
        getSalesOfEventIdFromDB,
        getSellersInDbWithUids,
        getEventFromUid,
        getReviewsOfSellerUid,
        addReviewOfSellerUid,
        sendInBlue_sendNotificationToSellerOfReview } = useAuth() // context


    useEffect(() => {
        if (eventId === null || eventId === undefined || eventId.length < 1) {
            return history.push('/')
        }
        // Si pas connecté
        if (!user) {
            setIsMounted(true)
            return setError("Vous devez être connecté pour laisser un avis.")
        }
        // Si pas le createur de l'event
        getEventFromUid(eventId).then(res => {
            if (!res || user.uid !== res.user) {
                return history.push('/')
            }
        })


        if (eventId !== null && eventId.length > 1) {
            getAllowedSellers().then(newSellers => {
                if (newSellers === false) return history.push("/")
                // On ne prend que les sellers qui n'ont pas deja un avis avec l'id de l'event
                const filtered = newSellers.filter(seller => seller.reviews.filter(review => review.eventID === eventId).length === 0)
                const final = filtered.map(item => {
                    return {
                        newReview: {},
                        companyName: item.companyName,
                        reviews: item.reviews,
                        uid: item.uid,
                        firstName: item.firstName,
                        email: item.email
                    }
                })
                setSellers(final)
                setError("")
                setIsMounted(true)
            })
        }
    }, [])

    async function getAllowedSellers() {
        const res = await getSalesOfEventIdFromDB(eventId)
        if (res.length < 1) return false
        const sellerIds = res.map(element => element.sellerID)

        const sellersArray = await getSellersInDbWithUids(sellerIds)
        const newSellers = new Promise((resolve, reject) => {
            sellersArray.map(async seller => {
                const res = await getReviewsOfSellerUid(seller.uid)
                seller.reviews = res
                resolve(seller)
            })
        });
        return Promise.all([newSellers]).then((val) => val)
    }

    function handleNoteChanged(key, note) {
        let newSellers = [...sellers]
        newSellers[key].newReview.note = note
        setSellers(newSellers)
    }

    function handleCommentChanged(key, comment) {
        let newSellers = [...sellers]
        newSellers[key].newReview.comment = comment
        setSellers(newSellers)
    }

    async function handleSendReview(sellerUID, key) {
        const note = sellers[key].newReview.note
        const comment = sellers[key].newReview.comment
        if (note === undefined || comment === undefined) return
        const res = await addReviewOfSellerUid(sellerUID, eventId, note, comment, user.displayName)
        if (res) {
            let newSellers = [...sellers]
            const newReview = { eventID: eventId, note: note, comment: comment }
            newSellers[key].reviews.push(newReview)
            newSellers[key].newReview = newReview
            setSellers(newSellers)

            sendInBlue_sendNotificationToSellerOfReview(newSellers[key].email, newSellers[key].firstName)
        }
    }

    return (
        <div className="GiveReview_container">
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
                <div className="GiveReview">
                    {error.length < 1 ?
                        <>
                            <h1>Donnez une note aux prestataires que vous aviez choisi</h1>
                            {sellers.map((seller, key) =>
                                seller.newReview.eventID === undefined ?
                                    <div key={key} className="GiveReview__item" >
                                        <h2>{seller.companyName}</h2>
                                        <div className="stars_container">
                                            <FaStar className={`${seller.newReview.note > 4 ? "active" : ""}`} onClick={() => handleNoteChanged(key, 5)} />
                                            <FaStar className={`${seller.newReview.note > 3 ? "active" : ""}`} onClick={() => handleNoteChanged(key, 4)} />
                                            <FaStar className={`${seller.newReview.note > 2 ? "active" : ""}`} onClick={() => handleNoteChanged(key, 3)} />
                                            <FaStar className={`${seller.newReview.note > 1 ? "active" : ""}`} onClick={() => handleNoteChanged(key, 2)} />
                                            <FaStar className={`${seller.newReview.note > 0 ? "active" : ""}`} onClick={() => handleNoteChanged(key, 1)} />
                                        </div>
                                        <div className="formField">
                                            <textarea
                                                type="text"
                                                value={seller.comment}
                                                onChange={e => handleCommentChanged(key, e.target.value)}
                                                placeholder="Laissez un commentaire"
                                            />
                                        </div>
                                        <div className="buttonSendForm">
                                            <ButtonSmall
                                                onClick={() => handleSendReview(seller.uid, key)}
                                                color="blue"
                                                value="Valider"
                                                disabled={seller.newReview.note === undefined || seller.newReview.comment === undefined || seller.newReview.comment.length < 3}
                                            />
                                        </div>
                                    </div>
                                    :
                                    <div key={key}>Merci</div>
                            )}
                        </>
                        :
                        <>
                            <p>{error}</p>
                            <span className="linkRedirect" onClick={() => history.push('/compte')} >Se connecter</span>
                        </>
                    }
                </div>
            </CSSTransition>
        </div >
    )
}

export default GiveReview