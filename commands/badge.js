const Discord = require('discord.js');
exports.run = (Bot, message, args) => {
  var userMention;
  var index = 0;
  if (message.mentions.users.first()) {
    userMention = message.mentions.users.first();
  } else {
    let content = args.slice(1).join(" ");
    let user = content.match(/(.+[#]+[0-9]{4})/g);
    if (user) {
      user = user.toString();
      index = user.split(" ").length;
      user = user.split("#");
      userMention = Bot.users.find((element) => {
        return element.username === user[0] && element.discriminator === user[1];
      });
    }
  }
  let badgeText = args.slice(1).join(" ");
  let badgeUser = args.slice(1 + index).join(" ");
  if (message.mentions.users.first()) {
    badgeUser = args.slice(2).join(" ");
  }
  console.log(message);
  if (!args[0]) {
    message.reply('You forgot to set an arg!').then(msg => msg.delete(5000));
  } else {
    switch (args[0]) {
      case 'give':
        if (message.member.hasPermission("MANAGE_ROLES")) {
          Bot.sql.get(`SELECT * FROM badge WHERE (ServerID, badgeName) = (?, ?)`, [message.guild.id, badgeUser]).then((log) => {
            if (typeof log === 'undefined') {
              message.reply(`Badge not found!`);
            } else if (typeof userMention === 'undefined') {
              message.reply(`User not found`);
            } else {
              Bot.sql.get(`SELECT * FROM userBadge WHERE (ServerID, UserID, badgeName) = (?, ?, ?)`, [message.guild.id, userMention.id, badgeUser]).then((badgeCheck) => {
                if (typeof badgeCheck === 'undefined') {
                  Bot.sql.run(`INSERT INTO userBadge (ServerID, UserID, badgeName) VALUES (?, ?, ?)`, [message.guild.id, userMention.id, badgeUser]);
                  message.reply(`You added the badge "${badgeUser}" to ${userMention.tag}!`);
		  Bot.channels.get(Bot.config.announcementChat).send(`<@!${userMention.id}>`);
                  Bot.channels.get(Bot.config.announcementChat).send({
                    "embed": {
                      "description": `Congratulations! <@!${userMention.id}> just unlocked the **${badgeUser}** achievement!`,
                      "color": 1000,
                      "timestamp": new Date(),
                      "image": {
                        "url": log.badgeImage
                      },
                      "author": {
                        "name": Bot.user.username,
                        "icon_url": Bot.user.displayAvatarURL
                      }
                    }
                  });
                }
              }).catch();
            }
          }).catch();
        } else {
          message.channel.send('Permission denied!');
        }
        break;
      case 'remove':
        if (message.member.hasPermission("MANAGE_ROLES")) {
          if (typeof userMention === 'undefined') {
            message.reply(`User not found`);
          } else {
            Bot.sql.get(`SELECT * FROM userBadge WHERE (ServerID, UserID, badgeName) = (?, ?, ?)`, [message.guild.id, userMention.id, badgeUser]).then((badgeCheck) => {
              if (typeof badgeCheck === 'undefined') {
                message.reply(`${userMention.tag} doesn't have that badge!`);
              } else {
                Bot.sql.run(`DELETE FROM userBadge WHERE (ServerID, UserID, badgeName) = (?, ?, ?)`, [message.guild.id, userMention.id, badgeUser]);
                message.reply(`You removed the badge "${badgeUser}" from ${userMention.tag}!`);
              }
            }).catch();
          }
        } else {
          message.channel.send('Permission denied!');
        }
        break;
      case 'create':
        let image = "";
        if (message.member.hasPermission("MANAGE_ROLES")) {
          if (!args[1]) {
            message.reply('You forgot to set a badge name!').then(msg => msg.delete(5000));
            break;
          }
          if (args[1] == "-image") {
            image = args[2];
            badgeText = args.slice(3).join(" ");
          }
          Bot.sql.get(`SELECT * FROM badge WHERE (ServerID, badgeName) = (?, ?)`, [message.guild.id, badgeText]).then((badge) => {
            if (typeof badge === 'undefined') {
              Bot.sql.run(`INSERT INTO badge (ServerID, badgeName, badgeImage) VALUES (?, ?, ?)`, [message.guild.id, badgeText, image]);
              message.reply(`${badgeText} has been successfully added as a badge!`);
            } else {
              message.reply(`${badgeText} already exists!`);
            }
          }).catch();
        } else {
          message.channel.send('Permission denied!');
        }
        break;
      case 'delete':
        if (message.member.hasPermission("MANAGE_ROLES")) {
          if (!args[1]) {
            message.reply('You forgot to set a badge name!').then(msg => msg.delete(5000));
            break;
          }
          Bot.sql.get(`SELECT * FROM badge WHERE (ServerID, badgeName) = (?, ?)`, [message.guild.id, badgeText]).then((badge) => {
            if (typeof badge !== 'undefined') {
              Bot.sql.run(`DELETE FROM badge WHERE (ServerID, badgeName) = (?, ?)`, [message.guild.id, badgeText]);
              message.reply(`${badgeText} has been successfully deleted!`);
            } else {
              message.reply(`${badgeText} doesn't exist!`).then(msg => msg.delete(5000));
            }
          }).catch();
        } else {
          message.channel.send('Permission denied!');
        }
        break;
      case 'list':
        if (message.channel.id === Bot.config.userChat || message.channel.id === Bot.config.modChat) {
          if (typeof userMention === 'undefined') {
            message.reply('You forgot mention a user!').then(msg => msg.delete(5000));
            break;
          }
          Bot.sql.all(`SELECT * FROM userBadge WHERE (ServerID, UserID) = (?, ?)`, [message.guild.id, userMention.id]).then(rows => {
            if (rows.length > 0) {
              message.channel.send(`User Badges:`);
              rows.forEach((badgeList) => {
                Bot.sql.get(`SELECT * FROM badge WHERE (ServerID, badgeName) = (?, ?)`, [message.guild.id, badgeList.badgeName]).then((badge) => {
                  if (typeof badge !== 'undefined') {
                    message.channel.send({
                      "embed": {
                        "description": `**${badge.badgeName}**`,
                        "color": 1000,
                        "thumbnail": {
                          "url": badge.badgeImage
                        },
                      }
                    });
                  }
                }).catch();
              });
            } else {
              message.channel.send(`User has no badges!`);
            }
          }).catch();
        } else if (message.member.hasPermission("MANAGE_ROLES")) {
          if (typeof userMention === 'undefined') {
            message.reply('You forgot mention a user!').then(msg => msg.delete(5000));
            break;
          }
          Bot.sql.all(`SELECT * FROM userBadge WHERE (ServerID, UserID) = (?, ?)`, [message.guild.id, userMention.id]).then(rows => {
            if (rows.length > 0) {
              message.channel.send(`User Badges:`);
              rows.forEach((badgeList) => {
                Bot.sql.get(`SELECT * FROM badge WHERE (ServerID, badgeName) = (?, ?)`, [message.guild.id, badgeList.badgeName]).then((badge) => {
                  if (typeof badge !== 'undefined') {
                    message.channel.send({
                      "embed": {
                        "description": `**${badge.badgeName}**`,
                        "color": 1000,
                        "thumbnail": {
                          "url": badge.badgeImage
                        },
                      }
                    });
                  }
                }).catch();
              });
            } else {
              message.channel.send(`User has no badges!`);
            }
          }).catch();
        } else {
          message.reply(`Use this command in <#${Bot.config.userChat}>`).then(msg => msg.delete(5000));
          message.delete(5000);
        }
        break;
      case 'listbadges':
        if (message.channel.id === Bot.config.userChat || message.channel.id === Bot.config.modChat) {
          Bot.sql.all(`SELECT * FROM badge WHERE ServerID = ?`, [message.guild.id]).then((badges) => {
            if (typeof badges !== 'undefined') {
              badges.forEach((badge) => {
                message.channel.send({
                  "embed": {
                    "description": `**${badge.badgeName}**`,
                    "color": 1000,
                    "thumbnail": {
                      "url": badge.badgeImage
                    },
                  }
                });
              });
            } else {
              message.reply(`No badges have been created!`).then(msg => msg.delete(5000));
            }
          }).catch();
        } else if (message.member.hasPermission("MANAGE_ROLES")) {
          Bot.sql.all(`SELECT * FROM badge WHERE ServerID = ?`, [message.guild.id]).then((badges) => {
            if (typeof badges !== 'undefined') {
              badges.forEach((badge) => {
                message.channel.send({
                  "embed": {
                    "description": `**${badge.badgeName}**`,
                    "color": 1000,
                    "thumbnail": {
                      "url": badge.badgeImage
                    },
                  }
                });
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
