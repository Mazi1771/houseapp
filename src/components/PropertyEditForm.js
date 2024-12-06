import React, { useState } from 'react';
import { MapPin, Edit2, RefreshCw } from 'lucide-react';
import PriceHistoryChart from './PriceHistoryChart';

function PropertyEditForm({ property, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: property?.title || '',
    price: property?.price || '',
    area: property?.area || '',
    rooms: property?.rooms || '',
    location: property?.location || '',
    description: property?.description || '',
    status: property?.status || 'stan deweloperski',
    coordinates: property?.coordinates || null,
    priceHistory: property?.priceHistory || []
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Tytuł jest wymagany';
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Podaj prawidłową cenę';
    }
    
    if (!formData.area || formData.area <= 0) {
      newErrors.area = 'Podaj prawidłową powierzchnię';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Lokalizacja jest wymagana';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price' && value !== property.price) {
      const newPrice = Number(value);
      if (!isNaN(newPrice) && newPrice > 0 && property.price !== newPrice) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          priceHistory: [
            {
              price: property.price,
              date: new Date()
            },
            ...prev.priceHistory
          ]
        }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setFormData(prev => ({
      ...prev,
      location: newLocation,
      coordinates: null
    }));
    setGeocodeError(null);
  };

  const geocodeAddress = async (address) => {
    if (!address) return;
    
    setIsGeocoding(true);
    setGeocodeError(null);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=pl&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };

        setFormData(prev => ({
          ...prev,
          coordinates,
          location: result.display_name
        }));
      } else {
        throw new Error('Nie znaleziono lokalizacji');
      }
    } catch (error) {
      console.error('Błąd geokodowania:', error);
      setGeocodeError(
        'Nie udało się znaleźć dokładnej lokalizacji. ' +
        'Spróbuj podać bardziej szczegółowy adres lub sprawdź pisownię.'
      );
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleLocationBlur = () => {
    if (formData.location && formData.location !== property.location) {
      geocodeAddress(formData.location);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (formData.location !== property.location && !formData.coordinates) {
      try {
        await geocodeAddress(formData.location);
      } catch (error) {
        console.error('Nie udało się zaktualizować współrzędnych:', error);
      }
    }

    const updatedData = {
      ...formData,
      price: Number(formData.price),
      area: Number(formData.area),
      rooms: Number(formData.rooms || 0),
      priceHistory: property.price !== Number(formData.price) ? 
        [{ price: property.price, date: new Date() }, ...formData.priceHistory] :
        formData.priceHistory
    };

    onSave(updatedData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tytuł */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tytuł
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-lg shadow-sm p-2 border ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Cena i Powierzchnia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cena (PLN)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg shadow-sm p-2 border ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Powierzchnia (m²)
            </label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg shadow-sm p-2 border ${
                errors.area ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.area && (
              <p className="text-red-500 text-sm mt-1">{errors.area}</p>
            )}
          </div>
        </div>

        {/* Pokoje i Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Liczba pokoi
            </label>
            <input
              type="number"
              name="rooms"
              value={formData.rooms}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border"
            >
              <option value="do zamieszkania">Do zamieszkania</option>
              <option value="do remontu">Do remontu</option>
              <option value="w budowie">W budowie</option>
              <option value="stan deweloperski">Stan deweloperski</option>
            </select>
          </div>
        </div>

        {/* Lokalizacja */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lokalizacja
          </label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleLocationChange}
              onBlur={handleLocationBlur}
              placeholder="Wpisz dokładny adres, np. ul. Przykładowa 10, Kraków"
              className={`mt-1 block w-full rounded-lg shadow-sm p-2 border pr-10 ${
                errors.location ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => geocodeAddress(formData.location)}
              disabled={isGeocoding}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              title="Zaktualizuj lokalizację na mapie"
            >
              <MapPin 
                className={`h-5 w-5 ${
                  isGeocoding 
                    ? 'text-gray-400' 
                    : formData.coordinates 
                      ? 'text-green-500 hover:text-green-600' 
                      : 'text-blue-500 hover:text-blue-600'
                }`}
              />
            </button>
          </div>
          
          {isGeocoding && (
            <p className="text-sm text-gray-500 mt-1">
              Trwa wyszukiwanie lokalizacji...
            </p>
          )}
          
          {geocodeError && (
            <p className="text-sm text-red-500 mt-1">
              {geocodeError}
            </p>
          )}
          
          {formData.coordinates && (
            <div className="text-sm mt-1">
              <p className="text-green-600">
                ✓ Znaleziono lokalizację
              </p>
              <p className="text-xs text-gray-500">
                Współrzędne: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Opis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opis
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border"
          />
        </div>

        {/* Historia cen */}
        {formData.priceHistory.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Historia cen</h3>
            <PriceHistoryChart propertyId={property._id} />
          </div>
        )}

        {/* Przyciski */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Zapisz zmiany
          </button>
        </div>
      </form>
    </div>
  );
}

export default PropertyEditForm;
