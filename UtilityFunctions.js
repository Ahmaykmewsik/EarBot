//const SpyManagement = require('./SpyManagement');
const fetch = require("node-fetch");

module.exports = {

    //Gets a stored URL of a player's avatar
    async GetStoredUserURL(client, message, discordID) {
        let avatarInfo = client.getAvatar.get(discordID);
        let user = client.users.cache.get(discordID);

        if (!user) {
            console.error(`Couldn't find user with ID: ${discordID}`);
            return message.author.defaultAvatarURL();
        }

        if (!avatarInfo)
            return await this.UpdateStoredAvatarURL(client, message, user);

        if (avatarInfo.avatarID != user.avatar)
            return await this.UpdateStoredAvatarURL(client, message, user);

        return avatarInfo.reuploadedAvatarURL;
    },

    //Reuploads an image of a player's avatar as a message so that discord is forced to keep it :)
    async UpdateStoredAvatarURL(client, message, user) {

        const discordAvatarURL = await user.displayAvatarURL({ format: `webp`, size: 64 });
        const response = await fetch(discordAvatarURL);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const avatarMessage = await message.channel.send(`:desktop: NEW AVATAR FOR: ${user.username}`, { files: [{ attachment: buffer }] });
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