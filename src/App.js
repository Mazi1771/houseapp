// ===== SEGMENT 1: IMPORTY I INICJALIZACJA =====
import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, Search, Home, RefreshCw, Settings, LogOut } from 'lucide-react';
import PropertyForm from './components/PropertyForm';
import PropertyEditForm from './components/PropertyEditForm';
import Login from './components/Login';
import Register from './components/Register';
import PriceHistoryChart from './components/PriceHistoryChart';


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
      
      if (response.ok) {
        const data = await response.json();
        setProperties([data, ...properties]);
        setUrl('');
        setIsFormVisible(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Wystąpił błąd podczas pobierania danych');
      }
    } catch (error) {
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

// ===== SEGMENT 7: RENDER - GŁÓWNY WIDOK APLIKACJI =====
return (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    {/* header */}
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo i tytuł */}
          <div className="flex items-center gap-3">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              HouseApp
            </span>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <button
              onClick={fetchProperties}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Odśwież dane"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
            {isRefreshing ? (
              <span className="text-sm text-gray-600">
                Aktualizacja...
              </span>
            ) : (
              <button
                onClick={handleRefreshAll}
                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Aktualizuj wszystkie
              </button>
            )}
            <div className="h-6 w-px bg-gray-200" />
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                {user?.name || user?.email}
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Wyloguj</span>
            </button>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>

    {/* Mobile menu */}
    {isMobileMenuOpen && (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-lg">
          <button
            onClick={fetchProperties}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
            <span>Odśwież dane</span>
          </button>
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Aktualizuj wszystkie</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Wyloguj</span>
          </button>
        </div>
      </div>
    )}

    {/* Search and controls */}
  <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
    {/* Dodajemy lepszy układ dla mobile */}
    <div className="flex flex-col gap-4">
      {/* Search input i filtry w jednej linii */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Szukaj nieruchomości..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>
      
      {/* Przyciski w drugiej linii */}
      <div className="flex gap-2 justify-between">
        <button
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-2 flex-grow"
        >
          <Settings className="h-5 w-5" />
          {isFiltersVisible ? 'Ukryj filtry' : 'Pokaż filtry'}
        </button>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isFormVisible ? 'Zamknij' : 'Dodaj'}
        </button>
      </div>
    </div>
  </div>
</div>

    {/* Main content */}
     <main className="flex-1 max-w-7xl mx-auto px-4 w-full pt-16">
      {isFormVisible && (
        <PropertyForm
          onSubmit={handleScrape}
          isLoading={isLoading}
          url={url}
          setUrl={setUrl}
        />
      )}

      {editingProperty && (
        <div ref={editFormRef}>
          <PropertyEditForm
            property={editingProperty}
            onSave={handleSaveEdit}
            onCancel={() => setEditingProperty(null)}
          />
        </div>
      )}

         {isLoadingProperties ? (
        <div className="text-center py-4">
          <p>Ładowanie nieruchomości...</p>
        </div>
      ) : (
        <div className="space-y-6">
            {isRefreshing && (
              <div className="bg-blue-50 text-blue-600 p-4 rounded-md">
                Trwa aktualizacja nieruchomości...
                {refreshProgress && (
                  <div className="mt-2">
                    Postęp: {refreshProgress.current}/{refreshProgress.total}
                  </div>
                )}
              </div>
            )}

            {/* Sekcja filtrów */}
            {isFiltersVisible && (
               <div className="bg-white p-4 rounded-lg shadow mb-4 mt-4">
                <div className="grid grid-cols-1 gap-4">
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
            )}

            {/* Lista nieruchomości */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredAndSortedProperties().map((property, index) => (
  <div 
    key={property._id || index} 
    className={`group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 transition-all duration-300
      ${expandedProperty === property._id ? 'col-span-full' : ''}`}
    onClick={() => setExpandedProperty(expandedProperty === property._id ? null : property._id)}
  >
    <div className="p-4">
      {/* Nagłówek karty */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{property.title}</h3>
          <p className="text-sm text-gray-500">{property.location || 'Brak lokalizacji'}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Status aktywności */}
          {property.isActive === false ? (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              Nieaktywne
            </span>
          ) : (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              Aktywne
            </span>
          )}
          {/* Przycisk rozwijania */}
          <button 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              setExpandedProperty(expandedProperty === property._id ? null : property._id);
            }}
          >
            {expandedProperty === property._id ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Podstawowe informacje */}
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

      {/* Przyciski oceny */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRating(property._id, 'favorite');
          }}
          className={`p-2 rounded-lg transition-colors ${
            property.rating === 'favorite' 
              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
              : 'bg-gray-100 hover:bg-gray-200'
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
            property.rating === 'interested' 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : 'bg-gray-100 hover:bg-gray-200'
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
            property.rating === 'not_interested' 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title="Niezainteresowany"
        >
          👎
        </button>
      </div>

      {/* Rozszerzone informacje */}
      {expandedProperty === property._id && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {property.plotArea && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Powierzchnia działki</p>
                <p className="font-semibold text-gray-900">{property.plotArea} m²</p>
              </div>
            )}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Pokoje</p>
              <p className="font-semibold text-gray-900">{property.rooms || 'Brak danych'}</p>
            </div>
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

          {/* Przyciski akcji */}
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
          </div>
        )}
      </div>
    </main>
  </div>
);
}

export default App;
  
