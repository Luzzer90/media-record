import React, { useState } from 'react';
import './App.css';
import AudioRecorder from './component/audiorecoder';
import VideoRecorder from './component/videorecoder';

function App() {
  const [mode, setMode] = useState('audio'); 
  // Default mode is set to 'audio'
  // it's used to toggle between audio and video recording modes

  return (
    <div className="container">
      <h1>Audio & Video Recorder</h1>
      <div className="button-group">
        <button onClick={() => setMode('audio')}>🎤 Audio Mode</button>
        <button onClick={() => setMode('video')}>🎥 Video Mode</button>
      </div>
      {mode === 'audio' ? <AudioRecorder /> : <VideoRecorder />}
    </div>
  );
}

export default App;
// The App component serves as the main entry point for the application.