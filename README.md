# RK — Voice Assistant

Real-time voice-to-voice assistant built with React + TypeScript + Vite +
Tailwind, using Gemini Live API (`gemini-3.1-flash-live-preview`) for
audio-to-audio conversation. "RK" calls the user "Boss," speaks Hindi/Hinglish
by default, and only acts on direct commands.

## Setup (run this on your own computer)

npm install
cp .env.example .env
npm run dev

Then open the printed URL. To test on your Android phone: connect the phone
to the same wifi as your computer, then open http://<your-computer-ip>:5173
in Chrome on the phone. Chrome will ask for microphone permission — allow it.

Get a free Gemini API key at https://aistudio.google.com/apikey — note the
free tier has rate limits (requests per minute/day), it is not unlimited.

## What's implemented

- src/lib/audioStreamer.ts — mic capture to PCM16 16kHz chunks, and
  playback of the model's 24kHz audio response via Web Audio API
- src/lib/liveSession.ts — Gemini Live API connection, streaming,
  function-calling, and barge-in/interruption handling
- src/lib/persona.ts — RK's system instruction (personality, language,
  "only act on direct commands" rule)
- src/lib/tools.ts — function-calling tools; openWebsite is implemented
  as a working example
- src/App.tsx plus components/ — fullscreen dark UI with mic button,
  waveform, and state-based visuals (idle/connecting/listening/speaking)

## What is NOT included, and why

- WhatsApp call handling — WhatsApp has no public API for automating or
  answering voice calls.
- "Free, unlimited everything" — every free tier has usage limits.
- Auto-deploy to a live website — deploying to Vercel/Netlify takes a
  few minutes once you connect your own account.
- The full feature list (SEO tool, logo generator, video
  editor/generator, automation engine, etc.) — each is its own project.

## Adding a new capability

1. Add a new entry to tools in src/lib/tools.ts.
2. RK will automatically be able to call it once it's listed.
