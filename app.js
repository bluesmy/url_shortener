const express = require('express')
const app = express()
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const generate = require('nanoid/generate')

app.use(bodyParser.urlencoded({ extended: true }))

app.engine('handlebars', exphbs({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(express.static('public'))

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/url', { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})

db.once('open', () => {
  console.log('mongodb connected!')
})

const Url = require('./models/url')

app.get('/', (req, res) => {
  res.redirect('/shortUrl')
})

app.get('/shortUrl', (req, res) => {
  res.render('index')
})

app.post('/shortUrl', (req, res) => {
  const originalUrl = req.body.originalUrl
  const host = req.headers.host

  // alert when no input or input format is wrong
  const httpRegex = /^http:\/\//
  const httpsRegex = /^https:\/\//
  if (!originalUrl || (!originalUrl.match(httpRegex) && !originalUrl.match(httpsRegex))) {
    res.render('index', {
      originalUrl,
      error: 'Please enter a valid url: http://... or https://...'
    })
  }

  Url.findOne({ originalUrl: originalUrl }).then(async url => {
    if (url) {
      console.log('Url already shortened')
      const shortUrl = url.shortUrl
      const completeShortUrl = `https://${host}/${shortUrl}`
      res.render('index', { shortUrl: completeShortUrl })
    } else {
      // avoid duplicate short url
      let shortUrl = ''
      while (true) {
        shortUrl = generate('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)
        const duplicateUrl = await Url.findOne({ shortUrl: shortUrl })
        console.log('duplicate shortUrl!')
        if (!duplicateUrl) {
          console.log('shortUrl is created')
          break
        }
      }

      const url = new Url({
        originalUrl: req.body.originalUrl,
        shortUrl: shortUrl
      })

      const isHttpRegex = originalUrl.match(httpRegex)
      const isHttpsRegex = originalUrl.match(httpsRegex)

      if (isHttpRegex) {
        const completeShortUrl = `http://${host}/${shortUrl}`
        url.save(err => {
          if (err) return console.error(err)
          return res.render('index', { shortUrl: completeShortUrl })
        })
      }
      if (isHttpsRegex) {
        const completeShortUrl = `https://${host}/${shortUrl}`
        url.save(err => {
          if (err) return console.error(err)
          return res.render('index', { shortUrl: completeShortUrl })
        })
      }
    }
  })
})

app.get('/:shortUrl_id', (req, res) => {
  Url.findOne({ shortUrl: req.params.shortUrl_id }).then(url => {
    if (url) {
      res.redirect(`${url.originalUrl}`)
    } else {
      res.redirect('/')
    }
  }).catch(err => console.log(err))
})

app.listen(process.env.PORT || 3000, () => {
  console.log('App is running!')
})