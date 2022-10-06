import React from 'react'
import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';
import { useAuth } from "../context/userContext"; // context

const SellersMap = (props) => {


    const { event } = useAuth() // context
    const allSellers = props.allSellers
    const sellers = props.sellers


    function _mapLoaded(mapProps, map) {
        map.setOptions({
            styles: mapStyle
        })
    }

    const containerStyle = {
        width: '100%'
    }


    const mapStyle = [
        {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "poi",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
        },
        {
            "featureType": "transit",
            "stylers": [{ "visibility": "off" }]
        }
    ]

    const maxCharInPlace = 40;

    return (
        <Map
            containerStyle={containerStyle}
            initialCenter={event.latLng}
            style={{ width: '100%' }}
            google={props.google}
            zoom={15}
            mapId="a6dc99a9af73907"
            onReady={(mapProps, map) => _mapLoaded(mapProps, map)}
        >
                <div className="blackAdressOnMap">
                    <img alt="" src="/images/5km.png" />
                    <p>
                        {event.place.substr(0, maxCharInPlace)}
                        {maxCharInPlace < event.place.length && "..."}
                    </p>
                </div>
                <Marker
                    title={'The marker`s title will appear as a tooltip.'}
                    name={'SOMA'}
                    position={event.latLng} />

                {Object.entries(allSellers).map(([key, seller]) => {
                    return <Marker
                        key={key}
                        name={'SOMA'}
                        position={{ lat: seller.latLng.lat, lng: seller.latLng.lng }}
                        icon={{
                            url: "/images/grey_marker.png",
                            anchor: new props.google.maps.Point(12, 30),
                            scaledSize: new props.google.maps.Size(28, 30)
                        }}
                    />
                })}

                {Object.entries(sellers).map(([key, seller]) => {
                    return <Marker
                        key={key}
                        name={'SOMA'}
                        position={{ lat: seller.latLng.lat, lng: seller.latLng.lng }}
                        icon={{
                            url: "/images/blue_marker.png",
                            anchor: new props.google.maps.Point(12, 30),
                            scaledSize: new props.google.maps.Size(28, 30)
                        }}
                    />
                })}
            </Map>

    );
}

export default GoogleApiWrapper({
    apiKey: ("AIzaSyDOQ_vau2uT4Gx_iLMVq2XfsUK3BPULVnY")
})(SellersMap)