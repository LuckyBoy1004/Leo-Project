import React, { useEffect, useState } from "react";
import { useFirebase } from "../../assets/base-context";
import ShowSeller from './ShowSeller'
import { Table } from './Table'
import { CreateSeller } from './CreateSeller'

export const Sellers = () => {

    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()

    const refSellers = firestore.collection("sellers");
    const [sellers, setSellers] = useState([])
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState("list")
    const [currentSeller, setCurrentSeller] = useState("")

    useEffect(() => {
        const refSellers = firestore.collection("sellers");

        async function getData() {
            const query = await refSellers.get();
            const results = []

            query.forEach(doc => {
                results.push({
                    ...doc.data(),
                    id: doc.id,
                    action: <button onClick={() => handleOpeningSeller(doc.id)}>Voir</button>
                })
            })
            setSellers(results)
        }

        getData().then(() => {
            setLoading(false)
        })
    }, [step])


    async function handleDeletePrestataire() {
        await refSellers.doc(currentSeller).delete().then(() => {
            setStep("list")
        })
    }

    function handleOpeningSeller(id) {
        setStep('show')
        setCurrentSeller(id)
    }


    return !loading && (
        <div title="Liste des prestataires">
            {
                step === "list" ?
                    <div>
                        <button onClick={() => setStep("create")} className="buttonAdminTransparent"> + Créer un préstataire</button>
                        <Table data={sellers} type="sellers" />
                    </div>
                    : step === "show" ?
                        <div>
                            <button onClick={() => setStep("list")} className="buttonAdminTransparent">Revenir à la liste des préstataires</button>
                            <ShowSeller handleDeletePrestataire={handleDeletePrestataire} currentSeller={currentSeller} />
                        </div>
                        : step === "create" &&
                        <div>
                            <button onClick={() => setStep("list")} className="buttonAdminTransparent">Revenir à la liste des préstataires</button>
                            <CreateSeller setStep={setStep} setCurrentSeller={setCurrentSeller} />
                        </div>
            }
        </div>
    );
}