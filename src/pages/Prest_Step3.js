import React, { useState, useEffect } from "react";
import "../styles/Prest_.css"
import { useHistory } from 'react-router-dom'
import { useAuth } from "../context/userContext"; // context

import { ButtonSmall, ButtonLarge } from '../components/utilities/Buttons'
import Layout from '../components/utilities/Layout'
import Title from '../components/utilities/Title'
import SubTitle from '../components/utilities/SubTitle'
import ReactLoading from 'react-loading';
import { useFirebase } from "../assets/base-context";
import { FaCheckCircle } from 'react-icons/fa';
import { CSSTransition } from 'react-transition-group'

const Prest_Step3 = () => {
    
    const firebaseContext = useFirebase()
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


    const { seller, setCurrentStepProcess, addSellerDocuments, getSellerDocumentsFromDB } = useAuth() // context
    const history = useHistory()
    
    // seller.status !== "subscribing" && history.push('/mon-compte-partenaire')

    setCurrentStepProcess(3)

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
            docType === "kbis" ? setDocuments({ ...documents, kbis: e.target.files[0] })
                : docType === "ci" ? setDocuments({ ...documents, ci: e.target.files[0] })
                    : docType === "assurance" && setDocuments({ ...documents, assurance: e.target.files[0] })
            setError({ type: "", message: "" })
        }
    }

    async function handleSendForm() {
        setButtonLoading(true)
        if (documents.kbis.name && documents.ci.name && documents.assurance.name) {
            let documentsUrlArray = { ...documents }

            for (const doc in documents) {
                if (documents[doc].lastModified) {
                    const token = `${documents[doc].docType}-${Math.random().toString(36).substr(2, 19)}`
                    const url = await handleUploadFile(documents[doc], token)
                    documentsUrlArray[documents[doc].docType] = { url: url, token: token, name: documents[doc].name }
                }
            }
            
            const modifiedFiles = Object.values(documents).filter(doc => doc.lastModified !== undefined)
            modifiedFiles.length > 0 && await addSellerDocuments(documentsUrlArray)
            history.push('/mon-compte-partenaire/process/verification-2')

        } else {
            setError({ type: "docCount", message: "Il manque des documents. Le Kbis, la carte d'identité, et l'assurance de responsabilité civile, sont obligatoires." })
            setButtonLoading(false)
        }

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

    return (
        <Layout>
            <CSSTransition
                in={isMounted}
                timeout={300}
                classNames="pageTransition"
                unmountOnExit
            >
                <div className="layoutDocumentPrest">
                    <div className="Prest-Step3-Header">
                        <SubTitle value="Vérification documents" type="big" font="roboto-medium" align="left" />
                        <p>Sur cette page vous allez devoir nous transmettre vos documents, pour que nous puissions vérifier votre activité.</p>
                        <p>Merci de bien les vérifier avant envoi, il ne peut y avoir de modifications possibles.</p>
                    </div>

                    <div className="Prest-Step3-Section1">
                        <Title value="KBIS actualisé ou relevé Siren" type="h2" font="roboto-medium" align="left" />
                        {error.type === "kbis" && <p className="errorMessage">{error.message}</p>}
                        <p>Evitez les photos floues ou trop sombres.</p>
                        <input id="fileKbis" className="input-file" type="file" onChange={(e) => handleInputChange(e, "kbis")} />
                        <div className="fileConditions">
                            <p>2Mo max</p>
                            <p>Type de fichiers acceptés : jpeg, jpg, png ou PDF</p>
                        </div>
                        {
                            (documents.kbis.status && documents.kbis.status === "validated") ?
                                <p className="validMessage"><FaCheckCircle style={{ marginRight: "5px" }} size="25" color="rgb(120, 213, 152)" />Votre document a été accepté</p>
                                :
                                <div>
                                    {(documents.kbis.status && documents.kbis.status === "rejected") &&
                                        <p className="errorMessage">Votre document a été refusé.</p>
                                    }
                                    <ButtonSmall
                                        onClick={() => document.getElementById('fileKbis').click()}
                                        color="blue"
                                        value="Charger le document"
                                        marginTop="15px"
                                    />
                                    {(documents.kbis && documents.kbis.status !== "rejected") && <span className="fileNameOnRight">{documents.kbis.name}</span>}
                                </div>
                        }
                    </div>

                    <div className="Prest-Step3-Section2">
                        <Title value="Carte d'identité du gérant" type="h2" font="roboto-medium" align="left" />
                        {error.type === "ci" && <p className="errorMessage">{error.message}</p>}
                        <p>Evitez les photos floues ou trop sombres.</p>
                        <p>Merci de nous fournir un document avec le recto et le verso de votre carte d'identité.</p>
                        <input id="fileCi" className="input-file" type="file" onChange={(e) => handleInputChange(e, "ci")} />
                        <div className="fileConditions">
                            <p>2Mo max</p>
                            <p>Type de fichiers acceptés : jpeg, jpg, png ou PDF</p>
                        </div>
                        {
                            (documents.ci.status && documents.ci.status === "validated") ?
                                <p className="validMessage"><FaCheckCircle style={{ marginRight: "5px" }} size="25" color="rgb(120, 213, 152)" />Votre document a été accepté</p>
                                :
                                <div>
                                    {(documents.ci.status && documents.ci.status === "rejected") &&
                                        <p className="errorMessage">Votre document a été refusé.</p>
                                    }
                                    <ButtonSmall
                                        onClick={() => document.getElementById('fileCi').click()}
                                        color="blue"
                                        value="Charger le document"
                                        marginTop="15px"
                                    />
                                    {(documents.ci && documents.ci.status !== "rejected") && <span className="fileNameOnRight">{documents.ci.name}</span>}
                                </div>
                        }
                    </div>

                    <div className="Prest-Step3-Section4">
                        <Title value="Assurance responsabilité civile professionnelle" type="h2" font="roboto-medium" align="left" />
                        {error.type === "assurance" && <p className="errorMessage">{error.message}</p>}
                        <p>Evitez les photos floues ou trop sombres.</p>
                        <input id="fileAssurance" className="input-file" type="file" onChange={(e) => handleInputChange(e, "assurance")} />
                        <div className="fileConditions">
                            <p>2Mo max</p>
                            <p>Type de fichiers acceptés : jpeg, jpg, png ou PDF</p>
                        </div>
                        {
                            (documents.assurance.status && documents.assurance.status === "validated") ?
                                <p className="validMessage"><FaCheckCircle style={{ marginRight: "5px" }} size="25" color="rgb(120, 213, 152)" />Votre document a été accepté</p>
                                :
                                <div>
                                    {(documents.assurance.status && documents.assurance.status === "rejected") &&
                                        <p className="errorMessage">Votre document a été refusé.</p>
                                    }
                                    <ButtonSmall
                                        onClick={() => document.getElementById('fileAssurance').click()}
                                        color="blue"
                                        value="Charger le document"
                                        marginTop="15px"
                                    />
                                    {(documents.assurance && documents.assurance.status !== "rejected") && <span className="fileNameOnRight">{documents.assurance.name}</span>}
                                </div>
                        }
                    </div>


                    <div className="divider"></div>

                    <div className="Prest-Step3-Section3">
                        <ButtonLarge
                            onClick={() => handleSendForm()}
                            color="orange"
                            value={buttonLoading ? <ReactLoading className="loadingSpinnerButton" type="spin" color="white" height={23} width={23} /> : "Passer aux documents suivants"}
                            width="400px"
                        />
                    </div>
                    {error.type === "docCount" && <p className="PrestErrorMessage">{error.message}</p>}
                </div>
            </CSSTransition>
        </Layout>
    )
}
export default Prest_Step3;
