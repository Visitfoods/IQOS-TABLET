'use client';

import { useState, useEffect } from 'react';
import { useDeepgram } from '../lib/contexts/DeepgramContext';
import { addDocument } from '../lib/firebase/firebaseUtils';
import { motion } from 'framer-motion';

interface VoiceRecorderProps {
  userId: string;
}

export default function VoiceRecorder({ userId }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const { connectToDeepgram, disconnectFromDeepgram, connectionState, realtimeTranscript } = useDeepgram();

  const handleStartRecording = async () => {
    await connectToDeepgram();
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    disconnectFromDeepgram();
    setIsRecording(false);
    
    // Save the note to Firebase
    if (realtimeTranscript) {
      await addDocument('notes', {
        text: realtimeTranscript,
        timestamp: new Date().toISOString(),
        userId: userId,
      });
    }
  };

  return (
    <div className="w-full max-w-md">
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        className={`w-full py-3 px-4 rounded-full ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        } text-white font-bold transition-colors`}
      >
        {isRecording ? 'Parar Gravação' : 'Iniciar Gravação'}
      </button>
      {isRecording && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-8 h-8 bg-blue-500 rounded-full"
            />
          </div>
          <div className="p-3 bg-gray-50 rounded text-sm text-gray-700 min-h-[100px] max-h-[200px] overflow-y-auto">
            {realtimeTranscript || 'A ouvir...'}
          </div>
        </div>
      )}
    </div>
  );
}