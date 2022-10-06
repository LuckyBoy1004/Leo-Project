import React, { useState, useEffect } from "react";
import logo from '../images/Logo Nivid - Noir.png'
import { useHistory } from "react-router-dom";
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useAuth } from '../context/userContext'


const Prest_ProcessContainer = () => {

    const history = useHistory()
    const { currentStepProcess } = useAuth()

    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)

    useEffect(() => {
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))

    }, [window.innerWidth])

    const isMobile = () => (windowsWidth > 1100 ? false : true);
    const handleResize = (width) => setWindowsWidth(width);

    function getPourcentBar() {
        if (windowsWidth > 1100) {
            if (currentStepProcess === 0) { return 0; }
            else if (currentStepProcess === 1) { return 24.5; }
            else if (currentStepProcess === 2) { return 52.6; }
            else if (currentStepProcess === 3 || currentStepProcess === 4) { return 80; }
        }
        else {
            return 100
        }
    }

    function handlePreviousStep() {
        const lastStep = currentStepProcess
        if (lastStep === 1) {
            history.push('/mon-compte-partenaire/process/abonnement')
        }
        if (lastStep === 2) {
            history.push('/mon-compte-partenaire/process/description')
        }
        else if (lastStep === 3) {
            history.push('/mon-compte-partenaire/process/services')
        }
        else if (lastStep === 4) {
            history.push('/mon-compte-partenaire/process/verification-1')
        }
        else {
            history.push('/mon-compte-partenaire')
        }
    }

    return currentStepProcess !== 0 && (
        <div>
            <div className="headerStepCreateEvent bootstrapStyle">
                <header>
                    <div>
                        <div onClick={() => history.push('/dashboard')} className={!isMobile() ? "logoContainer" : "logoContainer mobile"}>
                            <img alt="" className="logo" src={logo} />
                        </div>
                        <div className={!isMobile() ? "stepBack" : "stepBack mobile"}>
                            <a href="#" onClick={() => handlePreviousStep()}>Revenir à l'étape précédente</a>
                        </div>
                    </div>
                </header>
                    {!isMobile() ?
                        <div className="stepCreateEvent">
                            <div className={currentStepProcess === 1 ? "step left active" : "step left"}>
                                <p>Prestations</p>
                            </div>
                            <div className={currentStepProcess === 2 ? "step active" : "step"}>
                                <p>Services & Produits</p>
                            </div>
                            <div className={currentStepProcess === 3 || currentStepProcess === 4 ? "step right active" : "step right"}>
                                <p>Vérification</p>
                            </div>
                        </div>
                        :
                        <div className="stepCreateEvent mobile">
                            <div className="step active">
                                <p>{
                                    currentStepProcess === 1 ? "Prestations"
                                        : currentStepProcess === 2 ? "Services & Produits"
                                            : (currentStepProcess === 3 || currentStepProcess === 4) && "Vérification"
                                }</p>
                            </div>
                        </div>
                    }
                <ProgressBar now={getPourcentBar()} />
            </div>
        </div>
    )
}

export default Prest_ProcessContainer;
