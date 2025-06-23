import React, { useRef, useState,useEffect } from 'react';
import { downloadBlob } from '../component/util/downloadBlob';
import './videorecoder.css'; // Assuming you have a CSS file for styling

function VideoRecorder() {
  const videoPreviewRef = useRef(null);
  const [videoURL, setVideoURL] = useState('');
  const [recording, setRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pastRecordings, setPastRecordings] = useState([]);
  const [hoverStates, setHoverStates] = useState([]);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunks = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('videoRecordings')) || [];
    setPastRecordings(stored);
    setHoverStates(new Array(stored.length).fill(false));
  }, []);

  const saveRecording = (blobUrl) => {
    const updated = [...pastRecordings, { url: blobUrl, timestamp: new Date().toLocaleString(), type: 'video/webm' }];
    setPastRecordings(updated);
    setHoverStates([...hoverStates, false]);
    localStorage.setItem('videoRecordings', JSON.stringify(updated));
  };

  const deleteRecording = (index) => {
    const updated = pastRecordings.filter((_, i) => i !== index);
    setPastRecordings(updated);
    setHoverStates(updated.map(() => false));
    localStorage.setItem('videoRecordings', JSON.stringify(updated));
  };

  const downloadRecording = (url, index) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => downloadBlob(blob, `recording_${index + 1}.webm`));
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

  const handleMouseEnter = (index) => {
    const updated = [...hoverStates];
    updated[index] = true;
    setHoverStates(updated);
    const video = document.getElementById(`video-thumb-${index}`);
    if (video?.canPlayType('video/webm')) video.play();
  };

  const handleMouseLeave = (index) => {
    const updated = [...hoverStates];
    updated[index] = false;
    setHoverStates(updated);
    const video = document.getElementById(`video-thumb-${index}`);
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <div className="recorder-box">
      <h2 className="recorder-title"> Video Recorder</h2>
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
        {!recording && <button className="control-btn" onClick={startRecording}> Start</button>}
        {recording && (
          <>
            <button className="control-btn" onClick={stopRecording}> Stop</button>
            <button className="control-btn" onClick={togglePause}>{isPaused ? 'Resume' : ' Pause'}</button>
          </>
        )}
      </div>

      {pastRecordings.length > 0 && (
        <div className="preview-box">
          <h3> Past Recordings</h3>
          <div className="recording-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {pastRecordings.map((rec, index) => (
              <div
                key={index}
                style={{
                  width: 'calc(31% - 1rem)',
                  background: '#f5f5f5',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
              >
                <video
                  id={`video-thumb-${index}`}
                  src={rec.url}
                  muted
                  playsInline
                  type="video/webm"
                  style={{ width: '100%', borderRadius: '6px' }}
                />
                <small style={{ display: 'block', marginTop: '0.25rem' }}>{rec.timestamp}</small>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <button
                    onClick={() => downloadRecording(rec.url, index)}
                    style={{
                      backgroundColor: '#1a73e8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.3rem 0.6rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => deleteRecording(index)}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.3rem 0.6rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                     Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoRecorder;


