const { BedrockStatus } = require('minecraft-server-util');
const bedrock = require('bedrock-protocol');
const { setIntervalAsync } = require('set-interval-async/dynamic');

const serverAddress = 'gadar2.aternos.me';
const serverPort = 42035;

let client;

async function pingServer() {
  try {
    const status = await BedrockStatus(serverAddress, serverPort);
    const playerCount = status.players.online;
    console.log(`Players online: ${playerCount}`);
    return playerCount > 0;
  } catch (error) {
    console.error('Error pinging server:', error);
    return false;
  }
}

function connectToServer() {
  try {
    client = bedrock.createClient({
      host: serverAddress,
      port: serverPort,
    });

    client.on('join', () => {
      console.log('Bot joined the server');
    });

    client.on('end', () => {
      console.log('Bot disconnected from the server');
    });

    client.on('error', (error) => {
      console.error('Client error:', error);
      client.disconnect();
      client = null;
    });
  } catch (error) {
    console.error('Error connecting to server:', error);
  }
}

// Initial server status check and connection
(async () => {
  const playersOnline = await pingServer();
  if (playersOnline) {
    connectToServer();
  } else {
    console.log('No players online, not connecting.');
  }
})();

// Check server status every minute and connect/disconnect accordingly
setIntervalAsync(async () => {
  const playersOnline = await pingServer();
  if (playersOnline) {
    if (!client) {
      console.log('Players online, connecting');
      connectToServer();
    }
  } else {
    if (client) {
      console.log('No players online, disconnecting');
      client.disconnect();
      client = null;
    }
  }
}, 60000);
