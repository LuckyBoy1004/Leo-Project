import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown } from 'react-icons/fa';
import ServicesSlider from '../components/ServicesSlider'
import { items } from '../components/servicesData'
import { useAuth } from "../context/userContext"; // context
import SellersMap from '../components/SellersMap'
import { GoogleApiWrapper } from 'google-maps-react';
import { useFirebase } from "../assets/base-context";
import { useHistory } from 'react-router-dom'
import StickerBudgetLeft from "../components/StickerBudgetLeft";

import Image from '../components/utilities/Image'

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const initialFilter = {
    vegan: false,
    halal: false,
    casher: false,
    vegetarien: false
}

const Etape2 = (props) => {

    const firebaseContext = useFirebase()
    const firestore = firebaseContext.firestore()

    const { event, setCurrentStepProcess } = useAuth() // context
    const history = useHistory()

    const [selectedMenu, setSelectedMenu] = useState("decorations");
    const [selectedSubMenu, setSelectedSubMenu] = useState("Décorations intérieures");
    const [currentPageOffers, setCurrentPageOffers] = useState(0);
    const [beforeSubMenu, setBeforeSubMenu] = useState("");
    const [isSubMenuDisplay, setIsSubMenuDisplay] = useState(true);
    const [sellers, setSellers] = useState([]);
    const [allSellers, setAllSellers] = useState([]); // C'est tout les sellers qui match en subcategory, ET qui sont à plus de 5km ( pour afficher les marker gris sur la map )
    const [loading, setLoading] = useState(true);
    const [categorySellers, setCategorySellers] = useState([]); // Tout les sellers qui match avec la category seulement, et à moins de 5 km ( pour afficher le nombre de
    // prestataire dans la category en cours)
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    // State pour le scroll du menu category en mobile version
    const [isDown, setIsDown] = useState(false)
    const [startX, setStartX] = useState()
    const [scrollLeft, setScrollLeft] = useState()

    const [isSubMenuNotActiveMobileDisplay, setIsSubMenuNotActiveMobileDisplay] = useState(false)

    const [isSliderHeaderIsMoving, setIsSliderHeaderIsMoving] = useState(false)

    const [foodTypeFilter, setFoodTypeFilter] = useState(initialFilter)
    const [isFoodFilterOpened, setIsFoodFilterOpened] = useState(false)

    const [leftBudget, setLeftBudget] = useState(0)

    const isMobile = () => windowsWidth > 1100 ? false : true

    const handleResize = (width) => setWindowsWidth(width)


    useEffect(() => {
        event && event.status && event.status !== "creating" && history.push('/dashboard')
        event && !event.status && history.push('/dashboard')
        !event && history.push('/dashboard')
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))
        setLoading(true)
        getSellersFromDB(selectedMenu, selectedSubMenu)
        setCurrentStepProcess(2)
        setLeftBudget(event.budgetLeft)
    }, [selectedMenu, selectedSubMenu, foodTypeFilter])

    useEffect(() => {
        setFoodTypeFilter(initialFilter)
        setIsFoodFilterOpened(false)
    }, [selectedMenu])

    function handleCategoryChange(category, subcategory) {
        if (isSliderHeaderIsMoving) return
        else {
            setIsSubMenuNotActiveMobileDisplay(false)
            if (category !== selectedMenu) {
                setSellers([])
                setSelectedMenu(category)
                setSelectedSubMenu(subcategory)
                setCurrentPageOffers(0)
                if (category === "nourriture") { setIsSubMenuDisplay(false); setBeforeSubMenu("") }
                else setIsSubMenuDisplay(true)
            }
        }
    }

    function handleSubCategoryChange(key) {
        if (key !== selectedSubMenu) {
            setSellers([])
            setSelectedSubMenu(key)
            setCurrentPageOffers(0)
            setIsSubMenuNotActiveMobileDisplay(false)
        }
    }

    function displayBeforeSubMenu() {
        const table = ["Service à table", "Dinatoire", "Buffet"]
        return table.map((name, i) =>
            <div onClick={() => (setBeforeSubMenu(name), setIsSubMenuDisplay(true))} key={i} className="subMenuItem beforeSubMenu">
                <p>{name}</p>
            </div>
        )
    }

    function handleOpeningSellersDetails(sellerId) {
        history.push(`/creer-mon-evenement/etape-2/prestataires/${sellerId}`)
    }

    async function getSellersFromDB(category, subCategory) {
        const refSellers = firestore.collection("sellers");

        // On va choper TOUT les sellers à moins de 5km pour ensuite faire le tri avec les category
        const results = []
        var query = refSellers
        query = query.where("category", "==", category)
        query = query.where("status", "==", "opened")
        query.get().then(async res => {

            res.forEach(doc => {
                results.push({ ...doc.data(), id: doc.id })
            })
            let filteredResults = []
            if (selectedMenu === "nourriture") {
                if (foodTypeFilter.vegan === true) {
                    results.forEach(item => {
                        if (item.foodTypes === undefined) return
                        let filtered = item.foodTypes.filter(foodType => foodType === "Vegan")
                        if (filtered.length) filteredResults.push(item)
                    })
                }
                if (foodTypeFilter.halal === true) {
                    results.forEach(item => {
                        if (item.foodTypes === undefined) return
                        let filtered = item.foodTypes.filter(foodType => foodType === "Halal")
                        if (filtered.length) filteredResults.push(item)
                    })
                }
                if (foodTypeFilter.casher === true) {
                    results.forEach(item => {
                        if (item.foodTypes === undefined) return
                        let filtered = item.foodTypes.filter(foodType => foodType === "Casher")
                        if (filtered.length) filteredResults.push(item)
                    })
                }
                if (foodTypeFilter.vegetarien === true) {
                    results.forEach(item => {
                        if (item.foodTypes === undefined) return
                        let filtered = item.foodTypes.filter(foodType => foodType === "Vegetarien")
                        if (filtered.length) filteredResults.push(item)
                    })
                }
            }

            if (foodTypeFilter.vegetarien === false && foodTypeFilter.casher === false && foodTypeFilter.halal === false && foodTypeFilter.vegan === false)
                filteredResults = [...results]

            if (filteredResults.length > 0) {
                const categorySellersQuery = await filterSellersByDistance(filteredResults)
                const categorySellersClose = []
                for (const result of categorySellersQuery) {
                    if (result.firstName) {
                        categorySellersClose.push(result)
                    }
                }
                const newSellers = categorySellersClose.filter(seller => seller.subcategory === subCategory)
                setSellers(newSellers)
                const eventTime = new Date(event.date);
                var eventDay = eventTime.getFullYear() + '.' + (eventTime.getMonth()+1) + '.' +eventTime.getDate();
                setSellers(newSellers.filter(seller => seller.holiday.filter(holiday => holiday == eventDay).length == 0))
                setCategorySellers(categorySellersClose)
                // On enlève les sellers à moins de 5 kilometres, pour ne garder dans allSellers uniquement ceux à plus de 5. Pour envoyer à la map
                const copyAllSellers = [...filteredResults].filter(item => item.subcategory === subCategory)
                const newAllSellers = copyAllSellers.filter((item) => !newSellers.includes(item));
                setAllSellers(newAllSellers)
            }
            else {
                setSellers([])
                setCategorySellers([])
            }
            setLoading(false)
        })
    }

    async function filterSellersByDistance(data) {
        return Promise.all(
            data.map(item => {
                const eventLatLng = event.latLng ? event.latLng : { lat: 48.51666, lng: -34.41888 }
                return getDistanceBetweenTwoPoints(eventLatLng, item.latLng)
                    .then((result) => {
                        if ((result / 1000) < 5) { return item }
                        else { return [] }
                    })
            })
        )
    }

    async function getDistanceBetweenTwoPoints(eventPos, sellerPos) {
        var origin = new props.google.maps.LatLng(eventPos.lat, eventPos.lng);
        var destination = new props.google.maps.LatLng(sellerPos.lat, sellerPos.lng);

        var service = new props.google.maps.DistanceMatrixService();
        return new Promise(resolve => {
            service.getDistanceMatrix(
                {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: 'DRIVING',
                }, (response, status) => {
                    resolve(response.rows[0].elements[0].distance.value)
                }
            )
        });
    }

    const sliderCategory = useRef()
    function handleMouseDownSliderHeader(e) {
        setIsDown(true)
        setStartX(windowsWidth < 1100 ? e.clientX : e.pageX - sliderCategory.current.offsetLeft)
        setScrollLeft(sliderCategory.current.scrollLeft)
        setIsSliderHeaderIsMoving(false)
    }

    function handleMouseLeaveAndUpSliderHeader() {
        setIsDown(false)
    }

    function handleMouseMoveSliderHeader(e) {
        if (!isDown) return
        setIsSliderHeaderIsMoving(true)
        e.preventDefault()
        const x = windowsWidth < 1100 ? e.clientX : e.pageX - sliderCategory.current.offsetLeft;
        const walk = (x - startX) * 2; //scroll-fast
        sliderCategory.current.scrollLeft = scrollLeft - walk;
    }
    function handleFoodTypeChanged(isChecked, type) {
        let newFoodTypeFilter = { ...foodTypeFilter }
        switch (type) {
            case "Vegan":
                newFoodTypeFilter.vegan = isChecked

                break;
            case "Halal":
                newFoodTypeFilter.halal = isChecked

                break;
            case "Casher":
                newFoodTypeFilter.casher = isChecked

                break;
            case "Vegetarien":
                newFoodTypeFilter.vegetarien = isChecked

                break;

            default:
                break;
        }
        setFoodTypeFilter(newFoodTypeFilter)
    }


    return (
        <div>
            {!isMobile() ?
                <div className="headerEtape2">
                    <div className={selectedMenu === "decorations" ? "category active" : "category"} onClick={() => handleCategoryChange("decorations", "Décorations intérieures")}>
                        <h1>Décorations <FaChevronDown /></h1>
                        <span>{categorySellers.length} prestataires au total</span>
                    </div>
                    <div className={selectedMenu === "ambiance" ? "category active" : "category"} onClick={() => handleCategoryChange("ambiance", "Musique")}>
                        <h1>Ambiance <FaChevronDown /></h1>
                        <span>{categorySellers.length} prestataires au total</span>
                    </div>
                    <div className={selectedMenu === "table" ? "category active" : "category"} onClick={() => handleCategoryChange("table", "Nourriture")}>
                        <h1>À table <FaChevronDown /></h1>
                        <span>{categorySellers.length} prestataires au total</span>
                    </div>
                    {/* <div className={selectedMenu === "service" ? "category active" : "category"} onClick={() => handleCategoryChange("service", "serveurs")}>
                        <h1>Service sur place <FaChevronDown /></h1>
                        <span>{categorySellers.length} prestataires au total</span>
            </div> */}
                </div>
                :
                <div
                    ref={sliderCategory}
                    className={isDown ? "headerEtape2 mobile active" : "headerEtape2 mobile"}
                    onMouseDown={(e) => handleMouseDownSliderHeader(e)}
                    onMouseLeave={() => handleMouseLeaveAndUpSliderHeader()}
                    onMouseUp={() => handleMouseLeaveAndUpSliderHeader()}
                    // onMouseMove={(e) => handleMouseMoveSliderHeader(e)}

                    onTouchStart={(e) => handleMouseDownSliderHeader(e)}
                    onTouchEnd={() => handleMouseLeaveAndUpSliderHeader()}
                    onTouchMove={(e) => handleMouseMoveSliderHeader(e)}
                    style={{touchAction: 'none'}}
                >
                    <div className={selectedMenu === "decorations" ? "category active" : "category"} onClick={() => handleCategoryChange("decorations", "Décorations intérieures")}>
                        <h1>Décorations <FaChevronDown /></h1>
                        <span>{categorySellers.length} prestataires au total</span>
                    </div>
                    <div className={selectedMenu === "ambiance" ? "category active" : "category"} onClick={() => handleCategoryChange("ambiance", "Musique")}>
                        <h1>Ambiance <FaChevronDown /></h1>
                        <span>{categorySellers.length} prestataires au total</span>
                    </div>
                    <div className={selectedMenu === "table" ? "category active" : "category"} onClick={() => handleCategoryChange("table", "Nourriture")}>
                        <h1>À table <FaChevronDown /></h1>
                        <span>{categorySellers.length} prestataires au total</span>
                    </div>
                    {/* <div className={selectedMenu === "service" ? "category active" : "category"} onClick={() => handleCategoryChange("service", "serveurs")}>
                        <h1>Service sur place <FaChevronDown /></h1>
                        <span>{categorySellers.length} prestataires au total</span>
        </div> */}
                </div>
            }
            <div className={isMobile() ? "formEtape2Container mobile" : "formEtape2Container"} >
                {!isMobile() ?
                    <>
                        <div className="subHeaderEtape2">
                            {(selectedMenu === "nourriture" && beforeSubMenu.length < 1) && displayBeforeSubMenu()}
                            {isSubMenuDisplay &&
                                Object.entries(items[selectedMenu]).map(([key, item]) => {
                                    return (
                                        <div key={key} className={selectedSubMenu === key ? "subMenuItem active" : "subMenuItem"} onClick={() => handleSubCategoryChange(key)}>
                                            <Image url={item.icon} />
                                            <p>{key}</p>
                                            <span>{categorySellers.filter(seller => seller.subcategory === key).length} prestataires dans vos alentours</span>
                                        </div>
                                    )
                                })
                            }
                            <div className="stickerBudgetLeft">
                                <StickerBudgetLeft />
                            </div>
                        </div>
                    </>
                    :
                    <div className={isSubMenuNotActiveMobileDisplay ? "subHeaderEtape2 mobile active" : "subHeaderEtape2 mobile"}>
                        <p className="infoSubHeaderTopButton">Appuyez pour changer</p>
                        {(selectedMenu === "nourriture" && beforeSubMenu.length < 1) && displayBeforeSubMenu()}
                        {isSubMenuDisplay &&
                            Object.entries(items[selectedMenu]).map(([key, item]) => {
                                if (selectedSubMenu === key) {
                                    return (
                                        <div key={key} className="subMenuItem active" onClick={() => setIsSubMenuNotActiveMobileDisplay(!isSubMenuNotActiveMobileDisplay)}>
                                            <Image url={item.icon} />
                                            <p>{key}</p>
                                            <span>{categorySellers.filter(seller => seller.subcategory === key).length} prestataires dans vos alentours</span>
                                        </div>
                                    )
                                }
                            })
                        }
                        <div className="hideItemSubHeaderEtape2">
                            {
                                Object.entries(items[selectedMenu]).map(([key, item]) => {
                                    if (selectedSubMenu !== key) {
                                        return (
                                            <div key={key} className="subMenuItem" onClick={() => handleSubCategoryChange(key)}>
                                                <Image url={item.icon} />
                                                <p>{key}</p>
                                                <span>{categorySellers.filter(seller => seller.subcategory === key).length} prestataires dans vos alentours</span>
                                            </div>
                                        )
                                    }
                                })
                            }
                        </div>
                    </div>
                }

                {selectedMenu === "table" &&
                    <div className="foodTypeFilter">
                        <div onClick={() => setIsFoodFilterOpened(r => !r)} className="foodTypeFilter_select">
                            <p>Régime alimentaire <ExpandMoreIcon /></p>
                            {isFoodFilterOpened &&
                                <div onClick={(e) => e.stopPropagation()} className="foodTypeFilter_select_dropDown">
                                    <ul>
                                        <li>
                                            <p className={foodTypeFilter.vegan ? "active" : ""}>Vegan</p>
                                            <span>
                                                <Checkbox
                                                    checked={foodTypeFilter.vegan}
                                                    onChange={(e) => handleFoodTypeChanged(e.target.checked, "Vegan")}
                                                    inputProps={{ 'aria-label': 'controlled' }}
                                                />
                                            </span>
                                        </li>
                                        <li>
                                            <p className={foodTypeFilter.casher ? "active" : ""}>Casher</p>
                                            <span>
                                                <Checkbox
                                                    checked={foodTypeFilter.casher}
                                                    onChange={(e) => handleFoodTypeChanged(e.target.checked, "Casher")}
                                                    inputProps={{ 'aria-label': 'controlled' }}
                                                />
                                            </span>
                                        </li>
                                        <li>
                                            <p className={foodTypeFilter.halal ? "active" : ""}>Halal</p>
                                            <span>
                                                <Checkbox
                                                    checked={foodTypeFilter.halal}
                                                    onChange={(e) => handleFoodTypeChanged(e.target.checked, "Halal")}
                                                    inputProps={{ 'aria-label': 'controlled' }}
                                                />
                                            </span>
                                        </li>
                                        <li>
                                            <p className={foodTypeFilter.vegetarien ? "active" : ""}>Végétarien</p>
                                            <span>
                                                <Checkbox
                                                    checked={foodTypeFilter.vegetarien}
                                                    onChange={(e) => handleFoodTypeChanged(e.target.checked, "Vegetarien")}
                                                    inputProps={{ 'aria-label': 'controlled' }}
                                                />
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            }
                        </div>
                    </div>
                }


                <div className=
                    {
                        isMobile() && isSubMenuNotActiveMobileDisplay ? "contentEtape2 mobile notActive"
                            : isMobile() && !isSubMenuNotActiveMobileDisplay ? "contentEtape2 mobile"
                                : "contentEtape2"
                    }
                >
                    <ServicesSlider
                        sellers={sellers}
                        loading={loading}
                        leftBudget={leftBudget}
                        currentPageOffers={currentPageOffers}
                        setCurrentPageOffers={setCurrentPageOffers}
                        handleOpeningSellersDetails={handleOpeningSellersDetails}
                        isMobile={isMobile()}
                        windowsWidth={windowsWidth}
                        selectedSubMenu={selectedSubMenu}
                        selectedMenu={selectedMenu}
                    />

                    {!isMobile() &&
                        <div className="mapContainer">
                            <SellersMap sellers={sellers} allSellers={allSellers} />
                        </div>
                    }
                </div>
            </div >
        </div>
    )
}

export default GoogleApiWrapper({
    apiKey: ("AIzaSyDOQ_vau2uT4Gx_iLMVq2XfsUK3BPULVnY")
})(Etape2)