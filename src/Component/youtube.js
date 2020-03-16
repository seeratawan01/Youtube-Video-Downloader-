// Youtube
const fs = require('fs')
const path = require('path')
const youtubedl = require('youtube-dl')

module.exports.downloadVideo = (title, mainWindow, { dir, url, f = '18', ext = 'mp4' }) => {
    const video = youtubedl(url,
        // Optional arguments passed to youtube-dl.
        ['-f', f]
    )

    var size = 0
    // Will be called when the download starts.
    video.on('info', function (info) {
        size = info.size

        console.log('Got video info')
        var file = path.join(dir, `${info.fulltitle}.${ext}`)
        video.pipe(fs.createWriteStream(file))
    })

    var pos = 0
    video.on('data', function data(chunk) {
        pos += chunk.length

        // `size` should not be 0 here.
        if (size) {
            let p = ((pos / size)).toFixed(2);
            mainWindow.setProgressBar(parseFloat(p))
            mainWindow.setTitle(`${title} - (${p * 100})`);
        }
    })

    video.on('end', function end() {
        console.log('\nDone')
        mainWindow.setProgressBar(-1)

        // When finish, send signal to renderer
        mainWindow.webContents.send('done', 'done')
    })
};


module.exports.getVideoInfo = (url, cb) => {

    const mapInfo = (item) => {
        return {
            itag: item.format_id,
            filetype: item.ext,
            resolution:
                item.resolution ||
                (item.width ? item.width + 'x' + item.height : 'audio only')
        }
    }

    const formInfo = (err, info) => {
        if (err) {
            throw err
        }

        data = { id: info.id, name: info.fulltitle, thumbnail: info.thumbnails[0].url, formats: info.formats.map(mapInfo) }
        cb(data);
    }

    youtubedl.getInfo(url, formInfo);
}