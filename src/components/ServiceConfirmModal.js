import React, { useEffect, useState } from "react";
import Image from "./utilities/Image";
import { useDetectClickOutside } from "react-detect-click-outside";
import { ButtonSmall } from "./utilities/Buttons";

const ServiceConfirmModal = ({
  item,
  closeCallback,
  variation,
  confirmCallback,
}) => {
  const [note, setNote] = useState("");

  const ref = useDetectClickOutside({ onTriggered: closeCallback });

  return (
    <div className="serviceConfirmModal_container">
      <div ref={ref} className="serviceConfirmModal">
        <p>Confirmation d'ajout d'un service</p>
        <div className="serviceItem">
          <div className="imgDetailsServiceItem">
            <Image url={item.images[0].url} />
          </div>
          <div className="contentDetailsServiceItem">
            <p className="title">{item.name}</p>
            {variation.length > 0 && <p className="subTitle">{variation}</p>}
            <p className="price">{item.price},00€</p>
          </div>
        </div>
        <div className="serviceItem_note">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={"description"}
            placeholder="Ajouter un commentaire à l'intention du prestataire"
          ></textarea>
        </div>
        <div className="serviceItem_bottom">
          <ButtonSmall
            onClick={closeCallback}
            color="grey"
            value="Annuler"
            marginRight="20px"
            disabled={false}
          />
          <ButtonSmall
            onClick={() => confirmCallback(note)}
            color="green"
            value="Valider et continuer"
            marginRight="20px"
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceConfirmModal;
