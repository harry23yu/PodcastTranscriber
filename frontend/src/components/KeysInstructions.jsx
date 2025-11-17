import { Link } from "react-router-dom";

export default function KeysInstructions() {
    return (
      <div className="keys-instructions">
        <h3>How to get your API keys:</h3>
  
        <p>
          <b>Step 1: </b>Go to the <a href="https://www.assemblyai.com/" target="_blank" rel="noopener noreferrer">AssemblyAI page</a> and sign up or create an account.
          <div style={{ marginBottom: '8px' }} />
          <b>Step 2: </b> Once you are logged in, go to the <a href="https://www.assemblyai.com/dashboard/api-keys" target="_blank" rel="noopener noreferrer">API Keys tab</a> in the left-hand sidebar.
          <div style={{ marginBottom: '8px' }} />
          <img src="Step2.png" className="first-photo" alt="AssemblyAI dashboard with the sidebar, and one of the tabs is called 'API Keys.'" />
          <div style={{ marginBottom: '8px' }} />
          <b>Step 3: </b> Click "Create new API key" if you don't have a key yet. Give it a name (any name is okay).
          <div style={{ marginBottom: '8px' }} />
          <img src="Step3.png" alt="The 'Create new API key' button is near the bottom-left side of the page." />
          <div style={{ marginBottom: '8px' }} />
          <b>Step 4: </b> Copy and paste the key into the AssemblyAI API key input box.
          <div style={{ marginBottom: '8px' }} />
          <b><i>Only read steps 5-8 if you plan on using an OpenAI key to remove the ads from the transcript.</i></b>
          <div style={{ marginBottom: '8px' }} />
          <b>Step 5: </b>Go to the <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer">OpenAI Platform page</a> and sign up or create an account.
          <div style={{ marginBottom: '8px' }} />
          <b>Step 6: </b> Once you are logged in, create an OpenAI API key by going <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">here</a> and clicking the "Create new secret key" button.
          <div style={{ marginBottom: '8px' }} />
          <img src="Step6.png" alt="The 'Create new secret key' button is very close to the top-right side of the page." />
          <div style={{ marginBottom: '8px' }} />
          <b>Step 7: </b> Make sure it's owned by you (not a service account), give it an optional name, assign it to a project, and choose "All" for permissions.
          <div style={{ marginBottom: '8px' }} />
          <img src="Step7.png" alt="This little menu will only pop-up once you click the 'Create new secret key' button from step 6." />
          <div style={{ marginBottom: '8px' }} />
          <b>Step 8: </b> Click "Create secret key," and copy and paste the key into the OpenAI API key input box. 
        </p>
  
        <b><i>Important: If you plan on using the transcription tool more than once, it is a good idea to save the key somewhere in a secure location so you don't forget it later. You’ll paste them into the tool when asked.</i></b>

        <br></br>
        <br></br>
        <Link to="/">Back to home page</Link>
      </div>
    );
  }  