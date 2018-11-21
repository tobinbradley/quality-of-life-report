const siteConfig = require('./data/config/site.json');
const dataConfig = require('./data/config/data.json');

Object.keys(siteConfig).forEach(key => {
  process.env[`VUE_APP_${key}`] = siteConfig[key];
});

process.env['VUE_APP_dataconfig'] = dataConfig



module.exports = {
  baseUrl: process.env.NODE_ENV === 'production' ? '' : '/',
  css: {
    sourceMap: true
  },
 devServer: {
    host: '0.0.0.0',
    disableHostCheck: true
  }
};