
import articleImage from '../images/Menu-gastronomique-facile.png';
import Image from './utilities/Image'

const BlogWidget = ({title}) => {
    return (
        <div className="rightSide">
            <h1>{title ? title : "Blog"}</h1>
            <div className="blogContainer">
                <div className="articleContainer">
                    <div className="articleContent">
                        <h3>Quel repas choisir pour votre anniversaire ?</h3>
                        <p>le 21 Septembre 2020</p>
                        <div className="imageContainer">
                            <Image url={articleImage} />
                        </div>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.</p>
                        <p className="buttonArticle">Lire la suite</p>
                    </div>
                </div>
                <div className="articleContainer">
                    <div className="articleContent">
                        <h3>Quel repas choisir pour votre anniversaire ?</h3>
                        <p>le 21 Septembre 2020</p>
                        <div className="imageContainer">
                            <Image url={articleImage} />
                        </div>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.</p>
                        <p className="buttonArticle">Lire la suite</p>
                    </div>
                </div>
                <div className="articleContainer">
                    <div className="articleContent">
                        <h3>Quel repas choisir pour votre anniversaire ?</h3>
                        <p>le 21 Septembre 2020</p>
                        <div className="imageContainer">
                            <Image url={articleImage} />
                        </div>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.</p>
                        <p className="buttonArticle">Lire la suite</p>
                    </div>
                </div>
                <div className="articleContainer">
                    <div className="articleContent">
                        <h3>Quel repas choisir pour votre anniversaire ?</h3>
                        <p>le 21 Septembre 2020</p>
                        <div className="imageContainer">
                            <Image url={articleImage} />
                        </div>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.</p>
                        <p className="buttonArticle">Lire la suite</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlogWidget