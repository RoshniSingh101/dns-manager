const dgram = require('node:dgram');
const dnsPacket = require('dns-packet');
const db = require('./database');

const server = dgram.createSocket('udp4');

server.on('message', async (msg, rinfo) => {
  const query = dnsPacket.decode(msg);
  const name = query.questions[0].name.replace(/\.$/, '').toLowerCase();

  const record = await db.getRecord(name);

  if (record) {
    db.logQuery(name, rinfo.address, 'LOCAL'); // send local response
    // --- OPTION A: LOCAL DATA ---
    console.log(`[LOCAL] Found ${name}`);
    const responseData = {
      type: 'response',
      id: query.id,
      flags: dnsPacket.AUTHORITATIVE_ANSWER,
      questions: query.questions,
      answers: [{
        type: 'A',
        name: query.questions[0].name,
        data: record.ip,
        ttl: 300
      }]
    };
    const buf = dnsPacket.encode(responseData);
    server.send(buf, 0, buf.length, rinfo.port, rinfo.address);

  } else {
    db.logQuery(name, rinfo.address, 'PROXY'); // forward to Google
    // --- OPTION B: RECURSIVE (GOOGLE) ---
    console.log(`[PROXY] Forwarding ${name} to 8.8.8.8`);
    const proxy = dgram.createSocket('udp4');
    
    proxy.send(msg, 0, msg.length, 53, '8.8.8.8');

    proxy.on('message', (response) => {
      console.log(`[PROXY] Got answer from Google for ${name}`);
      server.send(response, 0, response.length, rinfo.port, rinfo.address);
      proxy.close();
    });

    // Handle potential timeouts so the socket doesn't hang
    proxy.on('error', () => proxy.close());
    setTimeout(() => { try { proxy.close(); } catch(e) {} }, 4000);
  }
});

server.bind(1053, '0.0.0.0', () => {
  console.log('DNS Engine is strictly listening on IPv4 port 1053');
});