import React, { useState, useRef } from "react";
import ReactLoading from 'react-loading';
import { items } from './servicesData'

import { ButtonSmall } from './utilities/Buttons'
import Image from './utilities/Image'



const ServicesSlider = (props) => {

    // Props reçu de Etape2.js
    const currentPageOffers = props.currentPageOffers
    const setCurrentPageOffers = props.setCurrentPageOffers // function
    const handleOpeningSellersDetails = props.handleOpeningSellersDetails // function
    const sellers = props.sellers
    const loading = props.loading
    const leftBudget = props.leftBudget
    // const isMobile = props.isMobile
    const isMobile = () => (windowsWidth > 1100) ? false : true
    const windowsWidth = props.windowsWidth
    const selectedSubMenu = props.selectedSubMenu
    const selectedMenu = props.selectedMenu

    const [isDown, setIsDown] = useState(false)
    const [startX, setStartX] = useState()
    const [scrollLeft, setScrollLeft] = useState()

    const [isSliderIsMoving, setIsSliderIsMoving] = useState(false)


    // Compte le nombre d'offre pour le transmettre au slice() plus bas, 
    function offersCountLine(line) {
        const count = sellers.length; // 6
        const countPerLine = Math.round(count / 2); // 3
        const firstLine = countPerLine;
        const secondLineFirst = countPerLine;
        const secondLineSecond = countPerLine * 2;
        if (line === 1) { return firstLine }
        else if (line === 2) { return secondLineFirst }
        else if (line === 3) { return secondLineSecond }
    }

    // On va tester si la valeur n'est pas en dessous de 0, ou si elle n'est pas trop élevé en fonction du nombre de page
    function handlePagination(val) {
        const count = sellers.length; // 11 pour exemple
        const maxPage = Math.ceil((Math.round(count / 2)) / 4); // 2 page max
        if (val >= 0 && maxPage > 1 && val < maxPage) { setCurrentPageOffers(val) }
    }

    function isButtonDisabled(val) {
        const count = sellers.length; // 11 pour exemple
        const maxPage = Math.ceil((Math.round(count / 2)) / 4); // 2 page max
        if (val >= 0 && maxPage > 1 && val < maxPage) { return null }
        else { return "disabled" }
    }

    const container = isMobile ? windowsWidth : 450
    const itemWidth = windowsWidth < 600 ? windowsWidth - (windowsWidth * 0.20) : 320
    const itemHeight = itemWidth * 1.2

    function handlePaginationMobile(val) {
        const count = sellers.length; // 5 pour exemple
        const maxPage = Math.ceil(count - (container / (itemWidth))); // 4
        if (val <= maxPage && val >= 0 && (count - maxPage) >= 1) { setCurrentPageOffers(val) }
    }

    function isButtonMobileDisabled(val) {
        const count = sellers.length; // 5 pour exemple
        const maxPage = Math.ceil(count - (container / (itemWidth))); // 4
        if (val <= maxPage && val >= 0 && (count - maxPage) >= 1) { return null }
        else { return "disabled" }
    }

    const sliderSellers = useRef()

    function handleMouseDownSliderHeader(e) {
        setIsDown(true)
        setStartX(windowsWidth < 1000 ? e.clientX : e.pageX - sliderSellers.current.offsetLeft)
        setScrollLeft(sliderSellers.current.scrollLeft)
        setIsSliderIsMoving(false)
    }

    function handleMouseLeaveAndUpSliderHeader() {
        setIsDown(false)
    }

    function handleMouseMoveSliderHeader(e) {
        if (!isDown) return
        setIsSliderIsMoving(true)
        e.preventDefault()
        const x = windowsWidth < 1000 ? e.clientX : e.pageX - sliderSellers.current.offsetLeft;
        const walk = (x - startX) * 2; //scroll-fast
        sliderSellers.current.scrollLeft = scrollLeft - walk;
    }

    function handleSellerClicked(id) {
        if (isSliderIsMoving) {
            return;
        }
        else {
            handleOpeningSellersDetails(id)
        }
    }

    return loading ? <div className="offersContainer"><ReactLoading className={isMobile() ? "loadingSpinner mobile" : "loadingSpinner"} type="spin" color="rgba(245, 192, 67)" height={50} width={50} /></div> : (
        // 3 Condition ci dessous : Si on ismobile est false, si on est à  moins de 600px, et si on est entre les deux
        !isMobile() ?
            <div className="offersContainer">
                <div style={{ marginLeft: -(currentPageOffers * 204) }} className="offersLine"
                >
                    {Object.entries(sellers
                    .slice(0, offersCountLine(1)))
                    .map(([key, item]) => {
                        return (
                            <div
                                key={key}
                                onClick={() => handleOpeningSellersDetails(item.id)}
                                style={{ backgroundImage: `url("${item.image_path.url}")` }}
                                className="offersItem"
                            >
                                <span className="bottom">
                                    <p>{item.companyName}</p>
                                    <p>+ en savoir plus</p>
                                </span>
                            </div>
                        )
                    })}
                </div>

                {sellers.length === 0 &&
                    <div className="noSellersAlert">
                        <Image url={items[selectedMenu][selectedSubMenu].icon} />
                        <p>Il n’y a aucun prestataires actuellement dans cette catégorie, essayez une autre catégorie !</p>
                    </div>
                }

                <div style={{ marginLeft: -(currentPageOffers * 204) }} className="offersLine">
                    {Object.entries(sellers
                    .slice(offersCountLine(2), offersCountLine(3)))
                    .map(([key, item]) => {
                        return (
                            <div
                                key={key}
                                onClick={() => handleOpeningSellersDetails(item.id)}
                                style={{ backgroundImage: `url("${item.image_path.url}")` }}
                                className="offersItem"
                            >
                                <span className="bottom">
                                    <p>{item.companyName}</p>
                                    <p>- en savoir plus</p>
                                </span>
                            </div>
                        )
                    })}
                </div>
                {sellers.length != 0 &&
                    <div className="offersListButtonContainer">
                        <ButtonSmall
                            onClick={() => handlePagination(currentPageOffers - 1)}
                            color="grey"
                            value="Précédent"
                            marginRight="20px"
                            disabled={isButtonDisabled(currentPageOffers - 1)}
                        />
                        <ButtonSmall
                            onClick={() => handlePagination(currentPageOffers + 1)}
                            color="grey"
                            value="Suivant"
                            marginRight="20px"
                            disabled={isButtonDisabled(currentPageOffers + 1)}
                        />
                    </div>
                }
            </div>

            : windowsWidth < 600 ?
                <div className="offersContainer mobile">
                    <div
                        style={{ marginLeft: -(currentPageOffers * (windowsWidth - windowsWidth * 0.17)) }}
                        className={isDown ? "detailsServiceItemContainer active" : "detailsServiceItemContainer"}
                        ref={sliderSellers}
                        onMouseDown={(e) => handleMouseDownSliderHeader(e)}
                        onMouseLeave={() => handleMouseLeaveAndUpSliderHeader()}
                        onMouseUp={() => handleMouseLeaveAndUpSliderHeader()}
                        onMouseMove={(e) => handleMouseMoveSliderHeader(e)}
                    >   
                    
                    {sellers.length > 1 &&
                        <button style={{backgroundColor:'white', border:'0px'}} onClick={() => handlePaginationMobile(currentPageOffers + 1)}>
                            <svg width="36" height="36" viewBox="0 0 24 24">
                                <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z"></path>
                            </svg>
                        </button>}
                        {/* <ButtonSmall
                            onClick={() => handlePaginationMobile(currentPageOffers + 1)}
                            color="rgba(245, 192, 67)"
                            padding="77px 17px"
                            backgroundColor="white"
                            value="<"
                            disabled={isButtonMobileDisabled(currentPageOffers + 1)}
                        /> */}
                        {Object.entries(sellers).map(([key, item]) => {
                            return (

                                
                                <div
                                    key={key}
                                    className={windowsWidth < 600 ? "offersItem mobile" : "offersItem"}
                                    onClick={() => handleSellerClicked(item.id)}
                                    style={{
                                        backgroundImage: `url("${item.image_path.url}")`,
                                        minWidth: "50vw",
                                        maxWidth: "50vw",
                                        margin: "0px 15px",
                                        maxHeight: "80vw",
                                        minHeight: "80vw"
                                    }}

                                >
                                    <span className="bottom">
                                        <p>{item.companyName}</p>
                                        <p>+ en savoir plus</p>
                                    </span>
                                </div>
                            )
                        })}
                        {/* <ButtonSmall
                            onClick={() => handlePaginationMobile(currentPageOffers - 1)}
                            color="rgba(245, 192, 67)"
                            value=">"
                            backgroundColor="white"
                            padding="77px 17px"
                            disabled={isButtonMobileDisabled(currentPageOffers - 1)}
                        /> */}
                        {sellers.length > 1 && <button style={{backgroundColor:'white', border:'0px'}} onClick={() => handlePaginationMobile(currentPageOffers - 1)}>
                            <svg width="36" height="36" viewBox="0 0 24 24">
                                <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z"></path>
                            </svg>
                        </button> }
                    </div>
                    {sellers.length === 0 &&
                        <div className="noSellersAlert">
                            <Image url={items[selectedMenu][selectedSubMenu].icon} />
                            <p>Il n’y a aucun prestataires actuellement dans cette catégorie, essayez une autre catégorie !</p>
                        </div>
                    }
                    {leftBudget!=0 && 
                        <div class="mobilebudget">
                            II vous reste <span style={{color:'rgb(245, 192, 67)'}}>{leftBudget}€</span> de budget
                        </div>
                    }
                    {leftBudget==0 &&
                        <div>
                            Quand on aime on  ne compte pas, toutefois vous venez de dépasser votre budget
                        </div>
                    }
                </div>
                

                : (windowsWidth > 600 && isMobile()) &&
                <div className="offersContainer mobile">
                    <div
                        style={{ marginLeft: -(currentPageOffers * (itemWidth + 25)) }}
                        className={isDown ? "detailsServiceItemContainer active" : "detailsServiceItemContainer"}
                        ref={sliderSellers}
                        onMouseDown={(e) => handleMouseDownSliderHeader(e)}
                        onMouseLeave={() => handleMouseLeaveAndUpSliderHeader()}
                        onMouseUp={() => handleMouseLeaveAndUpSliderHeader()}
                        onMouseMove={(e) => handleMouseMoveSliderHeader(e)}

                    >
                        {Object.entries(sellers).map(([key, item]) => {
                            return (

                                <div
                                    key={key}
                                    className="offersItem"
                                    onClick={() => handleSellerClicked(item.id)}
                                    style={{
                                        backgroundImage: `url("${item.image_path.url}")`,
                                        minWidth: itemWidth,
                                        maxWidth: itemWidth,
                                        marginRight: '25px'
                                    }}

                                >
                                    <span className="bottom">
                                        <p>{item.companyName}</p>
                                        <p>+ en savoir plus</p>
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    {sellers.length === 0 &&
                        <div className="noSellersAlert">
                            <Image url={items[selectedMenu][selectedSubMenu].icon} />
                            <p>Il n’y a aucun prestataires actuellement dans cette catégorie, essayez une autre catégorie !</p>
                        </div>
                    }
                    {sellers.length !== 0 &&
                        <div className="buttonDuoDashboard mobile">
                        <ButtonSmall
                            onClick={() => handlePaginationMobile(currentPageOffers + 1)}
                            color="grey"
                            value="Suivant"
                            disabled={isButtonMobileDisabled(currentPageOffers + 1)}
                        />
                        <ButtonSmall
                            onClick={() => handlePaginationMobile(currentPageOffers - 1)}
                            color="grey"
                            value="Précédent"
                            disabled={isButtonMobileDisabled(currentPageOffers - 1)}
                        />
                        </div>
                    }
                </div>

    )
}

export default ServicesSlider;