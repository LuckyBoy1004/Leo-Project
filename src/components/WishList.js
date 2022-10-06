import React, { useState, useEffect } from "react";
import { useAuth } from '../context/userContext'
import { useHistory } from "react-router-dom";
import ReactLoading from 'react-loading';

import { ButtonSmall } from './utilities/Buttons'
import Image from './utilities/Image'

const WishList = ({ eventStatus, isMobile }) => {

    const { user, getWishList, getSellersInDbWithUids, deleteItemFromWishList } = useAuth()

    const [loading, setLoading] = useState(true)
    const [wishList, setWishList] = useState([])

    const history = useHistory()


    useEffect(() => {
        getWishList(user.uid)
            .then(sellersIds => {
                sellersIds.length > 0 ?
                    getSellersInDbWithUids(sellersIds)
                        .then(sellersData => {
                            setWishList(sellersData)
                            setLoading(false)
                        })
                    :
                    setLoading(false)

            })
    }, [])

    async function deleteItem(sellerID) {
        await deleteItemFromWishList(sellerID)
        const newWishList = wishList.filter(item => item.uid !== sellerID)
        setWishList(newWishList)
        return
    }

    function handleSellerClicked(sellerID) {
        if (eventStatus === "creating") {
            history.push(`/creer-mon-evenement/etape-2/prestataires/${sellerID}`)
        }
    }

    return loading ?
        <div className={isMobile ? "dashboardWishlist mobile" : "dashboardWishlist"}>
            <ReactLoading className={isMobile ? "loadingSpinner mobile" : "loadingSpinner"} type="spin" color="rgba(245, 192, 67)" height={50} width={50} />
        </div>
        : (
            <div className={isMobile ? "dashboardWishlist mobile" : "dashboardWishlist"}>
                <div className="leftSide">
                    <h1>Vos prestataires favoris</h1>
                    <div className="wishlist_content">
                        {wishList.map((item, key) =>
                            <div key={key} className="wishlist__item">
                                <span className="heartContainer">
                                    <Image url="/images/heart.svg" />
                                </span>
                                <div
                                    onClick={() => handleSellerClicked(item.uid)}
                                    className={`wishlist__item_top ${eventStatus === "creating" && "clickable"}`}
                                    style={{backgroundImage:`url(${item.image_path.url})`, backgroundSize:"cover"}}
                                >
                                    <div className="wishlist__item_details">
                                        <p>{item.companyName}</p>
                                        <p>+ en savoir plus</p>
                                    </div>
                                </div>
                                <div className="wishlist__item_bottom">
                                    <ButtonSmall onClick={() => deleteItem(item.uid)} color="red" value="Retirer de ma liste" />
                                </div>
                            </div>
                        )}
                        {wishList.length === 0 && <p className="noContent">Pas de prestataires dans vos favoris</p>}
                    </div>
                </div>
            </div >
        )
}

export default WishList