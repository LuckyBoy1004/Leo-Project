import React from "react";


const ModalYesNo = ({ callback, value, value2, disabled }) => {


    return (
        <div className="modalYesNo__background">
            <div className="modalYesNo">
                {value && <p>{value}</p>}
                {value2 && <p>{value2}</p>}
                {!disabled &&
                    <>
                        <p> Êtes-vous sur ?</p>
                        <button onClick={() => callback("yes")}>Oui</button>
                        <button onClick={() => callback("no")}>Non</button>
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