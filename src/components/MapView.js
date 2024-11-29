import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const MapView = ({ properties, setExpandedProperty }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Konwersja adresu na współrzędne (geocoding)
  const geocodeAddress = async (address) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK') {
            resolve({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            });
          } else {
            reject(new Error('Nie można znaleźć lokalizacji'));
          }
        });
      });
    } catch (error) {
      console.error('Błąd geokodowania:', error);
      return null;
    }
  };

  // Przygotowanie markerów
  useEffect(() => {
    const prepareMarkers = async () => {
      const markersData = await Promise.all(
        properties.map(async (property) => {
          let coords = property.coordinates;

          // Jeśli brak współrzędnych, spróbuj geokodować adres
          if (!coords && property.location && property.location !== 'Brak lokalizacji') {
            coords = await geocodeAddress(property.location);
          }

          if (coords) {
            return {
              id: property._id,
              position: {
                lat: coords.lat,
                lng: coords.lng
              },
              title: property.title,
              price: property.price,
              property: property
            };
          }
          return null;
        })
      );

      setMarkers(markersData.filter(marker => marker !== null));
    };

    prepareMarkers();
  }, [properties]);

  const mapStyles = {
    height: "70vh",
    width: "100%"
  };

  const defaultCenter = {
    lat: 52.069167,
    lng: 19.480556
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={6}
        center={defaultCenter}
      >
        {markers.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            onClick={() => setSelectedMarker(marker)}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              labelOrigin: new window.google.maps.Point(15, -10)
            }}
            label={{
              text: marker.title,
              color: "#000000",
              fontSize: "12px",
              fontWeight: "bold"
            }}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2">
              <h3 className="font-bold">{selectedMarker.title}</h3>
              <p className="text-lg">{selectedMarker.price.toLocaleString()} PLN</p>
              <button
                onClick={() => {
                  setExpandedProperty(selectedMarker.property._id);
                  setSelectedMarker(null);
                }}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Zobacz szczegóły
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapView;