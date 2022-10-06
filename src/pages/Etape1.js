import React, { useState, useEffect } from "react";
import '../styles/Etape1.css'
import NumericInput from 'react-numeric-input';
import LocationSearchInput from "../components/autocompletePlaces"
import { useAuth } from "../context/userContext"; // context
import { useFirebase } from "../assets/base-context";
import { useHistory } from 'react-router-dom'
import InputRange from 'react-input-range';
import "react-input-range/lib/css/index.css";

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import frLocale from 'date-fns/locale/fr';
import MobileDatePicker from '@mui/lab/MobileDatePicker';

import { ButtonLarge } from '../components/utilities/Buttons'
import Loader from '../components/Loader.js'
import { FaQuestionCircle } from 'react-icons/fa'
import { Hidden } from "@mui/material";


function sizeFormat(num) { return num + ' m²'; }
function euroFormat(num) { return num + '€'; }

const Etape1 = () => {

    const firebaseContext = useFirebase()
    const auth = firebaseContext.auth()

    const history = useHistory()

    const { event, addEvent, setCurrentStepProcess, formatLabelTimePicker } = useAuth() // context


    const [name, setName] = useState(event.name);
    const [startDate, setStartDate] = useState(new Date(event.date));
    const [startTime, setStartTime] = useState(event.startAt);
    const [endTime, setEndTime] = useState(event.endAt);
    const [nbrPeople, setNbrPeople] = useState(event.people);
    const [placeSize, setPlaceSize] = useState(event.placeSize);
    const [place, setPlace] = useState(event.place);
    const [latLng, setLatLng] = useState(event.latLng);
    const [budget, setBudget] = useState(event.budget);
    const [status, setStatus] = useState(event.status);
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const [error, setError] = useState("");
    const [fieldError, setFieldError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCalendarOpened, setIsCalendarOpened] = useState(false);
    const [animationLoaderDone, setAnimationLoaderDone] = useState(true)
    const [buttonSendDisabled, setButtonSendDisabled] = useState(false);
    const [cEventInput, setCEventInput] = useState(1)
    const inputIntro = [
            
    ];

    let datePlusYear = new Date()
    datePlusYear.setFullYear(datePlusYear.getFullYear());


    const isMobile = () =>  windowsWidth < 1100

    const handleResize = (width) => setWindowsWidth(width)

    useEffect(() => {
        event && (event.status === undefined || event.status === "validated" || event.status === "pending") && history.push('/dashboard')
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))

        appendToSliderTimePicker()
        setCurrentStepProcess(1)
    }, [endTime, startTime, window.innerWidth])


    async function handleSendForm(e) {
        e.preventDefault()
        await isValid().then(async res => {
            if (res === true) {
                setLoading(true)
                setAnimationLoaderDone(false)
                const item = {
                    name: name,
                    date: startDate,
                    startAt: startTime,
                    endAt: endTime,
                    people: nbrPeople,
                    placeSize: placeSize,
                    place: place,
                    latLng: latLng,
                    budget: budget,
                    user: auth.currentUser.uid,
                    paid: 0,
                    status: status,
                    id: event.id
                }
                if (status !== "creating") { item.budgetLeft = budget }
                try {
                    addEvent(item).then(() => {
                        history.push('/creer-mon-evenement/etape-2')
                    })
                } catch (e) {
                    setLoading(false)
                    setError('Une erreur inconnue est survenue')
                }
            }
        })
    }

    async function isValid() {
        // else if(birthDate !== 0) {setError("Veuillez renseigner votre nom")} A faire avec la date de naissance
        if (name.length > 2) {
            if (latLng !== undefined && latLng.lat > 0 && latLng.lng > 0) {
                return true
            }
            else {
                setError("Veuillez renseigner une adresse valide")
                setFieldError("place")
            }
        }
        else {
            setError("Veuillez renseigner le nom de votre évènement")
            setFieldError("name")
        }
    }

    function handleAdressChanged(adress, latLng) {
        setButtonSendDisabled(true)
        setPlace(adress)
        setLatLng(latLng)
        setButtonSendDisabled(false)
    }

    function appendToSliderTimePicker() {
        const element = document.getElementsByClassName("input-range__slider")
        const formatedEndTime = formatLabelTimePicker(endTime)
        const formatedStartTime = formatLabelTimePicker(startTime)
        if (element[0] !== undefined) {
            element[0].innerHTML = "Commence à " + formatedStartTime
            element[1].innerHTML = "Termine à " + formatedEndTime
        }
    }

    function handleOnChangeInputs(name, value) {
        if (name === fieldError) {
            setFieldError("")
        }
        if (name === "name") { setName(value) }
        else if (name === "nbrPeople") { setNbrPeople(value) }
        else if (name === "placeSize") { setPlaceSize(value) }
        else if (name === "budget") { setBudget(value) }
    }

    function handleDateChanged(val) {
        setStartDate(val)
        setIsCalendarOpened(false)
    }

    const nextPage = (plus) =>{
        var number = cEventInput
        if(cEventInput==1&&plus==-1){
        } else {
            setCEventInput(number+plus)
        }
    }

    return (loading || !animationLoaderDone) ? <div className="formEtape1Container"><Loader callBack={() => setAnimationLoaderDone(true)} /></div> : (
        <div>
            <div className="formEtape1Container">
                <div style={{height:'100px'}}>
                    <h2><span style={{color: 'rgb(245, 192, 67)', fontFamily: "Roboto-medium"}}>{cEventInput}/6</span></h2>
                    <p>{inputIntro[cEventInput-1]}</p>
                </div>
                <form style={{position:'relative'}}>
                    
                    <div style={{height:"25vh",width:"100%"}}>
                    </div>
                    <div className="formLine inputview" style={{position:'absolute',top:0,width:'100%',opacity:cEventInput == 1 ? 1 : 0, zIndex:cEventInput == 1 ? '1' : '0'}}>
                        <div className={fieldError === "name" ? "formField error" : "formField"}>
                            <label>Nom de l'évènement</label>
                            <input className="nameEventInput" type="text" name="name" value={name} onChange={e => handleOnChangeInputs("name", e.target.value)} />
                        </div>
                    </div>

                    <div className="formLine inputview" style={{position:'absolute',top:0,width:'100%',opacity:cEventInput == 2 ? 1 : 0, zIndex:cEventInput == 2 ? '1' :'0'}}>
                        <div className="formFieldSpecialDate">
                            <label>Quand a-t-il lieu ?</label>
                            <div
                                onClick={() => setIsCalendarOpened(!isCalendarOpened)}
                                className="etape1DatePicker"
                            >
                                {new Date(startDate).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </div>
                            {isCalendarOpened &&
                                <div className="calendarContainerAbsolute">
                                    <LocalizationProvider style={{ position: "relative!important" }} locale={frLocale} dateAdapter={AdapterDateFns}>
                                        {isMobile() ?
                                            <MobileDatePicker
                                                label="Date de l'évènement"
                                                open={isCalendarOpened}
                                                onClose={() => setIsCalendarOpened(false)}
                                                value={startDate}
                                                onChange={(val) => handleDateChanged(val)}
                                                renderInput={() => null}
                                                minDate={datePlusYear}
                                            />
                                            :
                                            <DatePicker
                                                open={isCalendarOpened}
                                                onClose={() => setIsCalendarOpened(false)}
                                                value={startDate}
                                                onChange={(val) => handleDateChanged(val)}
                                                renderInput={() => null}
                                                minDate={datePlusYear}
                                            />
                                        }
                                    </LocalizationProvider>
                                </div>
                            }
                        </div>
                    </div>

                    <div className="formLine inputview" style={{position:'absolute',top:0,width:'100%',opacity:cEventInput == 3 ? 1 : 0, zIndex:cEventInput == 3 ? '1' : '0'}}>
                        <div className="formField">
                            <label>Créneau horaire</label>
                            <div className="etape1TimePickerContainer" style={{display:!isMobile()&&'inline-block',width:!isMobile()&&'45%'}}>
                                <InputRange
                                    maxValue={86400}
                                    minValue={0}
                                    draggableTrack
                                    step={900}
                                    value={startTime}
                                    formatLabel={value => formatLabelTimePicker(value)}
                                    onChange={value => setStartTime(value)} />
                            </div>
                            <div className="etape1TimePickerContainer endAt" style={{display:!isMobile()&&'inline-block',width:!isMobile()&&'45%'}}>
                                <InputRange
                                    maxValue={86400}
                                    minValue={0}
                                    draggableTrack
                                    step={900}
                                    value={endTime}
                                    formatLabel={value => formatLabelTimePicker(value)}
                                    onChange={value => setEndTime(value)} />
                            </div>
                        </div>
                    </div>

                    <div className={!isMobile() ? "formLine  inputview" : "formLine mobile  inputview"} style={{position:'absolute',top:0,width:'100%',opacity:cEventInput == 4 ? 1 : 0, zIndex:cEventInput == 4 ? '1' : '0'}}>
                        <div className="formField">
                            <label>Nombre de personnes</label>
                            <NumericInput
                                className="form-control"
                                value={nbrPeople}
                                min={0}
                                max={5000}
                                step={1}
                                precision={0}
                                size={4}
                                mobile
                                onChange={(value) => handleOnChangeInputs("nbrPeople", value)} />
                        </div>
                        <div className="formField">
                            <div className="formField_info">
                                <label>m² du lieu</label><FaQuestionCircle />
                                <span>Nombre de m2 de l’espace où l’évènement pour l’indiquer à nos partenaires si besoin.</span>
                            </div>
                            <NumericInput
                                format={sizeFormat}
                                className="form-control"
                                value={placeSize}
                                min={0}
                                max={10000}
                                step={1}
                                precision={0}
                                size={9}
                                mobile
                                onChange={(value) => handleOnChangeInputs("placeSize", value)} />
                        </div>
                    </div>

                    <div className="formLine inputview" style={{position:'absolute',top:0,width:'100%',opacity:cEventInput == 5 ? 1 : 0, zIndex:cEventInput == 5 ? '1' : '0'}}>
                        <div className={fieldError === "place" ? "formField error" : "formField"}>
                            <label>Lieu de ton évènement</label>
                            <LocationSearchInput placeType="address" value={place} onChanged={handleAdressChanged} />
                        </div>
                    </div>

                    <div className="formLine inputview" style={{position:'absolute',top:0,width:'100%',opacity:cEventInput == 6 ? 1 : 0, zIndex:cEventInput == 6 ? '1' : '0'}}>
                        <div className={fieldError === "budget" ? "formField error" : "formField"}>
                            <div className="formField_info">
                                <label>Budget</label><FaQuestionCircle />
                                <span>Il te sera possible de suivre l’avancée de ton budget durant l’organisation de ton évènement. Celui-ci peut être modifié à tout moment.</span>
                            </div>

                            <NumericInput
                                format={euroFormat}
                                className="form-control"
                                value={budget}
                                min={50}
                                max={50000}
                                step={50}
                                precision={0}
                                size={9}
                                mobile
                                onChange={(value) => handleOnChangeInputs("budget", value)}
                            />
                        </div>
                    </div>
                    {error.length > 0 &&
                        <p className="errorMessage">{error}</p>
                    }
                </form>
                {cEventInput==6 ?
                    <div className="formLine" style={{display:!isMobile() && "inline-block",width:!isMobile() && '25vw'}}>
                        <div className="formField">
                            <ButtonLarge
                                onClick={(e) => handleSendForm(e)}
                                color="orange"
                                value="C'est Party!"
                                backgroundColor="rgba(245, 192, 67)"
                                marginTop="10px"
                                disabled={buttonSendDisabled}
                                width={!isMobile() && '21vw'}
                            />
                        </div>
                    </div>
                :
                    <div className="formLine" style={{display:!isMobile() && "inline-block",width:!isMobile() && '25vw'}}>
                        <div className="formField">
                            <ButtonLarge
                                onClick={() => nextPage(1)}
                                color="orange"
                                value="Passez à l'étape suivante"
                                backgroundColor="rgba(245, 192, 67)"
                                marginTop="10px"
                                width={!isMobile() && '21vw'}
                            />
                        </div>
                    </div>
                }
                <div className="formLine" style={{display:!isMobile() && "inline-block",width:!isMobile() && '25vw'}}>
                    <div className="formField">
                        <ButtonLarge
                            onClick={() => nextPage(-1)}
                            color="grey"
                            value="Revenir en arrière"
                            backgroundColor="rgba(245, 192, 67)"
                            marginTop="10px"
                            disable={cEventInput==1 && 'false'}
                            width={!isMobile() && '21vw'}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Etape1