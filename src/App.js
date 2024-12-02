import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu as MenuIcon, 
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
  Plus,
  Trash2,
  Edit2
} from 'lucide-react';
import { Menu, MenuTrigger, MenuContent, MenuItem } from './components/ui/menu';
import PropertyForm from './components/PropertyForm';
import PropertyEditForm from './components/PropertyEditForm';
import Login from './components/Login';
import Register from './components/Register';
import PriceHistoryChart from './components/PriceHistoryChart';
import InvitationsView from './components/InvitationsView';
import BoardSharing from './components/BoardSharing';
import MapView from './components/MapView';

function App() {
  // === STANY APLIKACJI ===
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [boards, setBoards] = useState([]);
  const [sharedBoards, setSharedBoards] = useState([]);
  const [isShareBoardVisible, setIsShareBoardVisible] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [propertyToMove, setPropertyToMove] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isBoardSidebarOpen, setIsBoardSidebarOpen] = useState(true);
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const editFormRef = useRef(null);

  // === EFEKTY ===
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsBoardSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
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

  // === FUNKCJE OBSŁUGI TABLIC ===
  const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setIsAuthenticated(false);
  setUser(null);
  setProperties([]);
  setBoards([]);           // Dodane
  setSharedBoards([]);     // Dodane
  setSelectedBoard(null);
  setExpandedProperty(null);
};
  const BoardSidebar = ({ isOpen }) => (
  <div className={`fixed left-0 top-16 h-full bg-white shadow-lg transition-all duration-300 z-20 
    ${isOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
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
  const handleLogin = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  setIsAuthenticated(true);
  setUser(data.user);
  fetchBoards(); // To automatycznie ustawi pierwszą tablicę jako wybraną
};

const handleRegister = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  setIsAuthenticated(true);
  setUser(data.user);
  fetchBoards(); // To automatycznie ustawi pierwszą tablicę jako wybraną
};
  const isPropertyShared = (property) => {
  if (!property || !property.board) return false;
  const board = boards.find(b => b._id === property.board);
  return board?.owner !== user?._id;
};
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
        if (!selectedBoard && data.boards.length > 0) {
          setSelectedBoard(data.boards[0]);
        }
      }
    } catch (error) {
      console.error('Błąd podczas pobierania tablic:', error);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://houseapp-backend.onrender.com/api/boards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newBoardName }),
      });

      if (response.ok) {
        const newBoard = await response.json();
        setBoards([...boards, newBoard]);
        setNewBoardName('');
        setIsNewBoardModalOpen(false);
        await fetchBoards();
      }
    } catch (error) {
      console.error('Błąd podczas tworzenia tablicy:', error);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę tablicę? Wszystkie nieruchomości zostaną usunięte.')) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://houseapp-backend.onrender.com/api/boards/${boardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setBoards(boards.filter(board => board._id !== boardId));
        if (selectedBoard?._id === boardId) {
          setSelectedBoard(boards[0]);
        }
      }
    } catch (error) {
      console.error('Błąd podczas usuwania tablicy:', error);
    }
  };

  // === FUNKCJE OBSŁUGI NIERUCHOMOŚCI ===
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

  const handleAddProperty = async () => {
    if (!selectedBoard) {
      alert('Najpierw wybierz lub utwórz tablicę, aby dodać nieruchomość.');
      return;
    }

    if (!url) {
      alert('Wprowadź adres URL nieruchomości.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://houseapp-backend.onrender.com/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          url, 
          boardId: selectedBoard._id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Wystąpił błąd podczas pobierania danych.');
      }

      await fetchBoardProperties(selectedBoard._id);
      setUrl('');
      setIsFormVisible(false);
      alert('Nieruchomość została dodana pomyślnie!');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
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
      }
    } catch (error) {
      alert('Wystąpił błąd podczas aktualizacji');
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

  // === OBSŁUGA TABLIC I UDOSTĘPNIANIA ===
  const handleBoardSelect = (board) => {
    setSelectedBoard(board);
    setPropertyToMove(null);
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
        alert('Nieruchomość została skopiowana');
      } else {
        const data = await response.json();
        alert(data.error || 'Nie udało się skopiować nieruchomości');
      }
    } catch (error) {
      console.error('Błąd podczas kopiowania nieruchomości:', error);
    }
  };
  // === FUNKCJE FILTROWANIA I SORTOWANIA ===
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
          case 'price-asc': return (a.price || 0) - (b.price || 0);
          case 'price-desc': return (b.price || 0) - (a.price || 0);
          case 'area-asc': return (a.area || 0) - (b.area || 0);
          case 'area-desc': return (b.area || 0) - (a.area || 0);
          case 'date-asc': return new Date(a.createdAt) - new Date(b.createdAt);
          case 'date-desc': return new Date(b.createdAt) - new Date(a.createdAt);
          default: return 0;
        }
      });
    }

    return filtered;
  };

  // === FUNKCJE ODŚWIEŻANIA ===
  const handleRefreshProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${propertyId}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        await fetchBoardProperties(selectedBoard._id);
        alert(`Zaktualizowano ${data.updated} nieruchomości`);
      }
    } catch (error) {
      console.error('Błąd podczas odświeżania:', error);
      alert('Wystąpił błąd podczas aktualizacji');
    } finally {
      setIsRefreshing(false);
      setRefreshProgress(null);
    }
  };

  // === KOMPONENTY UI ===
  const BoardNavigation = ({ boards, sharedBoards, selectedBoard, onBoardSelect, onShareClick }) => {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Moje tablice</h2>
          <button
            onClick={() => setIsNewBoardModalOpen(true)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
          {boards.map(board => (
            <div 
              key={board._id}
              className={`flex items-center justify-between p-2 rounded-lg ${
                selectedBoard?._id === board._id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <span 
                onClick={() => onBoardSelect(board)}
                className="flex-grow cursor-pointer"
              >
                {board.name}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onShareClick(board)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                >
                  <Share className="w-4 h-4" />
                </button>
                {boards.length > 1 && (
                  <button
                    onClick={() => handleDeleteBoard(board._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {sharedBoards.length > 0 && (
          <>
            <h2 className="font-semibold text-lg mt-6 mb-4">Wspólne tablice</h2>
            <div className="space-y-2">
              {sharedBoards.map(board => (
                <div
                  key={board._id}
                  onClick={() => onBoardSelect(board)}
                  className={`p-2 rounded-lg cursor-pointer ${
                    selectedBoard?._id === board._id ? 'bg-purple-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{board.name}</span>
                    <span className="text-sm text-purple-600">
                      {board.owner.name || board.owner.email}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Zmodyfikowany PropertyCard z lepszym wsparciem dla wersji mobilnej
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
        } relative transition-all duration-300`}
        onClick={onExpandToggle}
      >
        <div className="p-4">
          {/* Menu w prawym górnym rogu */}
          <div className="absolute top-2 right-2 z-10">
            <Menu>
              <MenuTrigger>
                <button 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={e => e.stopPropagation()}
                >
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
                  Kopiuj do tablicy
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
          <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-3">
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-900 pr-8">{property.title}</h3>
              <p className="text-sm text-gray-500">{property.location || 'Brak lokalizacji'}</p>
              {isShared && (
                <p className="text-xs text-purple-600 mt-1">
                  Udostępnione przez: {property.owner?.name || 'Inny użytkownik'}
                </p>
              )}
            </div>
            <div className="self-start">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                property.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
{property.isActive ? 'Aktywne' : 'Nieaktywne'}
              </span>
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

          {/* Przyciski oceny - responsywne */}
          <div className="flex justify-end gap-2">
            {!isShared && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRate(property._id, 'favorite');
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    property.rating === 'favorite' 
                      ? 'bg-yellow-100 hover:bg-yellow-200' 
                      : 'bg-gray-100 hover:bg-gray-200'
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
                    property.rating === 'interested' 
                      ? 'bg-green-100 hover:bg-green-200' 
                      : 'bg-gray-100 hover:bg-gray-200'
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
                    property.rating === 'not_interested' 
                      ? 'bg-red-100 hover:bg-red-200' 
                      : 'bg-gray-100 hover:bg-gray-200'
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
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                {property.description || 'Brak opisu'}
              </p>
              
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
                    className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
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
  // Modal dodawania nowej tablicy
  const NewBoardModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-lg font-bold mb-4">Nowa tablica</h2>
        <input
          type="text"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          placeholder="Nazwa tablicy"
          className="w-full p-2 border rounded-lg mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsNewBoardModalOpen(false)}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Anuluj
          </button>
          <button
            onClick={handleCreateBoard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={!newBoardName.trim()}
          >
            Utwórz
          </button>
        </div>
      </div>
    </div>
  );
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <Home className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              HouseApp
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {!isMobile && (
              <button
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Aktualizacja...' : 'Aktualizuj wszystkie'}
              </button>
            )}

            <button
              onClick={() => setShowInvitations(!showInvitations)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Mail className="h-4 w-4" />
              {!isMobile && <span>Zaproszenia</span>}
            </button>

            <div className="flex items-center gap-2">
              {!isMobile && (
                <span className="text-gray-600">{user?.name || user?.email}</span>
              )}
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
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
          {selectedBoard ? (
            <>
              {/* Toolbar */}
<div className="bg-white p-4 rounded-lg shadow mb-6">
  <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-grow">
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
    </div>

    <div className="flex items-center gap-4 flex-wrap">
      {/* Przyciski filtrów */}
      <button
        onClick={() => setIsFiltersVisible(!isFiltersVisible)}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <Settings className="h-4 w-4" />
        {isFiltersVisible ? 'Ukryj filtry' : 'Pokaż filtry'}
      </button>

      {/* Przycisk udostępniania */}
      <button
  onClick={() => setShareModalOpen(true)}  // Na to
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
>
  <Share className="h-4 w-4" />
  Udostępnij Tablicę
</button>

      {/* Przycisk przełączania widoku */}
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

      {/* Dropdown sortowania */}
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

{/* Panel filtrów */}
{isFiltersVisible && (
  <div className="bg-white p-4 rounded-lg shadow mb-6">
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
            {/* Lista nieruchomości */}
{viewMode === 'map' ? (
  <MapView 
    properties={getFilteredAndSortedProperties()} 
    setExpandedProperty={setExpandedProperty}
  />
) : (
  <PropertyList />
)}

{/* Formularz edycji */}
{editingProperty && (
  <div ref={editFormRef}>
    <PropertyEditForm
      property={editingProperty}
      onSave={handleSaveEdit}
      onCancel={() => setEditingProperty(null)}
    />
  </div>
)}

{/* Formularz dodawania nieruchomości */}
{isFormVisible && (
  <div className="bg-white p-4 rounded-lg shadow mb-6">
    <h3 className="text-lg font-semibold">Dodaj nową nieruchomość</h3>
    <input
      type="text"
      placeholder="URL nieruchomości"
      value={url}
      onChange={(e) => setUrl(e.target.value)}
      className="w-full px-4 py-2 border rounded-lg mb-4"
    />
    <button
      onClick={handleAddProperty}
      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      disabled={!url}
    >
      Dodaj nieruchomość
    </button>
  </div>
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
    {isNewBoardModalOpen && <NewBoardModal />}
    {shareModalOpen && selectedBoard && (
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
            boardId={selectedBoard._id}
            onClose={() => setShareModalOpen(false)}
          />
        </div>
      </div>
    )}
    
    {propertyToMove && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-lg font-bold mb-4">Przenieś nieruchomość</h2>
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
