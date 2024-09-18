var express = require('express');
var mongoose = require('mongoose');

var userSchema = mongoose.Schema( {
    name: {
        type: String,
    },
    username: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    }
});

const user = mongoose.model('user', userSchema, 'users');

module.exports = user;
