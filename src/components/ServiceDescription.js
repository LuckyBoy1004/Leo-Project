import React, { useEffect, useState } from "react";
import NumericInput from "react-numeric-input";
import { useAuth } from "../context/userContext"; // context
import ReactLoading from "react-loading";

import { ButtonLarge } from "./utilities/Buttons";
import Image from "./utilities/Image";
import ServiceConfirmModal from "./ServiceConfirmModal";

import CustomSelect from "../components/utilities/CustomSelect";

import { ReactComponent as CheckTypeImg } from "../images/checked-type.svg";

import FullScreenImg from "./FullScreenImg";

const ServiceDescription = (props) => {
  const item = props.item;
  const handleAddToCard = props.handleAddToCard;
  const display = props.display;
  const isMobile = props.isMobile;
  const handleCloseService = props.handleCloseService;

  const {
    event,
    getServiceQuantityInCard,
    loadingButtonAddToCard,
    setLoadingButtonAddToCard,
  } = useAuth(); // context

  const [activePathImage, setActivePathImage] = useState();
  const [quantity, setQuantity] = useState(1);
  const [variation, setVariation] = useState("");
  const [error, setError] = useState("");
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [isFullscreenImgOpen, setIsFullscreenImgOpen] = useState(false);

  useEffect(() => {
    function getActivePath() {
      setActivePathImage(item.images[0].url);
      setQuantity(1);
      setLoadingButtonAddToCard(false);
    }
    item.variations && item.variations.length > 0
      ? setVariation(item.variations[0].name)
      : setVariation("");
    if (item.images) getActivePath();
  }, [item]);

  function handleImageClick(path) {
    setActivePathImage(path);
  }

  function preHandleAddToCard(note, quantity) {
    handleCloseModal();
    const currentQuantity = getServiceQuantityInCard(item.id);
    const total = (quantity - currentQuantity) * item.price;
    setError("");
    handleAddToCard(quantity, variation, note);
  }

  function organizeImg() {
    if (item.images) {
      return Object.entries(item.images).map(([key, item]) => {
        return (
          <div
            key={key}
            onClick={() => handleImageClick(item.url)}
            className={
              item.url === activePathImage
                ? "active verticalImgItem"
                : "verticalImgItem"
            }
          >
            <Image url={item.url} />
          </div>
        );
      });
    }
  }

  function openModal(e, quantity) {
    e.stopPropagation();
    setLoadingButtonAddToCard(true);
    setCurrentQuantity(quantity);
    setIsModalOpened(true);
  }

  function handleCloseModal() {
    setLoadingButtonAddToCard(false);
    setIsModalOpened(false);
  }

  return (
    <div
      className={
        display
          ? "serviceDescriptionContainer active"
          : "serviceDescriptionContainer"
      }
    >
      <div className="serviceDescription">
        <span
          onClick={() => handleCloseService()}
          className="closeButton"
        ></span>
        <div className="serviceDescriptionImgAndDetails">
          {!isMobile && (
            <div className="serviceDescriptionLeft">
              <div className="verticalLineImg">{organizeImg()}</div>
              <div className="activeImageItem" onClick={() => setIsFullscreenImgOpen(true)}>
                <Image url={activePathImage} />
              </div>
            </div>
          )}
          <div className="serviceDescriptionRight">
            <div>
              <p className="title">
                {item.name && item.name}{" "}
                <span>
                  {item.foodType && (
                    <>
                      <CheckTypeImg />
                      {item.foodType}
                    </>
                  )}
                </span>
              </p>
              {item.variations && item.variations.length > 0 && (
                <p className="subtitle">{variation}</p>
              )}
              <span>
                {item.variations && item.variations.length > 0
                  ? variation === ""
                    ? item.variations[0].price
                    : item.variations.filter((vari) => vari.name === variation)
                        .length > 0 &&
                      item.variations.filter(
                        (vari) => vari.name === variation
                      )[0].price + "€"
                  : item.price && item.price + "€"}
              </span>
            </div>
            <p onClick={(e) => e.stopPropagation()} className="smallTitle">
              Description de l'offre:
            </p>
            <p onClick={(e) => e.stopPropagation()}>
              {item.description && item.description}
            </p>
          </div>
        </div>
        <div className="serviceDescriptionActionContainer">
          {!isMobile && (
            <div className="infoServiceDescriptionAction">
              {item.id && getServiceQuantityInCard(item.id) !== 0 && (
                <p>
                  Déjà dans votre panier{" "}
                  <span>x {getServiceQuantityInCard(item.id)}</span>
                </p>
              )}
            </div>
          )}
          {error.length > 0 && <p className="errorMessage">{error}</p>}

          {item.variations && item.variations.length > 0 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="serviceDescriptionAction"
            >
              <div style={{ marginBottom: "20px" }}>
                <p className="smallTitle">Variante:</p>
                <CustomSelect
                  currentVariation={variation}
                  callback={(e) => setVariation(e.target.value)}
                  options={item.variations}
                />
              </div>
            </div>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="serviceDescriptionAction"
          >
            <div>
              <p className="smallTitle">Quantité:</p>
              <NumericInput
                className="form-control"
                value={quantity}
                min={1}
                max={20}
                step={1}
                precision={0}
                size={4}
                mobile
                onChange={(value) => setQuantity(value)}
              />
            </div>
            <ButtonLarge
              onClick={(e) => openModal(e, quantity)}
              color="orange"
              value={
                loadingButtonAddToCard ? (
                  <ReactLoading
                    className="loadingSpinnerButton"
                    type="spin"
                    color="white"
                    height={23}
                    width={23}
                  />
                ) : (
                  "Ajouter au panier"
                )
              }
              marginTop="10px"
              disabled={loadingButtonAddToCard ? "disabled" : null}
            />
          </div>
        </div>
      </div>
      {isModalOpened && (
        <ServiceConfirmModal
          item={item}
          variation={variation}
          closeCallback={handleCloseModal}
          confirmCallback={(note) => preHandleAddToCard(note, quantity)}
        />
      )}

      {isFullscreenImgOpen && <FullScreenImg imgpath={activePathImage} closeCallback={() => setIsFullscreenImgOpen(false)} />}
    </div>
  );
};
export default ServiceDescription;
