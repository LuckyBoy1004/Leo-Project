import React, { useState, useEffect } from "react";
import "../styles/Prest_.css"
import { useHistory } from 'react-router-dom'
import { useAuth } from "../context/userContext"; // context

import { ButtonSmall, ButtonLarge } from '../components/utilities/Buttons'
import Layout from '../components/utilities/Layout'
import Title from '../components/utilities/Title'
import SubTitle from '../components/utilities/SubTitle'
import ReactLoading from 'react-loading';
import { FaCheckCircle } from 'react-icons/fa';
import { useFirebase } from "../assets/base-context";

import { CSSTransition } from 'react-transition-group'

const Prest_Step4 = () => {
    
    const firebaseContext = useFirebase()
    const auth = firebaseContext.auth()
    const storage = firebaseContext.storage()

    const initialDocuments = {
        kbis: "",
        ci: "",
        assurance: "",
        sepa: "",
        rib: ""
    }

    const [error, setError] = useState({ type: "", message: "" });
    const [buttonLoading, setButtonLoading] = useState(false)

    const [documents, setDocuments] = useState(initialDocuments)

    const [isMounted, setIsMounted] = useState(false);

    const { seller, setCurrentStepProcess, addSellerDocuments, getSellerDocumentsFromDB, setSellerStatus } = useAuth() // context
    const history = useHistory()

    // seller.status !== "subscribing" && history.push('/mon-compte-partenaire')

    setCurrentStepProcess(4)

    useEffect(() => {
        function getCurrentDocumentsFromDB() {
            getSellerDocumentsFromDB().then(data => {
                if (data === null) {
                    setDocuments(initialDocuments)
                }
                else {
                    setDocuments(data)
                }
            })
        }
        getCurrentDocumentsFromDB()
        setIsMounted(true)
    }, [])

    function handleInputChange(e, docType) {
        const type = e.target.files[0].type
        const size = e.target.files[0].size
        if (type !== "image/png" && type !== "image/jpeg" && type !== "image/jpg" && type !== "application/pdf") {
            setError({ type: docType, message: "Votre fichier n'est ni une image jpeg, jpg, png ou PDF." })
        }
        else if (size > 2000000) {
            setError({ type: docType, message: "Votre image fait plus de 2Mo." })
        }
        else {
            e.target.files[0].docType = docType
            docType === "sepa" ? setDocuments({ ...documents, sepa: e.target.files[0] })
                : docType === "rib" && setDocuments({ ...documents, rib: e.target.files[0] })
            setError({ type: "", message: "" })
        }
    }

    async function handleSendForm() {
        setButtonLoading(true)
        if (documents.rib.name) {
            let documentsUrlArray = { ...documents }

            for (const doc in documents) {
                if (documents[doc].lastModified) {
                    const token = `${documents[doc].docType}-${Math.random().toString(36).substr(2, 19)}`
                    const url = await handleUploadFile(documents[doc], token)
                    documentsUrlArray[documents[doc].docType] = { url: url, token: token, name: documents[doc].name }
                }
            }
            await addSellerDocuments(documentsUrlArray)
            handleSendAll()
        }
        else {
            setError({ type: "final", message: "Pour finaliser votre inscription, le Rib est obligatoire." })
            setButtonLoading(false)
        }
    }

    async function handleSendAll() {

        if (seller.description && seller.description.length > 0) {
            if (seller.image_path && seller.image_path.url && seller.image_path.url.length > 0) {
                if (seller.services.length > 0) {
                    if (documents.kbis.name && documents.kbis.status !== "rejected") {
                        if (documents.ci.name && documents.ci.status !== "rejected") {
                            if (documents.assurance.name && documents.assurance.status !== "rejected") {
                                if (documents.rib.name && documents.rib.status !== "rejected") {
                                    await setSellerStatus(auth.currentUser.uid, "pending")
                                    history.push('/mon-compte-partenaire/confirmation')
                                } else {
                                    setError({ type: "final", message: "Pour finaliser votre inscription, le RIB est obligatoire." })
                                }
                            } else {
                                setError({ type: "final", message: "Pour finaliser votre inscription, l'assurance de responsabilité civile est obligatoire." })
                            }
                        } else {
                            setError({ type: "final", message: "Pour finaliser votre inscription, la carte d'identité du gérant est obligatoire." })
                        }
                    } else {
                        setError({ type: "final", message: "Pour finaliser votre inscription, le Kbis est obligatoire." })
                    }
                } else {
                    setError({ type: "final", message: "Pour finaliser votre inscription, vous devez avoir ajouté au moins 1 service." })
                }
            } else {
                setError({ type: "final", message: "Pour finaliser votre inscription, merci d'ajouter une photo principale pour votre boutique." })
            }
        }
        else {
            setError({ type: "final", message: "Pour finaliser votre inscription, vous devez renseigner une description de votre boutique, à l'étape Prestations" })
        }
        setButtonLoading(false)
    }

    function handleUploadFile(image, token) {

        return new Promise((resolve, reject) => {

            const upload = storage.ref(`sellers/${token}`).put(image)
            upload.on(
                "state_changed", snapshot => { },
                error => {
                    console.log(error)
                }, () => {
                    storage
                        .ref("sellers")
                        .child(token)
                        .getDownloadURL()
                        .then(url => {
                            resolve(url);
                        })
                        .catch(error => {
                            console.error(error)
                            reject(error);
                        })
                }
            )
        })
    }

    function handleDownloadSEPA() {

        const element = document.createElement("a");
        const file = new Blob([document.getElementById('inputDownload').value],
            { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = "SEPA.txt";
        document.body.appendChild(element);
        element.click();
    }

    return (
        <Layout>
            <CSSTransition
                in={isMounted}
                timeout={300}
                classNames="pageTransition"
                unmountOnExit
            >
                <div className="layoutDocumentPrest">
                    <div className="Prest-Step4-Header">
                        <SubTitle value="Vérification documents" type="big" font="roboto-medium" align="left" />
                        <p>Sur cette page vous allez devoir nous transmettre vos documents, pour que nous puissions vérifier votre activité.</p>
                        <p>Merci de bien les vérifier avant envoi, il ne peut y avoir de modifications possibles.</p>
                    </div>

                    <div className="Prest-Step4-Section1">
                        <Title value="Prélèvement SEPA à remplir" type="h2" font="roboto-medium" align="left" />
                        {error.type === "sepa" && <p className="errorMessage">{error.message}</p>}
                        <p>Vous pourrez transférer ce document plus tard sur votre espace ou dés maintenant.</p>
                        <input id="fileSepa" className="input-file" type="file" onChange={(e) => handleInputChange(e, "sepa")} />

                        {
                            (documents.sepa.status && documents.sepa.status === "validated") ?
                                <p className="validMessage"><FaCheckCircle style={{ marginRight: "5px" }} size="25" color="rgb(120, 213, 152)" />Votre document a été accepté</p>
                                :
                                <div>
                                    {(documents.sepa.status && documents.sepa.status === "rejected") &&
                                        <p className="errorMessage">Votre document a été refusé.</p>
                                    }
                                    <div id="inputDownload">
                                        <ButtonSmall
                                            onClick={() => handleDownloadSEPA()}
                                            color="orange"
                                            value="Télécharger le document"
                                            marginTop="20px"
                                        />
                                    </div>
                                    <ButtonSmall
                                        onClick={() => document.getElementById('fileSepa').click()}
                                        color="blue"
                                        value="Charger le document"
                                        marginTop="20px"
                                    />
                                    {(documents.sepa && documents.sepa.status !== "rejected") && <span className="fileNameOnRight">{documents.sepa.name}</span>}
                                </div>

                        }
                    </div>

                    <div className="Prest-Step4-Section2">
                        <Title value="RIB bancaire" type="h2" font="roboto-medium" align="left" />
                        {error.type === "rib" && <p className="errorMessage">{error.message}</p>}
                        <p>Evitez les photos flous ou trop sombres.</p>
                        <input id="fileRib" className="input-file" type="file" onChange={(e) => handleInputChange(e, "rib")} />
                        <div className="fileConditions">
                            <p>2Mo max</p>
                            <p>Type de fichiers acceptés : jpeg, jpg, png ou PDF</p>
                        </div>
                        {
                            (documents.rib.status && documents.rib.status === "validated") ?
                                <p className="validMessage"><FaCheckCircle style={{ marginRight: "5px" }} size="25" color="rgb(120, 213, 152)" />Votre document a été accepté</p>
                                :
                                <div>
                                    {(documents.rib.status && documents.rib.status === "rejected") &&
                                        <p className="errorMessage">Votre document a été refusé.</p>
                                    }
                                    <ButtonSmall
                                        onClick={() => document.getElementById('fileRib').click()}
                                        color="blue"
                                        value="Charger le document"
                                        marginTop="15px"
                                    />
                                    {(documents.rib && documents.rib.status !== "rejected") && <span className="fileNameOnRight">{documents.rib.name}</span>}
                                </div>
                        }

                    </div>


                    <div className="divider"></div>

                    <div className="Prest-Step4-Section3">
                        <Title value="Si vous avez terminé & bien vérifié que vos documents sont correctements enregistrés, vous pouvez finaliser votre dossier d'inscription" type="h2" font="roboto-medium" align="left" />
                        <p>En cochant cette case vous acceptez les <span>conditions générales de ventes</span></p>
                        <ButtonLarge
                            onClick={() => handleSendForm()}
                            color="orange"
                            value={buttonLoading ? <ReactLoading className="loadingSpinnerButton" type="spin" color="white" height={23} width={23} /> : "Finaliser mon inscription"}
                            width="400px"
                        />
                    </div>
                    {error.type === "final" && <p className="PrestErrorMessage">{error.message}</p>}
                </div>
            </CSSTransition>
        </Layout>
    )
}
export default Prest_Step4;
