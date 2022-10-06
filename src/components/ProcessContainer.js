import React, { useState, useEffect } from "react";
import logo from "../images/logoBlack.svg";
import { useHistory } from "react-router-dom";
import ProgressBar from "react-bootstrap/ProgressBar";
import CartWidget from "./CartWidget";
import { useAuth } from "../context/userContext";

const ProcessContainer = (props) => {
  const history = useHistory();
  const { currentStepProcess, user } = useAuth();

  const [windowsWidth, setWindowsWidth] = useState(window.innerWidth);

  const isMobile = () => (windowsWidth > 1100 ? false : true);
  const handleResize = (width) => setWindowsWidth(width);

  useEffect(() => {
    if (user.emailVerified === false) history.push("/dashboard");
  });

  useEffect(() => {
    window.addEventListener("resize", (e) => handleResize(window.innerWidth));
  }, [window.innerWidth]);

  function getPourcentBar() {
    if (windowsWidth > 1100) {
      return currentStepProcess === 1
        ? 24.5
        : currentStepProcess === 2 || currentStepProcess === 21
        ? 52.6
        : (currentStepProcess === 3 ||
            currentStepProcess === 31 ||
            currentStepProcess === 32) &&
          80;
    } else return 100;
  }

  function handlePreviousStep() {
    const lastStep = currentStepProcess;
    if (lastStep == 21) history.push("/creer-mon-evenement/etape-2");
    else if (lastStep === 31 || lastStep === 32) history.push("/dashboard");
    else if (lastStep > 1 && lastStep !== 21)
      history.push(`/creer-mon-evenement/etape-${lastStep - 1}`);
    else history.push("/dashboard");
  }

  return (
    <div>
      <div className="headerStepCreateEvent bootstrapStyle">
        <header className="process">
          <div>
            <div
              onClick={() => history.push('/dashboard')} className={!isMobile() ? "logoContainer" : "logoContainer mobile"}
            >
              <img alt="" className="logo" src={logo} />
            </div>
            <div className={!isMobile() ? "stepBack" : "stepBack mobile"}>
              <a href="#" onClick={() => handlePreviousStep()}>
                Revenir à l'étape précédente
              </a>
            </div>
            {currentStepProcess !== 1 &&
              currentStepProcess !== 3 &&
              currentStepProcess !== 31 &&
              currentStepProcess !== 32 && <CartWidget isMobile={isMobile()} />}
          </div>
          {!isMobile() ? (
            <div className="stepCreateEvent">
              <div
                className={
                  currentStepProcess === 1 ? "step left active" : "step left"
                }
              >
                <p>Partie 1</p>
              </div>
              <div
                className={
                  currentStepProcess === 2 || currentStepProcess === 21
                    ? "step active"
                    : "step"
                }
              >
                <p>Partie 2</p>
              </div>
              <div
                className={
                  currentStepProcess === 3 ||
                  currentStepProcess === 31 ||
                  currentStepProcess === 32
                    ? "step right active"
                    : "step right"
                }
              >
                <p>Partie 3</p>
              </div>
            </div>
          ) : (
            <div className="stepCreateEvent mobile">
              <div className="step active">
                <p>Partie {currentStepProcess.toString().substr(0, 1)}</p>
              </div>
            </div>
          )}
        </header>
        <ProgressBar now={getPourcentBar()} />
      </div>
    </div>
  );
};

export default ProcessContainer;
