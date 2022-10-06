import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { queryString } from 'query-string';
import { useFirebase } from "../assets/base-context";

const ConfirmEmail = () => {
    
    const firebaseContext = useFirebase()
    const auth = firebaseContext.auth()

    const [userNewPassword, setUserNewPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [confirmMessage, setConfirmMessage] = useState("")
    const [actionMode, setActionMode] = useState("")

    const history = useHistory()

    let url = window.location.search;
    let params = queryString.parse(url);
    var { mode, oobCode, continueUrl, lang } = params

    useEffect(() => {
        setActionMode(mode)
        if (mode === "resetPassword") {
            handleResetPassword();
        }
        else if (mode === "verifyEmail") {
            handleVerifyEmail(oobCode, continueUrl, lang);
        }
    }, [])



    function handleVerifyEmail(oobCode, continueUrl, lang) {
        auth.applyActionCode(oobCode).then((resp) => {
            // Email address has been verified.
            setConfirmMessage("Votre email a bien été confirmé, vous allez être redirigé ...")
            setTimeout(() => {
                history.push('/compte')
            }, 3000)

        }).catch((error) => {

        });
    }

    function handleResetPassword() {
        // Localize the UI to the selected language as determined by the lang
        // parameter.

        // Verify the password reset code is valid.
        auth.verifyPasswordResetCode(oobCode).then((email) => {
            var accountEmail = email;

            // TODO: Show the reset screen with the user's email and ask the user for

        }).catch((error) => {
            console.log(error)
        });
    }

    function handleConfirmNewPassword() {
        // the new password.
        var newPassword = userNewPassword

        // Save the new password.
        auth.confirmPasswordReset(oobCode, newPassword).then((resp) => {
            // Password reset has been confirmed and new password updated.
            setConfirmMessage("Mot de passe réinitialisé avec succés, vous allez être redirigé ...")
            setTimeout(() => {
                history.push('/compte')
            }, 3000)

        }).catch((error) => {
            console.log(error)
        });
    }

    return actionMode === "resetPassword" ? (
        confirmMessage.length < 3 ? (
            <div>
                <label>Votre nouveau mot de passe</label>
                <input type="password" value={userNewPassword} onChange={(e) => setUserNewPassword(e.target.value)} />
                <button onClick={() => handleConfirmNewPassword()}>Confirmer</button>
            </div>
        )
            : confirmMessage
    )
        : actionMode === "verifyEmail" && (
            confirmMessage ? confirmMessage : errorMessage
        )

}

export default ConfirmEmail