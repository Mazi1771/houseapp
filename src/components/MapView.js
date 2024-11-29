import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const MapView = ({ properties, setExpandedProperty }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Optymalizacja - memoizacja centrum mapy i stylów
  const defaultCenter = useMemo(() => ({
    lat: 52.069167,
    lng: 19.480556
  }), []);

  const mapStyles = useMemo(() => ({
    height: "600px",
    width: "100%"
  }), []);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: false,
    scrollwheel: true,
    gestureHandling: "cooperative",
    maxZoom: 18,
    minZoom: 4
  }), []);

  // Filtruj tylko właściwości z poprawnymi współrzędnymi
  const validProperties = useMemo(() => 
    properties.filter(prop => 
      prop.coordinates?.lat && 
      prop.coordinates?.lng && 
      !isNaN(prop.coordinates.lat) && 
      !isNaN(prop.coordinates.lng)
    ),
    [properties]
  );

  // Optymalizacja - callback dla zdarzenia onLoad
  const onLoad = useCallback((map) => {
    if (validProperties.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      validProperties.forEach(property => {
        bounds.extend({
          lat: property.coordinates.lat,
          lng: property.coordinates.lng
        });
      });
      map.fitBounds(bounds, { padding: 50 });
    }
    setMapLoaded(true);
  }, [validProperties]);

  if (!mapLoaded) {
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
    <LoadScript 
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      loadingElement={
        <div className="h-[600px] flex items-center justify-center">
          <p>Ładowanie Google Maps...</p>
        </div>
      }
    >
      <GoogleMap
        mapContainerStyle={mapStyles}
        center={defaultCenter}
        zoom={6}
        options={mapOptions}
        onLoad={onLoad}
      >
        {validProperties.map(property => (
          <Marker
            key={property._id}
            position={{
              lat: property.coordinates.lat,
              lng: property.coordinates.lng
            }}
            onClick={() => setSelectedMarker(property)}
            title={property.title}
            label={{
              text: property.price ? `${(property.price/1000000).toFixed(1)}M` : '',
              color: 'white',
              fontSize: '14px'
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
    </LoadScript>
  );
};

export default React.memo(MapView);