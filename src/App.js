import React, { useState } from 'react';
import PropertyForm from './components/PropertyForm';
import PropertyEditForm from './components/PropertyEditForm';

function App() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [properties, setProperties] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);

  const handleAddProperty = (propertyData) => {
    setProperties([...properties, propertyData]);
    setIsFormVisible(false);
  };

  const handleEditClick = (property) => {
    setEditingProperty(property);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${editingProperty._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedProperty = await response.json();
        setProperties(properties.map(p => 
          p._id === editingProperty._id ? updatedProperty : p
        ));
        setEditingProperty(null);
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              HouseApp
            </h1>
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isFormVisible ? 'Zamknij formularz' : 'Dodaj nieruchomość'}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isFormVisible ? (
          <PropertyForm onSubmit={handleAddProperty} />
        ) : editingProperty ? (
          <PropertyEditForm 
            property={editingProperty}
            onSave={handleSaveEdit}
            onCancel={() => setEditingProperty(null)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property, index) => (
              <div key={property._id || index} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                <div className="space-y-2">
                  <p>Cena: {property.price} PLN</p>
                  <p>Powierzchnia: {property.area} m²</p>
                  <p>Pokoje: {property.rooms}</p>
                  <p>Lokalizacja: {property.location}</p>
                  {property.description && (
                    <p className="text-gray-600">{property.description}</p>
                  )}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleEditClick(property)}
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      Edytuj
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
