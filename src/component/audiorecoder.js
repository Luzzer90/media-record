import React, { useState, useRef } from 'react';
import { downloadBlob } from '../component/util/downloadBlob';
import './audiorecoder.css'; // Assuming you have a CSS file for styling
function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorderRef.current.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
        setShowPlayer(true);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      alert('Microphone access denied or not supported');
      console.error(err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleDownload = () => {
    const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
    downloadBlob(blob, 'recording.webm');
  };

  return (
    <div className="recorder-box">
      <h2 style={{ textAlign: 'center' }}>Audio Recorder</h2>

      <div className="button-group" style={{ marginTop: '1rem' }}>
        {recording ? (
          <button onClick={stopRecording}> Stop Recording</button>
        ) : (
          <button onClick={startRecording}> Start Recording</button>
        )}
      </div>

      {showPlayer && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3>Preview Recording</h3>
          <audio controls src={audioURL} />
          <br />
          <button onClick={handleDownload} style={{ marginTop: '1rem' }}>
             Download Audio
          </button>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
