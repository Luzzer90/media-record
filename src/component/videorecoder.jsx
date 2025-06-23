import React, { useRef, useState,useEffect } from 'react';
import { downloadBlob } from '../component/util/downloadBlob';
import './videorecoder.css'; // Assuming you have a CSS file for styling



function VideoRecorder() {
  const videoPreviewRef = useRef(null);
  const [videoURL, setVideoURL] = useState('');
  const [recording, setRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [pastRecordings, setPastRecordings] = useState([]);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('videoRecordings')) || [];
    setPastRecordings(stored);
  }, []);

  const saveRecording = (blobUrl) => {
    const updated = [...pastRecordings, { url: blobUrl, timestamp: new Date().toLocaleString() }];
    setPastRecordings(updated);
    localStorage.setItem('videoRecordings', JSON.stringify(updated));
  };

  const deleteRecording = (index) => {
    const updated = pastRecordings.filter((_, i) => i !== index);
    setPastRecordings(updated);
    localStorage.setItem('videoRecordings', JSON.stringify(updated));
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setElapsedTime(0);
  };

  const pauseTimer = () => clearInterval(timerRef.current);
  const resumeTimer = () => startTimer();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunks.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setShowPlayer(true);
        saveRecording(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setIsPaused(false);
      startTimer();
    } catch (err) {
      alert('Camera access denied or not supported');
      console.error(err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    stopTimer();
    setRecording(false);
    setIsPaused(false);
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      resumeTimer();
    } else {
      mediaRecorderRef.current.pause();
      pauseTimer();
    }
    setIsPaused(prev => !prev);
  };

  const handleDownload = () => {
    const blob = new Blob(chunks.current, { type: 'video/webm' });
    downloadBlob(blob, 'video_recording.webm');
  };

  return (
    <div className="recorder-box">
      <h2 className="recorder-title">📹 Video Recorder</h2>
      {recording && (
        <div className="recorder-timer">
          ⏱ {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:{String(elapsedTime % 60).padStart(2, '0')}
        </div>
      )}

      <video
        ref={videoPreviewRef}
        muted
        autoPlay
        className="video-preview"
        style={{
          width: '100%',
          borderRadius: '12px',
          marginTop: '1rem',
          backgroundColor: '#000'
        }}
      ></video>

      <div className="control-bar">
        {!recording && <button className="control-btn" onClick={startRecording}>🎬 Start</button>}
        {recording && (
          <>
            <button className="control-btn" onClick={stopRecording}>🛑 Stop</button>
            <button className="control-btn" onClick={togglePause}>{isPaused ? '▶️ Resume' : '⏸ Pause'}</button>
          </>
        )}
      </div>

      {showPlayer && videoURL && (
        <div className="preview-box">
          <h3>Preview</h3>
          <video
            controls
            src={videoURL}
            style={{
              width: '100%',
              borderRadius: '12px',
              marginBottom: '1rem',
              backgroundColor: '#000'
            }}
          ></video>
          <button onClick={handleDownload} className="download-btn">⬇️ Download Video</button>
        </div>
      )}

      {pastRecordings.length > 0 && (
        <div className="preview-box">
          <h3>📁 Past Recordings</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {pastRecordings.map((rec, index) => (
              <li key={index} style={{ marginBottom: '0.75rem' }}>
                <small>{rec.timestamp}</small>
                <video src={rec.url} controls style={{ width: '100%', marginTop: '0.5rem' }}></video>
                <button
                  onClick={() => deleteRecording(index)}
                  style={{ marginTop: '0.5rem', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                >
                  🗑 Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default VideoRecorder;


