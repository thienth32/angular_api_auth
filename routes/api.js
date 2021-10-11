var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require("../models/user");
// var Book = require("../models/book");

router.post('/signup', function(req, res) {
  // res.send(123);
    if (!req.body.username || !req.body.password) {
      res.json({success: false, msg: 'Please pass username and password.'});
    } else {
      var newUser = new User({
        username: req.body.username,
        password: req.body.password
      });
    //   return res.json(newUser);
      // save the user
      newUser.save(function(err) {
        if (err) {
          return res.json({success: false, msg: 'Username already exists.'});
        }
        res.json({success: true, msg: 'Successful created new user.'});
      });
    }
});

router.post('/signin', async function(req, res) {
    let user = await User.findOne({username: req.body.username});
    
    if(!user || !user.comparePassword(req.body.password)){
      res.status(401).send({success: false, msg: 'Authentication failed.'});
    }
    var token = await jwt.sign(user.toJSON(), config.secret);
    res.json({success: true, token: 'JWT ' + token});

});

router.get('/users', passport.authenticate('jwt', { session: false}), function(req, res) {
    var token = getToken(req.headers);
    if (token) {
      User.find(function (err, users) {
        if (err) return next(err);
        res.json(users);
      });
    } else {
      return res.status(403).send({success: false, msg: 'Unauthorized.'});
    }
});

router.get('/list-users', passport.authenticate('jwt', { session: false}),  async (req, res) => {
    let users = await User.find({});
    res.json({
      status: true,
      data: users
    });
    
})
getToken = function (headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
};

  module.exports = router;