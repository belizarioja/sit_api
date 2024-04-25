import { Pool } from "pg";

export const pool = new Pool({
    user: process.env.USERDB,
    host: process.env.HOSTDB,
    database: process.env.DATABASE,
    password: process.env.PASSWDB
})
