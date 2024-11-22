import React, { useState, useEffect } from 'react';
import PropertyForm from './components/PropertyForm';
import PropertyEditForm from './components/PropertyEditForm';
import Login from './components/Login';
import Register from './components/Register';

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

 useEffect(() => {
   const token = localStorage.getItem('token');
   const savedUser = localStorage.getItem('user');
   if (token && savedUser) {
     setIsAuthenticated(true);
     setUser(JSON.parse(savedUser));
     fetchProperties();
   }
 }, []);
const handleEditClick = (property) => {
  setEditingProperty(property);
};
 const fetchProperties = async () => {
   try {
     const token = localStorage.getItem('token');
     if (!token) return;

     const response = await fetch('https://houseapp-backend.onrender.com/api/properties', {
       headers: {
         'Authorization': `Bearer ${token}`
       }
     });
     if (response.ok) {
       const data = await response.json();
       setProperties(data);
     }
   } catch (error) {
     console.error('Błąd podczas pobierania danych:', error);
   }
 };

 const handleLogin = (data) => {
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
 };

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
       const error = await response.json();
       alert(error.message || 'Wystąpił błąd podczas pobierania danych');
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
     }
   } catch (error) {
     console.error('Błąd podczas aktualizacji:', error);
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
 // Renderowanie komponentu autoryzacji
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
         <div className="bg-white p-6 rounded-lg shadow mb-6">
           <h2 className="text-lg font-semibold mb-4">Dodaj nową nieruchomość</h2>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700">Link do ogłoszenia Otodom</label>
               <div className="flex gap-2 mt-1">
                 <input
                   type="url"
                   className="flex-1 rounded-md border-gray-300 shadow-sm p-2 border"
                   placeholder="https://www.otodom.pl/..."
                   value={url}
                   onChange={(e) => setUrl(e.target.value)}
                 />
                 <button
                   onClick={handleScrape}
                   className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                   disabled={isLoading}
                 >
                   {isLoading ? 'Pobieranie...' : 'Pobierz dane'}
                 </button>
               </div>
             </div>
           </div>
         </div>
       ) : editingProperty ? (
         <PropertyEditForm 
           property={editingProperty}
           onSave={handleSaveEdit}
           onCancel={() => setEditingProperty(null)}
         />
       ) : (
         <>
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

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {getFilteredAndSortedProperties().map((property, index) => (
               <div key={property._id || index} className="bg-white rounded-lg shadow p-6">
                 <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
                 <div className="space-y-2">
                   <p>Cena: {property.price} PLN</p>
                   <p>Powierzchnia: {property.area} m²</p>
                   <p>Pokoje: {property.rooms}</p>
                   <p>Lokalizacja: {property.location}</p>
                   <p>Stan: <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                     property.status === 'do zamieszkania' ? 'bg-green-100 text-green-800' :
                     property.status === 'do remontu' ? 'bg-red-100 text-red-800' :
                     property.status === 'w budowie' ? 'bg-yellow-100 text-yellow-800' :
                     'bg-blue-100 text-blue-800'
                   }`}>
                     {property.status}
                   </span></p>
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
 
