var express  = require('express');
var Request  = require('superagent');
var ManagementClient = require('auth0@2.1.0').ManagementClient;
var _        = require('lodash');
var jwt      = require('jsonwebtoken');
var hooks    = express.Router();
var Path     = require('path');

module.exports = hooks;

function validateJwt (path) {
  return function (req, res, next) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      var token = req.headers.authorization.split(' ')[1];
      var isValid = jwt.verify(token, req.webtaskContext.data.EXTENSION_SECRET, {
        audience: Path.join(req.webtaskContext.data.WT_URL, path),
        issuer: 'https://' + req.webtaskContext.data.AUTH0_DOMAIN
      });

      if (!isValid) {
        return res.sendStatus(401);
      }

      return next();
    }

    return res.sendStatus(401);
  }
}

// Validate JWT for on-install
hooks.use('/on-install', validateJwt('/.extensions/on-install'));
hooks.use('/on-uninstall', validateJwt('/.extensions/on-uninstall'));

// Getting Auth0 APIV2 access_token
hooks.use(function (req, res, next) {
  getToken(req, function (access_token, err) {
    if (err) return next(err);

    var management = new ManagementClient({
      domain: req.webtaskContext.data.AUTH0_DOMAIN,
      token: access_token
    });

    req.auth0 = management;

    next();
  });
});

// This endpoint would be called by webtask-gallery
hooks.post('/on-install', function (req, res) {
  req.auth0.rules.create({
    name: 'extension-rule',
    script: "function (user, context, callback) {\n  callback(null, user, context);\n}",
    order: 2,
    enabled: true,
    stage: "login_success"
  })
  .then(function () {
    res.sendStatus(204);
  })
  .catch(function () {
    res.sendStatus(500);
  });
});

// This endpoint would be called by webtask-gallery
hooks.delete('/on-uninstall', function (req, res) {
  req.auth0
    .rules.getAll()
    .then(function (rules) {
      var rule = _.find(rules, {name: 'extension-rule'});

      if (rule) {
        req.auth0
          .rules.delete({ id: rule.id })
          .then(function () {
            res.sendStatus(204);
          })
          .catch(function () {
            res.sendStatus(500);
          });
      }
    })
    .catch(function () {
      res.sendStatus(500);
    });
});

function getToken(req, cb) {
  var apiUrl = 'https://'+req.webtaskContext.data.AUTH0_DOMAIN+'/oauth/token';
  var audience = 'https://'+req.webtaskContext.data.AUTH0_DOMAIN+'/api/v2/';
  var clientId = req.webtaskContext.data.AUTH0_CLIENT_ID;
  var clientSecret = req.webtaskContext.data.AUTH0_CLIENT_SECRET;

  Request
    .post(apiUrl)
    .send({
      audience: audience,
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
    .type('application/json')
    .end(function (err, res) {
      if (err || !res.ok) {
        cb(null, err);
      } else {
        cb(res.body.access_token);
      }
    });
}
