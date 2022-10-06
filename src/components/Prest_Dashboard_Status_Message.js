import Title from '../components/utilities/Title'


const Prest_Dashboard_Status_Message = ({ status }) => {
    switch (status) {
        case "pending": {
            return <div className="prest_status_message">
                <Title value="Votre profil est en attente de validation" type="h2" font="roboto-medium" align="center" />
                <p>Nous allons l'analyser et revenir vers vous d'ici 1 semaine.</p>
                <p>Si nous validons votre profil nous prendrons contact avec vous pour organiser un shooting photo des services présentés.</p>
            </div>
        }
        case "validated": {
            return <div className="prest_status_message">
                <Title value="Votre profil vient d'être validé félicitations!" type="h2" font="roboto-medium" align="center" />
                <p>Nous allons vous contacter pour organiser un shooting photo de vos services.</p>
                <p>Par la suite l'aventure pourra débuter !</p>
                <p>En attendant n'hésitez pas à consulter nos articles pour optimiser au mieux votre expérience Nivid.</p>
            </div>
        }
        case "rejected": {
            return <div className="prest_status_message">
                <Title value="Nous sommes désolés mais votre profil n'a pas été accepté..." type="h2" font="roboto-medium" align="center" />
                <p>Motif: Vos services ne respectent pas les conditions générales Nivid</p>
            </div>
        }
        default : {
            return
        }
    }
    // return status === "pending" ? (

    //     <div className="prest_status_message">
    //         <Title value="Votre profil est en attente de validation" type="h2" font="roboto-medium" align="center" />
    //         <p>Nous allons l'analyser et revenir vers vous d'ici 1 semaine.</p>
    //         <p>Si nous validons votre profil nous prendrons contact avec vous pour organiser un shooting photo des services présentés.</p>
    //     </div>
    // )
    //     : status === "subscribing" ?
    //         (
    //             "subscribing"
    //         )
    //         : status === "validated" ?
    //             (
    //                 "validated"
    //             )
    //             : status === "rejected" &&
    //             (
    //                 "rejected"
    //             )
}

export default Prest_Dashboard_Status_Message