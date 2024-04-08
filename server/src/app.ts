import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';


const express = require('express')
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
// const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));

// Path to user private key directory.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore'));

// Path to user certificate directory.
const certDirectoryPath = envOrDefault('CERT_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts'));

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();
const assetId = `asset${Date.now()}`;

async function main(): Promise<void> {

    await displayInputParameters();

    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(chaincodeName);

        // Initialize a set of asset data on the ledger using the chaincode 'InitLedger' function.
        await initLedger(contract);

        app.post('/acceptByContractor', async (req:any, res:any) => {
            const { contractId, contractor, manager, contractorAccount, paymentCurrency } = req.body;
            try {
                await acceptByContractor(contract, contractId, contractor, manager, contractorAccount, paymentCurrency);
                res.status(200).json({ message: 'Contract accepted by contractor' });
            } catch (error) {
                console.error('Error accepting contract by contractor:', error);
                res.status(500).json({ error: 'Failed to accept contract by contractor' });
            }
        });

        app.post('/acceptByManager', async (req:any, res:any) => {
            const { contractId, manager, contractor } = req.body;
            try {
                // Call the AcceptByManager function on the smart contract.
                await acceptByManager(contract, contractId, manager, contractor);
                res.status(200).json({ message: 'Contract accepted by manager' });
            } catch (error) {
                console.error('Failed to accept contract by manager:', error);
                res.status(500).json({ error: 'Failed to accept contract by manager' });
            }
        });

        app.post('/register', async (req:any, res:any) => {
            const { username, name, password, bankAccount, centralBank, company } = req.body;
            try {
                // Hash the password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Call the CreateUserAsset function on the smart contract.
                await createUserAsset(contract, username, name, hashedPassword, bankAccount, centralBank, company);
                res.status(200).json({ message: 'User asset created successfully' });
            } catch (error) {
                console.error('Error creating user asset:', error);
                res.status(500).json({ error: 'Failed to create user asset' });
            }
        });

        app.post('/login', async (req:any, res:any) => {
            const { username, password } = req.body;
            try {
                // Call the VerifyUserAsset function on the smart contract.
                const result = await verifyUserAsset(contract, username, password);

                if(result){
                    res.status(200).json({ message: 'User verified successfully', username: username});
                }
                else{
                    res.status(401).json({ message: 'Invalid Username or Password' });
                }
            } catch (error) {
                console.error('Error verifying user asset:', error);
                res.status(500).json({ error: 'Failed to verify user asset' });
            }
        });

        app.get('/UserAsset/:username', async (req:any, res:any) => {
            const { username } = req.params;
            try {
                // Call the GetUserAsset function on the smart contract.
                const result = await getUserAsset(contract, username);
                res.status(200).json(result);
            } catch (error) {
                console.error('Error getting user asset:', error);
                res.status(500).json({ error: 'Failed to get user asset' });
            }
        });

        app.get('/BankAccountAsset/:accountNo', async (req:any, res:any) => {
            const { accountNo } = req.params;
            try {
                // Call the GetBankAccountAsset function on the smart contract.
                const result = await getBankAccountAsset(contract, accountNo);
                res.status(200).json(result);
            } catch (error) {
                console.error('Error getting bank account asset:', error);
                res.status(500).json({ error: 'Failed to get bank account asset' });
            }
        });

        app.get('/contracts/:username', async (req:any, res:any) => {
            const { username } = req.params;
            try {
                // Call the GetContracts function on the smart contract.
                const result = await getContracts(contract, username);
                res.status(200).json(result);
            } catch (error) {
                console.error('Error getting contracts:', error);
                res.status(500).json({ error: 'Failed to get contracts' });
            }
        });

        app.get('/requestedContracts/:username', async (req:any, res:any) => {
            const { username } = req.params;
            try {
                // Call the GetContracts function on the smart contract.
                const result = await getRequestedContracts(contract, username);
                res.status(200).json(result);
            } catch (error) {
                console.error('Error getting contracts:', error);
                res.status(500).json({ error: 'Failed to get contracts' });
            }
        });

        app.get('/pendingContracts/:username', async (req:any, res:any) => {
            const { username } = req.params;
            try {
                // Call the GetContracts function on the smart contract.
                const result = await getPendingContracts(contract, username);
                res.status(200).json(result);
            } catch (error) {
                console.error('Error getting contracts:', error);
                res.status(500).json({ error: 'Failed to get contracts' });
            }
        });

        app.post('/createContractAsset', async (req:any, res:any) => {
            const { manager, contractor, duration, interval, ratePerInterval, rateCurrency, natureOfWork } = req.body;
            try {
                // Call the CreateContractAsset function on the smart contract.
                await createContractAsset(contract, manager, contractor, duration, interval, ratePerInterval, rateCurrency, natureOfWork);
                res.status(200).json({ message: 'Contract asset created successfully' });
            } catch (error) {
                console.error('Error creating contract asset:', error);
                res.status(500).json({ error: 'Failed to create contract asset' });
            }
        });
        

    }
    finally {
        // gateway.close();
        // client.close();
        console.log("Main Executed");
    }
}

main().catch(error => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});

async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity(): Promise<Identity> {
    const certPath = await getFirstDirFileName(certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function getFirstDirFileName(dirPath: string): Promise<string> {
    const files = await fs.readdir(dirPath);
    return path.join(dirPath, files[0]);
}

async function newSigner(): Promise<Signer> {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */
async function initLedger(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');

    await contract.submitTransaction('InitLedger');

    console.log('*** Transaction committed successfully');
}

async function createUserAsset(contract: Contract, username: string, name: string, password: string, bankAccountNo: string, centralBankID: string, company: string): Promise<void> {
    console.log('\n--> Submit Transaction: CreateUserAsset, function creates the initial set of assets on the ledger');

     await contract.submitTransaction(
        'CreateUserAsset',
        username,
        name,
        password,
        bankAccountNo,
        centralBankID,
        company
    );
}
async function verifyUserAsset(contract: Contract, username: string, password: string): Promise<boolean> {
    console.log('\n--> Evaluate Transaction: VerifyUserAsset, function verifies user asset with username and password');
    const resultBytes = await contract.evaluateTransaction('VerifyUserAsset', username, password);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
    return result;
}


async function getUserAsset(contract: Contract, username: string): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetUserAsset, function returns user asset attributes');

    const resultBytes = await contract.evaluateTransaction('GetUserAsset', username);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
    return result;
}



async function getBankAccountAsset(contract: Contract, accountNo: string): Promise<any> {
    console.log('\n--> Evaluate Transaction: GetBankAccountAsset, function returns bank account asset by account number');
    const resultBytes = await contract.evaluateTransaction('GetBankAccountAsset', accountNo);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
    return result;
}

async function getContracts(contract: Contract, username: string): Promise<any> {
    console.log('\n--> Evaluate Transaction: GetContracts, function returns contracts for a given username');
    const resultBytes = await contract.evaluateTransaction('GetContracts', username);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
    return result;
}

async function getRequestedContracts(contract: Contract, username: string): Promise<any> {
    console.log('\n--> Evaluate Transaction: GetContracts, function returns contracts for a given username');
    const resultBytes = await contract.evaluateTransaction('GetRequestedContracts', username);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
    return result;
}


async function getPendingContracts(contract: Contract, username: string): Promise<any> {
    console.log('\n--> Evaluate Transaction: GetContracts, function returns contracts for a given username');
    const resultBytes = await contract.evaluateTransaction('GetPendingContracts', username);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
    return result;
}

async function createContractAsset(contract: Contract, manager: string, contractor: string, duration: string, interval: string, ratePerInterval: string, rateCurrency: string, natureOfWork: string): Promise<void> {
    console.log('\n--> Submit Transaction: CreateContractAsset, function creates a new contract asset on the ledger');
    await contract.submitTransaction(
        'CreateContractAsset',
        manager,
        contractor,
        duration,
        interval,
        ratePerInterval,
        rateCurrency,
        natureOfWork
    );
}

async function acceptByContractor(contract: Contract, contractId: number, contractor: string, manager: string, contractorAccount: string, paymentCurrency: string): Promise<void> {
    console.log('\n--> Submit Transaction: AcceptByContractor, function accepts the contract by the contractor');
    await contract.submitTransaction(
        'AcceptByContractor',
        contractId.toString(),
        contractor,
        manager,
        contractorAccount,
        paymentCurrency
    );
    console.log('*** Transaction committed successfully');
}

async function acceptByManager(contract: Contract, contractId: number, manager: string, contractor: string): Promise<void> {
    console.log('\n--> Submit Transaction: AcceptByManager, function accepts the contract by the manager');
    await contract.submitTransaction(
        'AcceptByManager',
        contractId.toString(),
        manager,
        contractor
    );
    console.log('*** Transaction committed successfully');
}



/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
async function displayInputParameters(): Promise<void> {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certDirectoryPath: ${certDirectoryPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}

app.listen( port ,()=>{
    console.log('server is running at port number 3000')
});