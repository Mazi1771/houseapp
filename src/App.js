import React, { useState, useEffect } from 'react';
import PropertyForm from './components/PropertyForm';
import PropertyEditForm from './components/PropertyEditForm';
import Login from './components/Login';
import Register from './components/Register';
import PriceHistoryChart from './components/PriceHistoryChart';

function App() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [properties, setProperties] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    areaMin: '',
    areaMax: '',
    status: '',
    rating: '',
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      fetchProperties();
    } else {
      setIsLoadingProperties(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchProperties();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchProperties = async () => {
    try {
      setIsLoadingProperties(true);
      const token = localStorage.getItem('token');
      console.log('Token przy pobieraniu właściwości:', token ? 'Jest' : 'Brak');

      const response = await fetch('https://houseapp-backend.onrender.com/api/properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Status odpowiedzi properties:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Pobrano nieruchomości:', data.length);
        setProperties(data);
      } else {
        const errorData = await response.json();
        console.error('Błąd przy pobieraniu właściwości:', errorData);
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error('Błąd podczas pobierania danych:', error);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const handleEditClick = (property) => {
    setEditingProperty(property);
  };

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setIsAuthenticated(true);
    setUser(data.user);
    fetchProperties();
  };

  const handleRegister = (data) => {
    setIsAuthenticated(true);
    setUser(data.user);
    fetchProperties();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setProperties([]);
  };const handleScrape = async () => {
    if (!url) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Jest' : 'Brak');

      const response = await fetch('https://houseapp-backend.onrender.com/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      });
      
      if (response.ok) {
        const data = await response.json();
        setProperties([data, ...properties]);
        setUrl('');
        setIsFormVisible(false);
      } else {
        const errorData = await response.json();
        console.error('Błąd odpowiedzi:', errorData);
        alert(errorData.error || 'Wystąpił błąd podczas pobierania danych');
      }
    } catch (error) {
      console.error('Błąd:', error);
      alert('Wystąpił błąd podczas komunikacji z serwerem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (propertyId, rating) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });

      if (response.ok) {
        const updatedProperty = await response.json();
        setProperties(properties.map(p => 
          p._id === propertyId ? updatedProperty : p
        ));
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji oceny:', error);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProperties(properties.filter(p => p._id !== propertyId));
      } else {
        alert('Nie udało się usunąć ogłoszenia');
      }
    } catch (error) {
      console.error('Błąd podczas usuwania:', error);
      alert('Wystąpił błąd podczas usuwania ogłoszenia');
    }
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${editingProperty._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedProperty = await response.json();
        setProperties(properties.map(p => 
          p._id === editingProperty._id ? updatedProperty : p
        ));
        setEditingProperty(null);
      } else {
        const errorData = await response.json();
        console.error('Błąd podczas aktualizacji:', errorData);
        alert(errorData.error || 'Wystąpił błąd podczas aktualizacji');
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji:', error);
      alert('Wystąpił błąd podczas aktualizacji');
    }
  };

  const getFilteredAndSortedProperties = () => {
    let filtered = properties.filter(property => {
      const matchesPrice = (!filters.priceMin || property.price >= Number(filters.priceMin)) &&
                          (!filters.priceMax || property.price <= Number(filters.priceMax));
                          
      const matchesArea = (!filters.areaMin || property.area >= Number(filters.areaMin)) &&
                         (!filters.areaMax || property.area <= Number(filters.areaMax));
                         
      const matchesStatus = !filters.status || property.status === filters.status;
      
      const matchesRating = !filters.rating || property.rating === filters.rating;

      return matchesPrice && matchesArea && matchesStatus && matchesRating;
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return (a.price || 0) - (b.price || 0);
          case 'price-desc':
            return (b.price || 0) - (a.price || 0);
          case 'area-asc':
            return (a.area || 0) - (b.area || 0);
          case 'area-desc':
            return (b.area || 0) - (a.area || 0);
          case 'date-asc':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case 'date-desc':
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });
    }

    return filtered;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              HouseApp
            </h1>
          </div>
          {authMode === 'login' ? (
            <div>
              <Login onLogin={handleLogin} />
              <p className="text-center mt-4">
                Nie masz jeszcze konta?{' '}
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Zarejestruj się
                </button>
              </p>
            </div>
          ) : (
            <div>
              <Register onRegister={handleRegister} />
              <p className="text-center mt-4">
                Masz już konto?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Zaloguj się
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
return (
    <div className="min-h-screen bg-gray-100">
     <header className="bg-white shadow">
  <div className="max-w-7xl mx-auto py-6 px-4">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-gray-900">
        HouseApp
      </h1>
      <div className="flex items-center gap-4">
        <button
          onClick={fetchProperties}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          title="Odśwież dane"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
        <span className="text-gray-600">
          {user?.name || user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Wyloguj
        </button>
      </div>
    </div>
    <div className="flex justify-between items-center mt-4">
      <div className="flex items-center gap-4">
        <select
          onChange={(e) => setSortBy(e.target.value)}
          value={sortBy || ''}
          className="rounded-md border-gray-300 shadow-sm p-2"
        >
          <option value="">Sortuj według...</option>
          <option value="price-asc">Cena: rosnąco</option>
          <option value="price-desc">Cena: malejąco</option>
          <option value="area-asc">Powierzchnia: rosnąco</option>
          <option value="area-desc">Powierzchnia: malejąco</option>
          <option value="date-asc">Data: najstarsze</option>
          <option value="date-desc">Data: najnowsze</option>
        </select>
        <button
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex items-center gap-2"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
            />
          </svg>
          {isFiltersVisible ? 'Ukryj filtry' : 'Pokaż filtry'}
        </button>
      </div>
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        {isFormVisible ? 'Zamknij formularz' : 'Dodaj nieruchomość'}
      </button>
    </div>
  </div>
</header>

{/* Sekcja filtrów - przeniesiona poza header */}
{isFiltersVisible && (
  <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
    <div className="bg-white p-4 rounded-lg shadow mb-4 transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="font-medium mb-2">Cena (PLN)</h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Od"
              value={filters.priceMin}
              onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
              className="w-full rounded border p-2"
            />
            <input
              type="number"
              placeholder="Do"
              value={filters.priceMax}
              onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
              className="w-full rounded border p-2"
            />
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Powierzchnia (m²)</h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Od"
              value={filters.areaMin}
              onChange={(e) => setFilters({...filters, areaMin: e.target.value})}
              className="w-full rounded border p-2"
            />
            <input
              type="number"
              placeholder="Do"
              value={filters.areaMax}
              onChange={(e) => setFilters({...filters, areaMax: e.target.value})}
              className="w-full rounded border p-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <h3 className="font-medium mb-2">Stan</h3>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full rounded border p-2"
            >
              <option value="">Wszystkie</option>
              <option value="do zamieszkania">Do zamieszkania</option>
              <option value="do remontu">Do remontu</option>
              <option value="w budowie">W budowie</option>
              <option value="stan deweloperski">Stan deweloperski</option>
            </select>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Ocena</h3>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({...filters, rating: e.target.value})}
              className="w-full rounded border p-2"
            >
              <option value="">Wszystkie</option>
              <option value="favorite">⭐ Ulubione</option>
              <option value="interested">👍 Zainteresowany</option>
              <option value="not_interested">👎 Niezainteresowany</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setFilters({
            priceMin: '',
            priceMax: '',
            areaMin: '',
            areaMax: '',
            status: '',
            rating: '',
          })}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          Wyczyść filtry
        </button>
      </div>
    </div>
  </div>
)}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredAndSortedProperties().map((property, index) => (
                <div key={property._id || index} className="bg-white rounded-lg shadow p-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                    
                    <div className="space-y-2">
                      <p>Cena: {property.price ? `${property.price.toLocaleString()} PLN` : 'Brak danych'}</p>
                      <p>Powierzchnia: {property.area ? `${property.area} m²` : 'Brak danych'}</p>
                      {property.plotArea && (
                        <p>Powierzchnia działki: {property.plotArea} m²</p>
                      )}
                      <p>Pokoje: {property.rooms || 'Brak danych'}</p>
                      <p>Lokalizacja: {property.location || 'Brak danych'}</p>
                      <p>Stan: 
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          property.status === 'do zamieszkania' ? 'bg-green-100 text-green-800' :
                          property.status === 'do remontu' ? 'bg-red-100 text-red-800' :
                          property.status === 'w budowie' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {property.status}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4 border-t pt-4">
                      <PriceHistoryChart propertyId={property._id} />
                    </div>

                    {property.sourceUrl && (
                      <a 
                        href={property.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Zobacz ogłoszenie →
                      </a>
                    )}

                    {property.description && (
                      <p className="text-gray-600">{property.description}</p>
                    )}

                    <div className="flex justify-between items-center mt-4">
                      <div className="space-x-2">
                        <button
                          onClick={() => handleRating(property._id, 'favorite')}
                          className={`p-2 rounded ${property.rating === 'favorite' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100'}`}
                          title="Ulubione"
                        >
                          ⭐
                        </button>
                        <button
                          onClick={() => handleRating(property._id, 'interested')}
                          className={`p-2 rounded ${property.rating === 'interested' ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}
                          title="Zainteresowany"
                        >
                          👍
                        </button>
                        <button
                          onClick={() => handleRating(property._id, 'not_interested')}
                          className={`p-2 rounded ${property.rating === 'not_interested' ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}
                          title="Niezainteresowany"
                        >
                          👎
                        </button>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleEditClick(property)}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                        >
                          Edytuj
                        </button>
                        <button
                          onClick={() => handleDelete(property._id)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
