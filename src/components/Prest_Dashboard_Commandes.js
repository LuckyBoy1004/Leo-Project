import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/userContext'
import { CSSTransition } from 'react-transition-group'

import Loader from './Loader'
import ModalYesNo from './utilities/ModalYesNo'

import Title from './utilities/Title'
import SubTitle from './utilities/SubTitle'
import { ButtonSmall } from './utilities/Buttons'
import Image from '../components/utilities/Image'
import PrintIcon from '@mui/icons-material/Print';
import { FaChevronDown } from 'react-icons/fa';
import IconButton from '@mui/material/IconButton';

import Fade from '@mui/material/Fade';

const Prest_Dashboard_Commandes = () => {

    const {
        seller,
        insertHoliday,
        getSalesOfSellerIdFromDB,
        formateToDateWithWords,
        formateToDate,
        formatLabelTimePicker,
        updateSaleStatusInDB,
        updateSaleNote,
        sendInBlue_sendBillRequestToAdmin
    } = useAuth()

    const [openedEvent, setOpenedEvent] = useState("")
    const [sales, setSales] = useState([]);
    const [noteObj, setNoteObj] = useState({ saleID: 0, message: "" });
    const [rejectModal, setRejectModal] = useState(false);
    const [validatedModal, setValidatedModal] = useState(false);
    const [currentKey, setCurrentKey] = useState();

    const [filterStatus, setFilterStatus] = useState("");
    const [filterYear, setFilterYear] = useState(0);

    const [isBillEmailSent, setIsBillEmailSent] = useState(false);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        getSales().then(() => {
            setIsMounted(true)
        })
    }, [])

    async function getSales() {
        const salesList = await getSalesOfSellerIdFromDB(seller.uid)
        return setSales(salesList)
    }

    async function handleActionSale(key, status) {
        setCurrentKey(key)
        if (status === "rejected") {
            rejectModalYesNoReturn(key)
            return
        }else if (status === "validated") {
            setValidatedModal(true)
            return
        }

    }

    async function validatedModalYesNoReturn(val) {
        setValidatedModal(false)
        if (val == "no") {
            let sale = sales.filter(sale => sale.id === currentKey)
            sale[0].status = "validated"
            let newSales = sales.filter(sale => sale.id !== currentKey)
            newSales = [...newSales, sale[0]]
            await updateSaleStatusInDB(sale[0].id, sale[0].sellerID, "validated")
            return setSales(newSales)    
        }else if (val == "yes") {
            let sale = sales.filter(sale => sale.id === currentKey)
            sale[0].status = "validated"
            let newSales = sales.filter(sale => sale.id !== currentKey)
            newSales = [...newSales, sale[0]]
            await updateSaleStatusInDB(sale[0].id, sale[0].sellerID, "validated")
            var date = new Date(sale[0].date)
            var holiday = date.getFullYear() + '.' + (date.getMonth()+1) + '.' +date.getDate();
            await insertHoliday(sale[0].sellerID, holiday)
            return setSales(newSales)    
        }
    }

    async function rejectModalYesNoReturn(val) {
        setRejectModal(false)
        if (val === "no") return

        let sale = sales.filter(sale => sale.id === currentKey)
        sale[0].status = "rejected"
        let newSales = sales.filter(sale => sale.id !== currentKey)
        newSales = [...newSales, sale[0]]
        await updateSaleStatusInDB(sale[0].id, sale[0].sellerID, "rejected")
        return setSales(newSales)
    }

    function handleChangeNote(saleID, value) {
        setNoteObj({ saleID, message: value })
    }

    async function handleSaveNote(eventID) {
        let newSale
        let newSaleList = [...sales]
        sales.forEach((sale, key) => {
            if (sale.eventID === eventID) {
                newSale = sale
                newSale.note = noteObj.message
                newSaleList[key] = newSale
            }
        })
        await updateSaleNote(noteObj.saleID, noteObj.message)
        setSales(newSaleList)
        return
    }

    function handleOpeningSale(key) {
        if (openedEvent === key) {
            setOpenedEvent("")
            setNoteObj({ saleID: 0, message: "" })
        } else {
            setOpenedEvent(key)
            let newSale = {}
            sales.forEach(sale => {
                if (sale.id === key) {
                    newSale = sale
                }
            })
            setNoteObj({ saleID: key, message: newSale.note })
        }
    }

    function getStartYearMinus(val) {
        let yearWanted = new Date(new Date().setFullYear(new Date().getFullYear() - val))
        yearWanted = yearWanted.getFullYear()
        const dateWanted = new Date(yearWanted, 0, 1)
        return dateWanted.getTime()
    }

    function getEndYearMinus(val) {
        let yearWanted = new Date(new Date().setFullYear(new Date().getFullYear() - val))
        yearWanted = yearWanted.getFullYear()
        const dateWanted = new Date(yearWanted, 12, 31)
        return dateWanted.getTime()
    }

    function handlePrintClicked(transcationID, sellerID) {
        sendInBlue_sendBillRequestToAdmin(transcationID, sellerID).then(res => {
            if (res === true) {
                setIsBillEmailSent(true)
                setTimeout(() => {
                    setIsBillEmailSent(false)
                }, 2000)
            }
        })
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
                <div className="prest_Dashboard_Commandes">

                    <section className="prest_dashboard_header">
                        <div>
                            <SubTitle type="big" font="roboto-bold" value="Commandes re??ues" />
                            <p>Vos commandes r??centes s'afficheront ici, ne s'afficherint que celle de l'ann??e en cours.<br />
                                Si vous avez besoin de voit vos commandes archiv??es, vous pourrez y acc??der en filtrant
                                les commandes ?? afficher dans la liste ci-dessous.</p>
                        </div>
                    </section>

                    <section className="prest_dashboard_commandes_list">
                        <div className="prest_dashboard_commandes_list__header">
                            <div>
                                <label>Filtrer par:</label>
                                <div className="filterBloc">
                                    <div className="filterField year">Ann??e <FaChevronDown /></div>
                                    <div className="filterOptions year">
                                        <div onClick={() => setFilterYear(0)}>{new Date().getFullYear()}</div>
                                        <div onClick={() => setFilterYear(1)}>{new Date().getFullYear() - 1}</div>
                                        <div onClick={() => setFilterYear(2)}>{new Date().getFullYear() - 2}</div>
                                        <div onClick={() => setFilterYear(3)}>{new Date().getFullYear() - 3}</div>
                                    </div>
                                </div>

                                <div className="filterBloc">
                                    <div className="filterField year">Statut <FaChevronDown /></div>
                                    <div className="filterOptions year">
                                        <div onClick={() => setFilterStatus("")}>Tous</div>
                                        <div onClick={() => setFilterStatus("validated")}>Valid??</div>
                                        <div onClick={() => setFilterStatus("rejected")}>Rejet??</div>
                                        <div onClick={() => setFilterStatus("pending")}>En attente</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {sales
                            .filter(sale => sale.date > getStartYearMinus(filterYear) && sale.date < getEndYearMinus(filterYear))
                            .filter(sale => (filterStatus.length > 0 ? sale.status === filterStatus : sale.status.length > 0))
                            .sort((a, b) => b.date - a.date)
                            .map((sale, key) =>
                                <div key={key} className="prest_dashboard_commandes_list__item">
                                    <div className="item__header">

                                        <p className="commandTitle">Commande #{sale.id} - <span>{formateToDate(sale.date)}</span>
                                            {(sale.status === "validated") &&
                                                // Traitement ?? changer, je lemet comme ??a pour qu'il soit visible 
                                                // de L??o, mais ensuite on devra ne l'afficher que sur c'est ?? "passed"
                                                <>
                                                    <IconButton onClick={() => handlePrintClicked(sale.transactionID, sale.sellerID)} aria-label="bill">
                                                        <PrintIcon />
                                                    </IconButton>
                                                    <Fade in={isBillEmailSent}>
                                                        <div className="confirmBox_print">
                                                            <p>Votre demande de facture a bien ??t?? prise en compte, vous recevrez un mail d'ici peu.</p>
                                                        </div>
                                                    </Fade>
                                                </>
                                            }
                                        </p>
                                        <p className="blueLink" onClick={() => handleOpeningSale(sale.id)}>
                                            {openedEvent === sale.id ? "Fermer les d??tails de la commande" : "Voir les d??tails de la commande"}
                                        </p>
                                        <p className="commandTitle">Montant de la commande : <span>{sale.total}???</span></p>
                                    </div>
                                    <div className="item__content">

                                        <div className={`item__content__left imagesSuperpos ${openedEvent === sale.id && "closed"}`}>
                                            {sale.choosedServices.slice(0, 3).map(service =>
                                                <div><Image url={service.image} /></div>
                                            )}
                                        </div>
                                        <div className={`item__content__right ${sale.status}`}>
                                            <div>
                                                <label>Date de l'??v??nement :</label>
                                                <p>{formateToDateWithWords(sale.eventDate)}</p>
                                            </div>
                                            <div>
                                                <label>Nombre de personne :</label>
                                                <p>{sale.people} personnes</p>
                                            </div>
                                            <div>
                                                <label>Cr??neau :</label>
                                                <p>Commence ?? <span>{formatLabelTimePicker(sale.startAt)}</span> & se termine ?? <span>{formatLabelTimePicker(sale.endAt)}</span>
                                                </p>
                                            </div>
                                            <div>
                                                <label>Nombre de m?? :</label>
                                                <p>{sale.placeSize}m??</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={openedEvent === sale.id ? "item__details active" : "item__details"}
                                    >
                                        <div className="item__details__services__list">
                                            {sale.choosedServices.map((service, key) =>
                                                <div key={key} className="item__details__services__item">
                                                    <div className="services__item__left">
                                                        <div>
                                                            <img src={service.image} alt="" />
                                                        </div>
                                                    </div>
                                                    <div className="services__item__right">
                                                        <p>{service.name}</p>
                                                        <div>
                                                            <span className="price">{service.price}???</span>
                                                            <span className="quantity">x{service.quantity}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="item__details__note">
                                            <Title type="h2" font="roboto-bold" value="Ajouter une note pense-b??te" />
                                            <p>Si vous avez besoin de noter quelque chose ?? ne pas oublier concernant cette commande, c'est ici.</p>
                                            <textarea value={noteObj.message} onChange={(e) => handleChangeNote(sale.id, e.target.value)}></textarea>
                                            {noteObj.message !== sale.note && <ButtonSmall onClick={() => handleSaveNote(sale.eventID)} color="blue" value="Sauvegarder" />}
                                        </div>
                                    </div>
                                    <div className="item__bottom">
                                        <div className="item__bottom__left">
                                            <p>Reste ?? payer ?? charge du client : {sale.paid !== sale.total ? (sale.total * 0.7).toFixed(2) : 0}???</p>
                                            <span>Ce montant sera r??gl?? 2 jours avant le d??but de l'??v??nement</span>
                                        </div>

                                        <CSSTransition
                                            in={sale.status !== "pending"}
                                            timeout={0}
                                            classNames="opacityTransition"
                                            unmountOnExit
                                        >
                                            <div className="item__bottom__center">
                                                <p className={sale.status}>
                                                    Statut : <span>{sale.status === "validated" ? "Valid??" : "Refus??"}</span>
                                                </p>
                                            </div>
                                        </CSSTransition>
                                        {sale.status === "pending" &&
                                            <div className="item__bottom__right">
                                                <ButtonSmall onClick={() => handleActionSale(sale.id, "rejected")} color="red" value="Refuser la commande" />
                                                <ButtonSmall onClick={() => handleActionSale(sale.id, "validated")} color="green" value="Accepter la commande" />
                                            </div>
                                        }

                                        <CSSTransition
                                            in={sale.status === "validated"}
                                            timeout={200}
                                            classNames="fromLeftTransition"
                                            unmountOnExit
                                        >
                                            <ButtonSmall onClick={() => handleActionSale(sale.id, "rejected")} color="red" value="Annuler la commmande" />
                                        </CSSTransition>

                                    </div>
                                    <CSSTransition
                                        in={validatedModal}
                                        timeout={200}
                                        classNames="pageTransition"
                                        unmountOnExit
                                    >
                                        <ModalYesNo
                                            callback={(val) => validatedModalYesNoReturn(val)}
                                            value="Voulez-vous accepter d'autres r??servations?"
                                            value2="En acceptant, vous pourrez recevoir d'autres r??servations, sinon votre calendrier sera ferm??e le jour de la r??servations et ne pourra en accepter d'autres"
                                        />
                                    </CSSTransition>
                                    {/* <CSSTransition
                                        in={rejectModal}
                                        timeout={200}
                                        classNames="pageTransition"
                                        unmountOnExit
                                    >
                                        <ModalYesNo
                                            callback={(val) => rejectModalYesNoReturn(val)}
                                            value="L'annulation d'une commande est irr??versible."
                                        />
                                    </CSSTransition> */}
                                </div>
                            )}
                    </section>
                </div>
            </CSSTransition>
        </>
    )
}

export default Prest_Dashboard_Commandes