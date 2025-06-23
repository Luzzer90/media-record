import React, { useState, useRef } from 'react';
import { downloadBlob } from '../component/util/downloadBlob';
import './audiorecoder.css'; // Assuming you have a CSS file for styling

function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [visualizing, setVisualizing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);

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

  const startVisualizer = (stream) => {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 64;
    analyserRef.current = analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function draw() {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = '#f1f1f1';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength);
      dataArray.forEach((value, i) => {
        const barHeight = value / 2;
        ctx.fillStyle = '#1a73e8';
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
      });
    }
    draw();
  };

  const pauseTimer = () => clearInterval(timerRef.current);
  const resumeTimer = () => startTimer();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
        setShowPlayer(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setIsPaused(false);
      setVisualizing(true);
      startTimer();
      startVisualizer(stream);
    } catch (err) {
      alert('Microphone access denied or not supported');
      console.error(err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    stopTimer();
    setVisualizing(false);
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
    const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
    downloadBlob(blob, 'audio_recording.webm');
  };

  return (
    <div className="recorder-box">
      <h2 className="recorder-title"> Audio Recorder</h2>
      {recording && (
        <>
          <div className="recorder-timer">
             {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:{String(elapsedTime % 60).padStart(2, '0')}
          </div>
          <canvas ref={canvasRef} width="300" height="50" className="audio-visualizer"></canvas>
        </>
      )}

      <div className="control-bar">
        {!recording && <button className="control-btn" onClick={startRecording}> Start</button>}
        {recording && (
          <>
            <button className="control-btn" onClick={stopRecording}> Stop</button>
            <button className="control-btn" onClick={togglePause}>{isPaused ? ' Resume' : ' Pause'}</button>
          </>
        )}
      </div>

      {showPlayer && (
        <div className="preview-box">
          <h3>Preview</h3>
          <audio controls src={audioURL}></audio>
          <button onClick={handleDownload} className="download-btn"> Download Audio</button>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
