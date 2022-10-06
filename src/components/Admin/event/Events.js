import React, { useEffect, useState } from "react";
import { useFirebase } from "../../../assets/base-context";
import ShowEvent from './ShowEvent'
import { Table } from '../Table'

export const Events = () => {

    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()


    const refEvents = firestore.collection("events");
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState("list")
    const [currentEvent, setCurrentEvent] = useState("")

    useEffect(() => {
        getData().then(() => {
            setLoading(false)
        })
    }, [step])

    async function getData() {
        const query = await refEvents.get();
        const results = []

        query.forEach(doc => {
            // Cette variable nous permet d'attendre que les data soit chargées avant de continuer, car on avait un souci avec la date
            const data = doc.data()
            const timstamp = (data && data.date) && data.date.toDate()
            results.push({  
                ...doc.data(),
                id: doc.id, 
                date: timstamp.toLocaleDateString("fr-FR", { year: "numeric", month: "numeric", day: "numeric" }),  
                action: <button onClick={() => (setStep("show"), setCurrentEvent(doc.id))}>Voir</button> })
        })
        setEvents(results)
    }
    
    async function handleDeleteEvent() {
        await refEvents.doc(currentEvent).delete().then(() => {
            setStep("list")
        })
    }


    return !loading && (
        <div title="Liste des events">
            {
                step === "list" ?
                    <div>
                        <Table data={events} type="events" />
                    </div>
                    : step === "show" &&
                        <div>
                        <button onClick={() => setStep("list")} className="buttonAdminTransparent">Revenir à la liste des évènements</button>
                            <ShowEvent handleDeleteEvent={handleDeleteEvent} currentEvent={currentEvent} />
                        </div>
            }
        </div>
    );
}