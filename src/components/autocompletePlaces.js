import React from 'react';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';
import mapImg from '../images/google-maps.png'
import { GoogleApiWrapper } from 'google-maps-react';

class LocationSearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { address: this.props.value, isValid: null };
  }

  componentDidMount() {
    this.setState({ isValid: this.props.isValid })
  }

  searchOptions = {
    componentRestrictions: { country: "fr" },
    types: [this.props.placeType]
  }

  handleChange = address => {
    this.setState({ address, isValid: false });
    this.props.onChanged(address)
  };

  handleSelect = address => {
    this.setState({ address });
    geocodeByAddress(address)
      .then(results => getLatLng(results[0]))
      .then(latLng => this.props.onChanged(address, latLng))
      .then(() => this.setState({ isValid: true }))
      .catch(error => console.error('Error', error));

  };


  render() {
    return (
      <PlacesAutocomplete
        value={this.state.address}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
        searchOptions={this.searchOptions}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div className="placeInputContainer" style={{ position: "relative" }}>
           {this.props.placeType !== "(cities)" && <img alt="" src={mapImg} />} 
            <input
              {...getInputProps({
                placeholder: this.props.placeholder || 'Chercher une adresse ...',
                className: `location-search-input ${this.state.isValid === true ? "valid" : this.state.isValid === null ? "" : "notValid"}`,
              })}
            />
            <div className="autocomplete-dropdown-container">
              {suggestions.slice(0, 4).map((suggestion, i) => {

                const className = suggestion.active
                  ? 'suggestion-item suggestion-item--active'
                  : 'suggestion-item';
                // inline style for demonstration purpose
                const style = suggestion.active
                  ? { backgroundColor: 'rgb(230, 230, 230)', cursor: 'pointer' }
                  : { backgroundColor: 'rgb(238, 238, 238)', cursor: 'pointer' };
                return (
                  <div
                    key={i}
                    {...getSuggestionItemProps(suggestion, {
                      className,
                      style,
                    })}
                  >
                    <img src="/images/grey_marker.png" alt="" />
                    <span>
                      <span className="suggestionDescriptionFirst">{suggestion.formattedSuggestion.mainText}</span>
                      <span className="suggestionDescriptionSecond">{suggestion.formattedSuggestion.secondaryText}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PlacesAutocomplete>
    );
  }
}

export default GoogleApiWrapper({
    apiKey: ("AIzaSyDOQ_vau2uT4Gx_iLMVq2XfsUK3BPULVnY")
})(LocationSearchInput)