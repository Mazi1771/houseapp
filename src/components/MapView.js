import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const MapView = ({ properties, setExpandedProperty }) => {
  const [selectedProperty, setSelectedProperty] = React.useState(null);

  const center = React.useMemo(() => {
    if (!properties?.length) return { lat: 52.0692, lng: 19.4803 }; // Centrum Polski

    const validProperties = properties.filter(p => p.coordinates?.lat && p.coordinates?.lng);
    if (!validProperties.length) return { lat: 52.0692, lng: 19.4803 };

    const sumLat = validProperties.reduce((sum, p) => sum + p.coordinates.lat, 0);
    const sumLng = validProperties.reduce((sum, p) => sum + p.coordinates.lng, 0);
    
    return {
      lat: sumLat / validProperties.length,
      lng: sumLng / validProperties.length
    };
  }, [properties]);

  const mapStyles = {
    height: '600px',
    width: '100%'
  };

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={6}
        center={center}
      >
        {properties?.map(property => (
          property.coordinates?.lat && property.coordinates?.lng ? (
            <Marker
              key={property._id}
              position={{
                lat: property.coordinates.lat,
                lng: property.coordinates.lng
              }}
              onClick={() => setSelectedProperty(property)}
            />
          ) : null
        ))}

        {selectedProperty && (
          <InfoWindow
            position={{
              lat: selectedProperty.coordinates.lat,
              lng: selectedProperty.coordinates.lng
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-sm mb-1">{selectedProperty.title}</h3>
              <p className="text-sm">Cena: {selectedProperty.price?.toLocaleString()} PLN</p>
              <p className="text-sm">Powierzchnia: {selectedProperty.area} m²</p>
              <button
                onClick={() => {
                  setExpandedProperty(selectedProperty._id);
                  setSelectedProperty(null);
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
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
