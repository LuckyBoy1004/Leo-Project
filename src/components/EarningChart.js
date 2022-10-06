import React, { useEffect, useState } from 'react'
import '../../node_modules/react-vis/dist/style.css';
import { XYPlot, VerticalBarSeries, XAxis, YAxis } from 'react-vis';
import { useAuth } from '../context/userContext'

const EarningChart = ({ sales }) => {

    const { seller } = useAuth()
    const [yearSales, setYearSales] = useState([])


    const [dataGraph, setDataGraph] = useState([
        { x: "Jan", y: 0 },
        { x: "Fev", y: 0 },
        { x: "Mar", y: 0 },
        { x: "Avr", y: 0 },
        { x: "Mai", y: 0 },
        { x: "Juin", y: 0 },
        { x: "Juil", y: 0 },
        { x: "Août", y: 0 },
        { x: "Sept", y: 0 },
        { x: "Oct", y: 0 },
        { x: "Nov", y: 0 },
        { x: "Dec", y: 0 }
    ])

    useEffect(() => {
        const rectList = document.querySelectorAll('rect')
        rectList.forEach(rect => {
            rect.setAttributeNS(null, "ry", "20");
        })
        return getSalesAndMountGraphData()
    }, [])

    function getSalesAndMountGraphData() {
        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        const yearSalesArray = sales.filter(sale => sale.date > yearStart && sale.status !== "rejected") // && sale.status === "validated"

        setYearSales(yearSalesArray)

        let newDataGraph = [...dataGraph]
        yearSalesArray.forEach(sale => {
            const month = new Date(sale.date).getMonth()
            newDataGraph[month].y = newDataGraph[month].y + sale.total
        }, () => setDataGraph(newDataGraph))

    }

    return yearSales.length > 0 ? (
        <XYPlot xType="ordinal" xDistance={0} color="rgb(159, 232, 184)" height={300} width={window.innerWidth * 0.9}>
            <XAxis hideLine />
            <YAxis hideLine />
            <VerticalBarSeries
                style={{ transform: `translate(${window.innerWidth * .02}px)`, width: `${window.innerWidth * .02}px` }}
                data={dataGraph} />
        </XYPlot>
    )
        : <div className="textInEmptyQuery"><p>Aucune commande validée cette année</p></div>
}

export default EarningChart