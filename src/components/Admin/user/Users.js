import React, { useEffect, useState } from "react";
import { Table } from '../Table'
import { useFirebase } from "../../../assets/base-context";

export const Users = () => {

    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()


    const refUsers = firestore.collection("users");
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        getData().then(() => {
            setLoading(false)
        })
    }, [step])

    async function getData() {
        const query = await refUsers.get();
        const results = []

        query.forEach(doc => {
            results.push({
                ...doc.data(),
                id: doc.id,
                action: <button onClick={() => (handleDeleteUser(doc.id))}>Supprimer</button>
            })
        })
        setUsers(results)
    }

    async function handleDeleteUser(id) {
        await refUsers.doc(id).delete().then(() => {
            setStep(!step)
        })
    }

    function handleSearch(val) {
        setSearch(val)
    }

    return !loading && (
        <div title="Liste des users">
                    <div>
                        <Table data={users} type="users" />
                    </div>
        </div>
    );
}