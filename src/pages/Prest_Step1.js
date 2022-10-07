import React, { useState, useEffect } from "react";
import "../styles/Prest_.css";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/userContext"; // context

import { ButtonSmall, ButtonLarge } from "../components/utilities/Buttons";
import Layout from "../components/utilities/Layout";
import Title from "../components/utilities/Title";
import SubTitle from "../components/utilities/SubTitle";
import { items } from "../components/servicesData";
import { useFirebase } from "../assets/base-context";
import ReactLoading from "react-loading";
import { CSSTransition } from "react-transition-group";
import { useLocation } from "react-router-dom";

const Prest_Step1 = () => {
  const firebaseContext = useFirebase();
  const storage = firebaseContext.storage();

  const [error, setError] = useState({ type: "", message: "" });
  const [buttonLoading, setButtonLoading] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const search = useLocation().search;
  const session_id = new URLSearchParams(search).get("session_id");

  const initialSellerDetails = {
    description: "",
    category: "",
    subcategory: "",
    image_path: "",
  };

  const initialPictures = {
    name: "",
    url: "",
    lastModified: 0,
    size: 0,
    type: "",
    webkitRelativePath: "",
  };

  const [sellerDetails, setSellerDetails] = useState(initialSellerDetails);

  const [pictures, setPictures] = useState(initialPictures);

  const {
    setCurrentStepProcess,
    setImageSellerDB,
    addSellerDescription,
    seller,
    deleteOldSellerPicture,
    checkoutCheck,
    refSellers,
    setSeller,
  } = useAuth(); // context
  const history = useHistory();

  // seller.status !== "subscribing" && history.push("/mon-compte-partenaire");

  setCurrentStepProcess(1);

  useEffect(() => {
    setSellerDetails({
      description: seller.description ? seller.description : '',
      category: seller.category ? seller.category : '',
      subcategory: seller.subcategory ? seller.subcategory : '',
      image_path: seller.image_path ? seller.image_path : '',
    });
    return setIsMounted(true);
  }, []);

  useEffect(() => {
    if (session_id) {
      checkoutCheck(session_id).then((res) => {
        if (res.status === "paid") {
          refSellers.doc(seller.uid).update({
            subscription_id: res.id,
          });
          setSeller({ ...seller, subscription_id: res.id });
        } /*else history.push("/mon-compte-partenaire/process/abonnement")*/;
      });
    }
  }, []);

  useEffect(() => {
    if (!seller.subscription_id && session_id === null)
      // history.push("/mon-compte-partenaire/process/abonnement");
      return;
  }, []);

  function handleCategoryChange(category, subcategory) {
    if (category !== sellerDetails.category) {
      setSellerDetails({
        ...sellerDetails,
        category: category,
        subcategory: subcategory,
      });
    }
  }

  function handleSubCategoryChange(key) {
    if (key !== sellerDetails.subcategory) {
      setSellerDetails({ ...sellerDetails, subcategory: key });
    }
  }

  function handleChange(e) {
    const type = e.target.files[0].type;
    const size = e.target.files[0].size;
    if (type !== "image/png" && type !== "image/jpeg" && type !== "image/jpg" && type !== "application/pdf") {
      setError({
        type: "imageType",
        message: "Votre fichier n'est ni une image jpeg, jpg ou PNG.",
      });
    } else if (size > 2000000) {
      setError({ type: "imageSize", message: "Votre image fait plus de 2Mo." });
    } else {
      setPictures(e.target.files[0]);
      setSellerDetails({
        ...sellerDetails,
        image_path: { url: URL.createObjectURL(e.target.files[0]) },
      });
      setError({ type: "", message: "" });
    }
  }

  async function isFormValid() {
    if (sellerDetails.description.length > 350) {
      if (
        sellerDetails.category.length > 1 &&
        sellerDetails.subcategory.length > 1
      ) {
        if (
          (pictures.name && pictures.name.length > 0) ||
          (sellerDetails.image_path && sellerDetails.image_path.url.length) > 0
        ) {
          return true;
        } else {
          setButtonLoading(false);
          setError({
            type: "noImage",
            message: "Vous devez ajouter une image.",
          });
        }
      } else {
        setButtonLoading(false);
        setError({
          type: "noCategory",
          message: "Vous devez séléctionner votre secteur d'activité.",
        });
      }
    } else {
      setButtonLoading(false);
      setError({
        type: "description",
        message: "Votre description doit faire au moins 350 caractères.",
      });
    }
  }

  async function handleSendForm() {
    setButtonLoading(true);
    setError({ type: "", message: "" });
    const valid = await isFormValid();
    if (valid === true) {
      let tokenAndUrl = { url: "", token: "" };

      // Si la photo est une nouvelle
      if (pictures.name.length > 0) {
        const token = Math.random().toString(36).substr(2, 19);
        const url = await handleUploadFile(token);
        await setImageSellerDB(url, token);
        tokenAndUrl = { url: url, token: token };
        seller.image_path.url &&
          deleteOldSellerPicture([seller.image_path.token]);
      } else {
        tokenAndUrl = sellerDetails.image_path; // Photo non changée
      }

      addSellerDescription(sellerDetails, tokenAndUrl).then(() => {
        setPictures(initialPictures);
        setSellerDetails({ ...sellerDetails, image_path: tokenAndUrl });
        setButtonLoading(false);
        history.push("/mon-compte-partenaire/process/services");
      });
    } else {
      return;
    }
  }

  async function handleUploadFile(token) {
    return new Promise((resolve, reject) => {
      const upload = storage.ref(`sellers/${token}`).put(pictures);
      upload.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.log(error);
        },
        () => {
          storage
            .ref("sellers")
            .child(token)
            .getDownloadURL()
            .then((url) => {
              resolve(url);
            })
            .catch((error) => {
              console.error(error);
              reject(error);
            });
        }
      );
    });
  }

  return (
    <Layout>
      <CSSTransition
        in={isMounted}
        timeout={300}
        classNames="pageTransition"
        unmountOnExit
      >
        <div>
          <SubTitle
            value="Dites-nous en plus sur votre activité"
            type="big"
            font="roboto-medium"
            align="left"
          />

          <div className="Prest-Step1-Section1">
            <Title
              value="Que devraient savoir vos futurs clients sur vous ?"
              type="h2"
              font="roboto-medium"
              align="left"
            />
            <p>
              Décrivez en détail votre entreprise : aussi bien les services que
              les produits proposés afin de renseigner au mieux vos futurs
              clients. Notre équipe révisera votre texte afin
              d'optimiser votre vitrine et vous permettre d'attirer le plus
              grand nombre de clients. Merci de ne pas inclure de page web,
              courrier électronique, numéro de téléphone et autres coordonnées
              de contact.
            </p>
            <div className="textAreaContainer">
              <textarea
                value={sellerDetails.description}
                onChange={(e) =>
                  setSellerDetails({
                    ...sellerDetails,
                    description: e.target.value,
                  })
                }
              ></textarea>
              <span
                className={sellerDetails.description.length > 349 && "valid"}
              >
                {sellerDetails.description.length}/350
              </span>
            </div>
          </div>

          <div className="Prest-Step1-Section2">
            <Title
              value="Sélectionnez votre secteur d'activité"
              type="h2"
              font="roboto-medium"
              align="left"
            />

            <div className="headerEtape2 Prest-category">
              {(sellerDetails.category === "decorations" ||
                sellerDetails.category.length === 0) && (
                <div
                  className={
                    sellerDetails.category === "decorations"
                      ? "category active"
                      : "category"
                  }
                  onClick={() =>
                    handleCategoryChange("decorations", "Décorations intérieures")
                  }
                >
                  <h1>Décorations</h1>
                </div>
              )}

              {(sellerDetails.category === "ambiance" ||
                sellerDetails.category.length === 0) && (
                <div
                  className={
                    sellerDetails.category === "ambiance"
                      ? "category active"
                      : "category"
                  }
                  onClick={() => handleCategoryChange("ambiance", "Musique")}
                >
                  <h1>Ambiance</h1>
                </div>
              )}

              {(sellerDetails.category === "table" ||
                sellerDetails.category.length === 0) && (
                <div
                  className={
                    sellerDetails.category === "table"
                      ? "category active"
                      : "category"
                  }
                  onClick={() => handleCategoryChange("table", "Nourriture")}
                >
                  <h1>À table</h1>
                </div>
              )}

             {/* {
                                (sellerDetails.category === "service" || sellerDetails.category.length === 0) &&
                                <div
                                    className={sellerDetails.category === "service" ? "category active" : "category"}
                                    onClick={() => handleCategoryChange("service", "serveurs")}
                                >
                                    <h1>Service sur place</h1>
                                </div>
                            } */} 

              {sellerDetails.category.length > 0 && (
                <div className="category button">
                  <h1
                    onClick={() =>
                      setSellerDetails({
                        ...sellerDetails,
                        category: "",
                        subcategory: "",
                      })
                    }
                  >
                    Modifier ma sélection
                  </h1>
                </div>
              )}
            </div>

            <div className="subHeaderEtape2 Prest-subCategory">
              {sellerDetails.category.length > 1 &&
                Object.entries(items[sellerDetails.category]).map(
                  ([key, item]) => {
                    return (
                      <div
                        key={key}
                        className={
                          sellerDetails.subcategory === key
                            ? "subMenuItem active"
                            : "subMenuItem"
                        }
                        onClick={() => handleSubCategoryChange(key)}
                      >
                        <img alt="" src={item.icon} />
                        <p>{key}</p>
                      </div>
                    );
                  }
                )}
            </div>
          </div>

          <div className="Prest-Step1-Section3">
            <Title
              value="Photo principale"
              type="h2"
              font="roboto-medium"
              align="left"
            />

            {(error.type === "imageSize" || error.type === "imageType") && (
              <p className="errorMessage">{error.message}</p>
            )}

            <p>
              De votre boutique ou bien de votre stand, quelque chose de
              représentatif !
            </p>
            <div className="fileInputContainer">
              {sellerDetails.image_path.length === 0 &&
                seller.image_path.length === 0 && (
                  <label for="file" className="label-file">
                    +
                  </label>
                )}
              <input
                accept="image/jpeg, image/jpg, image/png, application/pdf"
                id="file"
                className="input-file"
                type="file"
                onChange={(e) => handleChange(e)}
              />
              <img
                style={{ borderRadius: "8px" }}
                alt=""
                src={sellerDetails.image_path.url || seller.image_path.url}
              />
              <div className="fileInputRight">
                <p>2Mo max.</p>
                <p>Type de fichiers acceptés : jpeg, jpg, png ou PDF</p>
                <ButtonSmall
                  onClick={() => document.getElementById("file").click()}
                  color={
                    sellerDetails.image_path.length === 0 ? "grey" : "blue"
                  }
                  value={
                    sellerDetails.image_path.length === 0
                      ? "Choisir une image"
                      : "Changer d'image"
                  }
                  marginTop="10px"
                />
              </div>
            </div>
          </div>

          <div className="Prest-Step1-Section4">
            <div>
              <p>
                <span>Attention: </span>Merci de bien vérifier toutes vos
                informations, celles-ci seront modifiables seulement si votre
                dossier est en attente de validation.
              </p>
            </div>
            <div>
              <ButtonLarge
                onClick={() => handleSendForm()}
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
                    "Passer à l'étape suivante"
                  )
                }
                width="400px"
              />
            </div>
          </div>

          {error.message.length > 1 && (
            <p className="PrestErrorMessage">{error.message}</p>
          )}
        </div>
      </CSSTransition>
    </Layout>
  );
};
export default Prest_Step1;
