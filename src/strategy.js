var util = require('util');
var OAuth2Strategy = require('switch-oauth2');
var InternalOAuthError = require('switch-oauth2').InternalOAuthError;
function getHost (region) {
    if(region === 'cn') {
        return 'www.battlenet.com.cn';
    } else {
        return region + '.battle.net';
    }
}
function Strategy (options, verify) {
    options = options || {};
    options.region = options.region || 'us';
    options.authorizationURL = options.authorizationURL || 'https://' + getHost(options.region) + '/oauth/authorize';
    options.tokenURL = options.tokenURL || 'https://' + getHost(options.region) + '/oauth/token';
    options.scopeSeparator = options.scopeSeparator || ' ';
    options.customHeaders = options.customHeaders || {};
    OAuth2Strategy.call(this, options, verify);
    if(!options.clientSecret) {
        throw new TypeError('OAuth2Strategy requires a clientSecret option')
    }
    this.name = 'bnet';
    this._profileUrl = options.userURL || 'https://' + getHost(options.region) + '/oauth/userinfo';
    this._oauth2.useAuthorizationHeaderforGET(true);
}
util.inherits(Strategy, OAuth2Strategy);
Strategy.prototype.userProfile = function (accessToken, done) {
    this._oauth2.get(this._profileUrl, accessToken, function (err, body, res) {
      var json;
      if (err) {
        return done(new InternalOAuthError('Failed to fetch the user id', err));
      }
      try {
        json = JSON.parse(body);
      } catch (ex) {
        return done(new Error('Failed to parse the user id'));
      }
      var profile = json;
      profile.provider = 'bnet';
      profile.token = accessToken;
      return done(null, profile);
    })
}
module.exports = Strategy;