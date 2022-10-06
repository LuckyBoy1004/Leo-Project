import React, { useState, useEffect } from "react";
import "../styles/Prest_.css"

import Layout from '../components/utilities/Layout'
import Title from '../components/utilities/Title'
import { CSSTransition } from 'react-transition-group'
import checkedsvg from '../images/checked.png'
import BlogWidget from '../components/BlogWidget'


const Prest_Step_Confirm = () => {

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        return setIsMounted(true)
    }, [])

    return (
        <Layout>
            <CSSTransition
                in={isMounted}
                timeout={300}
                classNames="pageTransition"
                unmountOnExit
            >
                <>
                <div className="Prest-Step-Confirm">
                    <img alt="" style={{width: "60px"}} src={checkedsvg} />
                    <Title value="Félicitation, vous venez de passer la première étape !" type="h2" font="roboto-medium" align="center" />
                    <p>Nous allons maintenant analyser votre profil et revenir vers vous prochainement.</p>
                    <p>Si nous validons votre profil nous prendrons contact avec vous pour organiser un shooting photo des services présentés.</p>
                </div>
                
                <BlogWidget title="En attendant, ces articles pourraient vous intéresser" />
                </>
            </CSSTransition>
        </Layout>
    )
}
export default Prest_Step_Confirm;
