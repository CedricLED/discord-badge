const Discord = require('discord.js');
const Config = require('./config.js');
const Database = require('./database/db.js');
const fs = require('fs');

// Creating the discord client
const client = new Discord.Client();

// Attaching the sqlite database to the client
client.sql = Database.sql;
client.database = Database;

// Attaching the config to the client
client.config = Config;

client.on('ready', () => {
  client.sql.run(`CREATE TABLE IF NOT EXISTS badge (ServerID TEXT, badgeName TEXT, badgeImage TEXT)`);
  client.sql.run(`CREATE TABLE IF NOT EXISTS userBadge (ServerID TEXT, UserID TEXT, badgeName TEXT)`);
  console.log(`Logged in as ${client.user.tag}\n${client.guilds.size} servers!`);
  client.user.setActivity(`${Config.Prefix}stats`, {
    type: "LISTENING"
  });
});

client.on('message', (message) => {
  if (!message.content.toLowerCase().startsWith(client.config.Prefix)) return;

  // Removes the prefix from the message, before "slicing" it up to an array ['like', 'this']
  const args = message.content.slice(client.config.Prefix.length).trim().split(/ +/g);
  // The command
  const command = args.shift().toLowerCase();

  fs.exists(`./commands/${command}.js`, (exists) => {
    if (exists) {
      let fetchCommand = require(`./commands/${command}.js`);
      fetchCommand.run(client, message, args);
    }
  });
});

// Logging in to the client with the token
client.login(Config.Token);
