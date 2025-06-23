import React, { useState } from 'react';
import './App.css';
import AudioRecorder from './component/audiorecoder';
import VideoRecorder from './component/videorecoder';


function App() {

  const [mode, setMode] = useState('audio'); 
  // Default mode is set to 'audio'
  // it's used to toggle between audio and video recording modes
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  
   return (
    <div className={theme}>
      {/* Theme Toggle in Top-Right Corner */}
      <div className="theme-toggle-wrapper">
        <label className="theme-toggle-label"></label>
        <label className="theme-switch">
          <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
          <span className="slider"></span>
        </label>
      </div>

      {/* Main Container */}
      <div className="container">
        <h1> Audio & Video Recorder</h1>

        <div className="button-group">
          <button
            className={mode === 'audio' ? 'active' : ''}
            onClick={() => setMode('audio')}
          >
            Audio Mode
          </button>
          <button
            className={mode === 'video' ? 'active' : ''}
            onClick={() => setMode('video')}
          >
            Video Mode
          </button>
        </div>

        {mode === 'audio' ? <AudioRecorder /> : <VideoRecorder />}
      </div>
    </div>
  );
}


export default App;
// The App component serves as the main entry point for the application.