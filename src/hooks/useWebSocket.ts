import { useState, useEffect, useCallback } from 'react';
import type { NewsItem } from '../types/news';

export function useWebSocket() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const addNews = useCallback((newsItem: NewsItem) => {
    setNews(prev => [newsItem, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        // Use the relative path for WebSocket connection
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setReconnectAttempts(0);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connection') {
              return;
            }
            addNews({
              ...data,
              timestamp: new Date(data.timestamp)
            });
          } catch (error) {
            console.error('Error processing message:', error);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          
          if (reconnectAttempts < 5) {
            setReconnectAttempts(prev => prev + 1);
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        if (reconnectAttempts < 5) {
          setReconnectAttempts(prev => prev + 1);
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [addNews, reconnectAttempts]);

  return { news, isConnected };
}