import React from 'react'
import Home from '../pages/Home'
import Pepites from '../pages/Pepites'
import About from '../pages/About'
import Blog from '../pages/Blog'
import Contact from '../pages/Contact'
import {
  BrowserRouter as Router,
  Route,
  Redirect
} from "react-router-dom";
import Subscribe from '../pages/Subscribe'
import Login from '../pages/Login'
import Header from './Header'
import Dashboard from '../pages/Dashboard';
import ProcessContainer from './ProcessContainer'
import PrivateRoute from './PrivateRoute'
import PrivateSellerRoute from './PrivateSellerRoute'
import { useAuth } from '../context/userContext'
import Etape1 from '../pages/Etape1'
import Etape2 from '../pages/Etape2'
import SellerDetailProcess from '../pages/SellerDetailProcess'
import Recapitulatif from '../pages/Recapitulatif';
import PaymentConfirm from '../pages/paymentConfirm';
import PanelDashboard from './Admin/PanelDashboard'
import Invitations from '../pages/Invitations'
import PasswordForget from '../pages/passwordForget';
import Footer from './Footer'
import Prest_Login from '../pages/Prest_Login'
import Prest_Subscribe from '../pages/Prest_Subscribe'
import Prest_ProcessContainer from './Prest_ProcessContainer';
import Prest_Dashboard from '../pages/Prest_Dashboard'
import Prest_Step0 from '../pages/Prest_Step0'
import Prest_Step1 from '../pages/Prest_Step1'
import Prest_Step2 from '../pages/Prest_Step2'
import Prest_Step3 from '../pages/Prest_Step3'
import Prest_Step4 from '../pages/Prest_Step4'
import Prest_Step_Confirm from '../pages/Prest_Step_Confirm'
import ConfirmSubscribe from '../pages/ConfirmSubscribe'
import GiveReview from '../pages/GiveReview';
import ConfirmEmail from '../pages/ConfirmEmail';
import Contact_Boutique from '../pages/Contact_Boutique'
import CGV from '../pages/CGV'
import CGU from '../pages/CGU'
import Faq from '../pages/Faq'
import CookieConsent from "react-cookie-consent";

import ScrollToTop from './ScrollToTop'
import { CSSTransition } from 'react-transition-group'


const privateRoute = [
  { path: '/creer-mon-evenement/etape-1', Component: Etape1, exact: false },
  { path: '/creer-mon-evenement/etape-2', Component: Etape2, exact: true },
  { path: '/creer-mon-evenement/etape-3/panier', Component: Recapitulatif, exact: true },
  { path: '/creer-mon-evenement/etape-3/confirmation', Component: PaymentConfirm, exact: true },
  { path: '/creer-mon-evenement/etape-3/invitations', Component: Invitations, exact: true },
]


const RouteProvider = () => {

  const { user, seller } = useAuth()

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <div className="appContainer">

          <Route exact path="/">
            <Header />
            <Home />
          </Route>
          <Route exact path="/pepites">
            <Header />
            <Pepites />
          </Route>
          <Route path="/qui-sommes-nous">
            <Header />
            <About />
          </Route>
          <Route path="/blog">
            <Header />
            <Blog />
          </Route>
          <Route path="/contact">
            <Header />
            <Contact />
          </Route>
          <Route path="/demande-de-rappel">
            <Header />
            <Contact_Boutique />
          </Route>
          <Route path="/cgv">
            <Header />
            <CGV />
            </Route>
          <Route path="/cgu">
            <Header />
            <CGU />
          </Route>
          <Route path="/faq">
            <Header />
            <Faq />
          </Route>
          <Route path="/compte">{user ? <Redirect to='/dashboard' /> : <Login />}</Route>
          <Route path="/confirm-email"><ConfirmEmail /></Route>
          <Route path="/inscription">{user ? <Redirect to='/dashboard' /> : <Subscribe />}</Route>
          <Route path="/mot-de-passe-oublie">{user ? <Redirect to='/dashboard' /> : <PasswordForget />}</Route>
          <Route path="/confirmation">{user ? <Redirect to='/dashboard' /> : <ConfirmSubscribe />}</Route>

          <PrivateRoute path="/dashboard" comp={Dashboard}></PrivateRoute>
          <PrivateRoute path="/creer-mon-evenement" comp={ProcessContainer}></PrivateRoute>
          {privateRoute.map(({ path, Component, exact }) => (
            <Route key={path} exact={exact} path={path}>
              {({ match }) => (
                <CSSTransition
                  in={match !== null}
                  timeout={300}
                  classNames="pageTransition"
                  unmountOnExit
                >
                  <div className="pageTransition">
                    <Component />
                  </div>
                </CSSTransition>
              )}
            </Route>
          ))}
          <PrivateRoute path="/creer-mon-evenement/etape-2/prestataires/:sellerId" comp={SellerDetailProcess}></PrivateRoute>

          <Route path="/acces-prestataire">{seller ? <Redirect to='/mon-compte-partenaire' /> : <><Header /><Prest_Login /></>}</Route>
          <Route path="/inscription-prestataire">{seller ? <Redirect to='/mon-compte-partenaire' /> : <><Header /><Prest_Subscribe /></>}</Route>

          <PrivateSellerRoute exact path="/mon-compte-partenaire" comp={Prest_Dashboard}></PrivateSellerRoute>

          <PrivateSellerRoute path="/mon-compte-partenaire/process" comp={Prest_ProcessContainer}></PrivateSellerRoute>
          <PrivateSellerRoute path="/mon-compte-partenaire/process/abonnement" comp={Prest_Step0}></PrivateSellerRoute>
          <PrivateSellerRoute path="/mon-compte-partenaire/process/description" comp={Prest_Step1}></PrivateSellerRoute>

          <PrivateSellerRoute path="/mon-compte-partenaire/process/services" comp={Prest_Step2}></PrivateSellerRoute>
          <PrivateSellerRoute path="/mon-compte-partenaire/process/verification-1" comp={Prest_Step3}></PrivateSellerRoute>
          <PrivateSellerRoute path="/mon-compte-partenaire/process/verification-2" comp={Prest_Step4}></PrivateSellerRoute>

          <Route path="/mon-compte-partenaire/confirmation"><Header /><Prest_Step_Confirm /></Route>

          <Route path="/admin">{user ? <PanelDashboard /> : <Redirect to='/' />}</Route>

          <Route path="/donner-mon-avis"><GiveReview /></Route>

          <Route path="/"><Footer /></Route>
            <CookieConsent
              location="bottom"
              buttonClass="smallButton"
              buttonText="J'accepte"
              cookieName="nivid-cookies"
              style={{ background: "rgb(232, 236, 247)", textAlign: "left", lineHeight: "25px", color: "black", alignItems: "center", padding: "7px 7px", boxShadow: "1px 1px 12px 1px rgba(0,0,0, .2)" }}
              buttonStyle={{ backgroundColor: "rgb(245, 192, 67)" ,color: "white", fontSize: "15px", padding: "10px 25px", borderRadius: "7px" }}
              expires={150}
            >
              Nous utilisons des cookies pour vous offrir une meilleure expérience de navigation et analyser le trafic du site. Si vous continuez à utiliser ce site, vous consentez à notre utilisation des cookies <a href="#" class="">En savoir plus</a>{" "}
            </CookieConsent>
        </div>
      </div>
    </Router>

  );
}

export default RouteProvider;