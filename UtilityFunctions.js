const fetch = require("node-fetch");
const Discord = require('discord.js');

module.exports = {

    //Gets a stored URL of a player's avatar
    async GetStoredUserURL(client, message, discordID, earlogGuild) {

        let result = "";

        let defaultAvatarInfo = client.getDefaultAvatar.get(discordID);
        let guildAvatarInfo = client.getGuildAvatar.get(discordID, earlogGuild.id) ;
        let user = client.users.cache.get(discordID);
        let guildUser = earlogGuild.members.cache.get(discordID);

        if (user && guildUser) {
            if (guildUser.avatar && (!guildAvatarInfo|| guildAvatarInfo.avatarID != guildUser.avatar))
                result = this.UpdateStoredAvatarURL(client, message, guildUser, guildUser.guild.id);

            else if (!guildUser.avatar && (!defaultAvatarInfo || defaultAvatarInfo.avatarID != user.avatar)) 
                result = this.UpdateStoredAvatarURL(client, message, user, 'DEFAULT');

            else if (guildAvatarInfo && guildUser.avatar == guildAvatarInfo.avatarID) {
                result = guildAvatarInfo.reuploadedAvatarURL;
            }
            else if (defaultAvatarInfo && user.avatar == defaultAvatarInfo.avatarID) {
                result = defaultAvatarInfo.reuploadedAvatarURL;
            }
        }

        if (!result) {
            result = message.author.defaultAvatarURL();
        }

        return result;
    },

    //Reuploads an image of a player's avatar as a message so that discord is forced to keep it :)
    async UpdateStoredAvatarURL(client, message, user, guildID) {

        const discordAvatarURL = await user.displayAvatarURL({ format: `webp`, size: 512 });
        const response = await fetch(discordAvatarURL);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const attachment = new Discord.MessageAttachment(buffer);
        const avatarMessage = await message.channel.send({ content: `:desktop: NEW AVATAR FOR: ${user.username}`, files: [attachment] });
        const newURL = [...avatarMessage.attachments.values()][0].proxyURL;

        client.setAvatar.run({
            id: null,
            userDiscordID: user.id,
            guildID: guildID,
            avatarID: user.avatar,
            reuploadedAvatarURL: newURL
        });

        return newURL;
    },

    FilterImages(attachmentArray) {
        return attachmentArray.filter(attachment =>
            !attachment.url.includes(".webp") &&
            !attachment.url.includes(".png") &&
            !attachment.url.includes(".jpg") &&
            !attachment.url.includes(".jpeg") &&
            !attachment.url.includes(".gif")
        );
    },

    IsImageURL(url) {
        return (url.includes("https//:") || url.includes("http//:")) &&
            url.includes(".webp") ||
            url.includes(".png") ||
            url.includes(".jpg") ||
            url.includes(".jpeg") ||
            url.includes(".gif")
    },

    //Puts the bot to sleep. For not angering the discordAPI
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },


}