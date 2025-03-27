"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

interface DeepgramContextType {
  connectToDeepgram: () => Promise<void>;
  disconnectFromDeepgram: () => void;
  connectionState: string;
  realtimeTranscript: string;
  error: string | null;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(undefined);

interface DeepgramContextProviderProps {
  children: ReactNode;
}

export const DeepgramContextProvider: React.FC<DeepgramContextProviderProps> = ({ children }) => {
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [realtimeTranscript, setRealtimeTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    return () => {
      disconnectFromDeepgram();
    };
  }, []);

  const getApiKey = async (): Promise<string> => {
    try {
      // Primeiro tentamos usar a variável de ambiente
      const envApiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
      if (envApiKey) {
        return envApiKey;
      }
      
      // Se não estiver disponível, fazemos fallback para a API
      const response = await fetch('/api/deepgram');
      const data = await response.json();
      
      if (!data.apiKey) {
        throw new Error('API key not found');
      }
      
      return data.apiKey;
    } catch (error) {
      console.error('Failed to get Deepgram API key:', error);
      setError('Failed to get Deepgram API key');
      throw error;
    }
  };

  const connectToDeepgram = async () => {
    try {
      if (connectionState === 'connected' || connectionState === 'connecting') {
        console.log("Already connected or connecting to Deepgram");
        return;
      }

      setConnectionState('connecting');
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRef.current = new MediaRecorder(stream);

      const apiKey = await getApiKey();

      console.log("Opening WebSocket connection...");
      socketRef.current = new WebSocket('wss://api.deepgram.com/v1/listen', [
        'token',
        apiKey,
      ]);

      socketRef.current.onopen = () => {
        console.log("Connection opened");
        setConnectionState('connected');

        if (audioRef.current) {
          audioRef.current.addEventListener('dataavailable', async (event) => {
            if (socketRef.current?.readyState === WebSocket.OPEN && event.data.size > 0) {
              socketRef.current.send(event.data);
            }
          });

          audioRef.current.start(1000);
        }
      };

      socketRef.current.onmessage = (message) => {
        const data = JSON.parse(message.data);
        const transcript = data.channel?.alternatives?.[0]?.transcript || "";
        
        if (transcript) {
          setRealtimeTranscript(prevTranscript => 
            prevTranscript ? `${prevTranscript} ${transcript}` : transcript
          );
        }
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket error occurred");
        setConnectionState('error');
        disconnectFromDeepgram();
      };

      socketRef.current.onclose = () => {
        console.log("Connection closed");
        setConnectionState('disconnected');
      };
    } catch (error) {
      console.error("Error connecting to Deepgram:", error);
      setError(`Error connecting to Deepgram: ${error}`);
      setConnectionState('error');
    }
  };

  const disconnectFromDeepgram = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current.stream.getTracks().forEach(track => track.stop());
      audioRef.current = null;
    }

    setConnectionState('disconnected');
  };

  return (
    <DeepgramContext.Provider
      value={{
        connectToDeepgram,
        disconnectFromDeepgram,
        connectionState,
        realtimeTranscript,
        error,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

export const useDeepgram = () => {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error("useDeepgram must be used within a DeepgramContextProvider");
  }
  return context;
};
