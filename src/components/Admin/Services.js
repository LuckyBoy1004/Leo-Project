import React, { useEffect, useState } from "react";
import { useFirebase } from "../../assets/base-context";
import { ShowService } from "./ShowService";
import { Table } from './Table'
import { CreateService } from './CreateService'



export const Services = (props) => {
    
    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()

    const categorySeller = props.categorySeller
    const currentSeller = props.currentSeller;
    const refServices = firestore.collection("sellers").doc(currentSeller).collection("services");

    const [services, setServices] = useState([])
    const [currentService, setCurrentService] = useState()
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState("list")

    useEffect(() => {
        const refServices = firestore.collection("sellers").doc(currentSeller).collection("services");

        async function getData() {
            const query = await refServices.get();
            const results = []

            query.forEach(doc => {
                results.push({
                    ...doc.data(),
                    id: doc.id,
                    action: <button onClick={() => handleOpeningService(doc.id)}>Voir</button>
                })
            })
            setServices(results)
        }

        getData().then(() => {
            setLoading(false)
        })
    }, [step, currentSeller])


    async function handleDeleteService() {
        await refServices.doc(currentService).delete().then(() => {
            setStep("list")
        })
    }

    function handleOpeningService(id) {
        setStep('show')
        setCurrentService(id)
    }


    return !loading && (
        <div>
            {step === "list" ?
                <div className="servicesShowSellerContainer">
                    <h2>Les services:</h2>
                    <button onClick={() => setStep("create")} className="buttonAdminTransparent"> + Créer un service</button>
                    <Table data={services} type="services" />
                </div>
                : step === "show" ?
                    <div className="showServiceContainer">
                        <button onClick={() => setStep("list")} className="buttonAdminTransparent">Retour à la liste des services</button>
                        <ShowService handleDeleteService={handleDeleteService} currentService={currentService} currentSeller={currentSeller} />
                    </div>
                    : step === "create" &&
                    <CreateService categorySeller={categorySeller} setStep={setStep} setCurrentService={setCurrentService} currentSeller={currentSeller} />
            }
        </div>
    );
}
