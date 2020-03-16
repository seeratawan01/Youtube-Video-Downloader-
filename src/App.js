import React, { useEffect, useState } from 'react';
import './App.css';
const ipcRenderer = window.require('electron').ipcRenderer;

const App = () => {

  const [url, setUrl] = useState('https://www.youtube.com/watch?v=dZJiY8SHHWI');
  const [disabled, setDisabled] = useState(false);
  const [download, setDownload] = useState(false);
  const [info, setInfo] = useState({});
  const [options, setOptions] = useState(['18', 'mp4']);

  useEffect(() => {

    ipcRenderer.on('videoInfo', (event, arg) => {
      if (arg !== null) {
        setInfo(arg);
        setDisabled(false)
      } else {
        setDisabled(true)
        console.log("No Data Found!")
      }
    })

    ipcRenderer.on('done', (event, arg) => {
      if (arg === 'done') {
        setDisabled(false)
        setDownload(false);
      }
    })
  }, []);

  const sendURL = () => {
    if (isYouTubeUrl(url)) {
      ipcRenderer.send('url', url);
      setDisabled(true)
      setDisabled(true)
    } else {
      ipcRenderer.send('error', 'Please enter valid youtube video link');
    }
  }
  const downloadVideo = () => {
    ipcRenderer.send('download', { url: url, f: options });
    setDownload(true);
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
      <div className='box'>
        <input type="text" placeholder="Enter The URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button onClick={() => sendURL()} disabled={disabled}>
          Search
      </button>
      </div>

      {/* More Controls */}
      {
        ('formats' in info) ? (
          <>
            <div className='box'>
              <select title="Select Format" value={`${options[0]},${options[1]}`} onChange={(e) => setOptions(e.target.value.split(','))}>
                {
                  info.formats.map(item => {
                    return <option key={item.itag} value={`${item.itag},${item.filetype}`}>{item.resolution} ({item.filetype}) </option>
                  })
                }
              </select>
              <button onClick={() => downloadVideo()} disabled={download}>
                Download Now
            </button>
            </div>
            <img src={info.thumbnail} alt={info.name} width="250" />
          </>
        ) : null
      }
    </div>
  );
}

export default App;
