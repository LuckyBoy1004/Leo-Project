import React, { useState, useEffect } from "react";
import '../styles/Faq.css'
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useHistory } from 'react-router-dom'
import PlusImg from '../images/plus.svg'
import { AiOutlinePlus } from "react-icons/ai";
import { AiOutlineLine } from "react-icons/ai";

import  { ReactComponent as ArrowImg } from '../images/right-arrow.svg'

const faqData = [
    {
        question: "Comment est réalisé le paiement de mon évènement ?",
        response: "Le paiement est entièrement réalisé sur NIVID.fr. Dès validation de votre évènement, nous vous demanderons un acompte de 30%. Le jour de l’évènement, vous serez prélevé du restant dû de la commande avec le même moyen de paiement utilisé pour l’acompte. Les moyens de paiement sont : Visa, MasterCard, autres Cartes Bancaires, ApplePay, Paypal.",
        type: "particulier"
    },
    {
        question: "Quel évènement puis-je organiser sur NIVID.fr ?",
        response: "Sur NIVID.fr vous pouvez organiser tous types d’évènements, de la babyshower à l’anniversaire en passant par le diner en amoureux, sans oublier la soirée entre amis ou en famille. Laissez votre imagination vous guider et éclatez-vous !",
        type: "particulier"
    },
    {
        question: "Comment gérer mon évènement en période de crise sanitaire ?",
        response: "Nous veillons à la bonne exécution des gestes barrières de la part des partenaires NIVID. Il en est de votre responsabilité d’en faire de même le jour de votre évènement pour la sécurité de tous. Nous communiquerons quelques jours avant votre évènement, une note des bonnes pratiques à mettre en place.",
        type: "particulier"
    },
    {
        question: "Quelles sont les prochaines étapes de mon inscription ?",
        response: "Après nous avoir envoyé tous les documents nécessaires à l’identification de ton entreprise, nous procéderons à une validation de ton dossier. Une fois validé et le paiement de l’abonnement réalisé, il sera l’heure de faire tes premiers pas sur NIVID !",
        type: "prestataire"
    },
    {
        question: "Comment suis-je accompagné dans l’installation de ma vitrine ?",
        response: "Rassure-toi chez NIVID tu seras toujours accompagné et cela même après tes premiers pas. Pour installer ta vitrine, nous te mettrons à disposition des tutoriels et si besoin, tu pourras prendre rendez vous avec un membre de l’équipe NIVID.",
        type: "prestataire"
    },
    {
        question: "Aurais-je des contraintes a respecter en tant que partenaire NIVID ?",
        response: "Chez NIVID, nous mettons tout en œuvre pour offrir à nos partenaires et nos clients la meilleure expérience possible. Dans ce sens, nous avons mis en place les conditions générales de service, qui finalement reflètent l’état d’esprit NIVID !",
        type: "prestataire"
    },
    {
        question: "Combien coûte l’adhésion sur le site NIVID ?",
        response: "L’adhésion est à 468 €/mois HT soit 39€/mois HT, autrement dit l’équivalent d’un bouquet de fleur ou d’un beau gâteau d’anniversaire, d’un plateau traiteur, d’une bonne bouteille de champagne ... Vendu sur NIVID.fr. Et pour nous permettre de vous faire briller en ligne grâce à de la publicité digitale, l’optimisation de votre boutique digitale, nous prélevons une commission de 8% HT pour la vente de produits et de 10% HT pour la vente de services. Chez NIVID nous réinvestissons pour vous.",
        type: "prestataire"
    },
]

const Faq = (props) => {

    const [activeQuestionsType, setActiveQuestionsType] = useState("particulier")
    const [openedQuestion, setOpenedQuestion] = useState(-1)

    const [filter, setFilter] = useState("")
    const [pagination, setPagination] = useState({ from: 0, to: 5 })
    const [currentPage, setCurrentPage] = useState(0)
    const [pageCount, setPageCount] = useState(1)

    const history = useHistory()

    useEffect(() => {
        const newPageCount = Math.ceil(faqData.filter(item => item.type === activeQuestionsType).filter(item => item.question.includes(filter)).length / 5)
        newPageCount === 1 && setCurrentPage(0)
        setPageCount(newPageCount)
        const newSlice = { from: 0 + (currentPage * 5), to: 5 + (currentPage * 5) }
        setPagination(newSlice)
    }, [currentPage, filter, activeQuestionsType])

    function handlePagination(page) {
        if (page + 1 > pageCount || page < 0) return
        setCurrentPage(page)
    }

    function handleActiveQuestionsType(type) {
        setCurrentPage(0)
        setActiveQuestionsType(type)
    }

    return (
        <>
            <div className="faq">
                <div className="faq_header">
                    <h1>Questions fréquentes</h1>
                    <div className="inputWithButton_FAQ">
                        <input onChange={(e) => setFilter(e.target.value)} value={filter} placeholder="Tapez votre question ici ..." type="text" />
                    </div>
                </div>
                <div className="faq_content">
                    <div className="faq_content_type">
                        <h2 className={activeQuestionsType === "particulier" && "active"} onClick={() => handleActiveQuestionsType("particulier")}>Particulier</h2>
                        <h2 className={activeQuestionsType === "prestataire" && "active"} onClick={() => handleActiveQuestionsType("prestataire")}>Prestataire</h2>
                    </div>
                </div>
                <div className="faq_content_content">
                    {
                        faqData
                            .filter(item => item.question.includes(filter))
                            .filter(item => item.type === activeQuestionsType)
                            .slice(pagination.from, pagination.to)
                            .map((item, key) => {
                                return <div
                                    key={key}
                                    onClick={() => setOpenedQuestion(key === openedQuestion ? -1 : key)}
                                    className={openedQuestion === key ? "faq_item active" : "faq_item"}>
                                    <h4>{item.question}</h4>
                                    <p className={`${openedQuestion === key ? "active" : ""}`}> {item.response}</p>
                                    <span
                                    className={`${openedQuestion === key ? "active" : ""}`}
                                    >{ openedQuestion === key ? <AiOutlineLine /> : <AiOutlinePlus /> }</span>
                                </div>
                                // Afficher le + et le - sur les items
                            })
                    }
                    <div className="faq_pagination">
                        <ArrowImg className={currentPage - 1 < 0 && "disabled"} onClick={() => handlePagination(currentPage - 1)} />
                        <p>Page {currentPage + 1} sur {pageCount}</p>
                        <ArrowImg className={currentPage + 1 + 1 > pageCount && "disabled"} onClick={() => handlePagination(currentPage + 1)} />
                    </div>
                </div>
                <div className="faq_bottom">
                    <h4>Vous ne trouvez pas de réponse à votre question ?</h4>
                    <button onClick={() => history.push('/contact')} className="blue largeButton">Contactez-nous</button>
                </div>
            </div>
        </>
    )
}
export default Faq;
