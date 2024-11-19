import React, { useState } from 'react';
import PropertyForm from './components/PropertyForm';

function App() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [properties, setProperties] = useState([]);

  const handleAddProperty = (propertyData) => {
    setProperties([...properties, propertyData]);
    setIsFormVisible(false);
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
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {isFormVisible ? (
            <PropertyForm onSubmit={handleAddProperty} />
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Witaj w HouseApp!</h2>
              <p className="text-gray-500">
                {properties.length === 0 
                  ? "Rozpocznij dodawanie i zarządzanie swoimi ofertami nieruchomości."
                  : `Liczba dodanych nieruchomości: ${properties.length}`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
