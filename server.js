const express = require('express');
const Ddos = require('ddos');
const RateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const helmet = require('helmet');

const app = express();

// Setup Session Management & Lusca
if (!process.env.SESSION_SECRET) { console.warn('SESSION_SECRET not passed. Using a default value.'); } // eslint-disable-line no-console
app.use(session({
  secret: process.env.SESSION_SECRET || 'MySessionSecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));

app.use(helmet());

// Set additional headers and other middlewares if required
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Timestamp', Date.now()); // Tag all requests with a timestamp
  next();
});

if (process.env.LOGGING === true) {
  // Create a write stream to log requests (a = append)
  const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
  app.use(morgan('short', { stream: accessLogStream }));
}

if (process.env.RATE_LIMIT === true) {
  // Setup DDoS & Rate Limiting
  const ddos = new Ddos({ burst: 10, limit: 15 });
  const limiter = new RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    delayMs: 0, // disable delaying - full speed until the max limit is reached
  });
  app.use(ddos.express);
  app.use('/', limiter);
}

let port = null;
if (process.env.PORT) { port = process.env.PORT; } else { port = 8888; } // eslint-disable-line max-len

app.use('/', express.static(path.join(__dirname, process.env.SITE_ROOT || 'public'))); // Use the ENV defined site root or default "public"

app.listen(port, () => console.log(`App Listening on Port ${port}`)); // eslint-disable-line no-console
