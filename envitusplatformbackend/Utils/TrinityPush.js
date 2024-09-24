const request = require('request');

var Trinity = module.exports = {
  accessToken: '',
  refreshToken: '',
  auth: async function () {
    const options = {
      'method': 'POST',
      'url': process.env.PUSH_TRINITY_URL + '/HTTPProtAdaptorService/oauth/token',
      'headers': {
        'Authorization': 'Basic ' + process.env.TRINITY_APP_AUTH
      },
      formData: {
        'username': process.env.TRINITY_USERNAME,
        'password': process.env.TRINITY_PASSWORD,
        'grant_type': 'password'
      }
    };

    var resp = await new Promise(resolve => {
      request(options, function (error, response) {
        if (error) { resolve(false) }
        else { resolve(JSON.parse(response.body)) }
      });
    });

    
    if (resp) {
      Trinity.accessToken = resp.access_token;
      Trinity.refreshToken = resp.refresh_token;
      setTimeout(Trinity.refresh, ((resp.expires_in - (15 * 60)) * 1000));
    }
  },
  refresh: async function () {
    const options = {
      'method': 'POST',
      'url': process.env.PUSH_TRINITY_URL + '/HTTPProtAdaptorService/oauth/token',
      'headers': {
        'Authorization': 'Basic ' + process.env.TRINITY_APP_AUTH
      },
      formData: {
        'username': process.env.TRINITY_USERNAME,
        'password': process.env.TRINITY_PASSWORD,
        'grant_type': 'password',
        'refresh_token': Trinity.refreshToken
      }
    };

    var resp = await new Promise(resolve => {
      request(options, function (error, response) {
        if (error) { resolve(false) }
        else { resolve(JSON.parse(response.body)) }
      });
    });

    if (resp) {
      Trinity.accessToken = resp.access_token;
      Trinity.refreshToken = resp.refresh_token;
      setTimeout(Trinity.refresh, ((resp.expires_in - (15 * 60)) * 1000));
    }
  }
}
