import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu as MenuIcon, // Zmieniona nazwa z Menu na MenuIcon
  Search, 
  Home, 
  RefreshCw, 
  Settings, 
  LogOut, 
  Map, 
  Grid, 
  Mail,
  Share,
  MoreVertical,
} from 'lucide-react';

import PropertyForm from './components/PropertyForm';
import PropertyEditForm from './components/PropertyEditForm';
import Login from './components/Login';
import Register from './components/Register';
import PriceHistoryChart from './components/PriceHistoryChart';
import InvitationsView from './components/InvitationsView';
import BoardSharing from './components/BoardSharing';
import MapView from './components/MapView';
import { Menu, MenuButton, MenuItem, MenuList, MenuTrigger, MenuContent } from './components/ui/menu';

function App() {
  // === PODSTAWOWE STANY ===
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
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    areaMin: '',
    areaMax: '',
    status: '',
    rating: '',
  });

  // === STANY AUTORYZACJI ===
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  
  // === STANY UI ===
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  
  // === STANY TABLIC ===
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [boards, setBoards] = useState([]);
  const [sharedBoards, setSharedBoards] = useState([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [propertyToMove, setPropertyToMove] = useState(null);
  const [isBoardSidebarOpen, setIsBoardSidebarOpen] = useState(true);

  const editFormRef = useRef(null);

  // === POMOCNICZE FUNKCJE ===
  const isPropertyShared = (property) => {
    const board = [...boards, ...sharedBoards].find(b => b._id === property.board);
    return board?.owner !== user?._id;
  };

  const getCurrentBoard = () => {
    return selectedBoard || boards[0];
  };
  // === EFEKTY ===
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
          // Ustaw domyślnie pierwszą tablicę jako wybraną
          if (data.boards.length && !selectedBoard) {
            setSelectedBoard(data.boards[0]);
          }
        }
      } catch (error) {
        console.error('Błąd podczas pobierania tablic:', error);
      }
    };
    
    if (isAuthenticated) {
      fetchBoards();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    } else {
      setIsLoadingProperties(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && selectedBoard) {
      fetchBoardProperties(selectedBoard._id);
    }
  }, [isAuthenticated, selectedBoard]);

  // === FUNKCJE FETCHOWANIA DANYCH ===
  const fetchBoardProperties = async (boardId) => {
    try {
      setIsLoadingProperties(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://houseapp-backend.onrender.com/api/boards/${boardId}/properties`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
        
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error('Błąd podczas pobierania nieruchomości:', error);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  // === FUNKCJE OBSŁUGI TABLIC ===
  const handleBoardSelect = (board) => {
    setSelectedBoard(board);
  };

  const handlePropertyMove = async (propertyId, targetBoardId) => {
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
        // Odśwież właściwości na aktualnej tablicy
        await fetchBoardProperties(selectedBoard._id);
        setPropertyToMove(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Nie udało się przenieść nieruchomości');
      }
    } catch (error) {
      console.error('Błąd podczas przenoszenia nieruchomości:', error);
    }
  };

  const handlePropertyCopy = async (propertyId, targetBoardId) => {
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
        await fetchBoardProperties(selectedBoard._id);
      } else {
        const data = await response.json();
        alert(data.error || 'Nie udało się skopiować nieruchomości');
      }
    } catch (error) {
      console.error('Błąd podczas kopiowania nieruchomości:', error);
    }
  };

  // === KOMPONENTY UI ===
  const BoardSidebar = ({ isOpen }) => (
    <div
      className={`fixed left-0 top-16 h-full bg-white shadow-lg transition-all duration-300 z-20
        ${isOpen ? 'w-64' : 'w-0'} overflow-hidden`}
    >
      <div className="p-4">
        <BoardNavigation
          boards={boards}
          sharedBoards={sharedBoards}
          selectedBoard={selectedBoard}
          onBoardSelect={handleBoardSelect}
          onShareClick={(board) => {
            setShareModalOpen(true);
            setSelectedBoard(board);
          }}
        />
      </div>
    </div>
  );

  const PropertyList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {getFilteredAndSortedProperties().map((property) => (
        <PropertyCard
          key={property._id}
          property={property}
          isShared={isPropertyShared(property)}
          onMove={setPropertyToMove}
          onCopy={handlePropertyCopy}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onRate={handleRating}
          onRefresh={handleRefreshProperty}
          isExpanded={expandedProperty === property._id}
          onExpandToggle={() => setExpandedProperty(
            expandedProperty === property._id ? null : property._id
          )}
        />
      ))}
    </div>
  );
  // === KOMPONENT KARTY NIERUCHOMOŚCI ===
 const PropertyCard = ({ 
  property, 
  isShared, 
  onMove, 
  onCopy, 
  onEdit, 
  onDelete, 
  onRate,
  onRefresh,
  isExpanded,
  onExpandToggle
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border-l-4 ${
        isShared ? 'border-l-purple-500' : 'border-l-blue-500'
      } relative`}
      onClick={onExpandToggle}
    >
      <div className="p-4">
        {/* Menu w prawym górnym rogu */}
       <div className="absolute top-2 right-2 z-10">
  <Menu>
    <MenuTrigger>
      <button className="p-1 hover:bg-gray-100 rounded-full">
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </button>
    </MenuTrigger>
    <MenuContent>
      {!isShared && (
        <MenuItem onClick={() => onMove(property)}>
          Przenieś do innej tablicy
        </MenuItem>
      )}
      <MenuItem onClick={() => onCopy(property._id)}>
        Kopiuj do wspólnej tablicy
      </MenuItem>
      <MenuItem onClick={() => onEdit(property)}>
        Edytuj
      </MenuItem>
      {!isShared && (
        <MenuItem onClick={() => onDelete(property._id)} className="text-red-600">
          Usuń
        </MenuItem>
      )}
    </MenuContent>
  </Menu>
</div>
        {/* Podstawowe informacje */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{property.title}</h3>
            <p className="text-sm text-gray-500">{property.location || 'Brak lokalizacji'}</p>
            {isShared && (
              <p className="text-xs text-purple-600 mt-1">
                Udostępnione przez: {property.owner?.name || 'Inny użytkownik'}
              </p>
            )}
          </div>
          <div className="mr-10">
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

        {/* Grid z ceną i powierzchnią */}
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
        <div className="flex justify-end gap-2">
          {!isShared && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRate(property._id, 'favorite');
                }}
                className={`p-2 rounded-lg transition-colors ${
                  property.rating === 'favorite' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}
              >
                ⭐
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRate(property._id, 'interested');
                }}
                className={`p-2 rounded-lg transition-colors ${
                  property.rating === 'interested' ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                👍
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRate(property._id, 'not_interested');
                }}
                className={`p-2 rounded-lg transition-colors ${
                  property.rating === 'not_interested' ? 'bg-red-100' : 'bg-gray-100'
                }`}
              >
                👎
              </button>
            </>
          )}
        </div>

        {/* Rozszerzone informacje */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-700 mb-4">{property.description || 'Brak opisu'}</p>
            
            {property.sourceUrl && (
              <a 
                href={property.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline mb-4"
                onClick={(e) => e.stopPropagation()}
              >
                Zobacz ogłoszenie →
              </a>
            )}
            {!isShared && (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefresh(property._id);
                  }}
                  className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                  disabled={!property.sourceUrl}
                >
                  Odśwież
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
  // === GŁÓWNY RENDER APLIKACJI ===
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">HouseApp</h1>
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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
  onClick={() => setIsBoardSidebarOpen(!isBoardSidebarOpen)}
  className="p-2 hover:bg-gray-100 rounded-lg"
>
  <MenuIcon className="h-5 w-5" /> {/* Zmieniona nazwa z Menu na MenuIcon */}
</button>
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

      {/* Sidebar */}
      <BoardSidebar isOpen={isBoardSidebarOpen} />

      {/* Main content */}
      <main className="pt-16 transition-all duration-300" style={{ 
        marginLeft: isBoardSidebarOpen ? '16rem' : '0' 
      }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Toolbar */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">
                  {selectedBoard?.name || 'Wybierz tablicę'}
                </h1>
                <button
                  onClick={() => setIsFormVisible(!isFormVisible)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isFormVisible ? 'Zamknij' : 'Dodaj nieruchomość'}
                </button>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Szukaj nieruchomości..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Settings className="h-4 w-4" />
                  {isFiltersVisible ? 'Ukryj filtry' : 'Pokaż filtry'}
                </button>

                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'map' : 'grid')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
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
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600"
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

          {/* Content */}
          {selectedBoard ? (
            <>
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

              {viewMode === 'map' ? (
                <MapView 
                  properties={getFilteredAndSortedProperties()} 
                  setExpandedProperty={setExpandedProperty}
                />
              ) : (
                <PropertyList />
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h2 className="text-xl font-medium text-gray-600">
                Wybierz tablicę z menu po lewej stronie
              </h2>
            </div>
          )}
        </div>
      </main>

      {/* Modale */}
      {propertyToMove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Przenieś nieruchomość</h2>
            <div className="space-y-4">
              {boards.map(board => (
                <button
                  key={board._id}
                  onClick={() => {
                    handlePropertyMove(propertyToMove._id, board._id);
                    setPropertyToMove(null);
                  }}
                  className="w-full text-left p-4 rounded-lg hover:bg-gray-50"
                >
                  <p className="font-medium">{board.name}</p>
                  <p className="text-sm text-gray-500">
                    {board._id === selectedBoard?._id ? 'Obecna tablica' : 'Inna tablica'}
                  </p>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setPropertyToMove(null)}
              className="mt-4 w-full p-2 bg-gray-100 rounded-lg"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Udostępnij tablicę</h2>
              <button 
                onClick={() => setShareModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <BoardSharing
              boardId={selectedBoard?._id}
              onClose={() => setShareModalOpen(false)}
            />
          </div>
        </div>
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

      {showInvitations && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Zaproszenia do tablic</h2>
              <button 
                onClick={() => setShowInvitations(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <InvitationsView onClose={() => setShowInvitations(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
