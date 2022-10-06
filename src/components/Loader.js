import React from "react"
import { Lottie } from '@crello/react-lottie'
import animationData from './loader.json'

const Loader = ({ callBack }) => {

    function handleAnimationDone() {
        if (callBack !== undefined) {
            setTimeout(function(){ callBack() }, 1500);
        }
    }


    return (
        <div>
            <Lottie
                config={{
                    animationData: animationData,
                    loop: true,
                }}
                lottieEventListeners={[{ name: "complete", callback: handleAnimationDone() }]}
                height={'calc(100vh - 300px)'}
                speed={1.5}
            />
        </div>
    )
}

export default Loader;

