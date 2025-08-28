import { useState, useEffect } from "react";

export default function ApiKeys() {

  // Clear saved API keys from localStorage when the page first loads
  useEffect(() => {
    localStorage.removeItem("assemblyai_api_key");
    localStorage.removeItem("openai_api_key");
  }, []);

  const [assemblyKey, setAssemblyKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");

  useEffect(() => {
    if (assemblyKey) {
      sessionStorage.setItem("assemblyai_api_key", assemblyKey);
      localStorage.setItem("assemblyai_api_key", assemblyKey);
    } 
    else {
      sessionStorage.removeItem("assemblyai_api_key");
      localStorage.removeItem("assemblyai_api_key");
    }
  }, [assemblyKey]);

  useEffect(() => {
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
        <label className="block mb-1">AssemblyAI key (required): </label>
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
        <label className="block mb-1">OpenAI key (optional): </label>
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