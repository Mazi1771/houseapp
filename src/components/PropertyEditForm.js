import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
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
    coordinates: property?.coordinates || null
  });

  const [priceHistory, setPriceHistory] = useState(property?.priceHistory || []);
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
    
    // Jeśli zmienia się cena, dodaj wpis do historii
    if (name === 'price' && value !== property.price) {
      const newPrice = Number(value);
      if (!isNaN(newPrice) && newPrice > 0 && property.price !== newPrice) {
        setPriceHistory(prev => [
          {
            price: property.price,
            date: new Date()
          },
          ...prev
        ]);
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Wyczyść błąd dla tego pola
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const geocodeAddress = async (address) => {
    if (!address) return;
    
    setIsGeocoding(true);
    setGeocodeError(null);
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      const results = await new Promise((resolve, reject) => {
        geocoder.geocode({
          address,
          region: 'pl',
          componentRestrictions: { country: 'pl' }
        }, (results, status) => {
          if (status === 'OK' && results && results.length > 0) {
            resolve(results[0]);
          } else {
            reject(new Error(`Nie można znaleźć lokalizacji (${status})`));
          }
        });
      });

      const coordinates = {
        lat: results.geometry.location.lat(),
        lng: results.geometry.location.lng()
      };

      const addressComponents = {};
      results.address_components.forEach(component => {
        const type = component.types[0];
        addressComponents[type] = component.long_name;
      });

      let formattedAddress = results.formatted_address;
      
      if (addressComponents.locality && !addressComponents.route) {
        formattedAddress = `${addressComponents.locality}${
          addressComponents.administrative_area_level_1 
            ? `, ${addressComponents.administrative_area_level_1}` 
            : ''
        }`;
      }

      setFormData(prev => ({
        ...prev,
        coordinates,
        location: formattedAddress
      }));
      
      setGeocodeError(null);

    } catch (error) {
      console.error('Szczegóły błędu geokodowania:', error);
      setGeocodeError(
        'Nie udało się znaleźć dokładnej lokalizacji. ' +
        'Spróbuj podać bardziej szczegółowy adres lub sprawdź pisownię.'
      );
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setFormData(prev => ({
      ...prev,
      location: newLocation,
      coordinates: null
    }));
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
      rooms: Number(formData.rooms),
      priceHistory: property.price !== Number(formData.price) ? 
        [{ price: property.price, date: new Date() }, ...priceHistory] :
        priceHistory
    };

    onSave(updatedData);
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
            className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cena (PLN)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Powierzchnia (m²)</label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm p-2 border ${
                errors.area ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.area && (
              <p className="text-red-500 text-xs mt-1">{errors.area}</p>
            )}
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
        </div>{/* Lokalizacja */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Lokalizacja</label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleLocationChange}
              onBlur={handleLocationBlur}
              placeholder="Wpisz dokładny adres, np. ul. Przykładowa 10, Kraków"
              className={`mt-1 block w-full rounded-md shadow-sm p-2 border pr-10 ${
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
              <br />
              <span className="text-xs">
                Wskazówka: Podaj pełny adres z nazwą ulicy i numerem
              </span>
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
          {errors.location && (
            <p className="text-red-500 text-xs mt-1">{errors.location}</p>
          )}
        </div>

        {/* Opis */}
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

        {/* Historia cen */}
        {priceHistory.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium mb-2">Historia cen</h3>
            <div className="mb-4">
              <PriceHistoryChart propertyId={property._id} />
            </div>
            <div className="space-y-2">
              {priceHistory.map((entry, index) => {
                const previousPrice = index < priceHistory.length - 1 ? priceHistory[index + 1].price : null;
                const priceChange = previousPrice ? entry.price - previousPrice : null;
                const percentageChange = previousPrice ? ((entry.price - previousPrice) / previousPrice * 100).toFixed(1) : null;
                
                return (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <span className="ml-2 font-medium">
                        {entry.price.toLocaleString()} PLN
                      </span>
                    </div>
                    {priceChange !== null && (
                      <div className={`text-sm ${priceChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {priceChange > 0 ? '+' : ''}{priceChange.toLocaleString()} PLN
                        <span className="ml-1">
                          ({priceChange > 0 ? '+' : ''}{percentageChange}%)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Przyciski akcji */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Zapisz zmiany
          </button>
        </div>
      </form>
    </div>
  );
}

export default PropertyEditForm;
