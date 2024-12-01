import React, { useState } from 'react';
import { Mail } from 'lucide-react';

function BoardSharing({ boardId }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://houseapp-backend.onrender.com/api/boards/${boardId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, role })
      });

      if (response.ok) {
        alert('Zaproszenie zostało wysłane');
        setEmail('');
      } else {
        const data = await response.json();
        alert(data.error || 'Wystąpił błąd podczas wysyłania zaproszenia');
      }
    } catch (error) {
      alert('Wystąpił błąd podczas wysyłania zaproszenia');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Udostępnij tablicę</h3>
      
      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email użytkownika
          </label>
          <div className="mt-1 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="przykład@email.com"
              required
            />
            <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Uprawnienia
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="viewer">Tylko przeglądanie</option>
            <option value="editor">Edytowanie</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
            ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Wysyłanie...' : 'Zaproś'}
        </button>
      </form>
    </div>
  );
}
export default BoardSharing; // Dodaj tę linię na końcu pliku
