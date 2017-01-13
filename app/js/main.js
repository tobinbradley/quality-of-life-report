require('es6-promise').polyfill();  // fix for Axois on IE11
import axios from 'axios';
import getURLParameter from './modules/geturlparams';
import isNumeric from './modules/isnumeric';
import {sum, mean, weighted} from './modules/metric_calculations';
import {prettyNumber} from './modules/number_format';
import dataConfig from '../../data/config/data';
import siteConfig from '../../data/config/site';


// Set selected data set
var selected = [];
if (getURLParameter('s') !== null) {
    selected = getURLParameter('s').split(',');
}

// metric list
let opts = document.querySelectorAll('#mapmetric option');
let optIndex = Math.floor(Math.random() * opts.length);
opts[optIndex].setAttribute('selected', true);
let mapmetric = document.querySelector('#mapmetric');
mapmetric.onchange = function() {
    let metric = this.options[this.selectedIndex];
    document.querySelector('#map').setAttribute('src', `${siteConfig.qolembedURL}embed.html?m=${metric.value}&s=${selected.join(',')}`);
};


// handle map toggle
let togglemap = document.querySelector("#togglemap");
if (togglemap) {
    togglemap.addEventListener('click', function() {
        let mapselect = document.querySelector("#mapmetric");
        let map = document.querySelector('#map');
        let mapcontainer = document.querySelector(".page-map");
        let mapmetric = document.querySelector("#mapmetric");

        if (this.innerHTML === "Show Map") {
            mapselect.disabled = false;
            mapcontainer.style.display = "block";
            window.scrollTo(0, 965);
            this.innerHTML = "Hide Map";
            map.setAttribute('src', `${siteConfig.qolembedURL}embed.html?m=${mapmetric.value}&s=${selected.join(',')}&tocp=true`);
        } else {
            mapselect.disabled = true;
            mapcontainer.style.display = "none";
            window.scrollTo(0, 0);
            this.innerHTML = "Show Map";
        }
    });
}

// map
// if (siteConfig.qolembedURL) {
//     document.querySelector('#map').setAttribute('src', `${siteConfig.qolembedURL}embed.html?m=${opts[optIndex].getAttribute('value')}&s=${selected.join(',')}`);
// }

// hide first page grid if nothing selected
if (selected.length > 0) {
    document.querySelector('.metric-box').style.display = 'table';
}

// Fetch data
axios.get('./data/metric/data.json')
    .then(function (response) {
        // validate selected and toss out loosers
        let mKeys = Object.keys(response.data);
        let nKeys = Object.keys(response.data[mKeys[0]]);
        for (let i = 0; i < selected.length; i++) {
            if (nKeys.indexOf(selected[i]) === -1) {
                let pos = selected.indexOf(selected[i]);
                selected.splice(pos, 1);
            }
        }

        crunch(dataConfig, response.data);
    });


// populate report
function crunch(config, data) {
    for (var key in config) {
        let d = config[key];

        // years
        let year = getYear(d.metric, data);
        populateVals(`.m${d.metric}-year`, year.replace('y_', ''));

        // links
        if (selected.length > 0) {
            let link = document.querySelector(`.m${d.metric}-link`);
            link.setAttribute('href', link.getAttribute('href') + `&n=${selected.join(',')}`);
        }

        // Set value arrays
        let cntyArray = valsToArray(data[`r${d.metric}`], year, Object.keys(data[`r${d.metric}`]));
        let selArray = valsToArray(data[`r${d.metric}`], year, selected);

        // calculated values
        switch(d.type) {
        case 'sum':
            populateVals(`.m${d.metric}-county`, prettyNumber(sum(cntyArray), 0, d.prefix, d.suffix));
            populateVals(`.m${d.metric}-selected`, prettyNumber(sum(selArray), 0, d.prefix, d.suffix));
            break;
        case 'mean':
            populateVals(`.m${d.metric}-county`, prettyNumber(mean(cntyArray), d.decimals, d.prefix, d.suffix));
            populateVals(`.m${d.metric}-selected`, prettyNumber(mean(selArray), d.decimals, d.prefix, d.suffix));
            break;
        case 'weighted':
            let cntyWArray = valsToArray(data[`w${d.metric}`], year, Object.keys(data[`r${d.metric}`]));
            let selWArray = valsToArray(data[`w${d.metric}`], year, selected);
            populateVals(`.m${d.metric}-county`, prettyNumber(weighted(cntyArray, cntyWArray), d.decimals, d.prefix, d.suffix));
            populateVals(`.m${d.metric}-selected`, prettyNumber(weighted(selArray, selWArray), d.decimals, d.prefix, d.suffix));
            break;
        }

        // raw values
        if (d.raw_label) {
            populateVals(`.m${d.metric}-county-raw`, prettyNumber(sum(cntyArray), 0));
            if (selected.length > 0) {
                populateVals(`.m${d.metric}-selected-raw`, prettyNumber(sum(selArray), 0));
            }
        }

        // fix for world vals in data config
        if (d.world_val && d.world_val[year]) {
            populateVals(`.m${d.metric}-county`, prettyNumber(d.world_val[year], d.decimals, d.prefix, d.suffix));
        }

    }
}

// find and set page elements
function populateVals(selector, value) {
    let elems = document.querySelectorAll(selector);
    for (let i = 0; i < elems.length; i++) {
        elems[i].innerHTML = value;
    }
}

// years
function getYear(metric, data) {
    let pointer = Object.keys(data[`r${metric}`])[0];
    let keys = Object.keys(data[`r${metric}`][pointer]);
    let year =  keys[0];
    return year;
}

// vals to array
function valsToArray(data, year, keys) {
    let arr = [];
    for (var i = 0; i < keys.length; i++) {
        if (isNumeric(data[keys[i]][year])) {
            arr.push(data[keys[i]][year]);
        }
    }
    return arr;
}
