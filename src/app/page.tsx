"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import VoiceRecorder from '../components/VoiceRecorder';
import { getDocuments } from '../lib/firebase/firebaseUtils';
import SignInWithGoogle from '../components/SignInWithGoogle';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Note {
  id: string;
  text: string;
  timestamp: string;
  userId: string;
}

export default function Home() {
  const { user, loading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      if (user) {
        try {
          const fetchedNotes = await getDocuments('notes') as Note[];
          const userNotes = fetchedNotes.filter(note => note.userId === user.uid);
          
          setNotes(userNotes.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          ));
        } catch (error) {
          console.error("Erro ao buscar notas:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setNotes([]);
        setIsLoading(false);
      }
    }

    if (!loading) {
      fetchNotes();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-pulse w-12 h-12 bg-blue-200 rounded-full"></div>
        <p className="mt-4 text-gray-500">A carregar...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8">Notas de Voz</h1>
        
        {!user ? (
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl mb-6 text-center">Faça login para gravar e ver suas notas de voz</h2>
            <SignInWithGoogle />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <VoiceRecorder userId={user.uid} />
            </div>
            
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4">Suas Notas</h2>
              
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 h-24 rounded-lg"></div>
                  ))}
                </div>
              ) : notes.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  Ainda não tem notas. Comece a gravar!
                </p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-sm text-gray-500 mb-2">
                        {format(new Date(note.timestamp), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-gray-800">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
