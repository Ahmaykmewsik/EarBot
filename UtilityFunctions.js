const fetch = require("node-fetch");
const Discord = require('discord.js');

module.exports = {

    //Gets a stored URL of a player's avatar
    async GetStoredUserURL(client, message, discordID, earlogGuild) {

        let result = "";

        let defaultAvatarInfos = client.getDefaultAvatar.all(discordID);
        let guildAvatarInfos = client.getGuildAvatar.all(discordID, earlogGuild.id);

        let user = client.users.cache.get(discordID);
        let guildUser = earlogGuild.members.cache.get(discordID);

        for (let avatarInfo of defaultAvatarInfos) {
            if (avatarInfo.avatarID != user.avatar)
                client.deleteAvatar.run(avatarInfo.id);
        }
        for (let avatarInfo of guildAvatarInfos) {
            if (avatarInfo.avatarID != guildUser.avatar && avatarInfo.guildID == earlogGuild.id)
                client.deleteAvatar.run(avatarInfo.id);
        }

        let matchingDefaultAvatarInfo = user && defaultAvatarInfos.find(a => a.avatarID == user.avatar);
        let matchingGuildAvatarInfo = guildUser && guildAvatarInfos.find(a => a.avatarID == guildUser.avatar);

        if (guildUser && guildUser.avatar) {
            result = (matchingGuildAvatarInfo)
                ? matchingGuildAvatarInfo.reuploadedAvatarURL
                : await this.UpdateStoredAvatarURL(client, message, guildUser, guildUser.user.username, guildUser.guild.id);
        }
        else if (user) {
            result = (matchingDefaultAvatarInfo)
                ? matchingDefaultAvatarInfo.reuploadedAvatarURL
                : await this.UpdateStoredAvatarURL(client, message, user, user.username, 'DEFAULT');
        }

        if (!result) 
            result = message.author.avatarURL();

        return result;
    },

    //Reuploads an image of a player's avatar as a message so that discord is forced to keep it :)
    async UpdateStoredAvatarURL(client, message, user, username, guildID) {

        const discordAvatarURL = await user.displayAvatarURL({ format: `webp`, size: 512 });
        const response = await fetch(discordAvatarURL);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const attachment = new Discord.MessageAttachment(buffer);
        const avatarMessage = await message.channel.send({ content: `:desktop: NEW AVATAR FOR: ${username}`, files: [attachment] });
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

    //TODO: (Marc) Proper text splitting 
    async SendToChannel(channel, text) {
		return channel.send(text);
    },

    async Send(message, text) {
		return message.channel.send(text);
    },

    async GetInputFromUser(message, promptMessage, { timeout = 60000, returnMessage = false, dm = false } = {}) {

        let channel = message.channel;

        if (promptMessage.length)
        {
            if (dm)
            {
                channel = await message.author.createDM();
                await this.SendToChannel(channel, promptMessage);
            }
            else
                await this.Send(message, promptMessage);
        }

        // let filter = m => !m.author.bot && (m.author.id == message.author.id);
        //TODO: Watch out if having the bot being able to listen to itself is bad (I don't think it is?)

        let filter = m => (m.author.id == message.author.id);
        let inputMessage = await channel.awaitMessages({ filter, max: 1, time: timeout });

        inputMessage = inputMessage.first();
        if (!inputMessage || !inputMessage.content) {
            this.SendToChannel(channel, `:clock1: ...hello? You still there? *(Confirmation aborted after timeout of ${timeout * 0.001} seconds)*`)
            return null;
        }

        if (returnMessage) return inputMessage;

        return inputMessage.content;
    },
}