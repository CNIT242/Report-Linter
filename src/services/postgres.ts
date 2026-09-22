import postgres from "pg";
import jwt from "jsonwebtoken";

import crypto from "node:crypto";


class Database
{
    pool : postgres.Pool;
    constructor()
    {   
        const poolSettings: postgres.PoolOptions = {
          host: process.env.POSTGRES_HOST || "localhost",
          database: process.env.POSTGRES_DATABASE || "database",
          user: process.env.POSTGRES_USER || "root",
          password: process.env.POSTGRES_PASSWORD || "password",
          max: 10,
          maxUses: Infinity,
          allowExitOnIdle: true,
          maxLifetimeSeconds: 600,
          idleTimeoutMillis: 10000,
        }

        this.pool = new postgres.Pool(poolSettings);
    }

    async Create() {
      this.pool.query(`
        `);
    }
}

// // Using the factory defaults.
// crypto.scrypt('password', 'salt', 64, (err, derivedKey) => {
//   if (err) throw err;
//   console.log(derivedKey.toString('hex'));  // '3745e48...08d59ae'
// });
// // Using a custom N parameter. Must be a power of two.
// crypto.scrypt('password', 'salt', 64, { N: 1024 }, (err, derivedKey) => {
//   if (err) throw err;
//   console.log(derivedKey.toString('hex'));  // '3745e48...aa39b34'
// });