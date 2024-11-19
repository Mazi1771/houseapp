import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Home } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            HouseApp
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Witaj w HouseApp!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Rozpocznij dodawanie i zarządzanie swoimi ofertami nieruchomości.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default App;
