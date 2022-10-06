import React, { useEffect, useState } from "react";
import { useFirebase } from "../../../assets/base-context";
// import { Services } from './Services'
import LocationSearchInput from "../../autocompletePlaces"
import { useAuth } from "../../../context/userContext"; // context
import InputRange from 'react-input-range';
import "react-input-range/lib/css/index.css";
import DatePicker from "react-date-picker";
import { Services } from './Services'
import { GoogleApiWrapper } from 'google-maps-react';

const ShowEvent = (props) => {

    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()

    const currentEvent = props.currentEvent
    const handleDeleteEvent = props.handleDeleteEvent
    const refEvent = firestore.collection("events").doc(currentEvent);

    const [event, setEvent] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentSubmenu, setCurrentSubmenu] = useState(0)
    const [step, setStep] = useState("show")

    const { formatLabelTimePicker } = useAuth()

    useEffect(() => {
        getData().then(() => {
            setLoading(false)
        })
        appendToSliderTimePicker()
    }, [step])

    async function getData() {
        const query = await refEvent.get();
        const results = query.data()
        const timstamp = results.date.toDate()
        setEvent({
            ...results,
            date: timstamp
        })
    }

    function handleAdressChanged(adress, latLng) {
        setEvent({ ...event, place: adress, latLng: latLng })
    }

    function handleOnChangeInputs(name, value) {
        if (name === "name") { setEvent({ ...event, name: value }) }
        else if (name === "place") { setEvent({ ...event, place: value }) }
        else if (name === "latLng") { setEvent({ ...event, latLng: value }) }
        else if (name === "budget") { setEvent({ ...event, budget: value }) }
        else if (name === "people") { setEvent({ ...event, people: value }) }
        else if (name === "placeSize") { setEvent({ ...event, placeSize: value }) }
        else if (name === "date") { setEvent({ ...event, date: value }) }
        else if (name === "startAt") { setEvent({ ...event, startAt: value }); appendToSliderTimePicker() }
        else if (name === "endAt") { setEvent({ ...event, endAt: value }); appendToSliderTimePicker() }
    }

    async function handleSendForm(e) {
        e.preventDefault()

        await refEvent.update({
            ...event,
            budget: parseInt(event.budget),
            people: parseInt(event.people),
            placeSize: parseInt(event.placeSize)
        })
            .catch((error) => {
                console.error(error)
            })
            .then(() => {
                setStep("show")
            })
    }

    function appendToSliderTimePicker() {
        const element = document.getElementsByClassName("input-range__slider")
        const formatedEndTime = formatLabelTimePicker(event.endAt)
        const formatedStartTime = formatLabelTimePicker(event.startAt)
        if (element[0] !== undefined) {
            element[0].innerHTML = "Commence à " + formatedStartTime
            element[1].innerHTML = "Termine à " + formatedEndTime
        }
    }

    return !loading && (
        <div>
            <h2>{event.name}</h2>
            <div className="showSellerContainer">
                <div className="headerShowSellerContainer">
                    <div className={currentSubmenu === 0 && "active"} onClick={() => setCurrentSubmenu(0)}><h3>Infos</h3></div>
                    <div className={currentSubmenu === 1 && "active"} onClick={() => setCurrentSubmenu(1)}><h3>Services</h3></div>
                </div>
                {currentSubmenu === 0 ?
                    <div>
                        {step === "show" ?
                            <div className="infoShowSellerContainer">
                                <ul>
                                    <li><label>Nom: </label>{event.name}</li>
                                    <li><label>Adresse: </label>{event.place}</li>
                                    <li><label>Budget: </label>{event.budget}</li>
                                    <li><label>Nombre de personnes: </label>{event.people}</li>
                                    <li><label>Surface du lieu: </label>{event.placeSize}</li>
                                    <li><label>Date: </label>{event.date.toLocaleDateString("fr-FR", { year: "numeric", month: "numeric", day: "numeric" })}</li>
                                    <li><label>Commence à: </label>{formatLabelTimePicker(event.startAt)}</li>
                                    <li><label>Termine à: </label>{formatLabelTimePicker(event.endAt)}</li>
                                    <li><label>Utilisateur: </label>{event.user}</li>
                                </ul>
                                <button className="buttonAdminTransparent" onClick={() => setStep("edit")}>Modifier les informations</button>
                                <button onClick={() => handleDeleteEvent()} className="buttonAdminTransparent">Supprimer cet évènement</button>
                            </div>
                            : step === "edit" &&
                            <div className="infoEditSellerContainer">
                                <form>
                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Nom de l'évènement</label>
                                            <input type="text" name="name" value={event.name} onChange={e => handleOnChangeInputs("name", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Lieu de l'évènement</label>
                                            <LocationSearchInput placeType="address" value={event.place} onChanged={handleAdressChanged} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Budget</label>
                                            <input type="text" name="budget" value={event.budget} onChange={e => handleOnChangeInputs("budget", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Nombre de personnes</label>
                                            <input type="text" name="people" value={event.people} onChange={e => handleOnChangeInputs("people", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Surface du lieu</label>
                                            <input type="text" name="placeSize" value={event.placeSize} onChange={e => handleOnChangeInputs("placeSize", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Date</label>
                                            <DatePicker
                                                value={event.date}
                                                onChange={date => handleOnChangeInputs("date", date)}
                                                className="etape1DatePicker"
                                                format="dd/MM/yyyy"
                                                clearIcon={null}
                                                calendarIcon={null}
                                                minDate={new Date()}
                                            />
                                        </div>
                                    </div>

                                    <div className="formLine">
                                        <div className="formField">
                                            <label>Créneau horaire</label>
                                            <div className="etape1TimePickerContainer">
                                                <InputRange
                                                    maxValue={86400}
                                                    minValue={0}
                                                    draggableTrack
                                                    step={900}
                                                    value={event.startAt}
                                                    formatLabel={value => formatLabelTimePicker(value)}
                                                    onChange={value => handleOnChangeInputs("startAt", value)} />
                                            </div>
                                            <div className="etape1TimePickerContainer endAt">
                                                <InputRange
                                                    maxValue={86400}
                                                    minValue={0}
                                                    draggableTrack
                                                    step={900}
                                                    value={event.endAt}
                                                    formatLabel={value => formatLabelTimePicker(value)}
                                                    onChange={value => handleOnChangeInputs("endAt", value)} />
                                            </div>
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
                    :
                    <Services eventName={event.name} currentEvent={currentEvent} />
                }
            </div>
        </div>

    );
}
export default GoogleApiWrapper({
    apiKey: ("AIzaSyDOQ_vau2uT4Gx_iLMVq2XfsUK3BPULVnY")
})(ShowEvent)