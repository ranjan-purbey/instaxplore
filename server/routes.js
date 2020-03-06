const { Router, json: jsonParser } = require('express');
// const cookieParser = require('cookie-parser');
// const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');
const { config, stripHtml } = require('./utils');
// const db = require('./database/models');

const apiRouter = Router();

// apiRouter.use(cookieParser());
apiRouter.use(jsonParser());

// apiRouter.use(async (req, res, next) => {
//   try {
//     console.log(req.cookies);
//     res.locals.user = jwt.verify(req.cookies.jwt, config.jwtSecret);
//   } catch(_) {
//     console.log('Getting user data from facebook')
//     const fbToken = req.headers.authorization;
//     try {
//       const tokenData = (await axios.get('https://graph.facebook.com/v6.0/debug_token', {
//         params: { 'access_token': config.facebookToken, 'input_token': fbToken}
//       })).data;

//       if(tokenData.data['is_valid'] && tokenData.data["user_id"]) {
//         res.locals.user = (await axios.get(`https://graph.facebook.com/v6.0/${tokenData.data['user_id']}`, {
//           params: { 'access_token': config.facebookToken }
//         })).data;
//         res.cookie('jwt',
//           jwt.sign(res.locals.user, config.jwtSecret, { expiresIn: '1h' }),
//           { maxAge: 36e5, httpOnly: true, secure: true });
//       }
//     } catch(error) {
//       console.log((error.response || {}).data || error.message);
//     }
//   }
//   next();
// });

apiRouter.post('/upload', async (req, res) => {
  if(req.headers.authorization) {
    try {
      const downloadResponse = await axios.get(req.body.src, {responseType: 'arraybuffer'});
      const filename = new URL(req.body.src).pathname.split('/').pop().split('.').slice(0,-1).join('');
      const extension = (() => {
        switch((downloadResponse.headers['content-type'] || '').toLowerCase()) {
          case 'image/png': return 'png';
          case 'image/jpeg': return 'jpg';
          case 'image/gif': return 'gif';
        }
      })();
      if(extension) {
        let data = new FormData();
        data.append('file', downloadResponse.data, {filename: `${filename}.${extension}`});
        data.append('alt_text', stripHtml(req.body.alt));
        data.append('caption', stripHtml(req.body.alt));
        data.append('description', stripHtml(req.body.description));
        try {
          await axios.post(`${config.wordpress.site}/wp-json/wp/v2/media`, data, {
            headers: {
              ...data.getHeaders(),
              'content-disposition': `attachment; filename=${filename}.${extension}`,
              'content-length': data.getLengthSync(),
              'authorization': `Bearer ${req.headers.authorization}`
            }
          })
          res.status(201).send('Image successfully uploaded')
        } catch(error) {
          console.error((error.response || {}).data || error.message);
          res.status(500).send('Failed to upload image to Wordpress');
        }
      } else {
        console.error('Image src has invalid content-type');
        res.status(400).send('Image src has invalid content-type');
      }
    } catch(error) {
      console.error((error.response || {}).data || error.message);
      res.status(400).send("Failed to access image link");
    }
  } else{
    res.sendStatus(401);
  }
})

module.exports = apiRouter;
