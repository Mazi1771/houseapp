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
        console.log('Surowe dane historii:', data);

        // Formatowanie i sortowanie danych
        const formattedData = data
          .map(entry => ({
            date: new Date(entry.date),
            price: entry.price,
            formattedDate: new Date(entry.date).toLocaleDateString()
          }))
          .sort((a, b) => b.date - a.date); // Sortuj od najnowszych do najstarszych
          
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

  if (loading) return <div className="p-4 text-gray-600">Ładowanie historii cen...</div>;
  if (error) return <div className="p-4 text-red-600">Błąd: {error}</div>;
  if (priceHistory.length === 0) return null;

  // Przygotuj dane dla wykresu
  const chartData = [...priceHistory].reverse(); // Odwróć dane dla wykresu (chronologicznie)

  return (
    <div className="space-y-4">
      {/* Lista zmian cen */}
      <div className="space-y-2">
        {priceHistory.map((entry, index) => {
          const nextEntry = priceHistory[index + 1];
          const priceChange = nextEntry ? entry.price - nextEntry.price : null;
          const percentageChange = nextEntry ? getPercentageChange(entry.price, nextEntry.price) : null;

          return (
            <div key={entry.date.toString()} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">{entry.formattedDate}</span>
                <span className={`font-medium ${getPriceChangeColor(entry.price, nextEntry?.price)}`}>
                  {formatPrice(entry.price)}
                </span>
              </div>
              {priceChange !== null && (
                <div className={`text-sm ${getPriceChangeColor(entry.price, nextEntry.price)}`}>
                  {priceChange > 0 ? '+' : ''}{formatPrice(priceChange)}
                  <br />
                  {priceChange > 0 ? '↑' : '↓'} {percentageChange}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Wykres */}
      {priceHistory.length > 1 && (
        <div className="mt-4 h-[300px]">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => [`${value.toLocaleString()} PLN`, 'Cena']}
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
                formatter={() => <span className="text-gray-600">Historia cen</span>}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#2563eb"
                strokeWidth={2}
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