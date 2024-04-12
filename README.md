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
./install-fabric.sh
cd fabric-samples/test-network

sudo ./network.sh down
sudo ./network.sh up createChannel
sudo ./network.sh deployCC -ccn basic -ccp ../../chaincodes/contract-chaincode -ccl go

sudo ./network.sh createChannel -c channel1
sudo ./network.sh deployCC -ccn basic -ccp ../../chaincodes/bank-chaincode -c channel1 -ccl go

sudo bash

export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

### Server
```
cd server
npm install
npm run build

sudo bash
npm start
```