import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

// Przenieś konfigurację bibliotek poza komponent
const GOOGLE_MAPS_LIBRARIES = ['places'];
const GOOGLE_MAPS_ID = 'google-map-script';

const MapView = ({ properties, setExpandedProperty }) => {
  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_ID,
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES  // używamy stałej referencji
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
      mapContainerStyle={mapStyles}
      center={defaultCenter}
      zoom={6}
    >
      {validProperties.map(property => {
        const position = {
          lat: property.coordinates.lat,
          lng: property.coordinates.lng
        };

        return (
          <div key={property._id}>
            <google.maps.marker.AdvancedMarkerElement
              position={position}
              title={property.title}
              onClick={() => setSelectedMarker(property)}
              content={
                new google.maps.marker.PinElement({
                  glyph: property.price ? `${(property.price/1000000).toFixed(1)}M` : '',
                  glyphColor: 'white',
                  background: '#1a73e8',
                  borderColor: '#1a73e8'
                })
              }
            />
          </div>
        );
      })}

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

export default React.memo(MapView);
