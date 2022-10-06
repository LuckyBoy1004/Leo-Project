import React, { useEffect, useState } from "react";
import { useFirebase } from "../../../assets/base-context";
import { Table } from '../Table'



export const Services = (props) => {

    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()

    const currentEvent = props.currentEvent;
    const refServices = firestore.collection("events").doc(currentEvent).collection("services");

    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState(true)

    useEffect(() => {
        getData().then(() => {
            setLoading(false)
        })
    }, [step])

    async function getData() {
        const query = await refServices.get();
        const results = []

        query.forEach(doc => {
            results.push({ ...doc.data(), id: doc.id, action: <button onClick={() => (handleDeleteService(doc.id))}>Supprimer</button> })
        })
        setServices(results)
    }

    async function handleDeleteService(id) {
        await refServices.doc(id).delete().then(() => {
            setStep(!step)
        })
    }

    return !loading && (
        <div>
            <div className="servicesShowSellerContainer">
                <h2>Les services:</h2>
                <Table data={services} type="services" />
            </div>
        </div>
    );
}
