import React, { useState, useEffect } from "react";
import '../styles/MosaiqueSlider.css'

import imgTest from '../images/AdobeStock_245763389.jpeg'


const MosaiqueSlider = () => {

    const [activeImg, setActiveImg] = useState(1)

    useEffect(() => {
        const interval = setInterval(() => {
            const random = Math.floor(Math.random() * 9)
            setActiveImg(random)
        }, 2000)
        return () => clearInterval(interval);
    }, [])

    return (
        <div className="mosaiqueSlider">
            <div className="mosaiqueSlider_line1">
                <div className={`mosaiqueSlider_item ${activeImg === 1 && "active"}`}>
                    <img src={imgTest} alt="" />
                </div>
                <div className={`mosaiqueSlider_item ${activeImg === 2 && "active"}`}>
                    <img src={imgTest} alt="" />
                </div>
                <div className={`mosaiqueSlider_item ${activeImg === 3 && "active"}`}>
                    <img src={imgTest} alt="" />
                </div>
                <div className={`mosaiqueSlider_item ${activeImg === 4 && "active"}`}>
                    <img src={imgTest} alt="" />
                </div>
            </div>
            <div className="mosaiqueSlider_line2">
                <div className={`mosaiqueSlider_item ${activeImg === 5 && "active"}`}>
                    <img src={imgTest} alt="" />
                </div>
                <div className={`mosaiqueSlider_item ${activeImg === 6 && "active"}`}>
                    <img src={imgTest} alt="" />
                </div>
                <div className={`mosaiqueSlider_item ${activeImg === 7 && "active"}`}>
                    <img src={imgTest} alt="" />
                </div>
                <div className={`mosaiqueSlider_item ${activeImg === 8 && "active"}`}>
                    <img src={imgTest} alt="" />
                </div>
            </div>
        </div>
    )
}
export default MosaiqueSlider;
