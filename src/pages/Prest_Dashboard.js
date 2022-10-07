import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Header from '../components/Header'
import { useAuth } from '../context/userContext'
import Prest_Dashboard_Dashboard from "../components/Prest_Dashboard_Dashboard"
import Prest_Dashboard_Commandes from '../components/Prest_Dashboard_Commandes'
import Prest_Dashboard_Services from '../components/Prest_Dashboard_Services'
import Prest_Dashboard_Info from '../components/Prest_Dashboard_Info'
import Prest_Dashboard_Sponsorship from '../components/Prest_Dashboard_Sponsorship'
import Prest_Dashboard_Status_Message from '../components/Prest_Dashboard_Status_Message'
import Prest_Dashboard_Calendar from '../components/Prest_Dashboard_Calendar'


const Prest_Dashboard = () => {

    const { seller } = useAuth()
    const history = useHistory()
    console.log(useAuth())
    seller.status === "subscribing" && history.push('/mon-compte-partenaire/process/description')
    
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const [step, setStep] = useState(seller.status === "opened" ? "1" : "0")

    function isMobile() {
        return windowsWidth > 1160 ? false : true
    }

    useEffect(() => {
        seller.status !== "opened" ? setStep(0) : setStep(1)
    }, [seller.status])

    window.addEventListener("resize", (e) => setWindowsWidth(window.innerWidth))
    window.scrollTo(0, 0);

    return (
        <div>
            <Header />
            <div className={!isMobile() ? "prest_Dashboard dashboard" : "prest_Dashboard dashboard mobile"}>
                <div className="dashboardHeader">
                    <p>Content de vous revoir <span>{seller.displayName}</span></p>
                    <div>
                        {seller.status !== "opened" && <span className={step === 0 && "active"} onClick={() => setStep(0)}>Dashboard</span>}

                        {seller.status === "opened" && <span className={step === 1 && "active"} onClick={() => setStep(1)}>Dashboard</span>}
                        {seller.status === "opened" && <span className={step === 2 && "active"} onClick={() => setStep(2)}>Commandes</span>}
                        {seller.status === "opened" && <span className={step === 3 && "active"} onClick={() => setStep(3)}>Mes services</span>}
                        {seller.status === "opened" && <span className={step === 4 && "active"} onClick={() => setStep(4)}>Mes informations</span>}
                        {seller.status === "opened" && <span className={step === 5 && "active"} onClick={() => setStep(5)}>Parrainage</span>}
                        {seller.status === "opened" && <span className={step === 6 && "active"} onClick={() => setStep(6)}>Calendrier</span>}
                    </div>
                </div>

                <div className={windowsWidth < 600 ? "dashboardContent mobile" : "dashboardContent"}>
                    {step === 0 &&
                        seller.status !== "opened" && <Prest_Dashboard_Status_Message status={seller.status} />
                    }

                    {step === 1 && <Prest_Dashboard_Dashboard setStep={setStep} />}
                    {step === 2 && <Prest_Dashboard_Commandes />}
                    {step === 3 && <Prest_Dashboard_Services setStep={setStep} />}
                    {step === 4 && <Prest_Dashboard_Info />}
                    {step === 5 && <Prest_Dashboard_Sponsorship />}
                    {step === 6 && <Prest_Dashboard_Calendar />}
                </div>
            </div>
        </div>

    )
}
export default Prest_Dashboard;
