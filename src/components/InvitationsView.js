import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

function InvitationsView() {
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://houseapp-backend.onrender.com/api/invitations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania zaproszeń:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvitation = async (boardId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://houseapp-backend.onrender.com/api/boards/${boardId}/invitation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchInvitations();
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji zaproszenia:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Ładowanie zaproszeń...</div>;
  }

  if (invitations.length === 0) {
    return <div className="text-center py-4 text-gray-500">Brak nowych zaproszeń</div>;
  }

  return (
    <div className="space-y-4">
      {invitations.map(board => (
        <div key={board._id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{board.name}</h4>
              <p className="text-sm text-gray-500">
                Od: {board.owner.email}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleInvitation(board._id, 'accepted')}
                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
              >
                <Check className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleInvitation(board._id, 'rejected')}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default InvitationsView;
