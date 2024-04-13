package chaincode

import (
    "encoding/json"
    "fmt"
    "strconv"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing assets
type SmartContract struct {
    contractapi.Contract
}


// BankAccountAsset represents a bank account asset
type BankAccountAsset struct {
    AccountNo   string `json:"accountNo"`   // Unique
    CentralBank string `json:"centralBank"`
    Funds       int    `json:"funds"`
    Owner       string `json:"owner"`
}


// InitLedger initializes the ledger with sample assets
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
    // Initialize any necessary data here
    
    return nil
}


// CreateBankAccountAsset creates a new bank account asset
func (s *SmartContract) CreateBankAccountAsset(ctx contractapi.TransactionContextInterface, accountNo string, centralBank string, funds int, owner string) error {
    exists, err := s.BankAccountAssetExists(ctx, accountNo)
    if err != nil {
        return err
    }
    if exists {
        return fmt.Errorf("bank account asset with account number %s already exists", accountNo)
    }

    bankAccountAsset := BankAccountAsset{
        AccountNo:   accountNo,
        CentralBank: centralBank,
        Funds:       funds,
        Owner:       owner,
    }

    bankAccountAssetJSON, err := json.Marshal(bankAccountAsset)
    if err != nil {
        return err
    }

    return ctx.GetStub().PutState(accountNo, bankAccountAssetJSON)
}

// GetBankAccountAsset retrieves a bank account asset by account number
func (s *SmartContract) GetBankAccountAsset(ctx contractapi.TransactionContextInterface, accountNo string) (*BankAccountAsset, error) {
    bankAccountAssetJSON, err := ctx.GetStub().GetState(accountNo)
    if err != nil {
        return nil, fmt.Errorf("failed to read bank account asset from world state: %v", err)
    }
    if bankAccountAssetJSON == nil {
        return nil, fmt.Errorf("bank account asset with account number %s does not exist", accountNo)
    }

    var bankAccountAsset BankAccountAsset
    err = json.Unmarshal(bankAccountAssetJSON, &bankAccountAsset)
    if err != nil {
        return nil, err
    }

    return &bankAccountAsset, nil
}


// BankAccountAssetExists checks if a bank account asset exists in the world state
func (s *SmartContract) BankAccountAssetExists(ctx contractapi.TransactionContextInterface, accountNo string) (bool, error) {
    bankAccountAssetJSON, err := ctx.GetStub().GetState(accountNo)
    if err != nil {
        return false, fmt.Errorf("failed to read bank account asset from world state: %v", err)
    }

    return bankAccountAssetJSON != nil, nil
}

func (s *SmartContract) InvokeForex(ctx contractapi.TransactionContextInterface, currencyFrom string, currencyTo string, amount int) (int, error) {
    
    fcn := "Forex"

    args := [][]byte{[]byte(fcn), []byte(currencyFrom), []byte(currencyTo), []byte(fmt.Sprintf("%d", amount))}

    response := ctx.GetStub().InvokeChaincode("forex", args, "")

    if response.GetStatus() != 200 {
        return 0, fmt.Errorf("forex chaincode returned %d", response.GetStatus())
    }

    payload, err := strconv.Atoi(string(response.GetPayload()))
    if err != nil {
        return 0, err
    }

    return payload, nil
}