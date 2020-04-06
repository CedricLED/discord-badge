const Discord = require('discord.js');
exports.run = (Bot, message, args) => {
  let userMention = message.mentions.users.first();
  let badgeText = args.slice(1).join(" ");
  let badgeUser = args.slice(2).join(" ");
  if (!args[0]) {
    message.reply('You forgot to set an arg!').then(msg => msg.delete(5000));
  } else {
    switch (args[0]) {
      case 'list':
        if (message.channel.id === Bot.config.userChat || message.channel.id === Bot.config.modChat) {
          Bot.sql.all(`SELECT * FROM badge WHERE ServerID = ?`, [message.guild.id]).then((badges) => {
            if (typeof badges !== 'undefined') {
              message.reply("Achievements you haven't unlocked:");
              badges.forEach((badge) => {
                Bot.sql.get(`SELECT * FROM userBadge WHERE (ServerID, UserID, badgeName) = (?, ?, ?)`, [message.guild.id, message.author.id, badge.badgeName]).then(userBadge => {
                  if (typeof userBadge === 'undefined') {
                    message.channel.send({
                      "embed": {
                        "description": `**${badge.badgeName}**`,
                        "color": 1000,
                        "image": {
                          "url": badge.badgeImage
                        },
                      }
                    });
                  }
                }).catch();
              });
            } else {
              message.reply(`No badges have been created!`).then(msg => msg.delete(5000));
            }
          }).catch();
        } else {
          message.reply(`Use this command in <#${Bot.config.userChat}>`).then(msg => msg.delete(5000));
          message.delete(5000);
        }
        break;
    }
  }
};
