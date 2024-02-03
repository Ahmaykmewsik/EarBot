const SQLite = require("better-sqlite3");
const sql = new SQLite('./data.sqlite');
const { DATABASE, DATABASE_DATA } = require("./Constants");
const UtilityFunctions = require("./UtilityFunctions");

class SqlColumn {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
};

module.exports = {

    GetDatabaseData(database) {
        let result = [];
        if (database)
            result = DATABASE_DATA.get(database);
        if (!result || !result.name) {
            let errorMessage = `SQL ERROR: Unknown Database ${database}`;
            console.error(errorMessage);
        }
        return result;
    },

    GetDatabaseValues(databaseData) {
        let values = []
        if (databaseData && databaseData.values) {
            let valuesRaw = databaseData.values
                .split(",")
                .map(d => d.trim())
                .map(r => r.split(" "))
            for (let value of valuesRaw) {
                if (value.length >= 2)
                    values.push(new SqlColumn(value[0], value[1]));
            }
        }
        return values;
    },

    SqlSetup(client) {

        if (!sql.prepare(`SELECT name FROM sqlite_master WHERE type='table' LIMIT 1;`).get()) {

            for (let databaseData of DATABASE_DATA.values()) {
                sql.prepare(`CREATE TABLE ${databaseData.name} (${databaseData.values});`).run();
            }

            sql.pragma("synchronous = 1");
            sql.pragma("journal_mode = wal");
            console.log("Completed First Time SQL Setup");
        }
        else {

            let sqlChangesToLog = [];
            for (let databaseType of Object.keys(DATABASE)) {
                let databaseData = this.GetDatabaseData(databaseType);
                if (databaseData) {

                    let tableExists = sql.prepare(
                        `SELECT count(*) FROM sqlite_master WHERE type='table' AND name = '${databaseData.name}'`).get();

                    if (!tableExists[`count(*)`]) {
                        sql.prepare(`CREATE TABLE ${databaseData.name} (${databaseData.values})`).run();
                        sqlChangesToLog.push(`New table created: ${databaseData.name}`);
                    }

                    let values = this.GetDatabaseValues(databaseData);
                    let valuesFromTable = sql.prepare(`PRAGMA table_info(${databaseData.name})`).all();
                    for (let valueFromTable of valuesFromTable) {
                        if (!values.some(v => v.name == valueFromTable.name && v.type == valueFromTable.type)) {
                            sql.prepare(`ALTER TABLE ${databaseData.name} DROP COLUMN ${valueFromTable.name}`).run();
                            sqlChangesToLog.push(`Dropped depricated column from ${databaseData.name}: ` +
                                `${valueFromTable.name} [${valueFromTable.type}]`);
                        }
                    }

                    for (let i in values) {
                        try {
                            sql.prepare(`SELECT ${values[i].name} FROM ${databaseData.name} LIMIT 1`).run();
                        } catch (error) {
                            let valueString = `${values[i].name} [${values[i].type}]`;
                            sql.prepare(`ALTER TABLE ${databaseData.name} ADD COLUMN ${valueString}`).run();
                            sqlChangesToLog.push(`New column added to ${databaseData.name}: ${valueString}`);
                        }
                    }
                } else {
                    console.error(`Failed to parse databaseData for ${databaseType}`);
                }
            }
        }

        client.sql = sql;
    },

    SqlGetAll(sql, DATABASE) {
        let result = [];

        let databaseData = DATABASE_DATA.get(DATABASE);
        (databaseData) 
            ? result = sql.prepare(`SELECT * FROM ${databaseData.name}`).all()
            : console.error(`Unknown database: ${DATABASE}`);

        return result;
    },

    SqlSet(sql, message, databaseInput, dataForSql) {
        let databaseData = this.GetDatabaseData(databaseInput, { message: message });
        let columns;
        let values;
        let rowArray = this.GetDatabaseValues(databaseData);
        columns = rowArray.map(r => r.name).join(", ");
        values = rowArray.map(r => r.name).join(", @");

        try {
            sql.prepare(`INSERT OR REPLACE INTO ${databaseData.name} (${columns}) VALUES (@${values})`).run(dataForSql);
        } catch (error) {
            UtilityFunctions.ReplyErrorMessage(error, message);
        }
    }

};