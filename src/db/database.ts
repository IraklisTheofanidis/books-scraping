
import { Pool, types } from "pg";


class Database {
    pool: Pool = new Pool();

    constructor() { }

    async connectToDB() {
        console.log('Connecting to database...');

        // Override PostgreSQL's NUMERIC (OID 1700) to parse as JS float
        const NUMERIC_OID = 1700;

        types.setTypeParser(NUMERIC_OID, (val: string): number => parseFloat(val));

        this.pool = new Pool({
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT as string),
        });
    }
}

const db = new Database();

export default db;
