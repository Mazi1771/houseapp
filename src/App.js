import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu as MenuIcon, 
  MapPin,
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
  Edit2,
  Copy,
  ArrowRight,
  Check,  // Dodane
  Scale
} from 'lucide-react';
import { Menu, MenuTrigger, MenuContent, MenuItem } from './components/ui/menu.jsx';
import PropertyForm from './components/PropertyForm';
import PropertyEditForm from './components/PropertyEditForm';
import Login from './components/Login';
import Register from './components/Register';
import PriceHistoryChart from './components/PriceHistoryChart';
import InvitationsView from './components/InvitationsView';
import BoardSharing from './components/BoardSharing';
import MapView from './components/MapView';


const BoardNavigation = ({ boards, sharedBoards, selectedBoard, onBoardSelect, onShareClick, setIsNewBoardModalOpen  }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Moje tablice</h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsNewBoardModalOpen(true);
          }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full flex items-center justify-center"
          aria-label="Dodaj nową tablicę"
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
const BoardSidebar = ({ 
  isOpen, 
  boards = [], // dodaj wartość domyślną
  sharedBoards = [], // dodaj wartość domyślną
  selectedBoard,
  onBoardSelect,
  onShareClick,
  setIsNewBoardModalOpen
}) => (
  <div className={`fixed left-0 top-16 h-full bg-white shadow-lg transition-all duration-300 z-20 
    ${isOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
    <div className="p-4">
      <BoardNavigation
        boards={boards}
        sharedBoards={sharedBoards}
        selectedBoard={selectedBoard}
        onBoardSelect={onBoardSelect}
        onShareClick={onShareClick}
        setIsNewBoardModalOpen={setIsNewBoardModalOpen}
      />
    </div>
  </div>
);

function App() {
  // === STANY APLIKACJI ===
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
const [comparisonMode, setComparisonMode] = useState(false);
const [selectedForComparison, setSelectedForComparison] = useState([]);
const [showComparisonModal, setShowComparisonModal] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
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
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
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
  const [addMethod, setAddMethod] = useState('url');
const [manualForm, setManualForm] = useState({
  title: '',
  price: '',
  area: '',
  location: '',
  status: '',
  description: '',
});
  
  const editFormRef = useRef(null);
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newBoardName.trim()) {
      handleCreateBoard();
    }
  };

  // === EFEKTY ===
useEffect(() => {
    // Ustaw menu jako domyślnie schowane na mobile
    const isMobile = window.innerWidth <= 768;
    setIsBoardSidebarOpen(!isMobile);
}, []);
  useEffect(() => {
    initializeUserSession();
}, []); 
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

 // Dodaj nowy efekt do zapamiętywania wybranej tablicy
useEffect(() => {
  if (selectedBoard) {
    localStorage.setItem('selectedBoard', JSON.stringify(selectedBoard));
  }
}, [selectedBoard]);

// Zmodyfikuj efekt inicjalizacji
useEffect(() => {
    const initializeApp = async () => {
        console.log('Inicjalizacja aplikacji...');
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        console.log('Stan początkowy:', { token: !!token, savedUser });

        if (token && savedUser) {
            try {
                // Ustawiamy stan autentykacji
                setIsAuthenticated(true);
                setUser(JSON.parse(savedUser));
                setIsLoadingProperties(true);

                // Pobieramy tablice
                const boardsResponse = await fetch('https://houseapp-backend.onrender.com/api/boards', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (boardsResponse.ok) {
                    const boardsData = await boardsResponse.json();
                    console.log('Pobrane tablice:', boardsData);

                    setBoards(boardsData.boards);
                    setSharedBoards(boardsData.sharedBoards);

                    // Sprawdzamy czy jest zapisana aktywna tablica
                    const savedBoardId = localStorage.getItem('selectedBoardId');
                    const allBoards = [...boardsData.boards, ...boardsData.sharedBoards];
                    
                    let boardToSelect;
                    
                    if (savedBoardId) {
                        // Próbujemy znaleźć zapisaną tablicę
                        boardToSelect = allBoards.find(board => board._id === savedBoardId);
                    }
                    
                    // Jeśli nie znaleźliśmy zapisanej tablicy, bierzemy pierwszą dostępną
                    if (!boardToSelect && allBoards.length > 0) {
                        boardToSelect = allBoards[0];
                    }

                    if (boardToSelect) {
                        console.log('Wybrana tablica:', boardToSelect);
                        setSelectedBoard(boardToSelect);
                        localStorage.setItem('selectedBoardId', boardToSelect._id);

                        // Pobieramy nieruchomości dla wybranej tablicy
                        const propertiesResponse = await fetch(
                            `https://houseapp-backend.onrender.com/api/boards/${boardToSelect._id}/properties`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                        if (propertiesResponse.ok) {
                            const propertiesData = await propertiesResponse.json();
                            console.log('Pobrane nieruchomości:', propertiesData);
                            setProperties(propertiesData);
                        } else {
                            console.error('Błąd podczas pobierania nieruchomości:', propertiesResponse.status);
                            setProperties([]);
                        }
                    }
                } else if (boardsResponse.status === 401) {
                    // Token wygasł
                    console.log('Token wygasł - wylogowuję...');
                    handleLogout();
                }
            } catch (error) {
                console.error('Błąd podczas inicjalizacji:', error);
            } finally {
                setIsLoadingProperties(false);
            }
        } else {
            console.log('Brak danych autoryzacji');
            setIsLoadingProperties(false);
        }
    };

    initializeApp();
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
    localStorage.removeItem('selectedBoardId');
    setIsAuthenticated(false);
    setUser(null);
    // Nie czyścimy tablic i nieruchomości - zostaną zaktualizowane przy następnym logowaniu
};
  
const handleLogin = async (data) => {
    setIsLoadingAuth(true);
    try {
        // Zapisz dane autentykacji
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setUser(data.user);

        // Ustaw menu jako schowane na urządzeniach mobilnych
        if (window.innerWidth <= 768) {
            setIsBoardSidebarOpen(false);
        }
        
        // Pobierz tablice użytkownika
        const response = await fetch('https://houseapp-backend.onrender.com/api/boards', {
            headers: {
                'Authorization': `Bearer ${data.token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            const boardsData = await response.json();
            console.log('Pobrane tablice:', boardsData);
            
            setBoards(boardsData.boards);
            setSharedBoards(boardsData.sharedBoards || []);
            
            // Jeśli są tablice, wybierz pierwszą
            if (boardsData.boards && boardsData.boards.length > 0) {
                const firstBoard = boardsData.boards[0];
                setSelectedBoard(firstBoard);
                localStorage.setItem('selectedBoardId', firstBoard._id);
                
                // Pobierz nieruchomości dla pierwszej tablicy
                try {
                    await fetchBoardProperties(firstBoard._id);
                } catch (error) {
                    console.error('Błąd podczas pobierania nieruchomości:', error);
                }
            }

            // Schowaj loader
            setIsLoadingProperties(false);
        } else {
            throw new Error('Błąd podczas pobierania tablic');
        }
    } catch (error) {
        console.error('Błąd podczas logowania:', error);
        alert('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
    } finally {
        setIsLoadingAuth(false);
        setIsLoadingProperties(false);
    }
};

const handleRegister = (data) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  setIsAuthenticated(true);
  setUser(data.user);
  fetchBoards(); // To automatycznie ustawi pierwszą tablicę jako wybraną
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
      console.log('Pobrane tablice:', data); // Dodajemy log
      setBoards(data.boards);
      setSharedBoards(data.sharedBoards);
      if (!selectedBoard && data.boards.length > 0) {
        setSelectedBoard(data.boards[0]);
      }
    } else {
      console.error('Błąd pobierania tablic:', response.status);
      // Jeśli token wygasł, wyloguj użytkownika
      if (response.status === 401) {
        handleLogout();
      }
    }
  } catch (error) {
    console.error('Błąd podczas pobierania tablic:', error);
  }
};

  const handleCreateBoard = async () => {
  if (!newBoardName.trim()) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://houseapp-backend.onrender.com/api/boards', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newBoardName }),
    });

    if (!response.ok) {
      throw new Error('Błąd podczas tworzenia tablicy');
    }

    const newBoard = await response.json();
    console.log('Nowa tablica utworzona:', newBoard);

    // Najpierw aktualizujemy tablice
    setBoards(prevBoards => [...prevBoards, newBoard]);
    
    // Potem ustawiamy nową tablicę jako wybraną
    setSelectedBoard(newBoard);
    
    // Czyścimy stan
    setNewBoardName('');
    setIsNewBoardModalOpen(false);

    return newBoard; // Zwracamy nową tablicę
  } catch (error) {
    console.error('Błąd podczas tworzenia tablicy:', error);
    alert('Nie udało się utworzyć tablicy');
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
const handleManualAdd = async (e) => {
  e.preventDefault();
  
  if (!selectedBoard) {
    alert('Najpierw wybierz lub utwórz tablicę, aby dodać nieruchomość.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    // Zmieniamy endpoint na endpoint tablicy
    const response = await fetch(`https://houseapp-backend.onrender.com/api/boards/${selectedBoard._id}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...manualForm,
        price: parseInt(manualForm.price, 10),
        area: parseFloat(manualForm.area),
        isActive: true,
        source: 'manual',
        lastChecked: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Szczegóły błędu:', errorData);
      throw new Error(errorData.error || 'Błąd podczas dodawania nieruchomości');
    }

    const newProperty = await response.json();
    console.log('Dodano nową nieruchomość:', newProperty);

    // Odświeżamy listę nieruchomości
    await fetchBoardProperties(selectedBoard._id);

    // Resetujemy formularz
    setManualForm({
      title: '',
      price: '',
      area: '',
      location: '',
      status: '',
      description: '',
    });
    setIsFormVisible(false);
    alert('Nieruchomość została dodana pomyślnie!');
  } catch (error) {
    console.error('Błąd:', error);
    alert(`Wystąpił błąd: ${error.message}`);
  }
};
const fetchBoardProperties = async (boardId) => {
    if (!boardId) return;
    
    try {
        setIsLoadingProperties(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch(`https://houseapp-backend.onrender.com/api/boards/${boardId}/properties`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Pobrane właściwości:', data);

        setProperties(data);
    } catch (error) {
        console.error('Błąd podczas pobierania właściwości:', error);
        setProperties([]);
    } finally {
        setIsLoadingProperties(false);
    }
};
const handleAddProperty = async () => {
  // Sprawdzenie czy tablica jest wybrana i istnieje
  if (!selectedBoard?._id) {
    alert('Najpierw wybierz lub utwórz tablicę, aby dodać nieruchomość.');
    return;
  }

  // Sprawdzenie czy tablica istnieje w liście tablic
  const boardExists = boards.some(board => board._id === selectedBoard._id);
  if (!boardExists) {
    alert('Wybrana tablica nie istnieje. Odśwież stronę lub wybierz inną tablicę.');
    return;
  }

  if (!url) {
    alert('Wprowadź adres URL nieruchomości.');
    return;
  }

  setIsLoading(true);
  try {
    const token = localStorage.getItem('token');
    console.log('Próba dodania nieruchomości do tablicy:', selectedBoard._id);
    
    // Przygotowanie danych do wysłania
    const requestData = {
      url,
      boardId: selectedBoard._id
    };
    console.log('Wysyłane dane:', requestData);

    const response = await fetch('https://houseapp-backend.onrender.com/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();
    console.log('Odpowiedź z serwera:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Wystąpił błąd podczas dodawania nieruchomości');
    }

    console.log('Nieruchomość została dodana:', data);

    // Bezpośrednie dodanie nowej nieruchomości do stanu
    setProperties(prevProperties => [...prevProperties, data]);

    // Resetowanie filtrów dla pewności, że nowa nieruchomość będzie widoczna
    setFilters({
      priceMin: '',
      priceMax: '',
      areaMin: '',
      areaMax: '',
      status: '',
      rating: '',
    });

    // Czyszczenie formularza i zamknięcie
    setUrl('');
    setIsFormVisible(false);

    // Odświeżenie listy nieruchomości po małym opóźnieniu
    setTimeout(async () => {
      try {
        await fetchBoardProperties(selectedBoard._id);
        console.log('Lista nieruchomości została odświeżona');
      } catch (refreshError) {
        console.error('Błąd podczas odświeżania listy:', refreshError);
      }
    }, 1000);

    // Powiadomienie użytkownika
    alert('Nieruchomość została dodana pomyślnie!');

  } catch (error) {
    console.error('Szczegółowy błąd podczas dodawania:', error);
    alert(`Błąd: ${error.message}`);
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
        
        // Upewnij się, że mamy dostęp do edytowanej nieruchomości
        if (!editingProperty) {
            throw new Error('Brak edytowanej nieruchomości');
        }

        const dataToUpdate = {
            title: updatedData.title,
            price: parseInt(updatedData.price),
            area: parseFloat(updatedData.area),
            location: updatedData.location,
            description: updatedData.description,
            status: updatedData.status,
            rooms: updatedData.rooms !== undefined ? parseInt(updatedData.rooms) : null
        };

        console.log('Wysyłane dane:', dataToUpdate);

        const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${editingProperty._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dataToUpdate)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Błąd podczas aktualizacji');
        }

        const responseData = await response.json();
        console.log('Odpowiedź z serwera:', responseData);

        // Aktualizuj stan lokalnie
        setProperties(prevProperties => 
            prevProperties.map(p => 
                p._id === editingProperty._id ? responseData : p
            )
        );

        setEditingProperty(null);
        alert('Zmiany zostały zapisane pomyślnie!');

    } catch (error) {
        console.error('Błąd podczas aktualizacji:', error);
        alert(`Wystąpił błąd: ${error.message}`);
    }
};
 const handleDelete = async (propertyId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę nieruchomość?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${propertyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Nie udało się usunąć nieruchomości');
        }

        // Aktualizuj stan lokalnie
        setProperties(prevProperties => 
            prevProperties.filter(property => property._id !== propertyId)
        );

        // Zamknij rozwinięty widok jeśli był otwarty
        if (expandedProperty === propertyId) {
            setExpandedProperty(null);
        }

        alert('Nieruchomość została usunięta pomyślnie');

    } catch (error) {
        console.error('Błąd podczas usuwania:', error);
        alert('Wystąpił błąd podczas usuwania nieruchomości');
    }
};

const handleRating = async (propertyId, newRating) => {
    let currentProperty = null;
    let originalRating = null;

    try {
        console.log('Aktualizacja oceny:', { propertyId, newRating });
        const token = localStorage.getItem('token');
        
        // Znajdź aktualną nieruchomość i zapisz jej stan
        currentProperty = properties.find(p => p._id === propertyId);
        if (!currentProperty) {
            throw new Error('Nie znaleziono nieruchomości');
        }

        // Zapisz oryginalną ocenę przed zmianą
        originalRating = currentProperty.rating;
        
        // Natychmiastowa aktualizacja UI
        setProperties(prevProperties => 
            prevProperties.map(p => 
                p._id === propertyId 
                    ? { ...p, rating: newRating }
                    : p
            )
        );

        const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${propertyId}/rating`, {
            method: 'PUT', // Zmienione z PATCH na PUT
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating: newRating })
        });

        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }

        const updatedProperty = await response.json();
        console.log('Odpowiedź z serwera:', updatedProperty);

        // Aktualizuj stan finalną wersją z serwera
        setProperties(prevProperties => 
            prevProperties.map(p => 
                p._id === propertyId ? updatedProperty : p
            )
        );

    } catch (error) {
        console.error('Błąd podczas aktualizacji oceny:', error);
        
        // Przywróć poprzedni stan
        if (originalRating !== null) {
            setProperties(prevProperties => 
                prevProperties.map(p => 
                    p._id === propertyId 
                        ? { ...p, rating: originalRating }
                        : p
                )
            );
        }
        
        alert('Wystąpił błąd podczas zapisywania oceny');
    }
};

  // === OBSŁUGA TABLIC I UDOSTĘPNIANIA ===
   // Dodaj nową funkcję inicjalizacji
const initializeUserSession = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedBoardId = localStorage.getItem('selectedBoardId');

    if (token && savedUser) {
        setIsLoadingProperties(true);
        try {
            setIsAuthenticated(true);
            setUser(JSON.parse(savedUser));

            const response = await fetch('https://houseapp-backend.onrender.com/api/boards', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Pobrane dane:', data);

            if (data.boards) {
                setBoards(data.boards);
                setSharedBoards(data.sharedBoards || []);

                // Znajdź zapisaną tablicę lub użyj pierwszej dostępnej
                let boardToSelect = null;
                if (savedBoardId) {
                    boardToSelect = [...data.boards, ...(data.sharedBoards || [])]
                        .find(board => board._id === savedBoardId);
                }
                if (!boardToSelect && data.boards.length > 0) {
                    boardToSelect = data.boards[0];
                }

                if (boardToSelect) {
                    setSelectedBoard(boardToSelect);
                    localStorage.setItem('selectedBoardId', boardToSelect._id);
                    await fetchBoardProperties(boardToSelect._id);
                }
            }
        } catch (error) {
            console.error('Błąd podczas inicjalizacji sesji:', error);
            if (error.message.includes('401')) {
                handleLogout();
            }
        } finally {
            setIsLoadingProperties(false);
        }
    } else {
        setIsLoadingProperties(false);
    }
};
  const handleBoardSelect = async (board) => {
    setSelectedBoard(board);
    localStorage.setItem('selectedBoardId', board._id);
    // Schowaj menu po wyborze tablicy na mobile
    if (window.innerWidth <= 768) {
        setIsBoardSidebarOpen(false);
    }
    await fetchBoardProperties(board._id);
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
  console.log('Wszystkie nieruchomości:', properties);
  console.log('Aktualne filtry:', filters);

  let filtered = properties.filter(property => {
    console.log('Sprawdzanie nieruchomości:', property);

    const matchesPrice = (!filters.priceMin || property.price >= Number(filters.priceMin)) &&
                        (!filters.priceMax || property.price <= Number(filters.priceMax));
                        
    const matchesArea = (!filters.areaMin || property.area >= Number(filters.areaMin)) &&
                       (!filters.areaMax || property.area <= Number(filters.areaMax));
                       
    const matchesStatus = !filters.status || property.status === filters.status;
    const matchesRating = !filters.rating || property.rating === filters.rating;

    const matches = matchesPrice && matchesArea && matchesStatus && matchesRating;
    console.log('Czy pasuje do filtrów:', matches);

    return matches;
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

  console.log('Przefiltrowane i posortowane nieruchomości:', filtered);
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
    onExpandToggle, 
    user,
    // Nowe props
    comparisonMode,
    isSelectedForComparison,
    onComparisonToggle
}) => {
    const userId = user?._id || user?.id;
    const addedByCurrentUser = userId && property.addedBy && 
        (property.addedBy._id === userId || property.addedBy.id === userId);
    const canEditProperty = !isShared || addedByCurrentUser;
    const canDeleteProperty = !isShared || addedByCurrentUser;

    return (
        <div 
            className={`relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 
                ${isSelectedForComparison ? 'ring-2 ring-blue-500' : ''}`}
            onClick={onExpandToggle}
        >
            {/* Przycisk porównywania - widoczny tylko w trybie porównywania */}
            {comparisonMode && (
                <button
                    onClick={onComparisonToggle}
                    className={`absolute top-2 right-2 z-50 p-2 rounded-full transition-colors ${
                        isSelectedForComparison 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <Check className="w-4 h-4" />
                </button>
            )}

            <div className="flex flex-col h-full">
                {/* Górny pasek gradientowy */}
                <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"/>

                <div className="p-4">
                    {/* Nagłówek z menu */}
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg text-gray-900 pr-8">{property.title}</h3>
                        <Menu>
                            <MenuTrigger>
                                <button 
                                    className="p-1.5 hover:bg-gray-100 rounded-full"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <MoreVertical className="w-5 h-5 text-gray-500" />
                                </button>
                            </MenuTrigger>
                            <MenuContent>
                                {(canEditProperty || canDeleteProperty) && (
                                    <>
                                        <MenuItem 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMove(property);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="w-4 h-4" />
                                                Przenieś do innej tablicy
                                            </div>
                                        </MenuItem>
                                        <MenuItem 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Czy na pewno chcesz usunąć tę nieruchomość?')) {
                                                    onDelete(property._id);
                                                }
                                            }}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Trash2 className="w-4 h-4" />
                                                Usuń
                                            </div>
                                        </MenuItem>
                                    </>
                                )}
                                <MenuItem 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCopy(property._id);
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Copy className="w-4 h-4" />
                                        Kopiuj do tablicy
                                    </div>
                                </MenuItem>
                            </MenuContent>
                        </Menu>
                    </div>

                    {/* Lokalizacja i status */}
                    <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{property.location || 'Brak lokalizacji'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Home className="w-4 h-4" />
                            <span className="text-sm">{property.status}</span>
                        </div>
                    </div>

                    {/* Cena i powierzchnia */}
                    <div className="mt-4 flex items-center gap-4">
                        <div className="text-blue-600">
                            <span className="text-2xl font-bold">
                                {property.price?.toLocaleString()}
                            </span>
                            <span className="text-sm ml-1">PLN</span>
                        </div>
                        <div className="text-gray-600">
                            <span className="text-lg font-semibold">{property.area}</span>
                            <span className="text-sm ml-1">m²</span>
                        </div>
                    </div>

                    {/* Sekcja z przyciskami oceny i akcji */}
                    <div className="flex justify-between items-center mt-4">
                       {/* Przyciski oceny */}
<div className="flex gap-2">
    <button
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const newRating = property.rating === 'favorite' ? null : 'favorite';
            console.log('Kliknięto ocenę favorite:', { currentRating: property.rating, newRating });
            onRate(property._id, newRating);
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
            e.preventDefault();
            e.stopPropagation();
            const newRating = property.rating === 'interested' ? null : 'interested';
            console.log('Kliknięto ocenę interested:', { currentRating: property.rating, newRating });
            onRate(property._id, newRating);
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
            e.preventDefault();
            e.stopPropagation();
            const newRating = property.rating === 'not_interested' ? null : 'not_interested';
            console.log('Kliknięto ocenę not_interested:', { currentRating: property.rating, newRating });
            onRate(property._id, newRating);
        }}
        className={`p-2 rounded-lg transition-colors ${
            property.rating === 'not_interested' 
                ? 'bg-red-100 hover:bg-red-200' 
                : 'bg-gray-100 hover:bg-gray-200'
        }`}
    >
        👎
    </button>
</div>

                        {/* Przyciski akcji */}
                        <div className="flex gap-2">
                            {canEditProperty && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onEdit(property);
                                    }}
                                    className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    Edytuj
                                </button>
                            )}
                            {property.sourceUrl && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onRefresh(property._id);
                                    }}
                                    className="px-3 py-1.5 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    Odśwież
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Rozszerzone informacje */}
                    {isExpanded && (
                        <div className="border-t border-gray-200 p-4">
                            <div className="space-y-4">
                                {/* Opis */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Opis</h4>
                                    <p className="text-gray-600 whitespace-pre-wrap">
                                        {property.description || 'Brak opisu'}
                                    </p>
                                </div>

                                {/* Historia cen */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Historia cen</h4>
                                    <PriceHistoryChart propertyId={property._id} />
                                </div>

                                {/* Link do źródła */}
                                {property.sourceUrl && (
                                    <a
                                        href={property.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline mt-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Zobacz ogłoszenie źródłowe →
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stopka */}
                    <div className="mt-auto border-t border-gray-200 bg-gray-50 p-2">
                        <div className="flex justify-between items-center">
                            <div>
                                {/* Pokazuj informację o autorze tylko jeśli to nie obecny użytkownik */}
                                {property.addedBy && property.addedBy !== user?._id && property.addedByUser && (
                                    <span className="text-xs text-purple-600">
                                        Dodane przez: {property.addedByUser.name || 'Innego użytkownika'}
                                    </span>
                                )}
                            </div>
                            <div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    property.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {property.isActive ? 'Aktywne' : 'Nieaktywne'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
const isPropertyShared = (property) => {
    if (!property || !user) {
        console.log('Brak wymaganych danych:', { property, user });
        return false;
    }

    const userId = user._id || user.id;
    if (!userId) {
        console.log('Brak ID użytkownika:', user);
        return false;
    }

    const board = boards.find(b => b._id === property.board?._id || property.board);
    if (!board) {
        console.log('Nie znaleziono tablicy dla nieruchomości:', property.board);
        return false;
    }

    // Sprawdź czy właściciel tablicy to obecny użytkownik
    const isShared = board.owner?._id !== userId && board.owner !== userId;
    
    console.log('Sprawdzanie współdzielenia:', { 
        boardOwner: board.owner, 
        userId, 
        isShared 
    });
    
    return isShared;
};


const PropertyList = () => {
    const filteredProperties = getFilteredAndSortedProperties();
    console.log('Wyświetlane nieruchomości:', filteredProperties);

    if (filteredProperties.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h2 className="text-xl font-medium text-gray-600">
            Brak nieruchomości na tej tablicy
          </h2>
        </div>
      );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProperties.map((property) => (
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
                    user={user}
                    // Nowe props do porównywania
                    comparisonMode={comparisonMode}
                    isSelectedForComparison={selectedForComparison.some(p => p._id === property._id)}
                    onComparisonToggle={(e) => {
                        e.stopPropagation();
                        if (selectedForComparison.some(p => p._id === property._id)) {
                            setSelectedForComparison(prev => 
                                prev.filter(p => p._id !== property._id)
                            );
                        } else if (selectedForComparison.length < 2) {
                            setSelectedForComparison(prev => [...prev, property]);
                        } else {
                            alert('Możesz porównać maksymalnie 2 nieruchomości');
                        }
                    }}
                />
            ))}
        </div>
    );
};
  // Modal dodawania nowej tablicy
  const NewBoardModal = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div 
      className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
      onClick={(e) => e.stopPropagation()} // Dodane, żeby zapobiec zamykaniu przy kliknięciu w modal
    >
      <h2 className="text-lg font-bold mb-4">Nowa tablica</h2>
     <input
  type="text"
  value={newBoardName}
  onChange={(e) => setNewBoardName(e.target.value)}
  onKeyPress={handleKeyPress}
  placeholder="Nazwa tablicy"
  className="w-full p-2 border rounded-lg mb-4"
  autoFocus
/>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setIsNewBoardModalOpen(false);
            setNewBoardName(''); // Dodane czyszczenie nazwy przy anulowaniu
          }}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Anuluj
        </button>
        <button
          onClick={async () => {
            await handleCreateBoard();
            setIsNewBoardModalOpen(false);
          }}
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
            <h1 className="text-3xl font-bold text-gray-900">Home-Hub</h1>
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
// Dodaj tutaj, zaraz po sprawdzeniu isAuthenticated
  if (isLoadingProperties) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
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
              Home-Hub
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
      <BoardSidebar 
  isOpen={isBoardSidebarOpen} 
  boards={boards}
  sharedBoards={sharedBoards}
  selectedBoard={selectedBoard}
  onBoardSelect={handleBoardSelect}
  onShareClick={(board) => setShareModalOpen(true)}
  setIsNewBoardModalOpen={setIsNewBoardModalOpen}  // Dodaj to
/>

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
    {/* Główny rząd przycisków */}
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Przycisk wyszukiwania */}
        <button
          onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Search className="h-4 w-4" />
          {isSearchExpanded ? 'Ukryj wyszukiwarkę' : 'Wyszukaj'}
        </button>

        {/* Przycisk porównywania */}
        <button
          onClick={() => {
            setComparisonMode(!comparisonMode);
            if (!comparisonMode) {
              setSelectedForComparison([]);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            comparisonMode 
              ? 'bg-orange-600 text-white hover:bg-orange-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Scale className="h-4 w-4" />
          {comparisonMode ? 'Zakończ porównywanie' : 'Porównaj nieruchomości'}
        </button>

        {/* Licznik wybranych do porównania */}
        {comparisonMode && (
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
            Wybrano {selectedForComparison.length}/2 nieruchomości
          </span>
        )}

        {/* Przycisk "Porównaj wybrane" */}
        {selectedForComparison.length === 2 && (
          <button
            onClick={() => setShowComparisonModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <ArrowRight className="h-4 w-4" />
            Porównaj wybrane
          </button>
        )}

        {/* Przycisk filtrów */}
        <button
          onClick={() => setIsFiltersVisible(!isFiltersVisible)}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings className="h-4 w-4" />
          {isFiltersVisible ? 'Ukryj filtry' : 'Pokaż filtry'}
        </button>

        {/* Przycisk widoku mapy */}
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
      </div>

      {/* Przycisk dodawania nieruchomości */}
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
      >
        {isFormVisible ? 'Zamknij' : 'Dodaj nieruchomość'}
      </button>
    </div>

    {/* Panel wyszukiwania */}
    {isSearchExpanded && (
      <div className="pt-4 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pole wyszukiwania */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj po nazwie lub lokalizacji..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Sortowanie */}
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

          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            <option value="">Wszystkie stany</option>
            <option value="do zamieszkania">Do zamieszkania</option>
            <option value="do remontu">Do remontu</option>
            <option value="w budowie">W budowie</option>
            <option value="stan deweloperski">Stan deweloperski</option>
          </select>
        </div>
      </div>
    )}

    {/* Panel filtrów */}
    {isFiltersVisible && (
      <div className="pt-4 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtry ceny */}
          <div>
            <h3 className="font-medium mb-2">Cena (PLN)</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Od"
                value={filters.priceMin}
                onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
                className="w-full rounded-lg border p-2"
              />
              <input
                type="number"
                placeholder="Do"
                value={filters.priceMax}
                onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
                className="w-full rounded-lg border p-2"
              />
            </div>
          </div>

          {/* Filtry powierzchni */}
          <div>
            <h3 className="font-medium mb-2">Powierzchnia (m²)</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Od"
                value={filters.areaMin}
                onChange={(e) => setFilters({...filters, areaMin: e.target.value})}
                className="w-full rounded-lg border p-2"
              />
              <input
                type="number"
                placeholder="Do"
                value={filters.areaMax}
                onChange={(e) => setFilters({...filters, areaMax: e.target.value})}
                className="w-full rounded-lg border p-2"
              />
            </div>
          </div>

          {/* Filtr ocen */}
          <div>
            <h3 className="font-medium mb-2">Ocena</h3>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({...filters, rating: e.target.value})}
              className="w-full rounded-lg border p-2"
            >
              <option value="">Wszystkie</option>
              <option value="favorite">⭐ Ulubione</option>
              <option value="interested">👍 Zainteresowany</option>
              <option value="not_interested">👎 Niezainteresowany</option>
            </select>
          </div>
        </div>

        {/* Przycisk czyszczenia filtrów */}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setFilters({
              priceMin: '',
              priceMax: '',
              areaMin: '',
              areaMax: '',
              status: '',
              rating: '',
            })}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Wyczyść filtry
          </button>
        </div>
      </div>
    )}
  </div>
</div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                <PropertyEditForm
                    property={editingProperty}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingProperty(null)}
                />
            </div>
        </div>
    </div>
)}

{/* Formularz dodawania nieruchomości */}
{isFormVisible && (
  <div className="bg-white p-4 rounded-lg shadow mb-6">
    <h3 className="text-lg font-semibold">Dodaj nową nieruchomość</h3>
    <div className="flex gap-4 mb-4">
      <button
        onClick={() => setAddMethod('url')}
        className={`flex-1 p-2 rounded-lg ${addMethod === 'url' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
      >
        Z linku Otodom
      </button>
      <button
        onClick={() => setAddMethod('manual')}
        className={`flex-1 p-2 rounded-lg ${addMethod === 'manual' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
      >
        Ręcznie
      </button>
    </div>

    {addMethod === 'url' ? (
      <>
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
          Dodaj z linku
        </button>
      </>
    ) : (
      <form onSubmit={handleManualAdd} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tytuł
          </label>
          <input
            type="text"
            value={manualForm.title}
            onChange={(e) => setManualForm({...manualForm, title: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cena (PLN)
            </label>
            <input
              type="number"
              value={manualForm.price}
              onChange={(e) => setManualForm({...manualForm, price: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Powierzchnia (m²)
            </label>
            <input
              type="number"
              value={manualForm.area}
              onChange={(e) => setManualForm({...manualForm, area: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lokalizacja
          </label>
          <input
            type="text"
            value={manualForm.location}
            onChange={(e) => setManualForm({...manualForm, location: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stan
          </label>
          <select
            value={manualForm.status}
            onChange={(e) => setManualForm({...manualForm, status: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          >
            <option value="">Wybierz stan</option>
            <option value="do zamieszkania">Do zamieszkania</option>
            <option value="do remontu">Do remontu</option>
            <option value="w budowie">W budowie</option>
            <option value="stan deweloperski">Stan deweloperski</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opis
          </label>
          <textarea
            value={manualForm.description}
            onChange={(e) => setManualForm({...manualForm, description: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            rows="4"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsFormVisible(false)}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Dodaj nieruchomość
          </button>
        </div>
      </form>
    )}
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
