# ExpressHTTP :shipit:

Express HTTP File Server with Helmet and DDoS Rate Limiting

#### Prerequisites

- Node v10+
- A Redis instance: `docker run --name redis -d -p 6379:6379 redis`

#### Quick Start

- Fetch the code using git or wget
- While in the app directory run `npm install` to setup
- Once complete, run `npm start` to launch the server
- Load files into the **public/** directory
- Navigate to <host>:8888/ in your browser

_[Optional] To keep ExpressHTTP up and running behind the scenes, checkout [PM2](http://pm2.keymetrics.io/ 'PM2')._

#### Production Support

To properly enable session support in ExpressHTTP, you must utilize a Redis instance. By default ExpressHTTP connects to a Redis instance running on the localhost when the app is launched in `production` mode. To override these settings, see the [Config Options](#Config-Options) below.

To setup a Redis instance if you do not have one running already: `docker run --name redis -d -p 6379:6379 redis`

Finally, run ExpressHTTP in `production` mode: `NODE_ENV=production npm start`

#### Running with Docker

ExpressHTTP is also available on [DockerHub](https://hub.docker.com/r/jonfairbanks/expresshttp).

Before Docker setup, ensure Redis is running and finally run the following command:

`docker run -d -p 8080:8080 -e REDIS_HOST=1.2.3.4 -v ~/ExpressHTTP/public:/app/public --name ExpressHTTP --restart=always jonfairbanks/expresshttp`

#### Config Options

The following options can be passed in at runtime as ENV variables:

- `SESSION_SECRET`: Either a string or array of secrets used to sign the session ID cookie
  - If array is passed -- the first secret is to sign, other secrets are used to verify
- `LOGGING`: If **true**, an access.log will be created for incoming site requests using Morgan logging
- `RATE_LIMIT`: If **true**, enables DDoS and RateLimit protections through Express
- `SITE_ROOT`: Override the default path files are served from (default: /public)
- `PORT`: Override the default address the ExpressHTTP app is served from (default: 8080)
- `REDIS`: If **true**, Express sessions will be saved in Redis (ideal for production)
- `REDIS_HOST`: Override the default address used to connect to Redis (default: 127.0.0.1)
- `REDIS_PORT`: Override the default port used to connect to Redis (default: 6370)
