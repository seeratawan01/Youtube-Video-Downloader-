import React, { useEffect, useState } from 'react';
import './App.css';
const ipcRenderer = window.require('electron').ipcRenderer;

const App = () => {

  const [value, setValue] = useState('https://www.youtube.com/watch?v=dZJiY8SHHWI');
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
    ipcRenderer.send('value', value);
  }

  return (
    <div className="App">
      <input type="text" placeholder="Enter The URL" value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={() => sendURL()} disabled={disabled}>
        Start
      </button>
    </div>
  );
}

export default App;
