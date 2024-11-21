import React, { useState, useEffect } from 'react';
import PropertyForm from './components/PropertyForm';
import PropertyEditForm from './components/PropertyEditForm';

function App() {
 const [isFormVisible, setIsFormVisible] = useState(false);
 const [properties, setProperties] = useState([]);
 const [editingProperty, setEditingProperty] = useState(null);
 const [url, setUrl] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 useEffect(() => {
   fetchProperties();
 }, []);

 const fetchProperties = async () => {
   try {
     const response = await fetch('https://houseapp-backend.onrender.com/api/properties');
     if (response.ok) {
       const data = await response.json();
       setProperties(data);
     }
   } catch (error) {
     console.error('Błąd podczas pobierania danych:', error);
   }
 };

 const handleAddProperty = (propertyData) => {
   setProperties([...properties, propertyData]);
   setIsFormVisible(false);
 };

 const handleEditClick = (property) => {
   setEditingProperty(property);
 };

 const handleDelete = async (propertyId) => {
   if (!window.confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) {
     return;
   }
   
   try {
     const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${propertyId}`, {
       method: 'DELETE'
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

 const handleScrape = async () => {
   if (!url) return;
   setIsLoading(true);
   try {
     const response = await fetch('https://houseapp-backend.onrender.com/api/scrape', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
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

 const handleSaveEdit = async (updatedData) => {
   try {
     const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${editingProperty._id}`, {
       method: 'PUT',
       headers: {
         'Content-Type': 'application/json',
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
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {properties.map((property, index) => (
             <div key={property._id || index} className="bg-white rounded-lg shadow p-6">
               <h3 className="text-lg font-semibold mb-2">{property.title}</h3>
               <div className="space-y-2">
                 <p>Cena: {property.price} PLN</p>
                 <p>Powierzchnia: {property.area} m²</p>
                 <p>Pokoje: {property.rooms}</p>
                 <p>Lokalizacja: {property.location}</p>
                 {property.description && (
                   <p className="text-gray-600">{property.description}</p>
                 )}
                 <div className="flex justify-end mt-4 space-x-2">
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
           ))}
         </div>
       )}
     </main>
   </div>
 );
}

export default App;
