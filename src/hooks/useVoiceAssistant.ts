import { useCallback, useRef, useState } from 'react';
import { LiveSession } from '../lib/liveSession';
import type { AssistantState } from '../types';

export function useVoiceAssistant(apiKey: string) {
  const [state, setState] = useState<AssistantState>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sessionRef = useRef<LiveSession | null>(null);

  const connect = useCallback(() => {
    if (!apiKey) {
      setErrorMessage('Gemini API key missing — add it to your .env file.');
      setState('error');
      return;
    }
    setErrorMessage(null);
    sessionRef.current = new LiveSession(apiKey, {
      onStateChange: setState,
      onError: (msg) => setErrorMessage(msg),
    });
    sessionRef.current.connect();
  }, [apiKey]);

  const disconnect = useCallback(() => {
    sessionRef.current?.disconnect();
    sessionRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (state === 'disconnected' || state === 'error') connect();
    else disconnect();
  }, [state, connect, disconnect]);

  return { state, errorMessage, toggle };
}
