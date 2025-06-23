import React, { useRef, useState } from 'react';
import { downloadBlob } from '../component/util/downloadBlob';
import './videorecoder.css'; // Assuming you have a CSS file for styling

function VideoRecorder() {
  const videoPreviewRef = useRef(null);
  const [videoURL, setVideoURL] = useState('');
  const [recording, setRecording] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      // Set the video preview source to the stream
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunks.current = [];
      // Collect data chunks as they become available

      mediaRecorderRef.current.ondataavailable = e => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      // When recording stops, create a Blob from the collected chunks

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setShowPlayer(true);
        stream.getTracks().forEach(track => track.stop());
      };
      // Start recording

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      alert('Camera access denied or not supported');
      console.error(err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    // Stop the video stream
    setRecording(false);
  };

  const handleDownload = () => {
    const blob = new Blob(chunks.current, { type: 'video/webm' });
    downloadBlob(blob, 'video_recording.webm');
    // Trigger download of the recorded video
  };

  return (
    <div className="recorder-box">
      <h2 style={{ textAlign: 'center' }}>Video Recorder with Live Preview</h2>

      <video
        ref={videoPreviewRef}
        muted
        autoPlay
        className="preview-video"
        style={{
          width: '100%',
          maxWidth: '100%',
          border: '1px solid #ccc',
          borderRadius: '8px',
          marginTop: '1rem',
        }}
      ></video>

      <div className="button-group" style={{ marginTop: '1rem' }}>
        {recording ? (
          <button onClick={stopRecording}> Stop Recording</button>
        ) : (
          <button onClick={startRecording}> Start Recording</button>
        )}
      </div>

      {showPlayer && videoURL && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3>Preview Recording</h3>
          <video
            controls
            src={videoURL}
            style={{
              width: '100%',
              maxWidth: '100%',
              border: '1px solid #ccc',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          ></video>
          <br />
          <button onClick={handleDownload}>Download Video</button>
        </div>
      )}
    </div>
  );
}

export default VideoRecorder;
