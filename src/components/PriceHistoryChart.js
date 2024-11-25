import React, { useState, useEffect } from 'react';

const PriceHistoryChart = ({ propertyId }) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://houseapp-backend.onrender.com/api/properties/${propertyId}/price-history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPriceHistory(data);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania historii cen:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceHistory();
  }, [propertyId]);

  if (isLoading) return <div className="text-center">Ładowanie...</div>;
  if (!priceHistory.length) return <div className="text-gray-500">Brak historii cen</div>;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Historia cen</h3>
      <div className="space-y-2">
        {priceHistory.map((record, index) => (
          <div key={index} className="flex justify-between items-center">
            <span>{new Date(record.date).toLocaleDateString()}</span>
            <span className="font-medium">{record.price.toLocaleString()} PLN</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceHistoryChart;
