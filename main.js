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

socket.once('connect', function () {
  setInterval(function () {
    socket.emit('getCurrentSong')
  }, 5000)
})

socket.on('currentSong', function (song) {
  save('currentsong.txt', typeof song.title === 'string' ? song.title : config.empty.currentSong)
})
