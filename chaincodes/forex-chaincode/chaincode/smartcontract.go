package chaincode

import (
    "fmt"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing assets
type SmartContract struct {
    contractapi.Contract
}


// InitLedger initializes the ledger with sample assets
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
    // Initialize any necessary data here
    
    return nil
}

func (s *SmartContract) Forex(ctx contractapi.TransactionContextInterface, currencyFrom string, currencyTo string, amount int) (int, error) {
    
    if currencyFrom == "USD" && currencyTo == "INR" {
        return amount * 83, nil
    } else if currencyFrom == "INR" && currencyTo == "USD" {
        return amount / 83, nil
    }
    
    return 0, fmt.Errorf("invalid currency pair")
}