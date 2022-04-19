INSTALLATION
============

Debian/Ubuntu
-------------

These are instructions for running bustabit locally on a Debian / Ubuntu machine.

### Distribution packages

You will need to install the Postgres DBMS and node.js. The `nodejs-legacy`
package installs `nodejs` but will additionally create a symlink from
`/usr/bin/node` to `/usr/bin/nodejs`.

    sudo apt-get install git npm postgresql nodejs-legacy

### Create a database user and setup the tables

Create a user. It will prompt you for a password.

    sudo -u postgres createuser -P wowgo

Create the database and setup the tables. The second command will prompt you
for the password again.

    sudo -u postgres createdb -O wowgo wowgodb
    psql -W -U wowgo -d wowgodb -h localhost -f server/schema.sql

Mac OS X
--------

These are instructions for running wowgo locally on a Mac using homebrew.

### Install homebrew packages

    brew install git node npm postgresql


### Create a database user and setup the tables

Create a user. It will prompt you for a password.

    createuser -P wowgo

Create the database and setup the tables. The second command will prompt you
for the password again.

    createdb -O wowgo wowgodb
    psql -W -U wowgo -d wowgodb -h localhost -f src/server/schema.sql


Configuration
=============

### Installing node.js dependencies locally.

This will download and install all dependencies in the `node_modules` subdirectory.

    npm install

### .env file

The following configuration variables need to be set in a .env file in the root directory. see the `example.env` file

### DATABASE_URL

Sets the database connection string. Example:

    DATABASE_URL=postgres://wowgo:<YOURPASSWORD>@localhost/wowgodb

### MNEMONIC

You will need to create a mnemonic and set the MENEMONIC variable in the .env file - A mnemonic is a phrase of 12 random words that will be used to generate a private key, public key, and wallet addresses. Example:

    MNEMONIC=crack giraffe gadget suspect lab enter switch nominee clump symbol hurt end

DON'T SHARE, CHANGE, OR LOOSE THE MNEMONIC OR YOU WILL LOOSE YOUR WALLETS AND ALL USERS FUNDS.

### ETHEREUM_PROVIDER

Set the ETHEREUM_PROVIDER variable in the .env file to your own provider. Example: 
    
    ETHEREUM_PROVIDER=http://mainnet.infura.io/v3/<YOU_PROJECT_KEY>

### MINING_FEE

Sets the mining fee for withdrawals. Example: `MINING_FEE=100`

### BIT_TO_ETH_RATIO

Sets the worth of the house's currency in ether. Example: if 1 ether = 1000000 bits, then `BIT_TO_ETH_RATIO=1000000`

### TIP_FEE 

Sets the house commission for processing tip submissions. `TIP_FEE=0`

### MIN_TIP

Sets the minimum amount of bit that could be sent as tip. `MIN_TIP=100`

### MIN_WITHDRAW

Sets the minimum amount of bit that could be withdrawn. `MIN_WITHDRAW=1000`

Running
=======

You can run the server by using `npm start`. By default it will listen on port `3841`.
