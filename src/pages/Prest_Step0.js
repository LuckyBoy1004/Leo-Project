import React, { useState, useEffect } from "react";
import "../styles/Prest_.css";
import { Link, useHistory } from "react-router-dom";

import { ButtonLarge } from "../components/utilities/Buttons";
import Layout from "../components/utilities/Layout";
import Title from "../components/utilities/Title";
import { useAuth } from "../context/userContext"; // context
import { ButtonSmall } from "../components/utilities/Buttons";
import Header from "../components/Header";
import { FaPlus } from "react-icons/fa";
import { ReactComponent as Checkedsvg } from "../images/checked.svg";
import { ReactComponent as Confetti } from "../images/confetti.svg";
import { AiOutlinePlus } from "react-icons/ai";
import { AiOutlineLine } from "react-icons/ai";
import pres1 from "../images/AdobeStock_426636063.jpeg";
import pres2 from "../images/AdobeStock_200877704.jpeg";
import pres3 from "../images/AdobeStock_292777021.jpeg";
import pres4 from "../images/AdobeStock_304886685.jpeg";
import pres5 from "../images/AdobeStock_129995716.jpeg";
import cibleImg from "../images/cible.svg";
import toolImg from "../images/repair-tools.svg";

const Prest_Step0 = () => {
  const [windowsWidth, setWindowsWidth] = useState(window.innerWidth);

  const history = useHistory();
  const { setCurrentStepProcess, checkoutSubscription, refSellers, seller } = useAuth(); // context

  const [openedFAQDropdown, setOpenedFAQDropdown] = useState(0);


  const isMobile = () => (windowsWidth > 1100 ? false : true);
  const handleResize = (width) => setWindowsWidth(width);

  useEffect(() => {
    window.addEventListener("resize", (e) => handleResize(window.innerWidth));
  }, []);
  
  // useEffect(() => {
  //   refSellers.doc(seller.uid).get().then(res => {
  //     const data = res.data()
  //     data.subscription_id && history.push("/mon-compte-partenaire/process/description")
  //   })
  // }, []);

  setCurrentStepProcess(0);

  return (
    <>
      <Header />
      <Layout>
        <div className="membership">
          <div className="membership_header">
            <h1>
              Dernière étape avant de rentrer
              <br /> officiellement dans la
              <span> famille!</span>
            </h1>
            <div className="membership_header_images">
              <div className="images_container">
                <div className="item">
                  <img style={{ marginLeft: "-85px" }} src={pres1}></img>
                </div>
                <div className="item">
                  <img style={{ marginLeft: "-85px" }} src={pres2}></img>
                </div>
                <div className="item">
                  <img style={{ marginLeft: "-115px" }} src={pres3}></img>
                </div>
                <div className="item">
                  <img style={{ marginLeft: "-155px" }} src={pres4}></img>
                </div>
                <div className="item">
                  <img style={{ marginLeft: "-15px" }} src={pres5}></img>
                </div>
              </div>
            </div>
          </div>
          <div className="membership_content">
            <p>
              En rejoignant <span>Nivid</span>, vous intégrez une communauté de
              professionnels passionés et résolument modernes. Un petit luxe
              dont on ne sait plus se passer une fois que l'on y a goûté !
            </p>
            <div className="features">
              <div>
                <img src={cibleImg} />
                <div class="blockprocessabonnement">
                  <h4>Augmentez votre chiffre d'affaires</h4>
                  <p>Grâce à une plateforme intuitive & personnalisée</p>
                </div>
              </div>
              <div>
                <img src={toolImg} />
                <div class="blockprocessabonnement">
                  <h4>Gagnez en productivité</h4>
                  <p>
                    Fini les multiples plateformes, faites tout depuis un seul
                    endroit
                  </p>
                </div>
              </div>
            </div>
            <div className="offer">
              <h1>Votre boutique en ligne</h1>
              <span>GRATUITE</span>
              <p>
                Une commission de 12% pour toute prestation réalisée sur nivid.fr
              </p>
              <ul>
                <li>
                  <Checkedsvg />Mise en place de la boutique en ligne
                </li>
                <li>
                  <Checkedsvg />
                  Gestion et facturation des commandes automatisées 24/7
                </li>
                <li>
                  <Checkedsvg />
                  Accompagnement et support partenaire
                </li>
                <li>
                  <Checkedsvg />
                  Outils d’analyse de performance (vues, likes, ventes)
                </li>
                <li>
                  <Checkedsvg />
                  SAV client
                </li>
                <li>
                  <Checkedsvg />
                  Communication digitale
                </li>
              </ul>
            </div>
            <div className="action">
              <h2>
                Vous n'êtes plus qu'à un clic d'augmenter votre{" "}
                <span> chiffre d'affaires</span> <Confetti />
              </h2>
              <Link to="/inscription-prestataire">
                <ButtonSmall
                  // onClick={() => checkoutSubscription()}
                  to="/acces-prestataire"
                  color="blue"
                  value="Je m'inscris maintenant"
                />
              </Link>
              <p>
                En cliquant, vous acceptez les conditions générales de vente
              </p>
            </div>
          </div>

          <div className="membership_bottom">
            <div className="left">
              <h1>Quelques questions / réponses à propos de l'abonnement</h1>
              <p>Pour encore plus de réponses, visitez notre FAQ</p>
              <button
                onClick={() => history.push("faq")}
                className="blue smallButton"
              >
                Voir la FAQ
              </button>
            </div>
            <div className="right">
              <div className="home_dropdown_faq">
                <div
                  onClick={() =>
                    setOpenedFAQDropdown(openedFAQDropdown === 1 ? 0 : 1)
                  }
                >
                  <div className="dropdown_faq_header">
                    <p>Quelles sont les prochaines étapes de mon inscription ?</p>
                    {openedFAQDropdown === 1 ? (
                      <AiOutlineLine />
                    ) : (
                      <AiOutlinePlus />
                    )}
                  </div>
                  <span className={openedFAQDropdown === 1 && "active"}>
                  Après nous avoir envoyé tous les documents nécessaires à l’identification de ton entreprise, nous procéderons à une validation de ton dossier. Une fois validé et le paiement de l’abonnement réalisé, il sera l’heure de faire tes premiers pas sur NIVID !
                  </span>
                </div>
                <div
                  onClick={() =>
                    setOpenedFAQDropdown(openedFAQDropdown === 2 ? 0 : 2)
                  }
                >
                  <div className="dropdown_faq_header">
                    <p>Comment suis-je accompagné dans l’installation de ma vitrine ?</p>
                    {openedFAQDropdown === 2 ? (
                      <AiOutlineLine />
                    ) : (
                      <AiOutlinePlus />
                    )}
                  </div>
                  <span className={openedFAQDropdown === 2 && "active"}>
                  Rassure-toi chez NIVID tu seras toujours accompagné et cela même après tes premiers pas.
Pour installer ta vitrine, nous te mettrons à disposition des tutoriels et si besoin, tu pourras <a href="/contact">prendre rendez vous avec un membre de l’équipe NIVID.</a>
                  </span>
                </div>
                <div
                  onClick={() =>
                    setOpenedFAQDropdown(openedFAQDropdown === 3 ? 0 : 3)
                  }
                >
                  <div className="dropdown_faq_header">
                    <p>Aurais-je des contraintes a respecter en tant que partenaire NIVID ?</p>
                    {openedFAQDropdown === 3 ? (
                      <AiOutlineLine />
                    ) : (
                      <AiOutlinePlus />
                    )}
                  </div>
                  <span className={openedFAQDropdown === 3 && "active"}>
                  Chez NIVID, nous mettons tout en œuvre pour offrir à nos partenaires et nos clients la meilleure expérience possible. Dans ce sens, nous avons mis en place les <a href="/CGU">conditions générales de service</a>, qui finalement reflètent l’état d’esprit NIVID !
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};
export default Prest_Step0;
