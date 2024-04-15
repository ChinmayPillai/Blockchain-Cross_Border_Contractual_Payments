package chaincode

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing assets
type SmartContract struct {
	contractapi.Contract
}

// BankAccountAsset represents a bank account asset
type BankAccountAsset struct {
	AccountNo   string `json:"accountNo"` // Unique
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

// BankAccountAssetExists checks if a bank account asset exists in the world state
func (s *SmartContract) BankAccountAssetExists(ctx contractapi.TransactionContextInterface, accountNo string) (bool, error) {
	bankAccountAssetJSON, err := ctx.GetStub().GetState(accountNo)
	if err != nil {
		return false, fmt.Errorf("failed to read bank account asset from world state: %v", err)
	}

	return bankAccountAssetJSON != nil, nil
}

// GetBankAccountAsset retrieves a bank account asset by account number.
// If the asset does not exist, it creates a new one with zero funds.
func (s *SmartContract) GetBankAccountAsset(ctx contractapi.TransactionContextInterface, accountNo string) (*BankAccountAsset, error) {
	bankAccountAssetJSON, err := ctx.GetStub().GetState(accountNo)
	if err != nil {
		return nil, fmt.Errorf("failed to read bank account asset from world state: %v", err)
	}
	if bankAccountAssetJSON == nil {
		// If the asset does not exist, create a new one with zero funds.
		bankAccountAsset := BankAccountAsset{
			AccountNo: accountNo,
			Funds:     0,
		}
		bankAccountAssetJSON, err := json.Marshal(bankAccountAsset)
		if err != nil {
			return nil, err
		}
		err = ctx.GetStub().PutState(accountNo, bankAccountAssetJSON)
		if err != nil {
			return nil, err
		}
		return &bankAccountAsset, nil
	}

	var bankAccountAsset BankAccountAsset
	err = json.Unmarshal(bankAccountAssetJSON, &bankAccountAsset)
	if err != nil {
		return nil, err
	}

	return &bankAccountAsset, nil
}

// AddFunds adds funds to a bank account asset.
// If the asset does not exist, it creates a new one with zero funds.
func (s *SmartContract) AddFunds(ctx contractapi.TransactionContextInterface, accountNo string, amount int) error {
	bankAccountAsset, err := s.GetBankAccountAsset(ctx, accountNo)
	if err != nil {
		return err
	}

	bankAccountAsset.Funds += amount

	bankAccountAssetJSON, err := json.Marshal(bankAccountAsset)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(accountNo, bankAccountAssetJSON)
}

// RemoveFunds removes funds from a bank account asset.
// If the asset does not exist, it returns an error.
// If the funds are not sufficient, it returns an error.
func (s *SmartContract) RemoveFunds(ctx contractapi.TransactionContextInterface, accountNo string, amount int) error {
	bankAccountAsset, err := s.GetBankAccountAsset(ctx, accountNo)
	if err != nil {
		return err
	}

	if bankAccountAsset.Funds < amount {
		return fmt.Errorf("insufficient funds in the account")
	}

	bankAccountAsset.Funds -= amount

	bankAccountAssetJSON, err := json.Marshal(bankAccountAsset)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(accountNo, bankAccountAssetJSON)
}

func (s *SmartContract) ForeignTransfer(ctx contractapi.TransactionContextInterface, currencyFrom string, currencyTo string, amount int, bank string, bankAccount string) error {
	
	fcn := "PayCentralBnk"
	args := [][]byte{[]byte(fcn), []byte(currencyFrom), []byte(currencyTo), []byte(fmt.Sprintf("%d", amount)), []byte(bank), []byte(bankAccount)}

	centralBnk := strings.ToLower(currencyFrom)

	response := ctx.GetStub().InvokeChaincode(centralBnk, args, "")

	if response.GetStatus() != 200 {
		return fmt.Errorf("central bank chaincode returned %d", response.GetStatus())
	}

	return nil	
}

func (s *SmartContract) Pay(ctx contractapi.TransactionContextInterface, currencyFrom string, currencyTo string, amount int, bankAccountFrom string, bankTo string, bankAccountTo string) error {

	err := s.RemoveFunds(ctx, bankAccountFrom, amount)
	if err != nil {
		return err
	}

	if(currencyFrom == currencyTo){

		fnc := "AddFunds"
		args := [][]byte{[]byte(fnc), []byte(bankAccountTo), []byte(fmt.Sprintf("%d", amount))}

		contract := strings.ToLower(bankTo)

		response := ctx.GetStub().InvokeChaincode(contract, args, "")

		if response.GetStatus() != 200 {
			return fmt.Errorf("bank chaincode returned %d", response.GetStatus())
		}

		return nil
	}

	err = s.ForeignTransfer(ctx, currencyFrom, currencyTo, amount, bankTo, bankAccountTo)
	if err != nil {
		return err
	}
	
	return nil
}
