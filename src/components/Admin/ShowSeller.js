import React, { useEffect, useState } from "react";
import { useFirebase } from "../../assets/base-context";
import { Services } from './Services'
import LocationSearchInput from "../autocompletePlaces"
import { ShowDocuments } from './components/ShowDocuments'
import { useAuth } from '../../context/userContext'


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

const ShowSeller = (props) => {

    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()

    const currentSeller = props.currentSeller
    const handleDeletePrestataire = props.handleDeletePrestataire
    const refSeller = firestore.collection("sellers").doc(currentSeller);

    const [seller, setSeller] = useState([])
    const [error, setError] = useState({ type: "", message: "" })
    const [loading, setLoading] = useState(true)
    const [currentSubmenu, setCurrentSubmenu] = useState(0)
    const [step, setStep] = useState("show")

    const { setSellerStatus } = useAuth()


    useEffect(() => {
        getData().then(() => {
            setLoading(false)
        })
    }, [step])

    async function getData() {
        const query = await refSeller.get();
        const results = query.data()
        setSeller({ ...results, uid: query.id })
    }

    function handleAdressChanged(adress, latLng) {
        setSeller({ ...seller, adress: adress, latLng: latLng })
    }

    function handleOnChangeInputs(name, value) {
        name === "companyName" ? setSeller({ ...seller, companyName: value })
            : name === "category" ? setSeller({ ...seller, category: value })
                : name === "subcategory" ? setSeller({ ...seller, subcategory: value })
                    : name === "description" ? setSeller({ ...seller, description: value })
                        : name === "firstName" ? setSeller({ ...seller, firstName: value })
                            : name === "lastName" ? setSeller({ ...seller, lastName: value })
                                : name === "phone" ? setSeller({ ...seller, phone: value })
                                    : name === "siret" ? setSeller({ ...seller, siret: value })
                                        : name === "website" && setSeller({ ...seller, website: value })
    }

    async function handleSendForm(e) {
        e.preventDefault()

        await refSeller.update({
            ...seller,
            companyName: seller.companyName,
            adress: seller.adress,
            latLng: seller.latLng,
            category: seller.category,
            subcategory: seller.subcategory,
            description: seller.description,
            firstName: seller.firstName,
            lastName: seller.lastName,
            phone: seller.phone,
            siret: seller.siret,
            website: seller.website,
        })
            .catch((error) => {
                console.error(error)
            })
            .then(() => {
                setStep("show")
            })
    }

    async function handleValidSeller() {
        if (seller.status !== "validated" && seller.status !== "opened" ) {
            let countValidDocs = 0
            for (const doc in seller.documents) {
                if (seller.documents[doc].status && seller.documents[doc].status === "validated") {
                    countValidDocs += 1
                }
            }
            if (countValidDocs === 5) {
                await setSellerStatus(seller.uid, "validated")
                setSeller({ ...seller, status: "validated" })
            }
            else {
                setError({ type: "missedValidatedDocs", message: "Attention, tout les documents doivent être validés pour valider le prestataire." })
            }
        }
        else {
            await setSellerStatus(seller.uid, "pending")
            setSeller({ ...seller, status: "pending" })
        }
    }

    async function handleOpenStore() {
        console.log(seller.status)
        if (seller.status === "validated") {
            await setSellerStatus(seller.uid, "opened")
            setSeller({ ...seller, status: "opened" })
        }
        else if (seller.status === "opened") {
            await setSellerStatus(seller.uid, "validated")
            setSeller({ ...seller, status: "validated" })
        }
        else {
            await setSellerStatus(seller.uid, "opened")
            setSeller({ ...seller, status: "opened" })
            // setError({ type: "missedValidatedDocs", message: "Le prestataire doit être validé avant de pouvoir ouvrir sa boutique" })
        }
    }

    return !loading && (
        <div>
            <h2>{seller.name}</h2>
            <div className="showSellerContainer">
                <div className="headerShowSellerContainer">
                    <div className={currentSubmenu === 0 && "active"} onClick={() => setCurrentSubmenu(0)}><h3>Infos</h3></div>
                    <div className={currentSubmenu === 1 && "active"} onClick={() => setCurrentSubmenu(1)}><h3>Services</h3></div>
                </div>
                {currentSubmenu === 0 ?
                    <div>
                        {step === "show" ?
                            <div className="infoShowSellerContainer">
                                <img alt={seller.name} src={seller.image_path.url} />
                                <ul>
                                    <li><label>Nom: </label>{seller.companyName}</li>
                                    <li><label>Adresse: </label>{seller.adress}</li>
                                    <li><label>Catégorie: </label>{seller.category}</li>
                                    <li><label>Sous catégorie: </label>{seller.subcategory}</li>
                                    <li><label>Email: </label>{seller.email}</li>
                                    <li><label>Description: </label>{seller.description}</li>
                                    <li><label>Siret: </label>{seller.siret}</li>
                                    <li><label>Site web: </label>{seller.website}</li>
                                    <li><label>Téléhone: </label>{seller.phone}</li>
                                    <li><label>Prénom du gérant: </label>{seller.firstName}</li>
                                    <li><label>Nom du gérant: </label>{seller.lastName}</li>
                                    <li>
                                        <label>Statut du compte: </label>
                                        <span
                                            className="statusSeller"
                                            style={{
                                                color:
                                                    seller.status === "validated" ? "green"
                                                        : seller.status === "opened" ? "green"
                                                            : seller.status === "subscribing" && "red"
                                            }}>
                                            {(seller.status === "validated" || seller.status === "opened") ? "Validé"
                                                : seller.status === "pending" ? "En attente"
                                                    : seller.status === "subscribing" && "Inscription ou manque de documents"
                                            }
                                        </span>
                                    </li>
                                    <li>
                                        <label>
                                            Boutique: <span style={{ color: seller.status === "opened" ? "green" : "red" }}>{seller.status === "opened" ? "Ouverte" : "Fermée"}</span>
                                        </label>
                                    </li>
                                </ul>
                                <button className="buttonAdminTransparent" onClick={() => setStep("edit")}>Modifier les informations</button>
                                <button onClick={() => handleDeletePrestataire()} className="buttonAdminTransparent">Supprimer ce préstataire</button>
                                <button onClick={() => handleValidSeller()} className="buttonAdminValid">
                                    { (seller.status === "validated" || seller.status === "opened") ? "Invalider" : "Valider le prestataire"}
                                </button>
                                <button onClick={() => handleOpenStore()} className="buttonAdminInfo">
                                    {seller.status === "opened" ? "Fermer la boutique" : "Ouvrir la boutique"}
                                </button>
                                <div>
                                    {error.type === "missedValidatedDocs" && <p className="errorMessage">{error.message}</p>}
                                </div>
                            </div>
                            : step === "edit" &&
                            <div className="infoEditSellerContainer">
                                <form>
                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Nom de la boutique</label>
                                            <input type="text" name="name" value={seller.companyName} onChange={e => handleOnChangeInputs("companyName", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Description</label>
                                            <textarea value={seller.description} onChange={e => handleOnChangeInputs("description", e.target.value)} name="description" cols="30" rows="10"></textarea>
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Lieu de l'évènement</label>
                                            <LocationSearchInput placeType="address" value={seller.adress} onChanged={handleAdressChanged} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Catégorie</label>
                                            <select onChange={e => handleOnChangeInputs("category", e.target.value)}>
                                                {category.map((item) => {
                                                    return <option selected={seller.category === item.id && "selected"} value={item.id}>{item.name}</option>
                                                })}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Sous catégorie</label>
                                            <select onChange={e => handleOnChangeInputs("subcategory", e.target.value)}>
                                                {subCategory.map((item) => {
                                                    return <option selected={seller.subcategory === item.id && "selected"} value={item.id}>{item.name}</option>
                                                })}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Prénom du gérant</label>
                                            <input type="text" name="firstName" value={seller.firstName} onChange={e => handleOnChangeInputs("firstName", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Nom du gérant</label>
                                            <input type="text" name="lastName" value={seller.lastName} onChange={e => handleOnChangeInputs("lastName", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Site web</label>
                                            <input type="text" name="website" value={seller.website} onChange={e => handleOnChangeInputs("website", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Numéro de téléphone</label>
                                            <input type="text" name="phone" value={seller.phone} onChange={e => handleOnChangeInputs("phone", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Siret</label>
                                            <input type="text" name="siret" value={seller.siret} onChange={e => handleOnChangeInputs("siret", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <input type="submit" value="Sauvegarder" onClick={(e) => handleSendForm(e)} />
                                            <button className="buttonAdminTransparent" onClick={() => setStep('show')}>Revenir en arrière</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        }
                        {(seller.status && seller.documents) && <ShowDocuments sellerId={seller.uid} documents={seller.documents} />}
                    </div>
                    :
                    <Services categorySeller={seller.category} sellerName={seller.name} currentSeller={currentSeller} />
                }
            </div>

        </div>

    );
}

export default ShowSeller