const { Router } = require('express');
const axios = require('axios');
const { config } = require('./utils');
const db = require('./database/models');

const apiRouter = Router();

apiRouter.use(async (req, res, next) => {
  const fbToken = req.query['access_token'];
  try {
    const tokenData = (await axios.get('https://graph.facebook.com/v6.0/debug_token', {
      params: { 'access_token': config.facebook.appToken, 'input_token': fbToken}
    })).data;
    
    if(tokenData.data['is_valid'] && tokenData.data["user_id"]) {
      res.locals.user = (await axios.get(`https://graph.facebook.com/v6.0/${tokenData.data['user_id']}`, {
        params: { 'access_token': config.facebook.appToken }
      })).data;
    }
  } catch(error) {
    console.log((error.response || {}).data || error.message);
  }
  next();
})

apiRouter.get('/uploads', (req, res) => {
  if(res.locals.user) {
    res.send(res.locals.user)
  } else{
    res.sendStatus(401);
  }
})

module.exports = apiRouter;
