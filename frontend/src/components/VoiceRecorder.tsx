// VoiceRecorder.tsx
import { ReactMediaRecorder } from "react-media-recorder";

export default function VoiceRecorder({ onStop }) {
  return (
    <ReactMediaRecorder
      audio
      onStop={(blobUrl, blob) => onStop(blob)}
      render={({ startRecording, stopRecording }) => (
        <div className="flex space-x-2">
          <button onClick={startRecording} className="btn">🎙️ Start</button>
          <button onClick={stopRecording} className="btn">⏹️ Stop</button>
        </div>
      )}
    />
  );
}
