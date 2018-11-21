import isNumeric from './isnumeric'

export default function valsToArray(data, year, keys) {
  let arr = [];
  for (var i = 0; i < keys.length; i++) {
      if (isNumeric(data[keys[i]][year])) {
          arr.push(data[keys[i]][year]);
      }
  }
  return arr;
}