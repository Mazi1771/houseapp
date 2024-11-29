import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

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

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
            console.log('Znalezione wyniki:', results);
            resolve(results[0]);
          } else {
            console.error('Status geokodowania:', status);
            reject(new Error(`Nie można znaleźć lokalizacji (${status})`));
          }
        });
      });

      const accuracy = results.geometry.location_type;
      console.log('Dokładność geokodowania:', accuracy);

      const coordinates = {
        lat: results.geometry.location.lat(),
        lng: results.geometry.location.lng()
      };

      const addressComponents = {};
      results.address_components.forEach(component => {
        const type = component.types[0];
        addressComponents[type] = component.long_name;
      });

      console.log('Komponenty adresu:', addressComponents);

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
      
      if (accuracy === 'APPROXIMATE') {
        console.log('Znaleziono przybliżoną lokalizację');
      }

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
      coordinates: null // Reset coordinates when location changes
    }));
  };

  const handleLocationBlur = () => {
    if (formData.location && formData.location !== property.location) {
      geocodeAddress(formData.location);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.location !== property.location && !formData.coordinates) {
      try {
        await geocodeAddress(formData.location);
      } catch (error) {
        console.error('Nie udało się zaktualizować współrzędnych:', error);
      }
    }

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
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleLocationChange}
              onBlur={handleLocationBlur}
              placeholder="Wpisz dokładny adres, np. ul. Przykładowa 10, Kraków"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border pr-10"
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