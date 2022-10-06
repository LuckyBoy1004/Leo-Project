import articleImage from '../images/Menu-gastronomique-facile.png';
import Image from './utilities/Image'

const InterestedSellers = () => {
    return (
        <div className="rightSide">
            <h1>Ces prestataires pourraient vous intéresser…</h1>
            <div className="interrestingSellersContainer">
                <div className="interrestingSellers">
                    <div className="item">
                        <div className="bottomImageAbsolute">
                            <p>Jardin des fleurs</p>
                            <p>+ en savoir plus</p>
                        </div>
                        <Image url={articleImage} />
                    </div>
                    <div className="item">
                        <div className="bottomImageAbsolute">
                            <p>Jardin des fleurs</p>
                            <p>+ en savoir plus</p>
                        </div>
                        <Image url={articleImage} />
                    </div>
                    <div className="item">
                        <div className="bottomImageAbsolute">
                            <p>Jardin des fleurs</p>
                            <p>+ en savoir plus</p>
                        </div>
                        <Image url={articleImage} />
                    </div>
                    <div className="item">
                        <div className="bottomImageAbsolute">
                            <p>Jardin des fleurs</p>
                            <p>+ en savoir plus</p>
                        </div>
                        <Image url={articleImage} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InterestedSellers