"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    user: process.env.USERDB,
    host: process.env.HOSTDB,
    database: process.env.DATABASE,
    password: process.env.PASSWDB
});
