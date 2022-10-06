import React, { useState, useEffect } from "react";
import { useAuth } from "../context/userContext"; // context
import { useHistory } from 'react-router-dom'

import { ButtonSmall } from '../components/utilities/Buttons'

const PaymentConfirm = () => {

    const history = useHistory()
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const [emails, setEmails] = useState([])
    const [newEmail, setNewEmail] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [isSent, setIsSent] = useState(false)

    const { user, event, setCurrentStepProcess, sendInBlue_sendInvitations } = useAuth() // context

    function handleResize(width) {
        setWindowsWidth(width)
    }

    useEffect(() => {
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))
    }, [window.innerWidth])

    setCurrentStepProcess(32)

    function handleAddNewEmail() {
        
        let containAt = newEmail.indexOf("@")
        if (containAt < 1) return setError("Veuillez entrer un email valide")

        let containDot = newEmail.indexOf(".")
        if (containDot <= containAt + 2) return setError("Veuillez entrer un email valide")


        if (containDot === newEmail.length - 1) return setError("Veuillez entrer un email valide")

            const newArray = [...emails]
            newArray.push(newEmail)
            setEmails(newArray)
            setNewEmail("")
            setError("")
    }

    function handleDeleteEmail(item) {
        const newArray = [...emails]
        const index = newArray.indexOf(item);
        if (index > -1) {
            newArray.splice(index, 1);
        }
        setEmails(newArray)
    }

    async function handleSendInvitations() {
        const req = await sendInBlue_sendInvitations(emails, message, user, event)
        if (req === true) {
            setIsSent(true)
            history.push("/dashboard")
        }
    }

    return (
        <div>
            <div className="invitationsContainer">
                <div className="headerInvitations">
                    <h2>Invitations</h2>
                    <p>Ajoutez les personnes que vous souhaitez inviter à votre évènement</p>
                </div>
                <div className="contentInvitations">
                    {!isSent ?
                        <>
                            <div className="emailsBlocInvitations">
                                <h3>Emails des invité(e)s</h3>
                                <div className="displayEmailsInvitations">
                                    {emails.map(item => {
                                        return <span>{item}<p onClick={() => handleDeleteEmail(item)}>X</p></span>
                                    })}
                                </div>
                                <div className="formField">
                                    <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="text" placeholder="Email de l'invité" />
                                    <button onClick={() => handleAddNewEmail()}>Ajouter</button>
                                </div>
                                {error.length > 0 &&
                                    <p className="errorMessage">{error}</p>
                                }
                            </div>
                            <div className="messageInvitations">
                                <h3>Message de l'invitation</h3>
                                <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
                                <button onClick={() => handleSendInvitations()}>Envoyer les invitations</button>
                            </div>
                        </>
                        :
                        <>
                            <p>Merci, vos invitations ont été envoyées.</p>
                            <ButtonSmall
                                onClick={() => history.push("/dashboard")}
                                color="orange"
                                value="Revenir au tableau de bord"
                            />
                        </>
                    }
                </div>
            </div>
        </div>
    )
}

export default PaymentConfirm;
