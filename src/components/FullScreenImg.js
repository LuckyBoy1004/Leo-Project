import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useDetectClickOutside } from "react-detect-click-outside";


const FullScreenImg = ({imgpath, closeCallback}) => {
    
  const ref = useDetectClickOutside({ onTriggered: closeCallback });

    return ( 
        <div className="fullScreenImg_container">
            <span onClick={closeCallback}><CloseIcon /></span>
            <img ref={ref} src={imgpath} />
        </div>
     )
}

export default FullScreenImg;