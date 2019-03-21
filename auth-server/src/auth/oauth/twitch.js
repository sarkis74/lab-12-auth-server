'use strict';
// const express = require('express');
// const app = express();
const superagent = require('superagent');
const Users = require('../users-model.js');
// require('dotenv').config();

const SERVICE = 'https://id.twitch.tv/oauth2/token';
const PROFILE = 'https://api.twitch.tv/helix/users';
// TODO: Change this REDIRECT when we deploy on Heroku

let authorize = (request) => {
    // the authorization code is in query.code because of the ?code= in the URL
    console.log('(1)', request.query.code);

    // Using the Auth code to perform a 'handshake'
    return superagent.post(`${SERVICE}?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&code=${request.query.code}&grant_type=authorization_code&redirect_uri=${process.env.REDIRECT_URI}`)
    // We should now receive back a JSON object
    // access_token, refresh_token, expires_in, scope:[], token_type
        .then( response => {
            let access_token = response.body.access_token;
            console.log('(2: access token)', access_token);
            console.log('(2.5: scope) ', response.body.scope);
            return access_token;
        })

        // We're here now
        .then(token => {
            console.log(PROFILE, token);
            return superagent.get(PROFILE)
                .set('Authorization', `Bearer ${token}`)
                .then( response => {
                    let user = response.body.data[0];
                    console.log('(3)', user);
                    return user;
                });
        })
        .then( oauthUser => {
            console.log('(4) Create Our Account');
            return Users.createFromOauth(oauthUser.email);
        })
        .then( actualUser => {
            return actualUser.generateToken();
        })
        .catch( error => error );
};


module.exports = authorize;