export default function MicButton({ src, recognizing, onToggle }) {
  return (
    <div className="right">
      <button
        id="start_button"
        type="button"
        aria-pressed={recognizing}
        aria-label={recognizing ? 'Stop recording' : 'Start recording'}
        onClick={onToggle}
      >
        <img id="start_img" src={src} alt={recognizing ? 'Stop' : 'Start'} />
      </button>
    </div>
  );
}
