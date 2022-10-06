import React, { Component } from "react";
import { withRouter } from "react-router-dom";

// Ce composant est appelé dans RouteProvider pour que, à chaque changement de page, on revienne au top de la page.
class ScrollToTop extends Component {
	componentDidUpdate(prevProps) {
		if (this.props.location !== prevProps.location) {
			window.scrollTo(0, 0);
		}
	}

	render() {
		return <React.Fragment />
	}
}

export default withRouter(ScrollToTop)