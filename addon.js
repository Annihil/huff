var addon = require('bindings')('addon.node')

const data = '\xFF\xFF\xFF\xFFconnect "\\name\\ETPlayer\\rate\\25000\\snaps\\20"';
console.log('sending', data.length, 'to c++');
const buf = Buffer.from(data, 'binary');
console.log('buf', data.length, 'to c++');
const ret = addon.Huff_Compress(buf, 12, buf.length);
console.log('buf size from node', ret.length);
console.log(ret, ret.toString('binary'));
