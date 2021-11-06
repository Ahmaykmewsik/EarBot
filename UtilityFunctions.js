const fetch = require("node-fetch");
const Discord = require('discord.js');

module.exports = {

    //Gets a stored URL of a player's avatar
    async GetStoredUserURL(client, message, discordID, earlogGuild) {
        let avatarInfo = client.getAvatar.get(discordID);
        let user = client.users.cache.get(discordID);
        let guildUser = earlogGuild.members.cache.get(discordID);

        if (!user || !guildUser) {
            console.error(`Couldn't find user with ID: ${discordID}`);
            return message.author.defaultAvatarURL();
        }

        if (!avatarInfo && guildUser.avatar)
            return await this.UpdateStoredAvatarURL(client, message, guildUser, user.username);
        else if (!avatarInfo) {
            return await this.UpdateStoredAvatarURL(client, message, user, user.username);
        }

        //If a guild avatar exists, use it
        //Otherwise use the player's global avatar
        if (guildUser.avatar && avatarInfo.avatarID != guildUser.avatar)
            return await this.UpdateStoredAvatarURL(client, message, guildUser, user.username);
        else if (!guildUser.avatar && avatarInfo.avatarID != user.avatar)
            return await this.UpdateStoredAvatarURL(client, message, user, user.username);

        return avatarInfo.reuploadedAvatarURL;
    },

    //Reuploads an image of a player's avatar as a message so that discord is forced to keep it :)
    async UpdateStoredAvatarURL(client, message, user, username) {

        const discordAvatarURL = await user.displayAvatarURL({ format: `webp`, size: 512 });
        const response = await fetch(discordAvatarURL);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const attachment = new Discord.MessageAttachment(buffer);
        const avatarMessage = await message.channel.send({ content: `:desktop: NEW AVATAR FOR: ${username}`, files: [attachment] });
        const newURL = [...avatarMessage.attachments.values()][0].proxyURL;

        client.setAvatar.run({
            userDiscordID: user.id,
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