
exports.DATABASE = {
    AWARD_CATEGORY: "AWARD_CATEGORY",
    GAME: "GAME",
    NOMINATION: "NOMINATION",
    NOMINATION_LINK: "NOMINATION_LINK",
    NOMINATION_IMAGE_URL: "NOMINATION_IMAGE_URL",
};

exports.OPTIONS = {
    OPTION_GAME: 1 << 0,
    OPTION_CHARACTER: 1 << 1,
    OPTION_PERSON: 1 << 2,
};

exports.DATABASE_DATA = new Map([
    [this.DATABASE.AWARD_CATEGORY, {
        name: "awardCategory",
        values:
            `id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoryString TEXT,
            optionsFlag INTEGER`
    }],

    [this.DATABASE.GAME, {
        name: "game",
        values:
            `id INTEGER PRIMARY KEY AUTOINCREMENT,
            gameString TEXT`
    }],

    [this.DATABASE.NOMINATION, {
        name: "nomination",
        values:
            `id INTEGER PRIMARY KEY AUTOINCREMENT,
            discordID TEXT,
            subjectString TEXT,
            categoryID INTEGER,
            gameID INTEGER,
            character TEXT,
            person TEXT,
            imageURL TEXT`
    }],

    [this.DATABASE.NOMINATION_LINK, {
        name: "nominationLink",
        values:
            `id INTEGER PRIMARY KEY AUTOINCREMENT,
            nominationID INTEGER,
            link TEXT`
    }],

    [this.DATABASE.NOMINATION_IMAGE_URL, {
        name: "nominationImageUrl",
        values:
            `id INTEGER PRIMARY KEY AUTOINCREMENT,
            nominationID INTEGER,
            imageURL TEXT`
    }],
]);