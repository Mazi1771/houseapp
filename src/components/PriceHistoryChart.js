import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const PriceHistoryChart = ({ propertyId }) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullHistory, setShowFullHistory] = useState(false);

  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `https://houseapp-backend.onrender.com/api/properties/${propertyId}/price-history`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Nie udało się pobrać historii cen');
        }

        const data = await response.json();
        const formattedData = data
          .map(entry => ({
            date: new Date(entry.date).toLocaleDateString(),
            price: entry.price,
            fullDate: new Date(entry.date)
          }))
          .sort((a, b) => b.fullDate - a.fullDate); // Sortuj od najnowszych

        setPriceHistory(formattedData);
      } catch (error) {
        console.error('Błąd podczas pobierania historii cen:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceHistory();
  }, [propertyId]);

  const getPriceChangeColor = (current, previous) => {
    if (!previous) return 'text-gray-600';
    return current > previous ? 'text-red-600' : current < previous ? 'text-green-600' : 'text-gray-600';
  };

  const formatPrice = (price) => price.toLocaleString() + ' PLN';

  const getPercentageChange = (current, previous) => {
    if (!previous) return null;
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1) + '%';
  };

  if (loading) return <div className="p-4">Ładowanie historii cen...</div>;
  if (error) return <div className="p-4 text-red-600">Błąd: {error}</div>;
  if (priceHistory.length === 0) return null;

  const displayedHistory = showFullHistory ? priceHistory : priceHistory.slice(0, 3);

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium">Historia cen</h4>
      
      {/* Ostatnie zmiany cen */}
      <div className="space-y-2">
        {displayedHistory.map((entry, index) => {
          const previousEntry = priceHistory[index + 1];
          const priceChange = previousEntry ? entry.price - previousEntry.price : null;
          const percentageChange = getPercentageChange(entry.price, previousEntry?.price);
          
          return (
            <div key={entry.date} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">{entry.date}</span>
                <span className={`font-medium ${getPriceChangeColor(entry.price, previousEntry?.price)}`}>
                  {formatPrice(entry.price)}
                </span>
              </div>
              {priceChange !== null && (
                <div className="flex flex-col items-end">
                  <span className={`font-medium ${getPriceChangeColor(entry.price, previousEntry?.price)}`}>
                    {priceChange > 0 ? '+' : ''}{formatPrice(priceChange)}
                  </span>
                  <span className={`text-sm ${getPriceChangeColor(entry.price, previousEntry?.price)}`}>
                    {priceChange > 0 ? '↑' : '↓'} {percentageChange}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Przycisk "Pokaż więcej" */}
      {priceHistory.length > 3 && (
        <button
          onClick={() => setShowFullHistory(!showFullHistory)}
          className="w-full py-2 px-4 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          {showFullHistory ? 'Pokaż mniej' : `Pokaż pełną historię (${priceHistory.length} zmian)`}
        </button>
      )}

      {/* Wykres */}
      {showFullHistory && priceHistory.length > 1 && (
        <div className="mt-4">
          <LineChart
            width={600}
            height={300}
            data={[...priceHistory].reverse()}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value) => formatPrice(value)}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#2563eb" 
              name="Cena"
              dot={{r: 4}}
              activeDot={{r: 6}}
            />
          </LineChart>
        </div>
      )}
    </div>
  );
};

export default PriceHistoryChart;
