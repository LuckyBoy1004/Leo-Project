import React, { useState, useEffect } from "react";
import "../styles/Prest_.css"
import { useHistory } from 'react-router-dom'
import { useAuth } from "../context/userContext"; // context

import DeleteIcon from '@mui/icons-material/DeleteOutline';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

import { useDetectClickOutside } from 'react-detect-click-outside';

import { ButtonSmall, ButtonLarge } from '../components/utilities/Buttons'
import Layout from '../components/utilities/Layout'
import Title from '../components/utilities/Title'
import SubTitle from '../components/utilities/SubTitle'
import NumericInput from 'react-numeric-input';
import { useFirebase } from "../assets/base-context";
import ReactLoading from 'react-loading';

import { FaTrashAlt } from 'react-icons/fa'
import { CSSTransition } from 'react-transition-group'

import Image from '../components/utilities/Image'

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

const BoxConfirm = ({ type, position, callback, callbackClose }) => {
    const refConfirmBox = useDetectClickOutside({ onTriggered: callbackClose });
    return <div ref={refConfirmBox} className={`confirmBox ${position}`}>
        <span>
            {type === "delete" && "Confirmation de suprresion d'une variation"}
            {type === "save" && "Confirmation de sauvegarde"}
        </span>
        <h2>
            {type === "delete" && "Êtes-vous sûr de vouloir supprimer cette variation ?"}
            {type === "save" && "Vous n'avez rien oublié ?"}
        </h2>
        <p>
            {type === "delete" && "Cette action est irréversible"}
            {type === "save" && "Si jamais... Vous pouvez toujours modifier ce service directement depuis votre dashboard"}
        </p>

        <ButtonSmall
            onClick={callback}
            color={type === "delete" ? "red" : "green"}
            value="Je confirme"
            marginTop="20px"
        />
    </div>
}


const Prest_Step2 = () => {

    const firebaseContext = useFirebase()
    const storage = firebaseContext.storage()

    const [error, setError] = useState({ type: "", message: "" });
    const [buttonLoading, setButtonLoading] = useState(false)

    const [services, setServices] = useState([])
    const [pictureTokensToDelete, setPictureTokensToDelete] = useState([])

    const [isFormOpened, setIsFormOpened] = useState(false)

    const { seller, setCurrentStepProcess, addSellerServices, getServicesOfCurrentSellerFromDB, deleteOldSellerPicture, addFoodTypeToSeller } = useAuth() // context
    const history = useHistory()

    // seller.status !== "subscribing" && history.push('/mon-compte-partenaire')

    const initialNewService = {
        category: seller.category,
        name: "",
        images: [],
        description: "",
        price: 0,
        variations: [],
        foodType: "Aucun",
        id: null
    }

    const [newService, setNewService] = useState(initialNewService)

    const [isMounted, setIsMounted] = useState(false);

    const [isPopupConfirmDeleteOpened, setIsPopupConfirmDeleteOpened] = useState(false)
    const [isPopupConfirmSaveOpened, setIsPopupConfirmSaveOpened] = useState(false)
    const [currentDeletingVariation, setCurrentDeletingVariation] = useState(-1)

    const [isServiceAddedCorrectly, setIsServiceAddedCorrectly] = useState(false)

    const [isVariations, setIsVariations] = useState(false)

    setCurrentStepProcess(2)

    useEffect(() => {
        function getCurrentServicesFromDB() {
            getServicesOfCurrentSellerFromDB().then(data => {
                setServices(data)
            })
        }
        getCurrentServicesFromDB()
        setIsMounted(true)
    }, [])


    function handleChange(e) {
        const type = e.target.files[0].type
        const size = e.target.files[0].size
        if (type !== "image/png" && type !== "image/jpeg" && type !== "image/jpg" && type !== "application/pdf") {
            setError({ type: "imageType", message: "Votre fichier n'est ni une image jpeg, jpg, png ou PDF." })
        }
        else if (size > 2000000) {
            setError({ type: "imageSize", message: "Votre image fait plus de 2Mo." })
        }
        else {
            const newURL = URL.createObjectURL(e.target.files[0])
            e.target.files[0].localURL = newURL
            setNewService({ ...newService, images: [...newService.images, e.target.files[0]] })
            setError({ type: "", message: "" })
        }
    }

    function euroFormat(num) { return num + '€'; }

    function handleDeletePicture(item) {
        const newPictures = [...newService.images]
        for (var i = 0; i < newPictures.length; i++) {
            if (newPictures[i].localURL === item || newPictures[i].url === item) {
                if (newPictures[i].url === item) {
                    setPictureTokensToDelete([...pictureTokensToDelete, newPictures[i].token])
                }
                newPictures.splice(i, 1);
            }
        }
        setNewService({ ...newService, images: newPictures })
    }

    function handleServiceClicked(item) {
        setIsVariations(item.variations.length > 0 ? true : false)
        clearInputs()
        setNewService(item)
        setIsFormOpened(true)
    }

    function clearInputs() {
        setNewService(initialNewService)
        setError({ type: "", message: "" })
    }

    function handleAddService() {
        setIsPopupConfirmSaveOpened(false)
        if (newService.name.length < 5) {
            setError({ type: "name", message: "Le nom de votre offre doit faire au minimum 5 caractères." })
        }
        else if (newService.description.length < 20 || newService.description.length > 300) {
            setError({ type: "description", message: "Votre description doit comporter entre 20 et 300 caractères." })
        }
        else if (newService.images.length === 0) {
            setError({ type: "noPictures", message: "Vous devez ajouter au moins une photo de votre service." })
        }
        else {
            setIsFormOpened(false)

            //Si l'id est égal à Null, c'est que le service est nouveau
            //Si l'id n'est pas null, on ne créera pas un nouveau service on modifiera l'actuel
            if (newService.id !== null) {
                const newServicesList = [...services]
                var index = newServicesList.findIndex(service => service.id === newService.id)

                const serviceToUpload = { ...newService }
                if (!isVariations) serviceToUpload.variations = []
                newServicesList[index] = serviceToUpload

                setServices(newServicesList)
                clearInputs()
                setIsServiceAddedCorrectly(true)
                setTimeout(() => {
                    setIsServiceAddedCorrectly(false)
                }, 2000)
            }
            else {

                if (services.length >= 5) {
                    setError({ type: "maxServices", message: "Vous avez déjà atteint le maximum d'offres sur votre boutique." })
                }
                else {
                    const reconstructedService = newService
                    reconstructedService.id = services.length
                    if (!isVariations) reconstructedService.variations = []

                    setServices([...services, reconstructedService])
                    clearInputs()
                    setIsServiceAddedCorrectly(true)
                    setTimeout(() => {
                        setIsServiceAddedCorrectly(false)
                    }, 2000)
                }
            }
        }
    }

    function handleClickedAddService() {
        setIsFormOpened(true)
        setIsVariations(false)
        clearInputs()
        document.getElementById('serviceName').focus()
    }

    function handleFormSend() {
        setButtonLoading(true)
        if (services.length > 0) {
            var newAllServicesArray = []

            services.forEach(async service => {
                var newServiceImageArray = service.images.filter(image => !image.localURL)
                var newServiceArray = {
                    description: service.description,
                    id: service.id,
                    name: service.name,
                    images: newServiceImageArray,
                    price: service.price,
                    category: service.category,
                    variations: service.variations,
                    foodType: service.foodType !== undefined ? service.foodType : "Aucun"
                }
                
                if (seller.category === "nourriture")
                    await addFoodTypeToSeller(service.foodType !== undefined ? service.foodType : "Aucun")

                for (var i = 0; i < service.images.length; i++) {

                    if (service.images[i].localURL) {
                        const token = Math.random().toString(36).substr(2, 19)
                        const url = await handleUploadFile(service.images[i], token)
                        let newImg = { url: url, token: token }
                        newServiceImageArray.push(newImg)
                        newServiceArray.images = newServiceImageArray
                        pictureTokensToDelete.length > 0 && deleteOldSellerPicture(pictureTokensToDelete, "services")
                    }
                }
                newAllServicesArray = [...newAllServicesArray, newServiceArray]
                if (services.length === newAllServicesArray.length) {
                    await addSellerServices(newAllServicesArray)
                    history.push('/mon-compte-partenaire/process/verification-1')
                }
            })
        }
        else {
            setError({ type: "serviceSize", message: "Merci d'ajouter au moins un service à votre boutique." })
            setButtonLoading(false)
        }
    }

    function handleUploadFile(image, token) {

        return new Promise((resolve, reject) => {

            const upload = storage.ref(`services/${token}`).put(image)
            upload.on(
                "state_changed", snapshot => { },
                error => {
                    console.log(error)
                }, () => {
                    storage
                        .ref("services")
                        .child(token)
                        .getDownloadURL()
                        .then(url => {
                            resolve(url);
                        })
                        .catch(error => {
                            console.error(error)
                            reject(error);
                        })
                }
            )
        })
    }

    function handleVariationChanged(type, val, key) {
        let newVariations = [...newService.variations]
        let newVariation = { ...newService.variations[key] }
        if (type === "name") newVariation.name = val
        else if (type === "price") newVariation.price = val
        newVariations[key] = newVariation
        setNewService({ ...newService, variations: newVariations })
    }

    function handleDeleteVariation(key) {
        let newVariations = [...newService.variations]
        newVariations.splice(key, key + 1)
        setNewService({ ...newService, variations: newVariations })
        setCurrentDeletingVariation(-1)
        setIsPopupConfirmDeleteOpened(false)
    }


    function handleFoodTypeChanged(e) {
        let newNewService = { ...newService }
        newNewService.foodType = e.target.value
        setNewService(newNewService)
    }

    return (
        <>
            <Layout>
                <CSSTransition
                    in={isMounted}
                    timeout={300}
                    classNames="pageTransition"
                    unmountOnExit
                >
                    <div>
                        <div className="Prest-Step2-Header">
                            <SubTitle value="Création de vos services" type="big" font="roboto-medium" align="left" />
                            <p>Sur cette page vous pourrez créer vos services, qui seront ensuite visibles sur la page de votre profil NIVID.</p>
                            <p>Prenez donc le temps de réfléchir vos prix & rédiger une bonne description.</p>
                            <p>dès validation de votre dossier nous viendrons prendre des photos professionnelles de vos services/produits</p>
                            <Title value="Ajouter vos services/produits" type="h2" font="roboto-medium" align="left" />
                            <div className="servicesListeContainer">
                                {
                                    services.map((item, key) => {
                                        return (
                                            <div
                                                className="serviceContainer"
                                                onClick={() => handleServiceClicked(item)}
                                                key={key}
                                            >

                                                <div className="detailsServiceItem active">
                                                    <div className="serviceItem">
                                                        <div className="imgDetailsServiceItem">
                                                            <Image url={item.images[0].localURL || item.images[0].url} />
                                                        </div>
                                                        <div className="contentDetailsServiceItem">
                                                            <p className="title">{item.name}</p>
                                                            <p>{item.variations.length > 0 ? item.variations[0].price : item.price},00€</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                {services.length < 5 && <label onClick={() => handleClickedAddService()} className="label-file">+</label>}
                            </div>
                            <span>{services.length} / 5</span>
                        </div>
                        <div className="divider"></div>

                        <div className={isFormOpened ? "formWrapContainer active" : "formWrapContainer"}>
                            <div className="Prest-Step2-Section0">
                                <Title value="Type de service:" type="h3" font="roboto-medium" align="left" />
                                <div className="Prest-Step2-Section0_serviceType">
                                    <Title onClick={() => setIsVariations(false)} customClass={!isVariations && "active"} value="Service simple" type="h2" font="roboto-medium" align="left" />
                                    <Title onClick={() => { newService.variations.length === 0 && setNewService({ ...newService, variations: [{ name: "", price: 0 }] }); setIsVariations(true) }} customClass={isVariations && "active"} value="Service variable" type="h2" font="roboto-medium" align="left" />
                                </div>
                            </div>
                            <div className={`Prest-Step2-Section1 ${isVariations ? "noFlex" : ""}`}>
                                <div className="left">
                                    <Title value="Intitulé du service" type="h2" font="roboto-medium" align="left" />
                                    <p>Le nom de votre offre, par exemple : x5 fleurs de décorations de table</p>
                                    <div className="formField withoutMargin">
                                        <input
                                            className={`${error.type === "name" ? "invalid" : ""}`}
                                            id="serviceName"
                                            type="text"
                                            value={newService.name}
                                            onChange={(e) => (setError({ type: "", message: "" }), setNewService({ ...newService, name: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                {!isVariations &&
                                    <div className="right">
                                        <Title value="Prix de votre service" type="h2" font="roboto-medium" align="left" />
                                        <div className="formField withoutMargin">
                                            <NumericInput
                                                format={euroFormat}
                                                className="form-control"
                                                value={newService.price}
                                                min={20}
                                                max={1000}
                                                step={1}
                                                precision={0}
                                                size={9}
                                                mobile
                                                onChange={(value) => (setError({ type: "", message: "" }), setNewService({ ...newService, price: value }))}
                                            />
                                        </div>
                                    </div>
                                }
                            </div>

                            {
                                seller.category === "nourriture" &&
                                <div className="Prest-Step2-Section1bis">
                                    <Title value="Régime alimentaire" type="h2" font="roboto-medium" align="left" />
                                    {/* <FormGroup style={{ display: "flex", flexDirection: "row" }}>
                                    <FormControlLabel onChange={(e) => handleFoodTypeChanged(e, "Vegan")} control={<Checkbox />} label="Vegan" />
                                    <FormControlLabel onChange={(e) => handleFoodTypeChanged(e, "Casher")} control={<Checkbox />} label="Casher" />
                                    <FormControlLabel onChange={(e) => handleFoodTypeChanged(e, "Halal")} control={<Checkbox />} label="Halal" />
                                    <FormControlLabel onChange={(e) => handleFoodTypeChanged(e, "Vegetarien")} control={<Checkbox />} label="Végétarien" />
                                </FormGroup>  */}
                                    <RadioGroup
                                        row
                                        aria-label="gender"
                                        name="row-radio-buttons-group"
                                        onChange={handleFoodTypeChanged}
                                        value={newService.foodType !== undefined ? newService.foodType : "Aucun"}
                                    >
                                        <FormControlLabel value="Vegan" control={<Radio />} label="Vegan" />
                                        <FormControlLabel value="Casher" control={<Radio />} label="Casher" />
                                        <FormControlLabel value="Halal" control={<Radio />} label="Halal" />
                                        <FormControlLabel value="Vegetarien" control={<Radio />} label="Végétarien" />
                                        <FormControlLabel value="Aucun" control={<Radio />} label="Aucun" />
                                    </RadioGroup>
                                </div>

                            }

                            <div className="Prest-Step2-Section2">
                                <Title value="Description de votre service" type="h2" font="roboto-medium" align="left" />
                                <p>Décrivez au mieux le service que vous proposez au travers de cette offre.</p>
                                <textarea
                                    value={newService.description}
                                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                    className={`${error.type === "description" && "invalid"}`}
                                >
                                </textarea>
                            </div>

                            {isVariations &&
                                <div className="Prest-Step2-Section2bis">
                                    <Title value="Création des déclinaisons" type="h2" font="roboto-medium" align="left" />
                                    <div className="Prest-Step2-Section2bis_variations">
                                        {newService.variations.map((variation, key) => {
                                            return <>
                                                <div className="variation_header">
                                                    <Title value={`Variation ${key}`} type="h3" font="roboto-medium" align="left" />
                                                    <IconButton
                                                        onClick={() => { setCurrentDeletingVariation(key); setIsPopupConfirmDeleteOpened(true) }}
                                                        color="error"
                                                        aria-label="delete"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                    {(isPopupConfirmDeleteOpened && currentDeletingVariation === key) &&
                                                        <BoxConfirm
                                                            type="delete"
                                                            position="bottom"
                                                            callback={() => handleDeleteVariation(key)}
                                                            callbackClose={() => { setCurrentDeletingVariation(-1); setIsPopupConfirmDeleteOpened(false) }}
                                                        />
                                                    }
                                                </div>
                                                <div className="Prest-Step2-Section2bis_variation_item"><div className="left">
                                                    <Title value="Intitulé de la variation" type="h2" font="roboto-medium" align="left" />
                                                    <p>Le nom de votre variation, par exemple : 6 parts/6 personnes</p>
                                                    <div className="formField withoutMargin">
                                                        <input
                                                            className={error.type === "name" && "invalid"}
                                                            id="serviceName"
                                                            type="text"
                                                            value={newService.variations[key].name}
                                                            onChange={(e) => handleVariationChanged("name", e.target.value, key)}
                                                        />
                                                    </div>
                                                </div>
                                                    <div className="right">
                                                        <Title value="Prix de la variation" type="h2" font="roboto-medium" align="left" />
                                                        <div className="formField withoutMargin">
                                                            <NumericInput
                                                                format={euroFormat}
                                                                className="form-control"
                                                                value={newService.variations[key].price}
                                                                min={1}
                                                                max={1000}
                                                                step={1}
                                                                precision={0}
                                                                size={9}
                                                                mobile
                                                                onChange={(value) => handleVariationChanged("price", value, key)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        })}
                                    </div>
                                    <ButtonSmall
                                        onClick={() => setNewService({ ...newService, variations: [...newService.variations, { name: "", price: 0 }] })}
                                        color="blue"
                                        value="Ajouter une variation"
                                        marginTop="20px"
                                        classname="flex"
                                        iconMUIStart={<AddIcon />}
                                    />
                                </div>
                            }

                            <div className="Prest-Step2-Section3">
                                <Title value="Photos du service" type="h2" font="roboto-medium" align="left" />
                                {(error.type === "imageSize" || error.type === "imageType" || error.type === "noPictures") && <p className="errorMessage">{error.message}</p>}
                                <p>Plusieurs photos peuvent être utiles pour le client, cela lui permettra de voir votre service plus en détail.</p>
                                <div className="servicesListeContainer">
                                    {newService.images.map((item, key) =>
                                        <div onClick={() => handleDeletePicture(item.localURL || item.url)} style={{ position: "relative" }}>
                                            <Image url={item.localURL || item.url} /><FaTrashAlt color={"white"} size={32} />
                                        </div>
                                    )}
                                    {newService.images.length < 4 && <label for="file" className="label-file">+</label>}
                                </div>

                                <input accept="image/jpeg, image/jpg, image/png, application/pdf" id="file" className="input-file" type="file" onChange={(e) => handleChange(e)} />
                                <div className="Prest-Step2-Section3-bottom">
                                    <p>2Mo max par photo</p>
                                    <p>Type de fichiers acceptés : jpeg, jpg, png ou PDF</p>
                                </div>
                                <div className="buttonSaveOffer">
                                    {error.type === "maxServices" && <p className="errorMessage">{error.message}</p>}
                                    {error.type === "name" && <p className="errorMessage">{error.message}</p>}
                                    {error.type === "description" && <p className="errorMessage">{error.message}</p>}
                                    <ButtonSmall
                                        onClick={() => setIsPopupConfirmSaveOpened(true)}
                                        color="green"
                                        value="Sauvergarder cette offre"
                                        marginTop="20px"
                                    />
                                    {isPopupConfirmSaveOpened &&
                                        <BoxConfirm
                                            type="save"
                                            position="top"
                                            callback={() => handleAddService()}
                                            callbackClose={() => setIsPopupConfirmSaveOpened(false)}
                                        />
                                    }
                                </div>
                            </div>
                            <div className="divider"></div>
                        </div>


                        <div className="Prest-Step2-Section4">
                            <Title value="Une fois terminé, passez à l’étape suivante" type="h2" font="roboto-medium" align="right" />
                            <p>Vos services pourront être modifiés sur votre tableau de bord plus tard.</p>
                            <ButtonLarge
                                onClick={() => handleFormSend()}
                                color="orange"
                                width="400px"
                                value={buttonLoading ? <ReactLoading className="loadingSpinnerButton" type="spin" color="white" height={23} width={23} /> : "Passer à l'étape suivante"}
                            />
                        </div>

                        {error.type === "serviceSize" && <p className="PrestErrorMessage">{error.message}</p>}
                    </div>
                </CSSTransition>
            </Layout>

            <CSSTransition
                in={isServiceAddedCorrectly}
                timeout={300}
                classNames="pageTransition"
                unmountOnExit
            >
                <div className="serviceAddedMessage">
                    <p>Annonce sauvegardée avec succès</p>
                </div>
            </CSSTransition>
        </>
    )
}
export default Prest_Step2;
