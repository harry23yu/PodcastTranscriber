export default function SubmitButton({ onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      Transcribe
    </button>
  );
}