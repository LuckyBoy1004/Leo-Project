import React, { useEffect, useState } from "react";
import { useAuth } from "../context/userContext"; // context
import { useDetectClickOutside } from "react-detect-click-outside";
import { useHistory } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import ModalYesNo from "./utilities/ModalYesNo";
import imgshooping from "../images/shopping-bag.svg";

const CartWidget = (props) => {
  const isMobile = props.isMobile;
  const history = useHistory();
  const {
    event,
    updateQuantityService,
    isCardWidgetOpen,
    setIsCardWidgetOpen,
  } = useAuth(); // context

  const [choosedServices, setChoosedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [currentServiceID, setCurrentServiceID] = useState("");

  useEffect(async () => {
    getChoosedServices().then(() => {
      getTotalPrice();
    });
  });

  async function handleDeleteClick(id) {
    setCurrentServiceID(id);
    setIsModalOpened(true);
  }

  async function handleModalYesNoReturn(val) {
    setIsModalOpened(false);
    if (val === "no") return;

    handleDeleteService(currentServiceID);
  }

  async function handleClickIcon() {
    if (!isMobile) {
      if (isCardWidgetOpen === false) {
        setIsCardWidgetOpen(true);
        await getChoosedServices().then(() => {
          getTotalPrice();
        });
      } else setIsCardWidgetOpen(false);
    } else history.push("/creer-mon-evenement/etape-3/panier");
  }

  async function getChoosedServices() {
    setChoosedServices(event.choosedServices);
  }

  function getTotalPrice() {
    let total = 0;
    choosedServices.forEach((service) => {
      let price = service.price;
      if (service.variations && service.variations.length > 0) {
        price = service.variations.filter(
          (vari) => vari.name === service.variation
        )[0].price;
      }
      total += price * service.quantity;
    });
    total = Number.parseFloat(total).toFixed(2);
    setTotalPrice(total);
  }

  function handleDeleteService(id) {
    updateQuantityService(id, 0);
  }

  function handleButtonRecap() {
    setIsCardWidgetOpen(false);
    history.push("/creer-mon-evenement/etape-3/panier");
  }

  const ref = useDetectClickOutside({
    onTriggered: () => setIsCardWidgetOpen(false),
  });

  return (
    <>
      <div
        ref={ref}
        className={
          isMobile ? "CartWidgetContainer mobile" : "CartWidgetContainer"
        }
      >
        <div
          onClick={() => handleClickIcon()}
          className={
            isCardWidgetOpen ? "CartIconContainer active" : "CartIconContainer"
          }
        >
          <img alt="" src={imgshooping} />
          <span>{choosedServices !== undefined && choosedServices.length}</span>
        </div>
        {isCardWidgetOpen && !isMobile && (
          <div className="wrapperContainer">
            <div className="wrapperItemList">
              {choosedServices.map((service) => {
                return (
                  <div className="cartWrapperItem">
                    <div className="imgCartWrapperItemContainer">
                      <img
                        alt=""
                        src={service.images && service.images[0].url}
                      />
                    </div>
                    <div className="contentCartWrapperItemContainer">
                      <span>
                        {service.variations && service.variations.length > 0
                          ? service.variations.filter(
                              (vari) => vari.name === service.variation
                            )[0].price + "€"
                          : service.price + "€"}
                      </span>
                      <p>{service.name}</p>
                      <p>{service.variation}</p>
                      <p>x {service.quantity}</p>
                      <div
                        onClick={() => handleDeleteClick(service.uid)}
                        className="deleteButtonCartWrapper"
                      >
                        <img alt="" src="/images/trashRed.png" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cartWrapperBottom">
              <div className="cartWrapperBottomTotalContainer">
                <p>Total: {totalPrice}€</p>
              </div>
              <div className="cartWrapperBottomButtonContainer">
                <button
                  disabled={choosedServices.length < 1 && "disabled"}
                  onClick={() => handleButtonRecap()}
                >
                  Voir panier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <CSSTransition
        in={isModalOpened}
        timeout={5000}
        classNames="pageTransition"
        unmountOnExit
      >
        <ModalYesNo callback={(val) => handleModalYesNoReturn(val)} value="" />
      </CSSTransition>
    </>
  );
};

export default CartWidget;
