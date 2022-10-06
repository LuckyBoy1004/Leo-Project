import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/userContext'
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useHistory } from "react-router-dom";

const StickerBudgetLeft = () => {

    const history = useHistory()

    const { event } = useAuth() 
    const [pourcentLeft, setPourcentLeft] = useState((event.budgetLeft / event.budget) * 100); // s= % left
    const [leftBudget, setLeftBudget] = useState(0)
    

    useEffect(() => {
        const total = (event.budgetLeft / event.budget) * 100
        if(total < 0) {
            setLeftBudget(0)
            setPourcentLeft(0)
        }
        else {
            setPourcentLeft(total)
            setLeftBudget(event.budgetLeft)
        }
    })

    return (
        <div className="stickerBudgetContainer" onClick={() => history.push('/creer-mon-evenement/etape-1')}>
        <CircularProgressbarWithChildren value={pourcentLeft} strokeWidth={5}>
            <p>{leftBudget}€</p>
            <span>restant</span>
        </CircularProgressbarWithChildren>
        </div>
    )
}

export default StickerBudgetLeft