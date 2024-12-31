import React from 'react';

const ComparisonModal = ({ properties, onClose }) => {
    // Funkcja do obliczania ceny za m²
    const calculatePricePerMeter = (price, area) => {
        if (!price || !area) return 0;
        return Math.round(price / area);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Nagłówek */}
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Porównanie nieruchomości</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                {/* Treść porównania */}
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-8">
                        {/* Kolumny dla każdej nieruchomości */}
                        {properties.map((property) => (
                            <div key={property._id} className="space-y-6">
                                {/* Podstawowe informacje */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-lg mb-2">{property.title}</h3>
                                    <p className="text-gray-600">{property.location}</p>
                                </div>

                                {/* Cena i powierzchnia */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Cena</p>
                                        <p className="text-xl font-bold text-blue-600">
                                            {property.price?.toLocaleString()} PLN
                                        </p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <p className="text-sm text-gray-600">Powierzchnia</p>
                                        <p className="text-xl font-bold text-green-600">
                                            {property.area} m²
                                        </p>
                                    </div>
                                </div>

                                {/* Wskaźniki */}
                                <div className="space-y-4">
                                    <div className="border-t pt-4">
                                        <p className="text-sm text-gray-600">Cena za m²</p>
                                        <p className="text-lg font-semibold">
                                            {calculatePricePerMeter(property.price, property.area).toLocaleString()} PLN/m²
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">Stan</p>
                                        <p className="text-lg font-semibold">{property.status}</p>
                                    </div>

                                    {property.rooms && (
                                        <div>
                                            <p className="text-sm text-gray-600">Liczba pokoi</p>
                                            <p className="text-lg font-semibold">{property.rooms}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Opis */}
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-2">Opis</p>
                                    <p className="text-gray-800">
                                        {property.description || 'Brak opisu'}
                                    </p>
                                </div>

                                {/* Status i ocena */}
                                <div className="border-t pt-4 flex justify-between items-center">
                                    <div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            property.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {property.isActive ? 'Aktywne' : 'Nieaktywne'}
                                        </span>
                                    </div>
                                    <div>
                                        {property.rating && (
                                            <span className="text-sm">
                                                {property.rating === 'favorite' && '⭐ Ulubione'}
                                                {property.rating === 'interested' && '👍 Zainteresowany'}
                                                {property.rating === 'not_interested' && '👎 Niezainteresowany'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Link do źródła */}
                                {property.sourceUrl && (
                                    <a
                                        href={property.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 text-blue-600 hover:text-blue-800"
                                    >
                                        Zobacz ogłoszenie →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Sekcja różnic */}
                    {properties.length === 2 && (
                        <div className="mt-8 border-t pt-8">
                            <h3 className="font-bold text-lg mb-4">Różnice</h3>
                            <div className="space-y-4">
                                {/* Różnica w cenie */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    {(() => {
                                        const difference = Math.abs(properties[0].price - properties[1].price);
                                        const percentDiff = Math.round(
                                            (difference / Math.min(properties[0].price, properties[1].price)) * 100
                                        );
                                        const cheaper = properties[0].price < properties[1].price ? properties[0] : properties[1];
                                        
                                        return (
                                            <div>
                                                <p className="text-lg mb-2">
                                                    <span className="font-semibold">{cheaper.title}</span> jest tańsza o{' '}
                                                    <span className="font-bold text-blue-600">
                                                        {difference.toLocaleString()} PLN
                                                    </span>{' '}
                                                    ({percentDiff}%)
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Różnica w powierzchni */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    {(() => {
                                        const difference = Math.abs(properties[0].area - properties[1].area);
                                        const bigger = properties[0].area > properties[1].area ? properties[0] : properties[1];
                                        
                                        return (
                                            <p className="text-lg">
                                                <span className="font-semibold">{bigger.title}</span> jest większa o{' '}
                                                <span className="font-bold text-green-600">
                                                    {difference} m²
                                                </span>
                                            </p>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComparisonModal;
