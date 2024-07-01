const bedrock = require('bedrock-protocol');
const setIntervalAsync = require('set-interval-async/dynamic').setIntervalAsync;
const express = require('express');

const serverAddress = 'gadar2.aternos.me';
const serverPort = 42035;
const botUsername = 'MyBot';

let client;
const app = express();
const port = 8000;

function connectToServer() {
  client = bedrock.createClient({
    host: serverAddress,
    port: serverPort,
    username: botUsername,
  });

  client.on('join', () => {
    console.log('Bot joined the server');
    checkPlayerList();
  });

  client.on('end', () => {
    console.log('Bot disconnected from the server');
  });

  client.on('error', (error) => {
    console.error('Connection error:', error);
  });
}

async function checkPlayerList() {
  try {
    client.write('command_request', {
      command: 'list',
      origin: {
        type: 'player',
        uuid: '',
        request_id: '',
        player_entity_id: 1,
      },
    });

    client.once('command_response', (packet) => {
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

// Express route to check if the bot is alive
app.get('/alive', (req, res) => {
  res.send('Bot is running and connected to the server.');
});

// Connect to the server initially
connectToServer();

// Check player list every 5 minutes
setIntervalAsync(async () => {
  if (client) {
    await checkPlayerList();
  } else {
    connectToServer();
  }
}, 60000 * 5);

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
});
