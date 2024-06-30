const bedrock = require('bedrock-protocol')
const client = bedrock.createClient({
  host: 'gadar2.aternos.me',   // optional
  port: 42035,         // optional, default 19132
  username: 'Notch',   // the username you want to join as, optional if online mode
  offline: false       // optional, default false. if true, do not login with Xbox Live. You will not be asked to sign-in if set to true.
})

client.on('text', (packet) => { // Listen for chat messages from the server and echo them back.
  if (packet.source_name != client.username) {
    client.queue('text', {
      type: 'chat', needs_translation: false, source_name: client.username, xuid: '', platform_chat_id: '',
      message: `${packet.source_name} said: ${packet.message} on ${new Date().toLocaleString()}`
    })
  }
})
