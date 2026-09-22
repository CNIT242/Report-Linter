# Linter
Google doc managemet for Purdue University, CNIT242 style Lab &amp; TPS Reports formatting. 


### Setup
#### Postgres
Account storage is handled through a postgres database. While the --generate flag will populace the database schema, the actual account and database creation is not handled through the program. Setup will vary depending on system configuration, but general instructions can be found here for a fresh installation of Postgres.  


```
CREATE USER <user> WITH PASSWORD '<password>';
CREATE DATABASE <project> OWNER <user>;
```

You may then need to modify the pg_hba.conf and postgresql.conf as necessary to accept remote connections. Alternative postgres account permissions can be configured, but the process assumes the account holds the following priveleges: SELECT, INSERT, UPDATE, DELETE, REFERENCES, CREATE (only when provided the --generate argument), & CONNECT. 

#### .env
Reference .env.example for variables and assignments. 