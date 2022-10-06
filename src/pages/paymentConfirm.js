import React, { useState, useEffect } from "react";
import { useAuth } from "../context/userContext"; // context
import { useHistory } from 'react-router-dom'
import { useLocation } from "react-router-dom";

import { ButtonRoundLarge } from '../components/utilities/Buttons'
import ServiceDescription from "../components/ServiceDescription";


const PaymentConfirm = () => {

    const [isPayment, setIsPayment] = useState(false)
    const history = useHistory()

    const { user,
        event,
        setCurrentStepProcess,
        addSalesInDB,
        updateEventStatus,
        getSalesOfSellerIdFromDB,
        sendInBlue_sendRecapToUserAfterPayment,
        sendInBlue_sendNewSaleToSeller,
        getEmailOfSellerWithUid,
        getSaleTokenOfEventFromDb,
        checkoutCheck } = useAuth() // context

    const search = useLocation().search
    const eventId = new URLSearchParams(search).get('id')
    const saleToken = new URLSearchParams(search).get('token')
    const session_id = new URLSearchParams(search).get('session_id')

    setCurrentStepProcess(31)

    useEffect(() => {
        if (eventId === undefined || eventId.length < 7 || eventId !== event.id) return history.push('/dashboard')
        if (event && event.status && event.status !== "creating") return history.push('/dashboard')

        getSaleTokenOfEventFromDb().then(token => {
            return saleToken !== token && history.push('/dashboard')
        })
        checkoutCheck(session_id)
            .then(res => {
                return res.status === "paid" ? createSales(res.amount, res.id) : history.push('/dashboard')
            })
    }, [])

    async function createSales(amount, stripeId) {
        const sellersUniqueIds = await getSellersIds()
        let finalSales = []
        // On map sur les ids triés, puis on trie les services pour les attribuer au bon seller
        sellersUniqueIds.map(async uniqueId => {
            const sellerServices = event.choosedServices.filter(service => service.sellerId === uniqueId)

            // On modifie les services dans le tableau pour leur donner la structure dont on a besoin
            let newSellerServices = []
            sellerServices.forEach(service => {
                const newService = {
                    id: service.id,
                    quantity: service.quantity,
                    price: service.price,
                    image: service.images[0].url,
                    name: service.name,
                    variations: service.variations,
                    variation: service.variation,
                    note: service.note
                }
                newSellerServices = [...newSellerServices, newService]
            })
            const sellerSales = await getSalesOfSellerIdFromDB(uniqueId)
            let total = 0
            newSellerServices.forEach(service =>
                (service.variations && service.variations.length > 0) ? 
                total += service.variations.filter(vari => vari.name === service.variation)[0].price * service.quantity
                : total += service.price * service.quantity
            )

            // On structure le sale comme on l'a décidé
            finalSales = [...finalSales, {
                eventID: event.id,
                sellerID: uniqueId,
                userID: user.uid,
                eventDate: event.date,
                choosedServices: newSellerServices,
                paid: amount,
                date: Date.now(), // à recevoir de stripe
                status: "pending",
                transactionID: stripeId,
                total: total,
                id: sellerSales.length + 1,
                people: event.people,
                placeSize: event.placeSize,
                startAt: event.startAt,
                endAt: event.endAt,
                sellerNote: ""
            }]

            const sellersEmail = await getEmailOfSellerWithUid(uniqueId)
            sendInBlue_sendNewSaleToSeller(sellersEmail, newSellerServices, event)

            // Cette fonction est appelée pour le moment au chargement de la pag mais il faudra une confirmation de stripe pour l'appeler.
            if (sellersUniqueIds.length === finalSales.length) {
                await addSalesInDB(finalSales)
                updateEventStatus("pending")
                sendInBlue_sendRecapToUserAfterPayment(user.email, finalSales, event)
            }
        })
    }

    async function getSellersIds() {
        // On récupère tous les ids des sellers présents dans tous les services puis on les trie
        let sellersIds = []
        event.choosedServices.map(service => sellersIds.push(service.sellerId))

        const sellersUniqueIds = sellersIds.reduce((acc, current) => {
            const isFound = acc.find(item => item === current);
            return !isFound ? acc = [...acc, current] : acc
        }, [])
        return sellersUniqueIds
    }

    return !isPayment && (
        <div>
            <div className="paymentConfirmContainer">
                <div className="paymentConfirmTop">
                    <img alt="" src="/images/wouhou.png" />
                    <h2>Votre paiement a bien été reçu, merci !</h2>
                    {/* <ButtonRoundLarge
                        onClick={() => history.push('/dashboard')}
                        color="orange"
                        value="Voir mon évènement"
                    /> */}
                </div>
                <div className="paymentConfirmBottom">
                <p>Vous pouvez aussi dès à présent inviter des personnes à votre évènements! 🥳</p>
                    <ButtonRoundLarge
                        onClick={() => history.push('/creer-mon-evenement/etape-3/invitations')}
                        color="blue"
                        value="Préparer mes invitations"
                    />
                </div>
                <div className="backconfirm">Revenir à l'accueil</div>
            </div>
        </div>
    )
}

export default PaymentConfirm;
