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

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/shortUrl', (req, res) => {
  const originalUrl = req.body.originalUrl
  const host = req.headers.host

  Url.findOne({ originalUrl: originalUrl }).then(url => {
    if (url) {
      console.log('Url already shortened')
      const shortUrl = url.shortUrl
      const completeShortUrl = `${host}/${shortUrl}`
      res.render('index', { shortUrl: completeShortUrl })
    } else {
      while (true) {
        let shortUrl = ''
        shortUrl = generate('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)
        const duplicateUrl = Url.findOne({ shortUrl: shortUrl })
        if (!duplicateUrl) break
      }

      const url = new Url({
        originalUrl: req.body.originalUrl,
        shortUrl: shortUrl
      })
      const completeShortUrl = `${host}/${shortUrl}`
      url.save(err => {
        if (err) return console.error(err)
        return res.render('index', { shortUrl: completeShortUrl })
      })
    }
  })
})

app.get('/:shortUrl_id', (req, res) => {
  console.log(req.params)
  Url.findOne({ shortUrl: req.params.shortUrl_id }).then(url => {
    if (url) {
      res.redirect(`http://${url.originalUrl}`)
    } else {
      res.redirect('/')
    }
  }).catch(err => console.log(err))
})

app.listen(3000, () => {
  console.log('App is running!')
})