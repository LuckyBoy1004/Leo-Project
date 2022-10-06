import React, { useState, useEffect } from "react";
import { useAuth } from '../context/userContext'
import { Link } from "react-router-dom";

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import frLocale from 'date-fns/locale/fr';
import MobileDatePicker from '@mui/lab/MobileDatePicker';

import ReactLoading from 'react-loading';

import { ButtonSmall } from './utilities/Buttons'

const UpdateProfil = (props) => {

    const isMobile = props.isMobile

    const { user, getCurrentUserProfil, updateCurrentUserProfil, verifyLogin, updateUserEmail } = useAuth()

    const [data, setData] = useState({
        gender: "f"
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState({
        field: "",
        message: ""
    })
    const [isCalendarOpened, setIsCalendarOpened] = useState(false)
    const [confirm, setConfirm] = useState(false)

    const [newEmail, setNewEmail] = useState("")
    const [confirmEmail, setConfirmEmail] = useState("")
    const [password, setPassword] = useState("")


    useEffect(() => {
        getCurrentUserProfil().then(results => {
            setData({ ...data, ...results, birthDate: results.birthDate && new Date(results.birthDate.seconds * 1000) })
            setNewEmail(results.email)
            setLoading(false)
        })
    }, [])

    // function isInputDisabled(input) {
    //     if (data[input] !== undefined && data[input].length >= 2) {
    //         return true
    //     }
    //     else {
    //         return false
    //     }
    // }

    async function verifyFields() {
        if (data.firstName !== undefined && data.firstName.length >= 2) {
            if (data.name !== undefined && data.name.length >= 2) {
                if (data.gender !== undefined && data.gender.length > 0) {
                    if (data.birthDate !== undefined) {
                        if (data.tel === undefined || data.tel.length === 10 || data.tel.length === 0) {
                            setError({ field: "", message: "" })
                            return true
                        }
                        else {
                            return setError({ field: "tel", message: "Merci de renseigner un numéro de téléphone valide." })
                        }
                    }
                    else {
                        return setError({ field: "birthDate", message: "Merci de renseigner votre date de naissance." })
                    }
                }
                else {
                    return setError({ field: "gender", message: "Merci de renseigner votre sexe." })
                }
            }
            else {
                return setError({ field: "name", message: "Merci de renseigner votre nom." })
            }
        }
        else {
            return setError({ field: "firstName", message: "Merci de renseigner votre prénom." })
        }
    }

    function handleSaveUpdate() {
        verifyFields()
            .then(async res => {
                if (res === true) {
                    if (user.providerData[0].providerId === "google.com") {
                        await updateCurrentUserProfil(data)
                        setConfirm(true)
                    }
                    else {
                        if (newEmail === confirmEmail) {
                            verifyLogin(data.email, password).then(async res => {
                                await updateCurrentUserProfil({ ...data, email: newEmail })
                                await updateUserEmail(newEmail)
                                return setConfirm(true)
                            })
                                .catch(error => {
                                    if (error.code === "auth/wrong-password") {
                                        return setError({ field: "password", message: "Le mot de passe est incorrect." })
                                    }
                                })
                        }
                        else {
                            return setError({ field: "emailConfirm", message: "Les deux adresses e-mail doivent être identiques." })
                        }
                    }
                }
            })
    }

    return loading ?
        <div className={isMobile ? "dashboardUpdate mobile" : "dashboardUpdate"}>
            <ReactLoading className={isMobile ? "loadingSpinner mobile" : "loadingSpinner"} type="spin" color="rgba(245, 192, 67)" height={50} width={50} />
        </div>
        : (
            <div className={isMobile ? "dashboardUpdate mobile" : "dashboardUpdate"}>
                <div className="leftSide">
                    <h1>Vos informations personnelles</h1>
                    <div className="updateProfilInfoBox">
                        <p>Pour modifier d'autres informations vous concernant, <Link class="contactlinkdashboard" to="/contact">contactez-nous</Link>.</p>
                    </div>
                    <p className="errorMessage">{error.message}</p>
                    <div className="updateProfilContent">

                        <div className={error.field === "firstName" ? "formField error" : "formField"}>
                            <label>Prénom*</label>
                            <input type="text" name="firstName" value={data.firstName} onChange={(e) => setData({ ...data, firstName: e.target.value })} />
                        </div>

                        <div className={error.field === "name" ? "formField error" : "formField"}>
                            <label>Nom*</label>
                            <input type="text" name="name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
                        </div>

                        <div className={error.field === "gender" ? "formField error" : "formField"}>
                            <label>Sexe*</label>
                            <select value={data.gender} onChange={(e) => setData({ ...data, gender: e.target.value })}>
                                <option selected={data.gender === "h" && "selected"} value="h">Homme</option>
                                <option selected={data.gender === "f" && "selected"} value="f">Femme</option>
                            </select>
                        </div>

                        <div className={error.field === "birthDate" ? "formFieldSpecialDate error" : "formFieldSpecialDate"}>
                            <label>Date de naissance*</label>
                            <div
                                onClick={() => setIsCalendarOpened(!isCalendarOpened)}
                                className="etape1DatePicker subscribe"
                            >
                                {
                                    data.birthDate !== undefined ?
                                        new Date(data.birthDate).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
                                        :
                                        "Date de naissance"
                                }
                            </div>
                            {isCalendarOpened &&
                                <div className="calendarContainerAbsolute">
                                    <LocalizationProvider style={{ position: "relative!important" }} locale={frLocale} dateAdapter={AdapterDateFns}>
                                        {isMobile ?
                                            <MobileDatePicker
                                                label="Date de l'évènement"
                                                open={isCalendarOpened}
                                                onClose={() => setIsCalendarOpened(false)}
                                                value={data.birthDate}
                                                onChange={(val) => (setData({ ...data, birthDate: val }), setIsCalendarOpened(false))}
                                                renderInput={() => null}
                                            />
                                            :
                                            <DatePicker
                                                open={isCalendarOpened}
                                                onClose={() => setIsCalendarOpened(false)}
                                                value={data.birthDate}
                                                onChange={(val) => (setData({ ...data, birthDate: val }), setIsCalendarOpened(false))}
                                                renderInput={() => null}
                                            />
                                        }
                                    </LocalizationProvider>
                                </div>
                            }
                        </div>

                        <div className={error.field === "tel" ? "formField error" : "formField"}>
                            <label>Numéro de téléphone</label>
                            <input type="text" name="tel" value={data.tel} onChange={(e) => setData({ ...data, tel: e.target.value })} />
                        </div>

                        {user.providerData[0].providerId !== "google.com" &&
                            <div className="formField">
                                <label>Adresse e-mail</label>
                                <input type="text" name="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                            </div>
                        }
                        {
                            user.providerData[0].providerId !== "google.com" &&
                            <div className={error.field === "emailConfirm" ? "formField error" : "formField"}>
                                <label>Confirmation e-mail</label>
                                <input type="text" name="email" onChange={(e) => setConfirmEmail(e.target.value)} />
                            </div>
                        }
                    </div>

                    <div className="updateProfilConfirm">

                        {
                            user.providerData[0].providerId !== "google.com" ?
                                <div>
                                    <p>Pour confirmer les changements, merci de renseigner votre mot de passe actuel dans le champ ci-dessous :</p>
                                    <div className={error.field === "password" ? "formField error" : "formField"}>
                                        <input type="password" name="password" onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                    <ButtonSmall
                                        onClick={() => handleSaveUpdate()}
                                        color="orange"
                                        value="Enregistrer les modifications"
                                        disabled={password.length < 2}
                                    />
                                </div>
                                :
                                <ButtonSmall
                                    onClick={() => handleSaveUpdate()}
                                    color="orange"
                                    value="Enregistrer les modifications"
                                />

                        }
                        <div>
                            {confirm &&
                                <p className="green">Vos informations personnelles ont bien été mis à jour.</p>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
}

export default UpdateProfil