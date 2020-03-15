import React, { useEffect, useState } from 'react';
import './App.css';
const ipcRenderer = window.require('electron').ipcRenderer;

const App = () => {

  const [url, setUrl] = useState('https://www.youtube.com/watch?v=dZJiY8SHHWI');
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    ipcRenderer.on('reply', (event, arg) => {
      if (arg === 'get') {
        setDisabled(true)
      }
    })

    ipcRenderer.on('done', (event, arg) => {
      if (arg === 'done') {
        setDisabled(false)
      }
    })
  }, []);

  const sendURL = () => {
    if (isYouTubeUrl(url)) {
      ipcRenderer.send('url', url);
    } else {
      ipcRenderer.send('error121', 'Please enter valid youtube video link');
    }
  }

  const isYouTubeUrl = (url) => {
    const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
    const found = url.match(regex);

    if (found != null) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <div className="App">
      <input type="text" placeholder="Enter The URL" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button onClick={() => sendURL()} disabled={disabled}>
        Search
      </button>
      <br />
      {/* More Controls */}
      <input type="text" />
    </div>
  );
}

export default App;
