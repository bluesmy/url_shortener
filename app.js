const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/url', { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')
})

const Url = require('./models/url')

//Url Shortener 首頁
app.get('/', (req, res) => {
  res.send('hello world')
})

// 新增一筆 short url
app.post('/shortUrl', (req, res) => {
  res.send('新增short url')
})

// 導向 short url網址
app.get('/:shortUrl_id', (req, res) => {
  res.send('導向short url網址')
})

app.listen(3000, () => {
  console.log('App is running!')
})