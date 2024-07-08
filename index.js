const axios = require('axios');
const { setIntervalAsync } = require('set-interval-async/dynamic');
const express = require('express');
const bedrock = require('bedrock-protocol');

const serverAddress = 'gadar2.aternos.me';
const serverPort = 42035;
const botUsername = 'MyBot';
const mcstatsAPI = `https://api.mcstatus.io/v2/status/bedrock/${serverAddress}:${serverPort}`;

let client;
let isConnected = false;
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
    isConnected = true;
    setTimeout(disconnectFromServer, 2.5 * 60 * 60 * 1000); // Disconnect after 2.5 hours
  });

  client.on('end', () => {
    console.log('Bot disconnected from the server');
    isConnected = false;
  });

  client.on('error', (error) => {
    console.error('Connection error:', error);
    isConnected = false;
    setTimeout(connectToServer, 5000); // Attempt to reconnect after 5 seconds
  });
}

function disconnectFromServer() {
  if (client) {
    console.log('Disconnecting bot after 2.5 hours');
    client.disconnect();
  }
}

async function checkServerStatus() {
  try {
    console.log('Checking server status...');
    const response = await axios.get(mcstatsAPI);
    const data = response.data;
    if (data.online) {
      console.log('Server is online');
      if (!isConnected) {
        connectToServer();
      }
    } else {
      console.log('Server is offline');
      if (isConnected) {
        disconnectFromServer();
      }
    }
  } catch (error) {
    console.error('Error checking server status:', error);
    if (isConnected) {
      disconnectFromServer();
    }
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

// Check server status every 1 minute
setIntervalAsync(async () => {
  await checkServerStatus();
}, 60000);

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running and listening on port ${port}`);
});
