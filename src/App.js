import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            HouseApp
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Witaj w HouseApp!</h2>
            <p className="text-gray-500">
              Rozpocznij dodawanie i zarządzanie swoimi ofertami nieruchomości.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
