# ExpressHTTP :shipit:

Express HTTP File Server with Lusca and DDoS Rate Limiting

#### Prerequisites
- Node v8+
- Yarn (prefered) or NPM
- Port 8888 Open and Accessible

#### Quick Start
- Fetch the code using git or wget
- While in the app directory, `yarn` or `npm install` to setup
- Once complete, `yarn start` or `npm start` to launch the server
- Load files into the **public/** directory
- Navigate to <host>:8888/ in your browser

*[Optional] To keep ExpressHTTP up and running behind the scenes, checkout [PM2](http://pm2.keymetrics.io/ "PM2").*


#### Config Options
The following options can be passed in at runtime as ENV variables:
- `SESSION_SECRET`: Either a string or array of secrets used to sign the session ID cookie (If array: first is used to sign, others are used to verify)
- `LOGGING`: If **true**, an access.log will be created for incoming site requests using Morgan logging
- `RATE_LIMIT`: If **true**, enables DDoS and RateLimit protections through Express
- `SITE_ROOT`: If set to a string, that path will be used as the default site root instead of the default of **public/**.
- `PORT`: If set, an alternate port will be used when starting ExpressHTTP. Otherwise, the default of **8888** will be used.