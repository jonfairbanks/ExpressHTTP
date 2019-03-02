const express = require('express'),
  Ddos = require('ddos'),
  RateLimit = require('express-rate-limit'),
  fs = require('fs'),
  path = require('path'),
  morgan = require('morgan'),
  session = require('express-session'),
  lusca = require('lusca')

const app = express()

// Setup Session Management & Lusca
if(!process.env.SESSION_SECRET){ console.warn("SESSION_SECRET not passed. Using a default value."); }
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

// Set additional headers and other middlewares if required
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.setHeader('X-Timestamp', Date.now()) // Tag all requests with a timestamp
  res.setHeader('X-Words-of-Wisdom', 'You come at the king, you best not miss. - Omar Little') // Yo dawg...
  next();
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
    max: 100, // limit each IP to 100 requests per windowMs
    delayMs: 0 // disable delaying - full speed until the max limit is reached
  })
  app.use(ddos.express)
  app.use('/', limiter)
}

var port = null;
if(process.env.PORT){ port = process.env.PORT; }else{ port = 8888; } // Default port is 8888 unless passed

app.use('/', express.static(path.join(__dirname, process.env.SITE_ROOT || 'public'))) // Use the ENV defined site root or default "public"

app.listen(port, () => console.log('App Listening on Port ' + port))