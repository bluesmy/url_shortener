const express = require('express')
const app = express()
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const generate = require('nanoid/generate')

app.use(bodyParser.urlencoded({ extended: true }))

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

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
  res.render('index')
})

// 新增一筆 short url
app.post('/shortUrl', (req, res) => {
  const originalUrl = req.body.originalUrl
  const host = req.headers.host

  Url.findOne({ originalUrl: originalUrl }).then(url => {
    if (url) {
      console.log('Url already shortened')
      const shortUrl = url.shortUrl
      const completeShortUrl = `https://${host}/${shortUrl}`
      res.render('index', { shortUrl: completeShortUrl })
    } else {
      const shortUrl = generate('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)
      const url = new Url({
        originalUrl: req.body.originalUrl,
        shortUrl: host + '/' + shortUrl
      })
      const completeShortUrl = `https://${host}/${shortUrl}`
      url.save(err => {
        if (err) return console.error(err)
        return res.render('index', { shortUrl: completeShortUrl })
      })
    }
  })
})

// 導向 short url網址
app.get('/:shortUrl_id', (req, res) => {
  res.send('導向short url網址')
})

app.listen(3000, () => {
  console.log('App is running!')
})