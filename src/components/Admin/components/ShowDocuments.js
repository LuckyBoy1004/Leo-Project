import React, { useEffect, useState } from "react";
import { useAuth } from '../../../context/userContext'


export const ShowDocuments = ({ sellerId, documents }) => {

    const [loading, setLoading] = useState(true)
    const [newDocuments, setNewDocuments] = useState(documents)

    const { updateSellerDocumentsStatus } = useAuth()


    useEffect(() => {
    }, [])

    async function validateDocument(key) {
        const newDocumentsArray = { ...newDocuments }
        newDocumentsArray[key] = { ...newDocumentsArray[key], status: "validated" }
        await updateSellerDocumentsStatus(sellerId, newDocumentsArray)
        setNewDocuments(newDocumentsArray)
    }

    async function rejectDocument(key) {
        const newDocumentsArray = { ...newDocuments }
        newDocumentsArray[key] = { ...newDocumentsArray[key], status: "rejected" }
        await updateSellerDocumentsStatus(sellerId, newDocumentsArray)
        setNewDocuments(newDocumentsArray)
    }

    return loading && (
        <div className="documentsContainer">
            <h1>Documents à vérifier</h1>
            {Object.entries(newDocuments).map(doc => {
                return (
                    <div>
                        <h2>{doc[0]}:</h2>
                        {
                            doc[1] &&
                            <>
                                <a href={doc[1].url} target="_blank" rel="noreferrer">
                                    <img alt="nivid" src={doc[1].url} />
                                    {
                                        (doc[1].status && doc[1].status === "validated") ? <span className="green">Validé</span>
                                            : (doc[1].status && doc[1].status === "rejected") ? <span className="red">Refusé</span>
                                                : (doc[1].status && doc[1].status === "pending" || !doc[1].status) && <span className="yellow">En attente</span>
                                    }
                                </a>
                                <div className="buttonsContainer">
                                    {
                                        (!doc[1].status || doc[1].status === "pending") &&
                                        <div>
                                            <button onClick={() => validateDocument(doc[0])} className="buttonAdminValid">Valider ce document</button>
                                            <button onClick={() => rejectDocument(doc[0])} className="buttonAdminDelete">Refuser ce document</button>
                                        </div>

                                    }
                                </div>
                            </>
                        }
                    </div>
                )
            })}
        </div>

    );
}