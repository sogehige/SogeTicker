'use strict'

var ini = require('ini')
var fs = require('fs')
var ioClient = require('socket.io-client')
const _ = require('lodash')
const glob = require('glob')
const express = require('express')
const http = require('http')
const path = require('path')

var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))

console.log('Connecting to a sogeBot on http://' + config.bot.url + ':' + config.bot.port)
var socket = ioClient.connect('http://' + config.bot.url + ':' + config.bot.port)

socket.emit('authenticate', config.bot.token.trim())
socket.on('authenticated', function () {
  console.log('Authenticated with a sogeBot on http://' + config.bot.url + ':' + config.bot.port)

  var app = express()
  var server = http.createServer(app)
  var port = process.env.PORT || config.serve.port

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

  // replay system
  var replay = []

  app.use('/replays', express.static(config.replay.folder))

  setInterval(function () {
    glob(config.replay.folder + '/' + config.replay.prefix + '*', function (er, files) {
      _.each(files, function (file) {
        if(((new Date().getTime() - new Date(fs.statSync(file).birthtime).getTime()) / 1000) <= 60) { // file is not older than 60s
          if (!_.includes(replay, file)) { // it was not send
            replay.push(file)
            console.log('Sending a replay video to a bot - http://localhost:%s/replays/%s', port, path.basename(file).replace(/ /g, '%20'))
            socket.emit('replay-video', 'http://localhost:' + port + '/replays/' + path.basename(file).replace(/ /g, '%20'))
            return false // don't continue _.each
          }
        }
      })
    })
  }, 10000)

  server.listen(port, function () {
    console.log('Ticker is available at http://localhost:%s', port)
  })
})