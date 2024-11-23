import React from 'react';
import { NewsFeed } from './components/NewsFeed';
import { Newspaper, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';

function App() {
  const { news, isConnected } = useWebSocket();

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Newspaper className="h-8 w-8 text-blue-400" />
              <h1 className="ml-3 text-2xl font-bold text-white">Market Impact News</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {isConnected ? (
                  <Wifi className="h-5 w-5 text-green-400" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="flex items-center bg-red-900/50 px-3 py-1 rounded-full">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-sm font-medium text-red-200">Live Updates</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-2">About Market Impact Scores</h2>
          <p className="text-gray-300">
            Each news item is analyzed and assigned a market impact score (0-100) based on its potential effect on financial markets.
            Scores above 70 indicate significant market impact potential.
          </p>
        </div>
        
        <NewsFeed news={news} />
      </main>
    </div>
  );
}

export default App;