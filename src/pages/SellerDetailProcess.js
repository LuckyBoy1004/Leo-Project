import React, { useEffect, useState } from "react";
import { useFirebase } from "../assets/base-context";
import ServiceDescription from "../components/ServiceDescription";
import { useAuth } from "../context/userContext"; // context
import { useParams } from "react-router-dom";
import StickerBudgetLeft from "../components/StickerBudgetLeft";

import { ButtonSmall } from "../components/utilities/Buttons";
import Image from "../components/utilities/Image";
import Loader from "../components/Loader.js";

import { CSSTransition } from "react-transition-group";

const SellerDetailProcess = () => {
  const firebaseContext = useFirebase();
  const firestore = firebaseContext.firestore();

  const [details, setDetails] = useState();
  const [loading, setLoading] = useState(true);
  const [isWishList, setIsWishList] = useState(false);
  const [currentPageOffer, setCurrentPageOffer] = useState(0);
  const [windowsWidth, setWindowsWidth] = useState(window.innerWidth);
  const [selectedService, setSelectedService] = useState({});
  const [isSelectedServiceOpen, setIsSelectedServiceOpen] = useState(false);

  const {
    addToCard,
    setCurrentStepProcess,
    addViewsOfSeller,
    addItemToWishListOfUser,
    isSellerInWishListOfUser,
    setIsCardWidgetOpen,
  } = useAuth(); // context
  const { sellerId } = useParams();

  const [animationLoaderDone, setAnimationLoaderDone] = useState(false);

  const refSellers = firestore.collection("sellers");

  const isMobile = () => (windowsWidth > 1100 ? false : true);
  const handleResize = (width) => setWindowsWidth(width);

  useEffect(() => {
    window.addEventListener("resize", (e) => handleResize(window.innerWidth));
    setCurrentStepProcess(21);

    function getSellerDetailsFromDB() {
      refSellers
        .doc(sellerId)
        .get()
        .then((queryDetails) => {
          getSellerServicesFromDB(queryDetails.data());
        });
    }

    getSellerDetailsFromDB();
    addViewsOfSeller(sellerId);

    isSellerInWishListOfUser(sellerId).then((res) => {
      if (res === true) setIsWishList(true);
    });
  }, []);

  async function getSellerServicesFromDB(data) {
    const servicesArray = [];
    const detailsArray = data;
    const results = await refSellers.doc(sellerId).collection("services").get();
    results.forEach((doc) => {
      const newData = doc.data();
      if (newData.variations && newData.variations.length > 0)
        newData.price = newData.variations[0].price;
      servicesArray.push({ ...newData, sellerId: sellerId, id: doc.id });
    });
    detailsArray.services = servicesArray;
    setDetails(detailsArray);
    setLoading(false);
  }

  function handlePaginationItem(val) {
    const count = details.services.length; // 5 pour exemple
    const maxPage = Math.ceil(count - windowsWidth / 380); // 4
    if (val <= maxPage && val >= 0 && count - maxPage >= 1)
      setCurrentPageOffer(val);
  }

  function handleServiceClicked(item) {
    if (selectedService !== undefined && item.id === selectedService.id)
      setIsSelectedServiceOpen(!isSelectedServiceOpen);
    else {
      setSelectedService(item);
      setIsSelectedServiceOpen(true);
    }
  }


  const handleCloseService = () => setIsSelectedServiceOpen(false)

  function isButtonDisabled(val) {
    const count = details.services.length; // 5 pour exemple
    const maxPage = Math.ceil(count - windowsWidth / 380); // 4
    return (val <= maxPage && val >= 0 && count - maxPage >= 1) ? null : "disabled"
  }

  function handleAddToCard(quantity, variation, note) {
    const sellerID = sellerId;
    let item = { ...selectedService };
    item.variation = variation;
    item.note = note;
    addToCard(sellerID, item, quantity);
    window.scrollTo(0, 0);
  }

  async function handleAddToWishList(id) {
    await addItemToWishListOfUser(id);
    setIsWishList(true);
    return;
  }

  return (
    <div>
      <CSSTransition
        in={loading || !animationLoaderDone}
        timeout={300}
        classNames="pageTransition"
        unmountOnExit
      >
        <div className="pageTransition">
          <div className="sellersDetailsContainer">
            <Loader callBack={() => setAnimationLoaderDone(true)} />
          </div>
        </div>
      </CSSTransition>

      <CSSTransition
        in={!loading && animationLoaderDone}
        timeout={300}
        classNames="pageTransition"
        unmountOnExit
      >
        {!loading && (
          <div className="pageTransition">
            <div
              className={
                !isMobile()
                  ? "sellersDetailsContainer"
                  : "sellersDetailsContainer mobile"
              }
            >
              <div className="sellersDetailsHeader">
                {!isMobile() && (
                  <div className="stickerBudgetLeft stickerBudgetDetailsHeader">
                    <StickerBudgetLeft />
                  </div>
                )}
                <div className="sellersHeaderImgContainer">
                  <Image url={details.image_path.url} />
                </div>
                <p className="title">{details.name}</p>
                <p>
                  <Image url={"/images/orange_marker.png"} />
                  {details.adress}
                </p>
                {isWishList ? (
                  <span>Ajouté à votre WishList</span>
                ) : (
                  <ButtonSmall
                    onClick={() => handleAddToWishList(sellerId)}
                    color="pink"
                    value="ajouter à ma wishlist"
                    marginTop="20px"
                    icon="/images/heart.svg"
                  />
                )}
              </div>
              {isMobile() && <div className="separatorServiceDetail"></div>}
              <div
                className={
                  !isMobile()
                    ? "sellerDetailsServicesContainer"
                    : "sellerDetailsServicesContainer mobile"
                }
              >
                <p className="title">Offres du prestataire</p>
                <div className="offersListButtonContainer detailsServicesButtonContainer">
                  <ButtonSmall
                    onClick={() => handlePaginationItem(currentPageOffer - 1)}
                    color="grey"
                    value="Précédent"
                    marginRight="20px"
                    disabled={isButtonDisabled(currentPageOffer - 1)}
                  />
                  <ButtonSmall
                    onClick={() => handlePaginationItem(currentPageOffer + 1)}
                    color="grey"
                    value="Suivant"
                    disabled={isButtonDisabled(currentPageOffer + 1)}
                  />
                </div>
                <div
                  style={{ marginLeft: -(currentPageOffer * 380) }}
                  className="detailsServiceItemContainer"
                >
                  {Object.entries(details.services).map(([key, item]) => {
                    return (
                      <div
                        onClick={() => handleServiceClicked(item)}
                        className={
                          selectedService !== undefined
                            ? selectedService.id !== item.id
                              ? "notActive detailsServiceItem"
                              : "active detailsServiceItem"
                            : "detailsServiceItem"
                        }
                        key={key}
                      >
                        <div className="serviceItem">
                          <div className="imgDetailsServiceItem">
                            <Image url={item.images[0].url} />
                          </div>
                          <div className="contentDetailsServiceItem">
                            <p className="title">{item.name}</p>
                            <p>{item.price}€</p>
                            <span>+ en savoir plus</span>
                          </div>
                        </div>
                        {isMobile() && (
                          <ServiceDescription
                            handleCloseService={handleCloseService}
                            isMobile={isMobile()}
                            display={
                              selectedService.id === item.id &&
                              isSelectedServiceOpen
                                ? true
                                : false
                            }
                            handleAddToCard={handleAddToCard}
                            item={selectedService}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                {!isMobile() && (
                  <ServiceDescription
                    handleCloseService={handleCloseService}
                    handleAddToCard={handleAddToCard}
                    item={selectedService}
                    display={isSelectedServiceOpen}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </CSSTransition>
    </div>
  );
};

export default SellerDetailProcess;
