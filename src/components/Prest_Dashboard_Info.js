import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/userContext'

import Title from './utilities/Title'
import { ButtonSmall } from './utilities/Buttons'

import { CSSTransition } from 'react-transition-group'
import ReactLoading from 'react-loading';


const Prest_Dashboard_Info = () => {

    const {
        updateSellerProfil,
        seller
    } = useAuth()

    const [error, setError] = useState({ type: "", message: "" });
    const [confirm, setConfirm] = useState("");
    const [buttonLoading, setButtonLoading] = useState(false)

    const initialData = {
        companyName: "",
        adress: "",
        siret: "",
        website: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        affiliateCode: "",
        status: ""
    }

    const [isMounted, setIsMounted] = useState(false);

    const [sellerData, setSellerData] = useState(initialData);
    const [sellerDataStatus, setSellerDataStatus] = useState({
        companyName: false,
        website: false,
        firstName: false,
        lastName: false,
        phone: false,
    });

    useEffect(() => {
        setSellerData({
            companyName: seller.companyName,
            adress: seller.adress,
            siret: seller.siret,
            website: seller.website,
            firstName: seller.firstName,
            lastName: seller.lastName,
            email: seller.email,
            phone: seller.phone,
            status: seller.status
        })
        setFieldsStatus(seller)
        return setIsMounted(true)
    }, [])

    function setFieldsStatus(data) {
        setSellerDataStatus({
            companyName: data.companyName.length > 0 ? true : false,
            firstName: data.firstName.length > 0 ? true : false,
            lastName: data.lastName.length > 0 ? true : false,
            phone: data.phone.length === 10 || data.phone.length === 0 ? true : false,
        })
    }

    async function handleFormSubmit() {
        if (buttonLoading) return
        if (!sellerDataStatus.companyName) return setError({ type: "companyName", message: "Vous devez renseigner le nom de votre entreprise." })
        if (!sellerDataStatus.firstName) return setError({ type: "firstName", message: "Merci de renseigner le prénom du gérant" })
        if (!sellerDataStatus.lastName) return setError({ type: "lastName", message: "Merci de renseigner le nom du gérant" })
        if (!sellerDataStatus.phone) return setError({ type: "phone", message: "Merci de renseigner un numéro de téléphone valide" })
        setButtonLoading(true)
        const data = {
            companyName: sellerData.companyName,
            website: sellerData.website,
            firstName: sellerData.firstName,
            lastName: sellerData.lastName,
            phone: sellerData.phone
        }
        await updateSellerProfil(data)
        setButtonLoading(false)
        setError({ type: "", message: "" })
        setConfirm("Vos informations ont été modifiées")
    }


    function handleFieldChange(data) {
        setFieldsStatus(data)
        setSellerData(data)
    }


    return (
        <CSSTransition
            in={isMounted}
            timeout={300}
            classNames="pageTransition"
            unmountOnExit
        >
            <div className="prest_Dashboard_Info">
                <div className="prest_dashboard_info_container">
                   {/*} <div className="prest_dashboard_info_header">
                        <p>Vous pouvez modifier sur cette page vos informations personnelles entrées lors de votre inscription mais attention ! <br />
                    Celles-ci ne sont modifiables seulement pendant la période d'attente de validation de votre compte, après cette période in ne sera plus possible de modifier vos informations personnelles.
                    </p>
                    </div>*/}

                    {error && <div className="errorMessage">{error.message}</div>}

                    <form>
                        <div className="leftForm">
                            <Title value="Votre entreprise" type="h2" font="roboto-medium" />
                            <div className="formLine">
                                <div className="formField withoutMargin">
                                    <label>Nom de l'entreprise</label>
                                    <input
                                        className={sellerDataStatus.companyName ? "valid" : "notValid"}
                                        value={sellerData.companyName}
                                        type="text"
                                        name="companyName"
                                        onChange={(e) => handleFieldChange({ ...sellerData, companyName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="formLine">
                                <div className="formField withoutMargin">
                                    <label>Adresse</label>
                                    <input disabled value={sellerData.adress} type="text" name="adress" />
                                </div>
                            </div>

                            <div className="formLine">
                                <div className="formField withoutMargin">
                                    <label>Numéro de Siret</label>
                                    <input disabled value={sellerData.siret} type="text" name="siret" />
                                </div>
                            </div>

                            <div className="formLine">
                                <div className="formField withoutMargin">
                                    <label>Site internet</label>
                                    <input
                                        value={sellerData.website}
                                        type="text"
                                        name="text"
                                        onChange={(e) => handleFieldChange({ ...sellerData, website: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rightForm">
                            <Title value="Coordonnées du gérant" type="h2" font="roboto-medium" />

                            <div className="formLine">
                                <div className="formField">
                                    <label>Prénom</label>
                                    <input
                                        className={sellerDataStatus.firstName ? "valid" : "notValid"}
                                        value={sellerData.firstName}
                                        type="text"
                                        name="firstName"
                                        onChange={(e) => handleFieldChange({ ...sellerData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="formField">
                                    <label>Nom</label>
                                    <input
                                        className={sellerDataStatus.lastName ? "valid" : "notValid"}
                                        value={sellerData.lastName}
                                        type="text"
                                        name="lastName"
                                        onChange={(e) => handleFieldChange({ ...sellerData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="formLine">
                                <div className="formField">
                                    <label>Email</label>
                                    <input disabled value={sellerData.email} type="email" name="email" />
                                </div>
                            </div>

                            <div className="formLine">
                                <div className="formField">
                                    <label>Numéro de téléphone (fixe ou portable)</label>
                                    <input
                                        className={sellerDataStatus.phone ? "valid" : sellerData.phone.length === 0 ? "" : "notValid"}
                                        value={sellerData.phone}
                                        type="text"
                                        name="phone"
                                        onChange={(e) => handleFieldChange({ ...sellerData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className="actionFormContainer">
                        {confirm.length > 0 && <p>{confirm}</p>}
                        <ButtonSmall
                            onClick={() => handleFormSubmit()}
                            color="orange"
                            disabled={buttonLoading}
                            value={buttonLoading ? <ReactLoading className="loadingSpinnerButton" type="spin" color="white" height={23} width={23} /> : "Sauvegarder les changements"}
                        />
                    </div>
                </div>
            </div>
        </CSSTransition>
    )
}

export default Prest_Dashboard_Info