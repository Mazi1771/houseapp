import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindow, Marker } from '@react-google-maps/api';

const GOOGLE_MAPS_LIBRARIES = ['places'];
const GOOGLE_MAPS_ID = 'google-map-script';

const mapStyles = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 52.069167,
  lng: 19.480556
};

const MapView = ({ properties, setExpandedProperty }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [googleMaps, setGoogleMaps] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_ID,
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES
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

  const getMarkerIcon = useCallback((property) => {
    if (!googleMaps) return null;
    
    return {
      path: googleMaps.SymbolPath.CIRCLE,
      fillColor: property.isActive ? '#2563eb' : '#ef4444',
      fillOpacity: 0.7,
      scale: 12,
      strokeColor: '#ffffff',
      strokeWeight: 2
    };
  }, [googleMaps]);

  const getMarkerLabel = useCallback((property) => ({
    text: `${property.price ? (property.price/1000).toFixed(0) + 'k' : 'b/c'}`,
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 'bold',
    className: 'marker-label'
  }), []);

  // Funkcja do automatycznego dopasowania widoku mapy
  const fitBoundsToMarkers = useCallback(() => {
    if (mapInstance && validProperties.length > 0 && googleMaps) {
      const bounds = new googleMaps.LatLngBounds();
      validProperties.forEach(property => {
        bounds.extend({
          lat: property.coordinates.lat,
          lng: property.coordinates.lng
        });
      });
      mapInstance.fitBounds(bounds, { padding: 50 });
      
      if (validProperties.length === 1) {
        mapInstance.setZoom(15);
      }
    }
  }, [mapInstance, validProperties, googleMaps]);

  // Wywołaj dopasowanie mapy przy zmianach
  useEffect(() => {
    if (mapInstance) {
      fitBoundsToMarkers();
    }
  }, [fitBoundsToMarkers, mapInstance]);

  const onMapLoad = useCallback((map) => {
    setMapInstance(map);
    // @ts-ignore
    setGoogleMaps(window.google.maps);
  }, []);

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
      onLoad={onMapLoad}
      options={{
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        streetViewControl: false,
        fullscreenControl: false
      }}
    >
      {validProperties.map(property => (
        <Marker
          key={property._id}
          position={{
            lat: property.coordinates.lat,
            lng: property.coordinates.lng
          }}
          onClick={() => setSelectedMarker(property)}
          icon={getMarkerIcon(property)}
          label={getMarkerLabel(property)}
          animation={googleMaps?.Animation.DROP}
          title={property.title}
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
          <div className="p-3 max-w-xs">
            <h3 className="font-bold text-lg mb-2 text-gray-900">{selectedMarker.title}</h3>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-blue-600">
                {selectedMarker.price?.toLocaleString()} PLN
              </p>
              <div className="text-sm text-gray-600">
                <p>{selectedMarker.area} m² • {selectedMarker.rooms} {selectedMarker.rooms === 1 ? 'pokój' : 'pokoje'}</p>
                <p>{selectedMarker.location}</p>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    setExpandedProperty(selectedMarker._id);
                    setSelectedMarker(null);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Zobacz szczegóły
                </button>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default React.memo(MapView);
