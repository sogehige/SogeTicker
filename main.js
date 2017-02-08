'use strict'

var ini = require('ini')
var fs = require('fs')
var ioClient = require('socket.io-client')

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))
var socket = ioClient.connect('http://' + config.server.url + ':' + config.server.port)

var save = function (file, string) {
  fs.writeFile('./' + file, string, function (err) {
    if (err) { return console.log(err) }
  })
}

socket.on('videoID', function (song) {
  save('currentsong.txt', typeof song.title === 'string' ? song.title : config.empty.currentSong)
  save('currentsong_lowercase.txt', typeof song.title === 'string' ? song.title.toLowerCase() : config.empty.currentSong)
  save('currentsong_w_separator.txt', typeof song.title === 'string' ? song.title + config.separator.default : config.empty.currentSong + config.separator.default)
  save('currentsong_w_separator_lowercase.txt', typeof song.title === 'string' ? song.title.toLowerCase() + config.separator.default : config.empty.currentSong + config.separator.default)
})
