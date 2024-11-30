import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const MapView = ({ properties, setExpandedProperty }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  // Filtruj właściwości z poprawnymi współrzędnymi
  const validProperties = useMemo(() => 
    properties.filter(prop => 
      prop.coordinates?.lat && 
      prop.coordinates?.lng && 
      !isNaN(prop.coordinates.lat) && 
      !isNaN(prop.coordinates.lng)
    ),
    [properties]
  );

  // Funkcja do automatycznego dopasowania widoku mapy
  const fitBoundsToMarkers = useCallback(() => {
    if (map && validProperties.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      validProperties.forEach(property => {
        bounds.extend({
          lat: property.coordinates.lat,
          lng: property.coordinates.lng
        });
      });
      map.fitBounds(bounds, { padding: { top: 50, right: 50, bottom: 50, left: 50 } });
      
      // Jeśli mamy tylko jedną pinezkę, ustaw odpowiedni zoom
      if (validProperties.length === 1) {
        map.setZoom(15);
      }
    }
  }, [map, validProperties]);

  // Wywołaj dopasowanie mapy przy pierwszym załadowaniu i przy zmianie właściwości
  const onMapLoad = useCallback((map) => {
    setMap(map);
    fitBoundsToMarkers();
  }, [fitBoundsToMarkers]);

  useEffect(() => {
    if (map) {
      fitBoundsToMarkers();
    }
  }, [validProperties, map, fitBoundsToMarkers]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-[600px] bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie mapy...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{
        width: '100%',
        height: '600px'
      }}
      center={{
        lat: 52.069167,
        lng: 19.480556
      }}
      zoom={6}
      onLoad={onMapLoad}
    >
      {validProperties.map(property => (
        <Marker
          key={property._id}
          position={{
            lat: property.coordinates.lat,
            lng: property.coordinates.lng
          }}
          onClick={() => setSelectedMarker(property)}
          title={`${property.title} - ${property.price?.toLocaleString()} PLN`}
          label={{
            text: `${property.location.split(',')[0]}`, // Pokazuje pierwszą część lokalizacji
            color: 'black',
            fontSize: '13px',
            fontWeight: 'bold',
            className: 'marker-label'
          }}
        />
      ))}

      {selectedMarker && (
        <InfoWindow
          position={{
            lat: selectedMarker.coordinates.lat,
            lng: selectedMarker.coordinates.lng
          }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="p-2 max-w-xs">
            <h3 className="font-bold text-lg mb-2">{selectedMarker.title}</h3>
            <p className="text-lg font-semibold mb-2">
              {selectedMarker.price?.toLocaleString()} PLN
            </p>
            <p className="text-sm mb-2">
              {selectedMarker.area} m² • {selectedMarker.rooms} pokoje
            </p>
            <p className="text-sm mb-2 text-gray-600">
              {selectedMarker.location}
            </p>
            <button
              onClick={() => {
                setExpandedProperty(selectedMarker._id);
                setSelectedMarker(null);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full"
            >
              Zobacz szczegóły
            </button>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapView;
