# Working with hooks

**Auth0 extensions** supports hooks where you can add logic for creating artifacts required by your extension like `rules`, `resource servers`, etc.

## Enabling hooks

For using hooks you will have to do two things. 

- Add a `onInstallPath` and/or `onUninstallPath` to your `webtask.json`

```javascript
"auth0": {
  "createClient": true,
  "scopes": "create:rules read:rules delete:rules",
  "onInstallPath": "/.extensions/on-install",
  "onUninstallPath": "/.extensions/on-uninstall"
}
```

- Add a handler to your extension for those path.

```javascript
app.use('/.extensions/on-install', ...);

app.use('/.extensions/on-uninstall', ...);
```

Note: if you don't add the entries to the `webtask.json` **Auth0 extensions** will not execute the hooks.

## OnInstall Hook

*Auth0 extensions* will call the hook and if everything is OK it will process to install the extension.

### Sample

In this example, we are creating a rule that will be used by the extension.

```javascript
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
```

## OnUninstall Hook 

*Auth0 extensions* will call the hook and if everything is OK it will proceed to delete the extension.

### Sample

In this example, we are deleting the rule created for the extension.

```javascript
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
```

## Deploying as Auth0 Custom Extension

1. Go to [Auth0 Extensions](https://manage.auth0.com/#/extensions)
2. Click on `+ Create Extension`
3. Fill in the textbox with `https://github.com/auth0/auth0-extension-boilerplate-hooks`
4. Click on `continue`
5. Finally, click on `install`

## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free Auth0 Account

1. Go to [Auth0](https://auth0.com/signup) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
