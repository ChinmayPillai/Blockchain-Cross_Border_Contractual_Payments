package chaincode

import (
    "encoding/json"
    "fmt"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
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
    BankAccountNo string          `json:"bankAccountNo"`
    CentralBankID string          `json:"centralBankID"`
}

// BankAccountAsset represents a bank account asset
type BankAccountAsset struct {
    AccountNo   string `json:"accountNo"`   // Unique
    CentralBank string `json:"centralBank"`
    Funds       int    `json:"funds"`
    Owner       string `json:"owner"`
}

// ContractAsset represents a contract asset
type ContractAsset struct {
    Manager           string `json:"manager"`
    Contractor        string `json:"contractor"`
    Duration          string `json:"duration"`
    Interval          string `json:"interval"`
    RatePerInterval   string `json:"ratePerInterval"`
    NatureOfWork      string `json:"natureOfWork"`
    ContractorAccount string `json:"contractorAccount"`
    PaymentCurrency   string `json:"paymentCurrency"`
}

// InitLedger initializes the ledger with sample assets
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
    // Initialize any necessary data here
    return nil
}

// CreateUserAsset creates a new user asset
func (s *SmartContract) CreateUserAsset(ctx contractapi.TransactionContextInterface, username string, bankAccountNo string, centralBankID string) error {
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
        BankAccountNo: bankAccountNo,
        CentralBankID: centralBankID,
    }

    userAssetJSON, err := json.Marshal(userAsset)
    if err != nil {
        return err
    }

    return ctx.GetStub().PutState(username, userAssetJSON)
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

// CreateContractAsset creates a new contract asset and adds it to the user's asset
func (s *SmartContract) CreateContractAsset(ctx contractapi.TransactionContextInterface, username string, manager string, contractor string, duration string, interval string, ratePerInterval string, natureOfWork string, list string) error {
    userAsset, err := s.GetUserAsset(ctx, username)
    if err != nil {
        return err
    }

    // Create the contract asset
    contract := ContractAsset{
        Manager:           manager,
        Contractor:        contractor,
        Duration:          duration,
        Interval:          interval,
        RatePerInterval:   ratePerInterval,
        NatureOfWork:      natureOfWork,
        ContractorAccount: "",
        PaymentCurrency:   "",
    }

    // Add the contract to the appropriate list
    //switch list {
    //case "Requests":
    //    userAsset.Requests = append(userAsset.Requests, contract)
    //case "Pending":
    //   userAsset.Pending = append(userAsset.Pending, contract)
    //default:
    //    return fmt.Errorf("unsupported list: %s", list)
    //}
    userAsset.Requests = append(userAsset.Requests, contract)

    // Marshal the updated user asset
    userAssetJSON, err := json.Marshal(userAsset)
    if err != nil {
        return err
    }

    // Put the updated user asset back to the world state
    return ctx.GetStub().PutState(username, userAssetJSON)
}

// AcceptByContractor fills ContractorAccount and PaymentCurrency in the previous contract,
// removes it from the Requests array of contractor,
// and appends it to the Pending array of manager
func (s *SmartContract) AcceptByContractor(ctx contractapi.TransactionContextInterface, contractor string, manager string, contractorAccount string, paymentCurrency string) error {
    // Get contractor's user asset
    contractorAsset, err := s.GetUserAsset(ctx, contractor)
    if err != nil {
        return err
    }

    // Find the contract in the Requests array of the contractor
    var contractIndex int
    var found bool
    for i, contract := range contractorAsset.Requests {
        if contract.Contractor == contractor && contract.Manager == manager {
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
func (s *SmartContract) AcceptByManager(ctx contractapi.TransactionContextInterface, manager string, contractor string) error {
    // Get manager's user asset
    managerAsset, err := s.GetUserAsset(ctx, manager)
    if err != nil {
        return err
    }

    // Find the contract in the Pending array of manager
    var contractIndex int
    var found bool
    for i, contract := range managerAsset.Pending {
        if contract.Manager == manager && contract.Contractor == contractor {
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

// BankAccountAssetExists checks if a bank account asset exists in the world state
func (s *SmartContract) BankAccountAssetExists(ctx contractapi.TransactionContextInterface, accountNo string) (bool, error) {
    bankAccountAssetJSON, err := ctx.GetStub().GetState(accountNo)
    if err != nil {
        return false, fmt.Errorf("failed to read bank account asset from world state: %v", err)
    }

    return bankAccountAssetJSON != nil, nil
}
