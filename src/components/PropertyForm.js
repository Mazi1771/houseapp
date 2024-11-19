import React, { useState } from 'react';

function PropertyForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    area: '',
    plotArea: '',
    location: '',
    status: 'do-zamieszkania',
    rooms: '',
    description: '',
    source: ''
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
    onSubmit(formData);
    // Wyczyść formularz po wysłaniu
    setFormData({
      title: '',
      price: '',
      area: '',
      plotArea: '',
      location: '',
      status: 'do-zamieszkania',
      rooms: '',
      description: '',
      source: ''
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Tytuł ogłoszenia
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Cena (PLN)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>

            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                Powierzchnia (m²)
              </label>
              <input
                type="number"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="plotArea" className="block text-sm font-medium text-gray-700">
                Powierzchnia działki (m²)
              </label>
              <input
                type="number"
                id="plotArea"
                name="plotArea"
                value={formData.plotArea}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>

            <div>
              <label htmlFor="rooms" className="block text-sm font-medium text-gray-700">
                Liczba pokoi
              </label>
              <input
                type="number"
                id="rooms"
                name="rooms"
                value={formData.rooms}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Lokalizacja
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Stan
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            >
              <option value="do-zamieszkania">Do zamieszkania</option>
              <option value="do-remontu">Do remontu</option>
              <option value="w-budowie">W budowie</option>
            </select>
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700">
              Źródło ogłoszenia
            </label>
            <input
              type="text"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              placeholder="np. otodom.pl"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Opis
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Dodaj nieruchomość
          </button>
        </div>
      </form>
    </div>
  );
}

export default PropertyForm;
