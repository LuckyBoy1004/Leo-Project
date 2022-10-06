import React, { useEffect, useState } from "react";
import { useFirebase } from "../../assets/base-context";
import LocationSearchInput from "../autocompletePlaces"


const category = [
    { id: 'decorations', name: 'Décoration' },
    { id: 'ambiance', name: ' Ambiance' },
    { id: 'table', name: 'À table' },
    // { id: 'service', name: 'Service sur place' },
]

const subCategory = [
    { id: 'intérieures', name: 'Décorations intérieures' },
    { id: 'extérieurs', name: 'Décorations extérieurs' },
    { id: 'Éclairages', name: 'Éclairages' },

    { id: 'Musique', name: 'Musique' },
    { id: 'Activités', name: 'Activités' },

    { id: 'Nourriture', name: 'Nourriture' },
    { id: 'Boissons', name: 'Boissons' },
]

export const CreateSeller = (props) => {

    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()

    const setStep = props.setStep
    const setCurrentSeller = props.setCurrentSeller

    const refSeller = firestore.collection("sellers");

    const [newName, setNewName] = useState("")
    const [newAdress, setNewAdress] = useState("")
    const [newLatLng, setNewLatLng] = useState([])
    const [newCategory, setNewCategory] = useState("decorations")
    const [newSubCategory, setNewSubCategory] = useState("Décorations intérieures")

    useEffect(() => {

    }, [])

    function handleAdressChanged(adress, latLng) {
        setNewAdress(adress)
        setNewLatLng(latLng)
    }

    function handleOnChangeInputs(name, value) {
        if (name === "companyName") { setNewName(value) }
        else if (name === "category") { setNewCategory(value) }
        else if (name === "subcategory") { setNewSubCategory(value) }
    }

    async function handleSendForm(e) {
        e.preventDefault()

        await refSeller.add({
            companyName: newName,
            adress: newAdress,
            latLng: newLatLng,
            category: newCategory,
            subcategory: newSubCategory,
            description: "Votre description",
            email: "UnfakeEmail@fakemail.fr",
            firstName: "Faux prénom",
            holiday: [],
            lastName: "Faux nom",
            phone: "",
            siret: "",
            status: "validated",
            website: "",
            documents: { assurance: "", rib: "", kbis: "", ci: "", sepa: "" },

            image_path: { url: "https://firebasestorage.googleapis.com/v0/b/nivid-cc8bc.appspot.com/o/sellers%2F9w2urjct1s8?alt=media&token=27d38fc7-1b78-4cb0-bc10-801606febbab" }
        })
            .catch((error) => {
                console.error(error)
            })
            .then(res => {
                setCurrentSeller(res.id)
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
                            <label>Nom du prestataire</label>
                            <input type="text" name="name" value={newName} onChange={e => handleOnChangeInputs("companyName", e.target.value)} />
                        </div>
                    </div>

                    <div className="formLine">
                        <div className="formField">
                            <label>Lieu de l'évènement</label>
                            <LocationSearchInput placeType="address" value={newAdress} onChanged={handleAdressChanged} />
                        </div>
                    </div>

                    <div className="formLine">
                        <div className="formField">
                            <label>Catégorie</label>
                            <select onChange={e => handleOnChangeInputs("category", e.target.value)}>
                                {category.map((item) => {
                                    return <option selected={newCategory === item.id && "selected"} value={item.id}>{item.name}</option>
                                })}
                            </select>
                        </div>
                    </div>

                    <div className="formLine">
                        <div className="formField">
                            <label>Sous catégorie</label>
                            <select onChange={e => handleOnChangeInputs("subcategory", e.target.value)}>
                                {subCategory.map((item) => {
                                    return <option selected={newSubCategory === item.id && "selected"} value={item.id}>{item.name}</option>
                                })}
                            </select>
                        </div>
                    </div>

                    <div className="formLine">
                        <div className="formField">
                            <input type="submit" value="Sauvegarder" onClick={(e) => handleSendForm(e)} />
                        </div>
                    </div>
                </form>
            </div>

        </div>
    );
}
