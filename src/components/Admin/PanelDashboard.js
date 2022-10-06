import React, { useState } from "react";
import './admin.css'
import logo from '../../images/Logo Nivid - Noir.png'

import { Sellers } from "./Sellers";
import { Events } from './event/Events'
import { Users } from './user/Users'

const PanelDashboard = () => {

    const [currentMenu, setCurrentMenu] = useState(0)


    return (
        <div className="panelContainer">
            <div className="panelMenu">
                <div className="panelLogoContainer">
                    <img alt="Nivid" src={logo} />
                </div>
                <ul>
                    <li className={currentMenu === 0 && "active"} onClick={() => setCurrentMenu(0)}>Prestataires</li>
                    <li className={currentMenu === 1 && "active"} onClick={() => setCurrentMenu(1)}>Evenements</li>
                    <li className={currentMenu === 2 && "active"} onClick={() => setCurrentMenu(2)}>Utilisateurs</li>
                </ul>
            </div>
            <div className="panelTopMenu">
                Se déconnecter
            </div>
            <div className="panelContent">
                {
                    currentMenu === 0 ? <Sellers />
                        : currentMenu === 1 ? <Events />
                            : currentMenu === 2 && <Users />
                }

            </div>
        </div>
    )
}

export default PanelDashboard;




