import React, { useState } from 'react';
import { Mic, MicOff, Video, Sparkles, CheckCircle, Radio, Settings } from 'lucide-react';
import { SessionState } from './types';

export default function App() {
  const [sessionState, setSessionState] = useState<SessionState>('disconnected');
  const [bossMessage, setBossMessage] = useState<string>('Ready for your command, Boss!');
  const [statusNotification, setStatusNotification] = useState<string>('');

  const handleToggleVoice = () => {
    if (sessionState === 'disconnected') {
      setSessionState('connecting');
      setTimeout(() => {
        setSessionState('listening');
        setBossMessage("Listening to you, Boss...");
      }, 1000);
    } else {
      setSessionState('disconnected');
      setBossMessage("Standing by, Boss.");
    }
  };

  const handleExecuteCommand = (taskName: string) => {
    setStatusNotification(`Processing ${taskName}...`);
    setTimeout(() => {
      setStatusNotification('');
      setBossMessage(`Ho gaya Boss! ${taskName} complete.`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 p-4 flex justify-between items-center backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
            RK
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">RK Voice & Studio AI</h1>
            <p className="text-xs text-indigo-400 font-medium">Boss Mode Active</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`h-3 w-3 rounded-full ${sessionState === 'listening' ? 'bg-green-500 animate-ping' : 'bg-slate-600'}`}></span>
          <span className="text-xs text-slate-400 capitalize">{sessionState}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col justify-between">
        
        {/* Boss Response Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden my-auto">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center space-x-3 text-indigo-400 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold tracking-wider uppercase">Assistant Response</span>
          </div>

          <div className="text-2xl md:text-3xl font-extrabold text-white mt-2 mb-4">
            "{bossMessage}"
          </div>

          {statusNotification && (
            <div className="inline-flex items-center space-x-2 bg-indigo-950/60 text-indigo-300 text-xs px-3 py-1.5 rounded-lg border border-indigo-800/50 animate-pulse">
              <CheckCircle className="w-4 h-4" />
              <span>{statusNotification}</span>
            </div>
          )}
        </div>

        {/* Quick Commands Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-6">
          <button 
            onClick={() => handleExecuteCommand('Video Generation')}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition flex items-center space-x-2">
            <Video className="w-4 h-4 text-indigo-400" />
            <span>Generate Video</span>
          </button>
          <button 
            onClick={() => handleExecuteCommand('Content Automation')}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition flex items-center space-x-2">
            <Radio className="w-4 h-4 text-indigo-400" />
            <span>Run Automations</span>
          </button>
          <button 
            onClick={() => handleExecuteCommand('System Sync')}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition flex items-center space-x-2 col-span-2 md:col-span-1">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Sync Settings</span>
          </button>
        </div>

        {/* Main Voice Mic Button */}
        <div className="flex justify-center my-6">
          <button
            onClick={handleToggleVoice}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              sessionState === 'listening'
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/50 scale-105 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40'
            }`}
          >
            {sessionState === 'listening' ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
        RK AI Assistant • Powered for Boss
      </footer>
    </div>
  );
      }
