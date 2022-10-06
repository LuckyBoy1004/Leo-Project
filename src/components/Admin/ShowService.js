import React, { useEffect, useState } from "react";
import { useFirebase } from "../../assets/base-context";


export const ShowService = (props) => {

    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()

    const currentSeller = props.currentSeller
    const currentService = props.currentService
    const handleDeleteService = props.handleDeleteService
    const refService = firestore.collection("sellers").doc(currentSeller).collection("services").doc(currentService);

    const [service, setService] = useState([])
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState("show")

    useEffect(() => {
        getData().then(() => {
            setLoading(false)
        })
    }, [])

    async function getData() {
        const query = await refService.get();
        const results = query.data()
        setService(results)
    }

    function handleOnChangeInputs(name, value) {
        if (name === "name") { setService({ ...service, name: value }) }
        else if (name === "price") { setService({ ...service, price: value }) }
        else if (name === "description") { setService({ ...service, description: value }) }
    }

    async function handleSendForm(e) {
        e.preventDefault()

        await refService.update(service)
            .catch((error) => {
                console.error(error)
            })
            .then(() => {
                setStep("show")
            })
    }


    return !loading && (
        <div>
            {step === "show" ?
                <div className="infoShowServiceContainer">
                    <h2>{service.name}</h2>
                    <div className="infoShowServiceImages">
                        {service.images.map(image => {
                            return <img alt="nivid" src={image.url} />
                        })}
                    </div>
                    <ul>
                        {service.variations.length === 0 && <li><label>Prix: </label>{service.price}</li>}
                        <li><label>Catégorie: </label>{service.category}</li>
                        <li><label>Déscription: </label>{service.description}</li>
                        <li>
                            <label>Variations: </label>
                            <p>{
                                service.variations.length === 0 ? "Non"
                            : service.variations.map(variation => `${variation.name} -- ${variation.price}€ `)
                            }</p>
                        </li>
                    </ul>
                    <button onClick={() => setStep("edit")} className="buttonAdminTransparent">Modifier</button>
                    <button onClick={() => handleDeleteService()} className="buttonAdminTransparent">Supprimer ce service</button>
                </div>
                : step === "edit" &&
                <div className="infoEditSellerContainer">
                    <form>
                        <div className="formLine">
                            <div className="formField">
                                <label>Nom du service</label>
                                <input type="text" name="name" value={service.name} onChange={e => handleOnChangeInputs("name", e.target.value)} />
                            </div>
                        </div>

                        <div className="formLine">
                            <div className="formField">
                                <label>Prix</label>
                                <input type="text" name="price" value={service.price} onChange={e => handleOnChangeInputs("price", e.target.value)} />
                            </div>
                        </div>

                        <div className="formLine">
                            <div className="formField">
                                <label>Déscription</label>
                                <textarea type="text" name="description" value={service.description} onChange={e => handleOnChangeInputs("description", e.target.value)} />
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
        </div>
    );
}
