import React, { useState, useEffect } from "react";
import "../styles/Prest_.css";
import { useAuth } from "../context/userContext"; // context
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { ButtonLarge } from "../components/utilities/Buttons";
import Layout from "../components/utilities/Layout";
import Title from "../components/utilities/Title";
import SubTitle from "../components/utilities/SubTitle";
import ReactLoading from "react-loading";
import LocationSearchInput from "../components/autocompletePlaces";

import imgLiasse from "../images/image00001.png";
import traitOrange from "../images/traitOrange.png";
import { bool } from "prop-types";

import { CSSTransition } from "react-transition-group";

const Prest_Subscribe = () => {
  const search = useLocation().search;
  const referral = new URLSearchParams(search).get("referral");

  const initialData = {
    companyName: "",
    adress: "",
    latLng: { lat: 0, lng: 0 },
    siret: "",
    website: "",
    firstName: "",
    holiday: [],
    lastName: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    referral: "",
    status: "subscribing",
  };

  const history = useHistory();

  const [sellerData, setSellerData] = useState(initialData);
  const [error, setError] = useState({ type: "", message: "" });

  const [passwordStatus, setPasswordStatus] = useState({
    valid: bool,
    message: "",
  });
  const [passwordConfirmStatus, setPasswordConfirmStatus] = useState({
    valid: bool,
    message: "",
  });
  const [affiliateCodeStatus, setAffiliateCodeStatus] = useState({
    valid: bool,
    message: "",
  });

  const [buttonLoading, setButtonLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { sellerSubscribe } = useAuth(); // context

  const { setCurrentStepProcess, checkoutSubscription, refSellers, seller } = useAuth(); // context

  useEffect(() => {
    if (referral !== null) setSellerData({ ...sellerData, referral: referral });
    return setIsMounted(true);
  }, []);

  function handleAdressChanged(adress, latLng) {
    if (latLng !== undefined) {
      setSellerData({ ...sellerData, adress: adress, latLng: latLng });
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setButtonLoading(true);
    const {
      companyName,
      adress,
      siret,
      website,
      firstName,
      holiday,
      lastName,
      email,
      phone,
      password,
      latLng,
      referral,
    } = sellerData;
    isFormComplete().then((res) => {
      if (res === true) {
        sellerSubscribe(
          companyName,
          adress,
          siret,
          website,
          firstName,
          holiday,
          lastName,
          email,
          phone,
          password,
          latLng,
          referral
        ).then((res) => {
          if (res === "auth/email-already-in-use") {
            setError({ type: "email", message: "Cet email est déjà utilisé" });
            setButtonLoading(false);
          } else
            setTimeout(() => {
              history.push("/mon-compte-partenaire/process/description");
            }, 2000);
        });
      }
    });
  }

  async function isFormComplete() {
    if (sellerData.companyName.length > 0) {
      if (sellerData.adress.length > 0) {
        if (sellerData.siret.length === 14) {
          if (sellerData.firstName.length > 0) {
            if (sellerData.lastName.length > 0) {
              if (sellerData.email.length > 0) {
                if (
                  sellerData.phone.length === 10 ||
                  sellerData.phone.length === 0
                ) {
                  if (sellerData.password.length > 8) {
                    if (sellerData.password === sellerData.passwordConfirm) {
                      return true;
                    } else {
                      setError({
                        type: "passwordConfirm",
                        message:
                          "Les deux mots de passe ne sont pas identiques",
                      });
                    }
                  } else {
                    setError({
                      type: "password",
                      message:
                        "Votre mot de passe doit faire 8 caractère minimum",
                    });
                  }
                } else {
                  setError({
                    type: "phone",
                    message:
                      "Merci de renseigner un numéro de téléphone valide",
                  });
                }
              } else {
                setError({
                  type: "email",
                  message: "Merci de renseigner un email",
                });
              }
            } else {
              setError({
                type: "lastName",
                message: "Merci de renseigner le nom du gérant",
              });
            }
          } else {
            setError({
              type: "firstName",
              message: "Merci de renseigner le prénom du gérant",
            });
          }
        } else {
          setError({
            type: "siret",
            message: "Merci de renseigner un numéro de Siret valide",
          });
        }
      } else {
        setError({
          type: "adress",
          message: "Vous devez renseigner l'adresse de votre entreprise.",
        });
      }
    } else {
      setError({
        type: "companyName",
        message: "Vous devez renseigner le nom de votre entreprise.",
      });
    }

    setButtonLoading(false);
  }

  function handlePasswordChanged(password) {
    password.length > 8
      ? setPasswordStatus({ valid: true })
      : setPasswordStatus({ valid: false });
    setSellerData({ ...sellerData, password: password });
  }

  function handlePasswordConfirmChanged(password) {
    password.length > 8 && password === sellerData.password
      ? setPasswordConfirmStatus({ valid: true })
      : setPasswordConfirmStatus({ valid: false });
    setSellerData({ ...sellerData, passwordConfirm: password });
  }

  function handleAffiliateCodeChanged(code) {
    code.length === 12
      ? setAffiliateCodeStatus({ valid: true })
      : setAffiliateCodeStatus({ valid: false });
    setSellerData({ ...sellerData, referral: code });
  }

  return (
    <Layout>
      <CSSTransition
        in={isMounted}
        timeout={300}
        classNames="pageTransition"
        unmountOnExit
      >
        <div className="prest-subscribe-container">
          <div className="prest-subscribe-beforeHeader">
            <p>
              Vous avez déjà un compte ?{" "}
              <span onClick={() => history.push("/acces-prestataire")}>
                Connectez-vous
              </span>
            </p>
          </div>
          <div className="prest-subscribe-header">
            <h1
              style={{ textAlign: "center", fontFamily: "roboto-medium" }}
              className="bigTitle"
            >
              Boostez les{" "}
              <span>
                revenus <img alt="" src={imgLiasse} />
                <img alt="" src={traitOrange} />
              </span>
              <br />
              de votre activité!
            </h1>
            <SubTitle
              value="Grâce à NIVID, recevez des réservations 24H/24 7J/7"
              type="big"
              font="roboto-regular"
              align="center"
            />
            <div className="divider small"></div>
          </div>

          {error && <div className="errorMessage">{error.message}</div>}

          <form>
            <div className="leftForm">
               {/* <Title value="À présent, <br></br>apprenons-en un peu plus sur vous" type="h2" font="roboto-medium" /> */ }
              <h2 class="bigTitle">À présent, <br></br>apprenons-en un peu plus sur vous</h2>
              <p class="bigTitlep">Votre compte sera validé manuellement par notre équipe.</p>
              <div className="formLine">
                <div className="formField withoutMargin">
                  <label>Nom de l'entreprise</label>
                  <input
                    value={sellerData.companyName}
                    type="text"
                    name="companyName"
                    onChange={(e) =>
                      setSellerData({
                        ...sellerData,
                        companyName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="formLine">
                <div className="formField withoutMargin">
                  <label>Adresse</label>
                  <LocationSearchInput
                    placeType="address"
                    value={sellerData.adress}
                    onChanged={handleAdressChanged}
                    isValid={
                      sellerData.latLng !== undefined &&
                      sellerData.latLng.lat !== 0
                        ? true
                        : sellerData.latLng !== undefined &&
                          sellerData.latLng.lat === 0
                        ? null
                        : false
                    }
                  />
                </div>
              </div>

              <div className="formLine">
                <div className="formField withoutMargin">
                  <label>Numéro de siret (14 caractères)</label>
                  <input
                    value={sellerData.siret}
                    type="text"
                    name="siret"
                    onChange={(e) =>
                      setSellerData({ ...sellerData, siret: e.target.value })
                    }
                    maxlength="14"
                  />
                </div>
              </div>

              <div className="formLine">
                <div className="formField withoutMargin">
                  <label>Site internet</label>
                  <input
                    value={sellerData.website}
                    type="text"
                    name="text"
                    onChange={(e) =>
                      setSellerData({ ...sellerData, website: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="rightForm">
              <Title
                value="Coordonnées du gérant"
                type="h2"
                font="roboto-medium"
              />

              <div className="formLine">
                <div className="formField">
                  <label>Prénom</label>
                  <input
                    value={sellerData.firstName}
                    type="text"
                    name="firstName"
                    onChange={(e) =>
                      setSellerData({
                        ...sellerData,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="formField">
                  <label>Nom</label>
                  <input
                    value={sellerData.lastName}
                    type="text"
                    name="lastName"
                    onChange={(e) =>
                      setSellerData({ ...sellerData, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="formLine">
                <div className="formField">
                  <label>Email</label>
                  <input
                    value={sellerData.email}
                    type="email"
                    name="email"
                    onChange={(e) =>
                      setSellerData({ ...sellerData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="formLine">
                <div className="formField">
                  <label>Numéro de téléphone (fixe ou portable)</label>
                  <input
                    value={sellerData.phone}
                    type="text"
                    name="phone"
                    onChange={(e) =>
                      setSellerData({ ...sellerData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="formLine">
                <div className="formField">
                  <label>Mot de passe</label>
                  <input
                    className={
                      passwordStatus.valid === true
                        ? "valid"
                        : passwordStatus.valid === false && "notValid"
                    }
                    value={sellerData.password}
                    type="password"
                    name="text"
                    onChange={(e) => handlePasswordChanged(e.target.value)}
                  />
                </div>
                <div className="formField">
                  <label>Confirmation mot de passe</label>
                  <input
                    className={
                      passwordConfirmStatus.valid === true
                        ? "valid"
                        : passwordConfirmStatus.valid === false && "notValid"
                    }
                    value={sellerData.passwordConfirm}
                    type="password"
                    name="text"
                    onChange={(e) =>
                      handlePasswordConfirmChanged(e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </form>
          <div className="actionFormContainer">
            <div className="leftForm">
              <Title
                value="Vous avez un code de parrainage ?"
                type="h2"
                font="roboto-medium"
              />
              <div className="formLine">
                <div className="formField withoutMargin">
                  <label>Code de votre parrain</label>
                  <input
                    className={
                      affiliateCodeStatus.valid === true
                        ? "valid"
                        : affiliateCodeStatus.valid === false && "notValid"
                    }
                    value={sellerData.referral}
                    type="text"
                    name="text"
                    onChange={(e) => handleAffiliateCodeChanged(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="rightForm">
              <p>
                En créant un compte chez Nivid en tant que préstataire, vous
                acceptez les <a href="/CGU">conditions générales du site</a>
              </p>
              <div className="formLine">
                <div className="formField withoutMargin">
                    <ButtonLarge
                      onClick={(e) => handleFormSubmit(e)}
                      color="orange"
                      value={
                        buttonLoading ? (
                          <ReactLoading
                            className="loadingSpinnerButton"
                            type="spin"
                            color="white"
                            height={23}
                            width={23}
                          />
                        ) : (
                          "Créer mon compte"
                        )
                      }
                      disabled={buttonLoading ? "disabled" : null}
                      marginTop="10px"
                      width="300px"
                    />
                  {/* </Link> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CSSTransition>
    </Layout>
  );
};
export default Prest_Subscribe;
