var express  = require('express');
var app      = express();
var template = require('./views/index.jade');
var metadata = require('./webtask.json');
var auth0    = require('auth0-oauth2-express');

app.use('/.extensions', require('./hooks'));

app.use(function (req, res, next) {
  auth0({
    scopes:              req.webtaskContext.data.AUTH0_SCOPES,
    clientId:            req.webtaskContext.data.AUTH0_CLIENT_ID,
    rootTenantAuthority: 'https://' + req.webtaskContext.data.AUTH0_DOMAIN
  })(req, res, next)
});

app.get('/', function (req, res) {
  res.header("Content-Type", 'text/html');
  res.status(200).send(template({
    baseUrl: res.locals.baseUrl,
    domain: 'https://' + req.webtaskContext.data.AUTH0_DOMAIN
  }));
});

// This endpoint would be called by webtask-gallery to dicover your metadata
app.get('/meta', function (req, res) {
  res.status(200).send(metadata);
});

module.exports = app;
