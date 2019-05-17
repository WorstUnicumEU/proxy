const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const proxy = express();

proxy.use(bodyParser.json());
proxy.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 5000;

proxy.listen(port, () => {
  console.log(`Proxy Server running on Port ${port}`);
});

proxy.get('/proxy_url', async (req, res) => {
  if (!req.query.url) {
    return res.status(400).json({
      status: 400,
      error: 'No URL query was specified'
    });
  }

  const url = decodeURIComponent(req.query.url);
  console.log(url);

  if (!!/^(https?:\/\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$/i.test(url)) {
    return res.status(400).json({
      status: 400,
      error: 'Invalid URL'
    });
  }

  axios({
    method: 'GET',
    url,
    validateStatus: status => (status >= 200 && status < 300) || (status >= 400 && status < 500)
  }).then(response => {
    res.set('Content-Type', response.headers['content-type']);
    res.status(response.status).send(response.data);
  }, error => {
    console.error(error);
    return res.status(500).json({
      status: 500,
      error: 'Internal Server Error'
    });
  });
});