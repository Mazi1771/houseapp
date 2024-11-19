import React from 'react';

function PropertyList({ properties }) {
  if (!properties.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map((property, index) => (
        <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
          <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Cena:</span>
              <span className="font-bold">{property.price} PLN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Powierzchnia:</span>
              <span>{property.area} m²</span>
            </div>
            {property.plotArea && (
              <div className="flex justify-between">
                <span className="text-gray-600">Działka:</span>
                <span>{property.plotArea} m²</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Pokoje:</span>
              <span>{property.rooms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stan:</span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                property.status === 'do-zamieszkania' 
                  ? 'bg-green-100 text-green-800' 
                  : property.status === 'do-remontu'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {property.status === 'do-zamieszkania' 
                  ? 'Do zamieszkania'
                  : property.status === 'do-remontu'
                  ? 'Do remontu'
                  : 'W budowie'}
              </span>
            </div>
            <div className="pt-2 border-t mt-2">
              <p className="text-gray-600 text-sm">{property.location}</p>
              {property.source && (
                <p className="text-gray-400 text-xs mt-1">Źródło: {property.source}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                Edytuj
              </button>
              <button className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">
                Usuń
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PropertyList;
