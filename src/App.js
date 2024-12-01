// ===== SEGMENT 1: IMPORTY I INICJALIZACJA =====
import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, Search, Home, RefreshCw, Settings, LogOut, Map, Grid, Mail } from 'lucide-react';
import PropertyForm from './components/PropertyForm';
import PropertyEditForm from './components/PropertyEditForm';
import Login from './components/Login';
import Register from './components/Register';
import PriceHistoryChart from './components/PriceHistoryChart';
import InvitationsView from './components/InvitationsView';
import BoardSharing from './components/BoardSharing';

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
  const [showInvitations, setShowInvitations] = useState(false);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [boards, setBoards] = useState([]);
  const [sharedBoards, setSharedBoards] = useState([]);
  const [isShareBoardVisible, setIsShareBoardVisible] = useState(false);
  // ===== SEGMENT 2: EFEKTY =====
  useEffect(() => {
  const fetchBoards = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://houseapp-backend.onrender.com/api/boards', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBoards(data.boards);
        setSharedBoards(data.sharedBoards);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania tablic:', error);
    }
  };
  fetchBoards();
}, []);
  //Funkcja przenoszenia,kopiowania
  const handleMoveProperty = async (propertyId, targetBoardId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${propertyId}/move`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetBoardId }),
    });

    if (response.ok) {
      alert('Nieruchomość została przeniesiona');
      fetchProperties(); // Odśwież listę nieruchomości
    } else {
      const data = await response.json();
      alert(data.error || 'Nie udało się przenieść nieruchomości');
    }
  } catch (error) {
    console.error('Błąd podczas przenoszenia nieruchomości:', error);
  }
};

const handleCopyProperty = async (propertyId, targetBoardId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${propertyId}/copy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetBoardId }),
    });

    if (response.ok) {
      alert('Nieruchomość została skopiowana');
      fetchProperties(); // Odśwież listę nieruchomości
    } else {
      const data = await response.json();
      alert(data.error || 'Nie udało się skopiować nieruchomości');
    }
  } catch (error) {
    console.error('Błąd podczas kopiowania nieruchomości:', error);
  }
};
  
 useEffect(() => {
  if (!isAuthenticated) return;

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://houseapp-backend.onrender.com/api/boards/default', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      console.log('Odpowiedź z API:', response);
      if (response.ok) {
        const data = await response.json();
        setCurrentBoard(data);
      } else {
        const errorText = await response.text();
        console.error('Błąd podczas pobierania tablicy domyślnej:', errorText);
      }
    } catch (error) {
      console.error('Błąd sieci:', error);
    }
  };

  fetchData();
}, [isAuthenticated]);
  
  useEffect(() => {
  // Sprawdź czy jest URL w parametrach
  const queryParams = new URLSearchParams(window.location.search);
  const urlParam = queryParams.get('url');
  
  if (urlParam && isAuthenticated) {
    // Ustaw URL w formularzu
    setUrl(urlParam);
    // Pokaż formularz
    setIsFormVisible(true);
    // Przewiń do formularza
    window.scrollTo(0, 0);
  }
}, [isAuthenticated]);
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
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
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
    console.log('Wysyłam URL:', url); // dla debugowania
    const response = await fetch('https://houseapp-backend.onrender.com/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ url: url }) // upewnij się, że wysyłasz obiekt z property url
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
      credentials: 'include',
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
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
      credentials: 'include',
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
  <div className="min-h-screen bg-gray-50">
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
          
         <button
        onClick={() => setShowInvitations(!showInvitations)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
      >
        <Mail className="h-4 w-4" />
        <span>Zaproszenia</span>
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
{/* Przełącznik między tablicami */}
<div className="flex justify-center gap-4 my-4">
  <button
    onClick={() => setBoardViewType('own')}
    className={`px-4 py-2 rounded-lg ${boardViewType === 'own' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
  >
    Moje Tablice
  </button>
  <button
    onClick={() => setBoardViewType('shared')}
    className={`px-4 py-2 rounded-lg ${boardViewType === 'shared' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
  >
    Udostępnione Tablice
  </button>
</div>
    {/* Search bar */}
    <div className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-grow">
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
              {isFiltersVisible ? 'Ukryj filtry' : 'Pokaż filtry'}
            </button>
            //Udostepnianie przycisk
            <div className="flex items-center gap-4">
  <button
    onClick={() => setIsShareBoardVisible(true)}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    Udostępnij Tablicę
  </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {viewMode === 'grid' ? (
                <>
                  <Map className="h-4 w-4" />
                  <span>Pokaż mapę</span>
                </>
              ) : (
                <>
                  <Grid className="h-4 w-4" />
                  <span>Pokaż listę</span>
                </>
              )}
            </button>

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

    {/* Main content */}
    <main className="flex-1 py-6">
      <div className="max-w-7xl mx-auto px-4">
      {/* Panel zaproszeń */}
    {showInvitations && (
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Zaproszenia do tablic</h2>
          </div>
          <div className="p-4">
            <InvitationsView />
          </div>
        </div>
      </div>
    )}
        {/* Formularz dodawania */}
        {isFormVisible && (
          <div className="mb-6">
            <PropertyForm
              onSubmit={handleScrape}
              isLoading={isLoading}
              url={url}
              setUrl={setUrl}
            />
          </div>
        )}

        {/* Formularz edycji */}
        {editingProperty && (
          <div ref={editFormRef} className="mb-6">
            <PropertyEditForm
              property={editingProperty}
              onSave={handleSaveEdit}
              onCancel={() => setEditingProperty(null)}
            />
          </div>
        )}
{isShareBoardVisible && (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold mb-4">Udostępnij Tablicę</h2>
      <BoardSharing
        boardId={currentBoard?._id}
        onClose={() => setIsShareBoardVisible(false)}
      />
    </div>
  </div>
)}
        {/* Lista tablic */}
<BoardsList
  boards={boardViewType === 'own' ? boards : sharedBoards}
  currentBoard={currentBoard}
  setCurrentBoard={setCurrentBoard}
/>

{/* Lista nieruchomości */}
<div className="max-w-7xl mx-auto px-4 py-6">
  {isLoadingProperties ? (
    <p>Ładowanie nieruchomości...</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <div key={property._id} className="bg-white shadow-md rounded-lg p-4">
          {/* Szczegóły nieruchomości */}
        </div>
      ))}
    </div>
  )}
</div>

            {isFiltersVisible && (
  <div className="bg-white p-4 rounded-lg shadow mb-4">
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

     

      <div className="md:col-span-3 flex justify-end mt-4">
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
 <div className="md:col-span-3 border-t pt-4 mt-4">
        <BoardSharing boardId={currentBoard?._id} />
      </div>
            {/* Przełączanie między mapą a listą */}
            {viewMode === 'map' ? (
  <MapView 
    properties={getFilteredAndSortedProperties()} 
    setExpandedProperty={setExpandedProperty}
  />
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
      {/* Nagłówek nieruchomości */}
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
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRating(property._id, 'favorite');
          }}
          className={`p-2 rounded-lg transition-colors ${
            property.rating === 'favorite' 
              ? 'bg-yellow-100 text-yellow-600' 
              : 'bg-gray-100'
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
              ? 'bg-green-100 text-green-600' 
              : 'bg-gray-100'
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
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-100'
          }`}
          title="Niezainteresowany"
        >
          👎
        </button>
      </div>

      {/* Funkcje przenoszenia i kopiowania */}
      <label htmlFor={`move-${property._id}`} className="block mt-2 text-sm font-medium text-gray-700">
        Przenieś do:
      </label>
      <select
        id={`move-${property._id}`}
        onChange={(e) => handleMoveProperty(property._id, e.target.value)}
        defaultValue=""
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="">Wybierz tablicę...</option>
        {boards.map((board) => (
          <option key={board._id} value={board._id}>
            {board.name}
          </option>
        ))}
      </select>

      <button
        onClick={() => handleCopyProperty(property._id, currentBoard?._id)}
        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Skopiuj do tej tablicy
      </button>

      {/* Rozszerzone informacje */}
      {expandedProperty === property._id && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          <p className="text-gray-700">{property.description || 'Brak opisu'}</p>
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

          {/* Przyciski edycji i usuwania */}
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
        )}
      </div>
    </main>
  </div>
);
}

export default App;


  
