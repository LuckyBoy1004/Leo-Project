import React, { useState, useEffect } from "react";
import "../../styles/Layout.css"

const Layout = ({ children }) => {

    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)


    function isMobile() {
        if (windowsWidth > 1100) { return false }
        else { return true }
    }

    function handleResize(width) {
        setWindowsWidth(width)
    }

    useEffect(() => {
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))
    }, [])

    return (
        <div className={!isMobile() ? "layoutContainer" : "layoutContainer mobile"}>
            {children}
        </div>
    )
}
export default Layout;
