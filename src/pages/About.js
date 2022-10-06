import React, { useState, useEffect } from "react";
import pres1 from "../images/AdobeStock_426636063.jpeg";
import pres2 from "../images/AdobeStock_200877704.jpeg";
import pres3 from "../images/AdobeStock_292777021.jpeg";
import pres4 from "../images/AdobeStock_304886685.jpeg";
import pres5 from "../images/AdobeStock_129995716.jpeg";
import "../styles/About.css";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import PlusImg from "../images/plus.svg";
import { ButtonSmall} from "../components/utilities/Buttons"
const About = (props) => {
  const history = useHistory();

  return (
    <>
      <div className="about">
        <div className="about_header">
          <h1>
            L’évènementiel qui <br />nous <span>rassemble</span>.
          </h1>
          <div className="about_header_images">
            <div className="images_container">
              
              <div className="left">
                <div className="item one"></div>
              </div>

              <div className="afterleft">
              <div className="item two"></div>
              <div className="item three"s></div>
              </div>

              <div className="center">
              <div className="item four"></div>
              </div>

              <div className="afterright">
              <div className="item five"></div>
              <div className="item six"></div>
              </div>

              <div className="right">
                <div className="item seven"></div>
              </div>

            </div>
          </div>
        </div>
        <div className="about_content">
          <div className="item">
            <div className="leftabout">20<br />20</div>
            <div className="rightabout"><p>
              Créé en 2020, <span>NIVID</span> est né de l’envie de révolutionner le monde de l’évènementiel,<br /><br />
              en donnant la possibilité aux particuliers d’organiser simplement <br /><br />des évènements à la hauteur de leurs espérances.<br /><br />
              Et pour cela, il nous fallait des <span>partenaires de qualité</span>, triés sur le volet.
            </p></div>
          </div>

          <div className="item">
            <div className="leftabout">20<br />21</div>
            <div className="rightabout"><p>
            Dès <span>2021</span> suite à la crise sanitaire, on décide de mettre la proximité au cœur de notre mission<br /><br />
            en permettant aux <span>commerçants</span> et <span>prestataires</span> de services de se consacrer à leur passion et savoir-faire.<br /><br />
            De la prospection à la facturation, en passant par le service après vente,<br /><br /> <span>NIVID</span> se charge de toutes les tâches laborieuses et chronophages,<br /><br />
            assurant une présence digitale clé en main à ses <span>partenaires</span>.
            </p></div>
          </div>

          <div className="item">
            <div className="leftabout">20<br />22</div>
            <div className="rightabout"><p>
            Après <span>2 ans de réflexion et de développement</span>,<br /><br />
            on dévoile au grand public la <span>première plateforme</span> d’organisation d’évènements privés.<br /><br />
            Et pour vous offrir le <span>meilleur</span>, on a consacré notre temps à imaginer une offre introuvable ailleurs,<br /><br />
            pour qu’aujourd’hui organiser un anniversaire, organiser une soirée en amoureux,<br /><br />
            ou encore organiser une baby shower soit une réelle source de satisfaction.
            </p></div>
          </div>

        </div>

<div className="bottomabout">
{/*<h1>
#EtMaintenant ?<br />
Si c’était vous notre prochain prestataire de <span>rêve</span>
          </h1>*/}
</div>

        <div className="about_bottom">
          <h2>Continuons d'écrire l'histoire ensemble...</h2>
          <button onClick={() => history.push('/compte')} className="button blue_button">Je commence mon évènement maintenant</button>
        </div>
      </div>
    </>
  );
};
export default About;
