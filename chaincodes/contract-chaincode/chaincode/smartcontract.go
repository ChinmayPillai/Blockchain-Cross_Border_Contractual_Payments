package chaincode

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"golang.org/x/crypto/bcrypt"
)

// SmartContract provides functions for managing assets
type SmartContract struct {
	contractapi.Contract
}

// UserAsset represents a user's asset
type UserAsset struct {
	Contracts     []ContractAsset `json:"contracts"`
	Requests      []ContractAsset `json:"requests"`
	Pending       []ContractAsset `json:"pending"`
	Username      string          `json:"username"` // Unique primary key
	Name          string          `json:"name"`
	Password      string          `json:"password"`
	Bank          string          `json:"bank"`
	BankAccountNo string          `json:"bankAccountNo"`
	CentralBankID string          `json:"centralBankID"`
	Company       string          `json:"company"`
}

// // BankAccountAsset represents a bank account asset
// type BankAccountAsset struct {
//     AccountNo   string `json:"accountNo"`   // Unique
//     CentralBank string `json:"centralBank"`
//     Funds       int    `json:"funds"`
//     Owner       string `json:"owner"`
// }

// ContractAsset represents a contract asset
type ContractAsset struct {
	ContractId           int    `json:"contractId"`
	Manager              string `json:"manager"`
	Contractor           string `json:"contractor"`
	Duration             int    `json:"duration"`
	Interval             int    `json:"interval"`
	RatePerInterval      int    `json:"ratePerInterval"`
	RateCurrency         string `json:"rateCurrency"`
	NatureOfWork         string `json:"natureOfWork"`
	StartDate            string `json:"startDate"`
	LastPaymentDate      string `json:"lastPaymentDate"`
	ManagerBank          string `json:"managerBank"`
	ManagerBankAccountNo string `json:"managerBankAccountNo"`
	ContractorAccount    string `json:"contractorAccount"`
	PaymentCurrency      string `json:"paymentCurrency"`
	ContractorBank       string `json:"contractorBank"`
}

// InitLedger initializes the ledger with sample assets
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	// Initialize any necessary data here

	return ctx.GetStub().PutState("contractNo", []byte("1"))
}

func (s *SmartContract) GetContractNo(ctx contractapi.TransactionContextInterface) (int, error) {
	contractNoBytes, err := ctx.GetStub().GetState("contractNo")
	if err != nil {
		return 0, fmt.Errorf("failed to read contractNo from world state: %v", err)
	}
	if contractNoBytes == nil {
		return 0, fmt.Errorf("contractNo does not exist")
	}

	contractNo, err := strconv.Atoi(string(contractNoBytes))
	if err != nil {
		return 0, fmt.Errorf("failed to convert contractNo to int: %v", err)
	}

	return contractNo, nil
}

func (s *SmartContract) IncrementContractNo(ctx contractapi.TransactionContextInterface) error {
	contractNoBytes, err := ctx.GetStub().GetState("contractNo")
	if err != nil {
		return fmt.Errorf("failed to read contractNo from world state: %v", err)
	}
	if contractNoBytes == nil {
		return fmt.Errorf("contractNo does not exist")
	}

	contractNo, err := strconv.Atoi(string(contractNoBytes))
	if err != nil {
		return fmt.Errorf("failed to convert contractNo to int: %v", err)
	}

	contractNo++
	contractNoBytes = []byte(strconv.Itoa(contractNo))

	return ctx.GetStub().PutState("contractNo", contractNoBytes)
}

// CreateUserAsset creates a new user asset
func (s *SmartContract) CreateUserAsset(ctx contractapi.TransactionContextInterface, username string, name string, password string, bank string, bankAccountNo string, centralBankID string, company string) error {
	exists, err := s.UserAssetExists(ctx, username)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("user asset with username %s already exists", username)
	}

	userAsset := UserAsset{
		Contracts:     []ContractAsset{},
		Requests:      []ContractAsset{},
		Pending:       []ContractAsset{},
		Username:      username,
		Name:          name,
		Password:      password,
		Bank:          bank,
		BankAccountNo: bankAccountNo,
		CentralBankID: centralBankID,
		Company:       company,
	}

	userAssetJSON, err := json.Marshal(userAsset)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(username, userAssetJSON)
}

// VerifyUserAsset verifies the password of a user asset
func (s *SmartContract) VerifyUserAsset(ctx contractapi.TransactionContextInterface, username string, password string) (bool, error) {
	userAssetJSON, err := ctx.GetStub().GetState(username)
	if err != nil {
		return false, fmt.Errorf("failed to read user asset from world state: %v", err)
	}
	if userAssetJSON == nil {
		return false, fmt.Errorf("user asset with username %s does not exist", username)
	}

	var userAsset UserAsset
	err = json.Unmarshal(userAssetJSON, &userAsset)
	if err != nil {
		return false, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(userAsset.Password), []byte(password))

	return err == nil, nil
}

// GetUserAsset retrieves a user asset by username
func (s *SmartContract) GetUserAsset(ctx contractapi.TransactionContextInterface, username string) (*UserAsset, error) {
	userAssetJSON, err := ctx.GetStub().GetState(username)
	if err != nil {
		return nil, fmt.Errorf("failed to read user asset from world state: %v", err)
	}
	if userAssetJSON == nil {
		return nil, fmt.Errorf("user asset with username %s does not exist", username)
	}

	var userAsset UserAsset
	err = json.Unmarshal(userAssetJSON, &userAsset)
	if err != nil {
		return nil, err
	}

	return &userAsset, nil
}

// CreateContractAsset creates a new contract asset and adds it to the user's asset
func (s *SmartContract) CreateContractAsset(ctx contractapi.TransactionContextInterface, manager string, contractor string, duration int, interval int, ratePerInterval int, natureOfWork string, startDate string) error {
	contractorAsset, err := s.GetUserAsset(ctx, contractor)
	if err != nil {
		return err
	}

	managerAsset, err := s.GetUserAsset(ctx, manager)
	if err != nil {
		return err
	}

	rateCurrency := managerAsset.CentralBankID
	managerBank := managerAsset.Bank
	managerBankAccountNo := managerAsset.BankAccountNo

	contractNo, err := s.GetContractNo(ctx)
	if err != nil {
		return fmt.Errorf("failed to read contractNo from world state: %v", err)
	}

	// Create the contract asset
	contract := ContractAsset{
		ContractId:           contractNo,
		Manager:              manager,
		Contractor:           contractor,
		Duration:             duration,
		Interval:             interval,
		RatePerInterval:      ratePerInterval,
		RateCurrency:         rateCurrency,
		NatureOfWork:         natureOfWork,
		StartDate:            startDate,
		LastPaymentDate:      startDate,
		ManagerBank:          managerBank,
		ManagerBankAccountNo: managerBankAccountNo,
		ContractorAccount:    "",
		PaymentCurrency:      "",
		ContractorBank:       "",
	}

	// Increment the contract number
	if err := s.IncrementContractNo(ctx); err != nil {
		return err
	}

	// Append the contract to the Requests array of the user
	contractorAsset.Requests = append(contractorAsset.Requests, contract)

	// Marshal the updated user asset
	userAssetJSON, err := json.Marshal(contractorAsset)
	if err != nil {
		return err
	}

	// Put the updated user asset back to the world state
	return ctx.GetStub().PutState(contractor, userAssetJSON)
}

// AcceptByContractor fills ContractorAccount and PaymentCurrency in the previous contract,
// removes it from the Requests array of contractor,
// and appends it to the Pending array of manager
func (s *SmartContract) AcceptByContractor(ctx contractapi.TransactionContextInterface, contractId int, contractor string, manager string, contractorAccount string, paymentCurrency string) error {
	// Get contractor's user asset
	contractorAsset, err := s.GetUserAsset(ctx, contractor)
	if err != nil {
		return err
	}

	// Find the contract in the Requests array of the contractor
	var contractIndex int
	var found bool
	for i, contract := range contractorAsset.Requests {
		if contract.ContractId == contractId {
			contractIndex = i
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("contract not found in the requests of contractor")
	}

	// Fill ContractorAccount and PaymentCurrency in the previous contract
	contract := contractorAsset.Requests[contractIndex]
	contract.ContractorAccount = contractorAccount
	contract.PaymentCurrency = paymentCurrency
	contract.ContractorBank = contractorAsset.Bank

	// Remove the contract from the Requests array of contractor
	contractorAsset.Requests = append(contractorAsset.Requests[:contractIndex], contractorAsset.Requests[contractIndex+1:]...)

	// Get manager's user asset
	managerAsset, err := s.GetUserAsset(ctx, manager)
	if err != nil {
		return err
	}

	// Append the modified contract to the Pending array of manager
	managerAsset.Pending = append(managerAsset.Pending, contract)

	// Update contractor's user asset in the world state
	contractorAssetJSON, err := json.Marshal(contractorAsset)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(contractor, contractorAssetJSON); err != nil {
		return err
	}

	// Update manager's user asset in the world state
	managerAssetJSON, err := json.Marshal(managerAsset)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(manager, managerAssetJSON); err != nil {
		return err
	}

	return nil
}

// AcceptByManager appends the final contract to the Contracts array of both contractor and manager
// and removes it from the Pending array of manager
func (s *SmartContract) AcceptByManager(ctx contractapi.TransactionContextInterface, contractId int, manager string, contractor string) error {
	// Get manager's user asset
	managerAsset, err := s.GetUserAsset(ctx, manager)
	if err != nil {
		return err
	}

	// Find the contract in the Pending array of manager
	var contractIndex int
	var found bool
	for i, contract := range managerAsset.Pending {
		if contract.ContractId == contractId {
			contractIndex = i
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("contract not found in the pending of manager")
	}

	// Get contractor's user asset
	contractorAsset, err := s.GetUserAsset(ctx, contractor)
	if err != nil {
		return err
	}

	// Append the contract to the Contracts array of both contractor and manager
	contract := managerAsset.Pending[contractIndex]
	managerAsset.Contracts = append(managerAsset.Contracts, contract)
	contractorAsset.Contracts = append(contractorAsset.Contracts, contract)

	// Remove the contract from the Pending array of manager
	managerAsset.Pending = append(managerAsset.Pending[:contractIndex], managerAsset.Pending[contractIndex+1:]...)

	// Update manager's user asset in the world state
	managerAssetJSON, err := json.Marshal(managerAsset)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(manager, managerAssetJSON); err != nil {
		return err
	}

	// Update contractor's user asset in the world state
	contractorAssetJSON, err := json.Marshal(contractorAsset)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(contractor, contractorAssetJSON); err != nil {
		return err
	}

	return nil
}

// UserAssetExists checks if a user asset exists in the world state
func (s *SmartContract) UserAssetExists(ctx contractapi.TransactionContextInterface, username string) (bool, error) {
	userAssetJSON, err := ctx.GetStub().GetState(username)
	if err != nil {
		return false, fmt.Errorf("failed to read user asset from world state: %v", err)
	}

	return userAssetJSON != nil, nil
}

// GetRequestsByUser retrieves the Requests array of a user asset by username
func (s *SmartContract) GetRequestedContracts(ctx contractapi.TransactionContextInterface, username string) ([]ContractAsset, error) {
	userAsset, err := s.GetUserAsset(ctx, username)
	if err != nil {
		return nil, err
	}
	return userAsset.Requests, nil
}

// GetPendingByUser retrieves the Pending array of a user asset by username
func (s *SmartContract) GetPendingContracts(ctx contractapi.TransactionContextInterface, username string) ([]ContractAsset, error) {
	userAsset, err := s.GetUserAsset(ctx, username)
	if err != nil {
		return nil, err
	}
	return userAsset.Pending, nil
}

// GetContractsByUser retrieves the Contracts array of a user asset by username
func (s *SmartContract) GetContracts(ctx contractapi.TransactionContextInterface, username string) ([]ContractAsset, error) {
	userAsset, err := s.GetUserAsset(ctx, username)
	if err != nil {
		return nil, err
	}
	return userAsset.Contracts, nil
}

func (s *SmartContract) RemoveFromRequestedOfContractor(ctx contractapi.TransactionContextInterface, contractId int, contractor string) error {
	// Get contractor's user asset
	contractorAsset, err := s.GetUserAsset(ctx, contractor)
	if err != nil {
		return err
	}

	// Find the contract in the Requests array of the contractor
	var contractIndex int
	var found bool
	for i, contract := range contractorAsset.Requests {
		if contract.ContractId == contractId {
			contractIndex = i
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("contract not found in the requests of contractor")
	}

	// Remove the contract from the Requests array of contractor
	contractorAsset.Requests = append(contractorAsset.Requests[:contractIndex], contractorAsset.Requests[contractIndex+1:]...)

	// Update contractor's user asset in the world state
	contractorAssetJSON, err := json.Marshal(contractorAsset)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(contractor, contractorAssetJSON); err != nil {
		return err
	}

	return nil
}

func (s *SmartContract) RemoveFromPendingOfManager(ctx contractapi.TransactionContextInterface, contractId int, manager string) error {
	// Get manager's user asset
	managerAsset, err := s.GetUserAsset(ctx, manager)
	if err != nil {
		return err
	}

	// Find the contract in the Pending array of manager
	var contractIndex int
	var found bool
	for i, contract := range managerAsset.Pending {
		if contract.ContractId == contractId {
			contractIndex = i
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("contract not found in the pending of manager")
	}

	// Remove the contract from the Pending array of manager
	managerAsset.Pending = append(managerAsset.Pending[:contractIndex], managerAsset.Pending[contractIndex+1:]...)

	// Update manager's user asset in the world state
	managerAssetJSON, err := json.Marshal(managerAsset)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(manager, managerAssetJSON); err != nil {
		return err
	}

	return nil
}

func (s *SmartContract) Revoke(ctx contractapi.TransactionContextInterface, contractId int, manager string, contractor string) error {
	// Get manager's user asset
	managerAsset, err := s.GetUserAsset(ctx, manager)
	if err != nil {
		return err
	}

	// Find the contract in the Contracts array of manager
	var managerContractIndex int
	var foundManager bool
	for i, contract := range managerAsset.Contracts {
		if contract.ContractId == contractId {
			managerContractIndex = i
			foundManager = true
			break
		}
	}
	if !foundManager {
		return fmt.Errorf("contract not found in the contracts of manager")
	}

	// Remove the contract from the Contracts array of manager
	managerAsset.Contracts = append(managerAsset.Contracts[:managerContractIndex], managerAsset.Contracts[managerContractIndex+1:]...)

	// Get contractor's user asset
	contractorAsset, err := s.GetUserAsset(ctx, contractor)
	if err != nil {
		return err
	}

	// Find the contract in the Contracts array of contractor
	var contractorContractIndex int
	var foundContractor bool
	for i, contract := range contractorAsset.Contracts {
		if contract.ContractId == contractId {
			contractorContractIndex = i
			foundContractor = true
			break
		}
	}
	if !foundContractor {
		return fmt.Errorf("contract not found in the contracts of contractor")
	}

	// Remove the contract from the Contracts array of contractor
	contractorAsset.Contracts = append(contractorAsset.Contracts[:contractorContractIndex], contractorAsset.Contracts[contractorContractIndex+1:]...)

	// Update manager's user asset in the world state
	managerAssetJSON, err := json.Marshal(managerAsset)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(manager, managerAssetJSON); err != nil {
		return err
	}

	// Update contractor's user asset in the world state
	contractorAssetJSON, err := json.Marshal(contractorAsset)
	if err != nil {
		return err
	}
	if err := ctx.GetStub().PutState(contractor, contractorAssetJSON); err != nil {
		return err
	}

	return nil
}

func (s *SmartContract) CalculateRedemptionAmount(ctx contractapi.TransactionContextInterface, contractId int, manager string, contractor string, currentDate string) (int, error) {
	// Get manager's user asset
	managerAsset, err := s.GetUserAsset(ctx, manager)
	if err != nil {
		return 0, err
	}

	// Get contractor's user asset
	contractorAsset, err := s.GetUserAsset(ctx, contractor)
	if err != nil {
		return 0, err
	}

	// Find the contract in the Contracts array of manager
	var managerContractIndex int
	var managerContractFound bool
	for i, contract := range managerAsset.Contracts {
		if contract.ContractId == contractId {
			managerContractIndex = i
			managerContractFound = true
			break
		}
	}
	if !managerContractFound {
		return 0, fmt.Errorf("contract not found in the contracts of manager")
	}

	// Find the contract in the Contracts array of contractor
	var contractorContractIndex int
	var contractorContractFound bool
	for i, contract := range contractorAsset.Contracts {
		if contract.ContractId == contractId {
			contractorContractIndex = i
			contractorContractFound = true
			break
		}
	}
	if !contractorContractFound {
		return 0, fmt.Errorf("contract not found in the contracts of contractor")
	}

	// Get the contract from manager's and contractor's assets
	managerContract := managerAsset.Contracts[managerContractIndex]
	contractorContract := contractorAsset.Contracts[contractorContractIndex]

	// Parse current date
	currentDateParsed, err := time.Parse("02-01-2006", currentDate)
	if err != nil {
		return 0, fmt.Errorf("failed to parse current date: %v", err)
	}

	// Parse last payment date
	lastPaymentDateParsed, err := time.Parse("02-01-2006", managerContract.LastPaymentDate)
	if err != nil {
		return 0, fmt.Errorf("failed to parse last payment date: %v", err)
	}

	// Calculate days since last payment
	daysSinceLastPayment := currentDateParsed.Sub(lastPaymentDateParsed).Hours() / 24

	// Calculate amount
	interval := float64(managerContract.Interval)
	ratePerInterval := float64(managerContract.RatePerInterval)
	amount := int(daysSinceLastPayment/interval) * int(ratePerInterval)

	// Update the last payment date for both manager and contractor
	// Calculate the accurate last payment date
	lastPaymentDateAdjusted := lastPaymentDateParsed.Add(-time.Duration(int(daysSinceLastPayment)%int(interval)) * 24 * time.Hour).Format("02-01-2006")

	// Update the last payment date for manager
	managerContract.LastPaymentDate = lastPaymentDateAdjusted
	managerAsset.Contracts[managerContractIndex] = managerContract

	// Update the last payment date for contractor
	contractorContract.LastPaymentDate = lastPaymentDateAdjusted
	contractorAsset.Contracts[contractorContractIndex] = contractorContract

	// Update manager's user asset in the world state
	managerAssetJSON, err := json.Marshal(managerAsset)
	if err != nil {
		return 0, err
	}
	if err := ctx.GetStub().PutState(manager, managerAssetJSON); err != nil {
		return 0, err
	}

	// Update contractor's user asset in the world state
	contractorAssetJSON, err := json.Marshal(contractorAsset)
	if err != nil {
		return 0, err
	}
	if err := ctx.GetStub().PutState(contractor, contractorAssetJSON); err != nil {
		return 0, err
	}

	return amount, nil
}
