// ===== SEGMENT 1: IMPORTY I INICJALIZACJA =====
import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, Search, Home, RefreshCw, Settings, LogOut, Map, Grid } from 'lucide-react';
import PropertyForm from './components/PropertyForm';
import PropertyEditForm from './components/PropertyEditForm';
import Login from './components/Login';
import Register from './components/Register';
import PriceHistoryChart from './components/PriceHistoryChart';

import MapView from './components/MapView';


function App() {
  // ===== SEGMENT 1A: STANY APLIKACJI =====
 const [isFormVisible, setIsFormVisible] = useState(false);
  const [properties, setProperties] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [expandedProperty, setExpandedProperty] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' lub 'map'
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
  const editFormRef = useRef(null);
  // ===== SEGMENT 2: EFEKTY =====
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
  // ===== SEGMENT 3: FUNKCJE POMOCNICZE =====
  const fetchProperties = async () => {
    try {
      setIsLoadingProperties(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://houseapp-backend.onrender.com/api/properties', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        const errorData = await response.json();
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
    setExpandedProperty(null);
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
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
    setExpandedProperty(null);
  };
  // ===== SEGMENT 4: FUNKCJE OBSŁUGI NIERUCHOMOŚCI =====
  const handleScrape = async () => {
  if (!url) return;
  setIsLoading(true);
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://houseapp-backend.onrender.com/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 400 && data.error.includes('nieaktywna')) {
        // Specjalna obsługa dla nieaktywnych ofert
        alert('Ta oferta jest już nieaktywna lub została usunięta. Spróbuj dodać inną ofertę.');
      } else {
        alert(data.error || 'Wystąpił błąd podczas pobierania danych');
      }
      return;
    }

    setProperties([data, ...properties]);
    setUrl('');
    setIsFormVisible(false);
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
        setExpandedProperty(null);
      } else {
        alert('Nie udało się usunąć ogłoszenia');
      }
    } catch (error) {
      alert('Wystąpił błąd podczas usuwania ogłoszenia');
    }
  };
  // ===== SEGMENT 5: FUNKCJE ODŚWIEŻANIA I AKTUALIZACJI =====
  const handleRefreshProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${propertyId}/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(properties.map(p => 
          p._id === propertyId ? data.property : p
        ));
        alert('Nieruchomość została zaktualizowana');
      }
    } catch (error) {
      console.error('Błąd podczas odświeżania:', error);
      alert('Wystąpił błąd podczas aktualizacji');
    }
  };

  const handleRefreshAll = async () => {
    if (!window.confirm('Czy chcesz zaktualizować wszystkie nieruchomości? To może potrwać kilka minut.')) {
      return;
    }

    setIsRefreshing(true);
    setRefreshProgress({ current: 0, total: properties.length });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://houseapp-backend.onrender.com/api/properties/refresh-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        await fetchProperties();
        alert(`Zaktualizowano ${data.updated} nieruchomości`);
      }
    } catch (error) {
      console.error('Błąd podczas odświeżania wszystkich nieruchomości:', error);
      alert('Wystąpił błąd podczas aktualizacji');
    } finally {
      setIsRefreshing(false);
      setRefreshProgress(null);
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
        alert(errorData.error || 'Wystąpił błąd podczas aktualizacji');
      }
    } catch (error) {
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
  // ===== SEGMENT 6: RENDER - CZĘŚĆ LOGOWANIA =====
if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
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

// ===== SEGMENT 7: RENDER - GŁÓWNY WIDOK APLIKACJI =====
return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              HouseApp
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {isRefreshing ? 'Aktualizacja...' : 'Aktualizuj wszystkie'}
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{user?.name || user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Szukaj nieruchomości..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <button
                onClick={() => setIsFormVisible(!isFormVisible)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                {isFormVisible ? 'Zamknij' : 'Dodaj nieruchomość'}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>{isFiltersVisible ? 'Ukryj filtry' : 'Pokaż filtry'}</span>
              </button>
              <button
    onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-2"
  >
    {viewMode === 'grid' ? (
      <>
        <Map className="h-5 w-5" />
        <span>Pokaż mapę</span>
      </>
    ) : (
      <>
        <Grid className="h-5 w-5" />
        <span>Pokaż listę</span>
      </>
    )}
  </button>
</div>
              <select
                onChange={(e) => setSortBy(e.target.value)}
                value={sortBy || ''}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">Sortuj według...</option>
                <option value="price-asc">Cena: rosnąco</option>
                <option value="price-desc">Cena: malejąco</option>
                <option value="area-asc">Powierzchnia: rosnąco</option>
                <option value="area-desc">Powierzchnia: malejąco</option>
                <option value="date-asc">Data: najstarsze</option>
                <option value="date-desc">Data: najnowsze</option>
              </select>
            </div>
          </div>
        </div>
      </div>

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
        )}

        {/* Przełączanie między mapą a listą */}
        {viewMode === 'map' ? (
          <MapView properties={getFilteredAndSortedProperties()} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredAndSortedProperties().map((property, index) => (
              <div 
                key={property._id || index} 
                className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300
                  ${expandedProperty === property._id ? 'col-span-full' : ''}`}
                onClick={() => setExpandedProperty(expandedProperty === property._id ? null : property._id)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{property.title}</h3>
                      <p className="text-sm text-gray-500">{property.location || 'Brak lokalizacji'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {property.isActive === false ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Nieaktywne
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Aktywne
                        </span>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedProperty(expandedProperty === property._id ? null : property._id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedProperty === property._id ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>
              
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Cena</p>
          <p className="font-semibold text-gray-900">
            {property.price ? `${property.price.toLocaleString()} PLN` : 'Brak danych'}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Powierzchnia</p>
          <p className="font-semibold text-gray-900">
            {property.area ? `${property.area} m²` : 'Brak danych'}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRating(property._id, 'favorite');
          }}
          className={`p-2 rounded-lg transition-colors ${
            property.rating === 'favorite' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100'
          }`}
          title="Ulubione"
        >
          ⭐
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRating(property._id, 'interested');
          }}
          className={`p-2 rounded-lg transition-colors ${
            property.rating === 'interested' ? 'bg-green-100 text-green-600' : 'bg-gray-100'
          }`}
          title="Zainteresowany"
        >
          👍
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRating(property._id, 'not_interested');
          }}
          className={`p-2 rounded-lg transition-colors ${
            property.rating === 'not_interested' ? 'bg-red-100 text-red-600' : 'bg-gray-100'
          }`}
          title="Niezainteresowany"
        >
          👎
        </button>
      </div>

      {/* Rozszerzone informacje */}
      {expandedProperty === property._id && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          {property.plotArea && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Powierzchnia działki</p>
              <p className="font-semibold text-gray-900">{property.plotArea} m²</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Pokoje</p>
              <p className="font-semibold text-gray-900">{property.rooms || 'Brak danych'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Stan</p>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                property.status === 'do zamieszkania' ? 'bg-green-100 text-green-800' :
                property.status === 'do remontu' ? 'bg-red-100 text-red-800' :
                property.status === 'w budowie' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {property.status}
              </span>
            </div>
          </div>

          {property.description && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Opis</p>
              <p className="text-gray-700">{property.description}</p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Historia cen</h4>
            <div className="price-history-chart">
              <PriceHistoryChart propertyId={property._id} />
            </div>
          </div>

          {property.sourceUrl && (
            <a 
              href={property.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Zobacz ogłoszenie →
            </a>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefreshProperty(property._id);
              }}
              className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
              disabled={!property.sourceUrl}
            >
              Odśwież dane
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(property);
              }}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Edytuj
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(property._id);
              }}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              Usuń
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
))}
            </div>
        
        )}
        
      </div>  
   </main>
  </div>
);
}

export default App;
  
