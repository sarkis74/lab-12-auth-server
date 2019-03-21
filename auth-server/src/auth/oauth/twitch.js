'use strict';

const superagent = require('superagent');
const Users = require('../users-model.js');

const API = 'http://localhost:3000';
const TWITCH = 'https://id.twitch.tv/oauth2/authorize';
const SERVICE = 'https://id.twitch.tv/oauth2/token';
const REDIRECT = 'http://localhost:3000/oauth';

let authorize = (request) => {

    console.log('(1)', request.query.code);

    return superagent.get(`${TWCH}?client_id=${process.env}`)
        .type('form')
        // .send({
        //     code: request.query.code,
        //     client_id: process.env.GOOGLE_CLIENT_ID,
        //     client_secret: process.env.GOOGLE_CLIENT_SECRET,
        //     redirect_uri: `${API}/oauth`,
        //     grant_type: 'authorization_code',
        // })
        .then( response => {
            let access_token = response.body.access_token;
            console.log('(2)', access_token);
            return access_token;
        })
        .then(token => {
            console.log(SERVICE, token);
            return superagent.get(SERVICE)
                .set('Authorization', `Bearer ${token}`)
                .then( response => {
                    let user = response.body;
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