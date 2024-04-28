# Blockchain and Hyperledger Based Cross-Border-Contractual-Payment System
Course Project for CS731 - Blockchain Technology and Applications, under Prof. Angshuman Karmakar, IIT Kanpur

## Running the Application

### Client
```
cd Client
npm install
npm run dev
```

### Hyperledger
```
sudo ./install-fabric.sh
cd fabric-samples/test-network

sudo ./network.sh down
sudo ./network.sh up 
sudo ./network.sh createChannel -c contract
sudo ./network.sh deployCC -ccn contract -ccp ../../chaincodes/contract-chaincode -c contract -ccl go

sudo ./network.sh createChannel -c bank
sudo ./network.sh deployCC -ccn adfc -ccp ../../chaincodes/adfc-chaincode -c bank -ccl go
sudo ./network.sh deployCC -ccn ibibi -ccp ../../chaincodes/ibibi-chaincode -c bank -ccl go
sudo ./network.sh deployCC -ccn yesbi -ccp ../../chaincodes/yesbi-chaincode -c bank -ccl go
sudo ./network.sh deployCC -ccn forex -ccp ../../chaincodes/forex-chaincode -c bank -ccl go
sudo ./network.sh deployCC -ccn inr -ccp ../../chaincodes/inr-chaincode -c bank -ccl go
sudo ./network.sh deployCC -ccn usd -ccp ../../chaincodes/usd-chaincode -c bank -ccl go

sudo bash

export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

### Server - Backend for Blockchain
```
cd server
npm install
npm run build

sudo bash
npm start
```

### Server2 - Backend for SQLite3 DB
This is used to store and retrieve non-critical user info that doesn't need to stored on the blockchain
```
cd server2
npm start
```