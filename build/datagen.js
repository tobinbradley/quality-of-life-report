var fs = require('fs');
var path = require('path');
var dataConfig = require('../data/config/data.json');
const csv = require('csvtojson');
const _ = require('lodash');
var dest = './tmp';
var shell = require('shelljs');

///////////////////////////////////////////////////
// Create destination folders
///////////////////////////////////////////////////
//shell.mkdir('-p', 'public/data/metric');
shell.mkdir('-p', 'tmp');

// return true if convertable to number
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}



///////////////////////////////////////////////
// CSVtoJSON
///////////////////////////////////////////////

// transform csv2json array to id: {y_2012: value} object format
function jsonTransform(jsonArray) {
  var jsonOut = {};
  for (var i = 0; i < jsonArray.length; i++) {
    jsonOut[jsonArray[i]['id']] = {};
    let keys = Object.keys(jsonArray[i]);
    let key = keys[keys.length - 1];
    if (isNumeric(jsonArray[i][key])) {
        jsonOut[jsonArray[i]["id"]][key] = Number(jsonArray[i][key]);
    } else {
        jsonOut[jsonArray[i]["id"]][key] = null;
    }
  }
  return jsonOut;
}


_.each(dataConfig, function(m) {

  if (m.type === 'sum') {
    csv()
      .fromFile('data/metric/r' + m.metric + '.csv')
      .then((jsonObj) => {
        let outJSON = {};
        outJSON['r'] = jsonTransform(jsonObj);

        fs.writeFileSync(
          path.join(dest, `r${m.metric}.json`),
          JSON.stringify(jsonTransform(jsonObj), null, '  ')
        );
      })      
  }
  if (m.type === 'mean') {
    csv()
      .fromFile('data/metric/n' + m.metric + '.csv')
      .then((jsonObj) => {
        let outJSON = {};
        outJSON['n'] = jsonTransform(jsonObj);
        
        fs.writeFileSync(
          path.join(dest, `n${m.metric}.json`),
          JSON.stringify(jsonTransform(jsonObj), null, '  ')
        );
        
      })      
  }
  if (m.type === 'weighted') {
    csv()
      .fromFile('data/metric/r' + m.metric + '.csv')
      .then((jsonObj) => {
        let outJSON = {};
        let jsonArrayR = jsonTransform(jsonObj);

        csv()
          .fromFile('data/metric/d' + m.metric + '.csv')
          .then((jsonObj) => {
            var jsonArrayD = jsonTransform(jsonObj);
            // let key, key2;
            // for (key in jsonArrayR) {
            //   for (key2 in jsonArrayR[key]) {
            //     if (
            //       isNumeric(jsonArrayR[key][key2]) &&
            //       isNumeric(jsonArrayD[key][key2])
            //     ) {
            //       jsonArrayR[key][key2] =
            //         Math.round(
            //           (jsonArrayR[key][key2] / jsonArrayD[key][key2]) * 1000
            //         ) / 1000;
            //     } else {
            //       jsonArrayR[key][key2] = null;
            //     }
            //   }
            // }
            // outJSON['d'] = jsonArrayD;
            // outJSON['r'] = jsonArrayR;

            fs.writeFileSync(
              path.join(dest, `d${m.metric}.json`),
              JSON.stringify(jsonArrayD, null, '  ')
            );
            fs.writeFileSync(
              path.join(dest, `r${m.metric}.json`),
              JSON.stringify(jsonArrayR, null, '  ')
            );            
          })          
      })
  }

});

