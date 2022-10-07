import React from "react";
import { ButtonSmall } from '../../components/utilities/Buttons'

const ModalYesNo = ({ callback, value, value2, disabled }) => {


    return (
        <div className="modalYesNo__background">
            <div className="modalYesNo">
                <p style={{fontWeight: "bold", fontSize: "15px", color: "grey"}}>Confirmation</p>
                {value && <p style={{fontWeight: "bold", fontSize: "21px", marginLeft: "7%", marginRight: "7%"}}>{value}</p>}
                {value2 && <p style={{fontSize: "15px", marginLeft: "7%", marginRight: "7%"}}>{value2}</p>}
                {!disabled &&
                    <>
                        <ButtonSmall
                            color="red"
                            onClick={()=>callback("yes")}
                            value={"Fermer mon calendar"}
                            backgroundColor="red"
                            marginTop="10px"
                            marginRight={"4%"}
                            width="48%"
                        />
                        <ButtonSmall
                            color="green"
                            onClick={()=>callback("no")}
                            value={"Laisser ouvert"}
                            backgroundColor="green"
                            marginTop="10px"
                            width="48%"
                        />
                    </>
                }
                {disabled &&
                    <button onClick={() => callback("no")}>Fermer</button>
                }
            </div>
        </div>
    )
}

export default ModalYesNo