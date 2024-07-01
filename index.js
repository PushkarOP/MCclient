const bedrock = require('bedrock-protocol');
const setIntervalAsync = require('set-interval-async/dynamic').setIntervalAsync;

const serverAddress = 'gadar2.aternos.me';
const serverPort = 42035;

let client;

function connectToServer() {
  client = bedrock.createClient({
    host: serverAddress,
    port: serverPort,
  });

  client.on('join', () => {
    console.log('Bot joined the server');
    checkPlayerList();
  });

  client.on('end', () => {
    console.log('Bot disconnected from the server');
  });
}

async function checkPlayerList() {
  try {
    await client.write('command_request', {
      command: 'list',
      origin: {
        type: 'player',
        uuid: '',
        request_id: '',
        player_entity_id: 1,
      },
    });

    client.on('command_response', (packet) => {
      const response = packet.output;
      const playerCountMatch = response.match(/There are (\d+)\/\d+ players online/);
      if (playerCountMatch && parseInt(playerCountMatch[1], 10) > 0) {
        console.log('Players online, maintaining connection');
      } else {
        console.log('No players online, disconnecting');
        client.disconnect();
      }
    });
  } catch (error) {
    console.error('Error checking player list:', error);
    client.disconnect();
  }
}

// Connect to the server initially
connectToServer();

// Check player list every minute
setIntervalAsync(async () => {
  if (client) {
    await checkPlayerList();
  } else {
    connectToServer();
  }
}, 60000);
