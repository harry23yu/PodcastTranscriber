export default function LinkInput({ value, onChange }) {
    return (
      <input
        type="text"
        placeholder="🔗 Enter Spotify episode link..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }  