import React, { useState } from 'react';

function PropertyEditForm({ property, onSave, onCancel }) {
 const [formData, setFormData] = useState({
   title: property.title || '',
   price: property.price || '',
   area: property.area || '',
   rooms: property.rooms || '',
   location: property.location || '',
   description: property.description || '',
   status: property.status || 'stan deweloperski'
 });

 const handleChange = (e) => {
   const { name, value } = e.target;
   setFormData(prev => ({
     ...prev,
     [name]: value
   }));
 };

 const handleSubmit = (e) => {
   e.preventDefault();
   onSave({
     ...formData,
     price: Number(formData.price),
     area: Number(formData.area),
     rooms: Number(formData.rooms)
   });
 };

 return (
   <div className="bg-white p-6 rounded-lg shadow">
     <form onSubmit={handleSubmit} className="space-y-4">
       <div>
         <label className="block text-sm font-medium text-gray-700">Tytuł</label>
         <input
           type="text"
           name="title"
           value={formData.title}
           onChange={handleChange}
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
         />
       </div>

       <div className="grid grid-cols-2 gap-4">
         <div>
           <label className="block text-sm font-medium text-gray-700">Cena (PLN)</label>
           <input
             type="number"
             name="price"
             value={formData.price}
             onChange={handleChange}
             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
           />
         </div>

         <div>
           <label className="block text-sm font-medium text-gray-700">Powierzchnia (m²)</label>
           <input
             type="number"
             name="area"
             value={formData.area}
             onChange={handleChange}
             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
           />
         </div>
       </div>

       <div className="grid grid-cols-2 gap-4">
         <div>
           <label className="block text-sm font-medium text-gray-700">Liczba pokoi</label>
           <input
             type="number"
             name="rooms"
             value={formData.rooms}
             onChange={handleChange}
             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
           />
         </div>

         <div>
           <label className="block text-sm font-medium text-gray-700">Status</label>
           <select
             name="status"
             value={formData.status}
             onChange={handleChange}
             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
           >
             <option value="do zamieszkania">Do zamieszkania</option>
             <option value="do remontu">Do remontu</option>
             <option value="w budowie">W budowie</option>
             <option value="stan deweloperski">Stan deweloperski</option>
           </select>
         </div>
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700">Lokalizacja</label>
         <input
           type="text"
           name="location"
           value={formData.location}
           onChange={handleChange}
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
         />
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700">Opis</label>
         <textarea
           name="description"
           value={formData.description}
           onChange={handleChange}
           rows={4}
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
         />
       </div>

       <div className="flex justify-end space-x-3">
         <button
           type="button"
           onClick={onCancel}
           className="px-4 py-2 border rounded-md hover:bg-gray-50"
         >
           Anuluj
         </button>
         <button
           type="submit"
           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
         >
           Zapisz zmiany
         </button>
       </div>
     </form>
   </div>
 );
}

export default PropertyEditForm;
