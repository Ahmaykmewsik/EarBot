
exports.DATABASE = {
    AWARD_CATEGORY: "AWARD_CATEGORY",
}

exports.DATABASE_DATA = new Map([
    [this.DATABASE.AWARD_CATEGORY, {
        name: "awardCategory",
        values:
            `id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoryString TEXT`
    }],
]);