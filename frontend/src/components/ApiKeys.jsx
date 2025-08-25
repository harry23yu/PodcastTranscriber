import { useState, useEffect } from "react";

export default function ApiKeys() {
  // Always clear keys on page load
  useEffect(() => {
    // sessionStorage.removeItem("assemblyai_api_key");
    // sessionStorage.removeItem("openai_api_key");
    localStorage.removeItem("assemblyai_api_key");
    localStorage.removeItem("openai_api_key");
  }, []);

  const [assemblyKey, setAssemblyKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");

  useEffect(() => {
    // if (assemblyKey) {
      // sessionStorage.setItem("assemblyai_api_key", assemblyKey);
      // localStorage.setItem("assemblyai_api_key", assemblyKey);
    if (assemblyKey) {
      sessionStorage.setItem("assemblyai_api_key", assemblyKey);
      localStorage.setItem("assemblyai_api_key", assemblyKey);
    } 
    else {
      sessionStorage.removeItem("assemblyai_api_key");
      localStorage.removeItem("assemblyai_api_key");
    }
    // }
  }, [assemblyKey]);

  useEffect(() => {
    // if (openaiKey) {
    //   sessionStorage.setItem("openai_api_key", openaiKey);
    //   localStorage.setItem("openai_api_key", openaiKey);
    // }
    if (openaiKey) {
      sessionStorage.setItem("openai_api_key", openaiKey);
      localStorage.setItem("openai_api_key", openaiKey);
    }
    else {
      sessionStorage.removeItem("openai_api_key");
      localStorage.removeItem("openai_api_key");
    }
  }, [openaiKey]);

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">API Keys</h2>

      {/* AssemblyAI */}
      <div className="mb-3">
        <label className="block mb-1">AssemblyAI Key: </label>
        <input
          type="password"
          value={assemblyKey}
          onChange={(e) => setAssemblyKey(e.target.value.trim())}
          placeholder="🔑 Paste AssemblyAI API key..."
          className="border px-2 py-1 rounded api-input"
        />
      </div>

      {/* OpenAI */}
      <div className="mb-3">
        <label className="block mb-1">OpenAI Key: </label>
        <input
          type="password"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value.trim())}
          placeholder="🔑 Paste OpenAI API key..."
          className="border px-2 py-1 rounded api-input"
        />
      </div>

      <p className="text-xs text-gray-500">
        Your keys are stored only during this session. They will disappear every time you refresh the page.
      </p>
    </div>
  );
}

// Issues to fix:
// 1. Duration is in seconds, not hh:mm:ss (SOLVED)
// 2. Profanity toggle not working (SOLVED)
// 3. Baked-in ads are in the transcript
// 4. Even with random and wrong API keys, transcription still work