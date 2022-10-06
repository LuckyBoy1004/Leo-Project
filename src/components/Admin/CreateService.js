import React, { useEffect, useState } from "react";
import { useFirebase } from "../../assets/base-context";

export const CreateService = (props) => {
    
    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()

    const setStep = props.setStep
    const setCurrentService = props.setCurrentService
    const currentSeller = props.currentSeller
    const categorySeller = props.categorySeller

    const refService = firestore.collection("sellers").doc(currentSeller).collection("services");

    const [newName, setNewName] = useState("")
    const [newPrice, setNewPrice] = useState("")
    const [newDescription, setNewDescription] = useState([])
    useEffect(() => {

    }, [])

    function handleOnChangeInputs(name, value) {
        if (name === "name") { setNewName(value) }
        else if (name === "price") { setNewPrice(value) }
        else if (name === "description") { setNewDescription(value) }
    }

    async function handleSendForm(e) {
        e.preventDefault()

        await refService.add({
            name: newName,
            price: newPrice,
            description: newDescription,
            category: categorySeller,
            images: [{token: "",url: "https://firebasestorage.googleapis.com/v0/b/nivid-cc8bc.appspot.com/o/sellers%2F9w2urjct1s8?alt=media&token=27d38fc7-1b78-4cb0-bc10-801606febbab"}]
        })
            .catch((error) => {
                console.error(error)
            })
            .then(res => {
                setCurrentService(res.id)
                setStep("show")
            })
    }

    return (
        <div>
            <h2>Ajouter un nouveau préstataire</h2>
            <div className="createSellerContainer">
                <form>
                    <div className="formLine">
                        <div className="formField">
                            <label>Nom du service</label>
                            <input type="text" name="name" value={newName} onChange={e => handleOnChangeInputs("name", e.target.value)} />
                        </div>
                    </div>

                    <div className="formLine">
                        <div className="formField">
                            <label>Prix</label>
                            <input type="text" name="price" value={newPrice} onChange={e => handleOnChangeInputs("price", e.target.value)} />
                        </div>
                    </div>

                    <div className="formLine">
                        <div className="formField">
                            <label>Déscription</label>
                            <textarea type="text" name="description" value={newDescription} onChange={e => handleOnChangeInputs("description", e.target.value)} />
                        </div>
                    </div>


                    <div className="formLine">
                        <div className="formField">
                            <input type="submit" value="Sauvegarder" onClick={(e) => handleSendForm(e)} />
                            <button className="buttonAdminTransparent" onClick={() => setStep('list')}>Revenir en arrière</button>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    );
}
