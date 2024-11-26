import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
        
        // Dodajemy console.log do sprawdzenia surowych danych
        console.log('Surowe dane historii:', data);

        const formattedData = data
          .map(entry => ({
            date: new Date(entry.date).toLocaleDateString(),
            price: entry.price,
            fullDate: new Date(entry.date),
            // Dodajemy oryginalną datę do debugowania
            originalDate: entry.date
          }))
          .sort((a, b) => b.fullDate - a.fullDate); // Sortuj od najnowszych
          
        // Dodajemy console.log do sprawdzenia posortowanych danych
        console.log('Posortowane dane:', formattedData);

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

  const displayedHistory = showFullHistory ? priceHistory : priceHistory.slice(0, 2);

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium">Historia cen</h4>
      
      {/* Ostatnie zmiany cen */}
      <div className="space-y-2">
        {displayedHistory.map((entry, index) => {
          const previousEntry = priceHistory[index + 1];
          
          // Dodajemy console.log do debugowania każdej zmiany ceny
          console.log('Aktualna cena:', entry.price, 'Data:', entry.originalDate);
          console.log('Poprzednia cena:', previousEntry?.price, 'Data:', previousEntry?.originalDate);
          
          const priceChange = previousEntry ? entry.price - previousEntry.price : null;
          const percentageChange = getPercentageChange(entry.price, previousEntry?.price);
          
          // Dodajemy console.log do sprawdzenia obliczonej różnicy
          console.log('Obliczona zmiana:', priceChange);

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

      {/* Reszta kodu pozostaje bez zmian */}
      {priceHistory.length > 2 && (
        <button
          onClick={() => setShowFullHistory(!showFullHistory)}
          className="w-full py-2 px-4 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          {showFullHistory ? 'Pokaż mniej' : `Pokaż pełną historię (${priceHistory.length} zmian)`}
        </button>
      )}

      {showFullHistory && priceHistory.length > 1 && (
        <div className="mt-4 h-[300px] w-full">
          <ResponsiveContainer>
            <LineChart
              data={[...priceHistory].reverse()}
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => formatPrice(value)}
                labelFormatter={(label) => `Data: ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => <span className="text-gray-600">Historia cen</span>}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#2563eb"
                strokeWidth={2}
                name="Cena"
                dot={{
                  r: 4,
                  fill: '#2563eb',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
                activeDot={{
                  r: 6,
                  fill: '#2563eb',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default PriceHistoryChart;
