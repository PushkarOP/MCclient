const axios = require('axios');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const express = require('express');
const bedrock = require('bedrock-protocol');

const serverAddress = 'gadar2.aternos.me';
const serverPort = 42035;
const botUsername = 'MyBot';
const mcstatsAPI = `https://api.mcstatus.io/v2/status/bedrock/${serverAddress}:${serverPort}`;

let client;
const app = express();
const port = 8000;

function connectToServer() {
  console.log('Attempting to connect to server...');
  client = bedrock.createClient({
    host: serverAddress,
    port: serverPort,
    username: botUsername,
  });

  client.on('join', () => {
    console.log('Bot joined the server');
    checkServerStatus();
  });

  client.on('end', () => {
    console.log('Bot disconnected from the server');
    setTimeout(connectToServer, 5000); // Attempt to reconnect after 5 seconds
  });

  client.on('error', (error) => {
    console.error('Connection error:', error);
    setTimeout(connectToServer, 5000); // Attempt to reconnect after 5 seconds
  });
}

async function checkServerStatus() {
  try {
    console.log('Checking server status...');
    const response = await axios.get(mcstatsAPI);
    const data = response.data;
    if (data.online) {
      const playerCount = data.players.online;
      console.log(`Server is online. Players online: ${playerCount}`);
      if (playerCount > 0) {
        console.log('Players online, maintaining connection');
      } else {
        console.log('No players online, disconnecting');
        client.disconnect();
      }
    } else {
      console.log('Server is offline, disconnecting');
      client.disconnect();
    }
  } catch (error) {
    console.error('Error checking server status:', error);
    client.disconnect();
  }
}

// Express route to check if the bot is alive
app.get('/alive', (req, res) => {
  res.send('Bot is running and connected to the server.');
});

// Express route to get the server status
app.get('/status', async (req, res) => {
  try {
    const response = await axios.get(mcstatsAPI);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching server status' });
  }
});

// Connect to the server initially
connectToServer();

// Check server status every 5 minutes
setIntervalAsync(async () => {
  if (client) {
    await checkServerStatus();
  } else {
    connectToServer();
  }
}, 60000 * 5);

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
});
