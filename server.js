//
// Express HTTP File Server with Lusca and DDoS Rate Limiting
//
// Author: Jon Fairbanks (https://github.com/jonfairbanks)
//
// Options:
//    - SESSION_SECRET: Either a string or array of secrets used to sign the session ID cookie (If array: first is used to sign, others are used to verify)
//    - LOGGING: If 'true', an access.log will be created for incoming site requests using Morgan logging
//    - RATE_LIMIT: If 'true', enables DDoS and RateLimit protections through Express
//    - SITE_ROOT: If set to a string, that path will be used as the default site root instead of the default of 'public'
//    - MODE: If set as `api`, ExpressHTTP will start in API mode and return a JSON response at /api.
//
const express = require('express'),
  Ddos = require('ddos'),
  RateLimit = require('express-rate-limit'),
  fs = require('fs'),
  path = require('path'),
  morgan = require('morgan'),
  session = require('express-session'),
  lusca = require('lusca'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser');

const app = express()
const router = express.Router()

// Set additional headers and other middlewares if required
app.disable('x-powered-by') // Disables Express' "X-Powered-By" Header
app.use((req, res, next) => {
  res.setHeader('X-Timestamp', Date.now()) // Tag all requests with a timestamp
  res.setHeader('X-Words-of-Wisdom', 'You come at the king, you best not miss. - Omar Little') // Yo dawg...
  next()
})

if(process.env.LOGGING == true) {
  // Create a write stream to log requests (a = append)
  var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
  app.use(morgan('short', {stream: accessLogStream}))
}

if(process.env.RATE_LIMIT == true) {
  // Setup DDoS & Rate Limiting
  const ddos = new Ddos({burst:10, limit:15})
  const limiter = new RateLimit({
    windowMs: 15*60*1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    delayMs: 0 // Disable delaying - full speed until the max limit is reached
  })
  app.use(ddos.express)
  app.use('/', limiter)
}

var port = null
if(process.env.PORT){ port = process.env.PORT; }else{ port = 8888; } // Default port is 8888 unless passed

if(process.env.MODE='api'){
  console.log('**   The Server is starting in API mode!   **')
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  // To prevent errors from Cross-Origin resource sharing, set headers to allow CORS with middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers')
    res.setHeader('Cache-Control', 'no-cache')
    next()
  });
  //now we can set the route path & initialize the API
  router.get('/', (req, res) => {
   res.json({ message: 'API Initialized!'})
  });
  app.use('/api', router)
  app.listen(port, () => console.log('API Listening on Port ' + port))
}else {
  // Setup Session Management & Lusca
  if(!process.env.SESSION_SECRET){ console.warn("SESSION_SECRET not passed. Using a default value.") }
  app.use(session({
  	secret: process.env.SESSION_SECRET || "MySessionSecret",
  	resave: false,
  	saveUninitialized: true,
    cookie: { secure: true }
  }))
  app.use(lusca({
    csrf: true,
    csp: false, // Set a valid CSP if desired - https://hacks.mozilla.org/2016/02/implementing-content-security-policy/
    xframe: 'SAMEORIGIN',
    hsts: {maxAge: 31536000, includeSubDomains: true, preload: true},
    xssProtection: true,
    nosniff: true,
    referrerPolicy: 'same-origin'
  }))
  app.use('/', express.static(path.join(__dirname, process.env.SITE_ROOT || 'public'))) // Use the ENV defined site root or default "public"
  app.listen(port, () => console.log('App Listening on Port ' + port))
}
