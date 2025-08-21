// export default function SubmitButton({ onClick }) {
//     return <button onClick={onClick}>Transcribe</button>;
//   }

export default function SubmitButton({ onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      Transcribe
    </button>
  );
}