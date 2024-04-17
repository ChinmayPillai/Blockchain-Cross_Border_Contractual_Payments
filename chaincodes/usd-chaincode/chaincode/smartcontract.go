package chaincode

import (
	"fmt"
	"strconv"
	"strings"

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


func (s *SmartContract) InvokeForex(ctx contractapi.TransactionContextInterface, currencyFrom string, currencyTo string, amount int) (int, error) {
    
    fcn := "Forex"

    args := [][]byte{[]byte(fcn), []byte(currencyFrom), []byte(currencyTo), []byte(fmt.Sprintf("%d", amount))}

    response := ctx.GetStub().InvokeChaincode("forex", args, "")

    if response.GetStatus() != 200 {
        return 0, fmt.Errorf("forex chaincode returned %d. %s", response.GetStatus(), response.GetMessage())
    }

    payload, err := strconv.Atoi(string(response.GetPayload()))
    if err != nil {
        return 0, err
    }

    return payload, nil
}

func (s *SmartContract) Receive(ctx contractapi.TransactionContextInterface, bank string, bankAccount string, amount int) error {
    
    fcn := "AddFunds"
    bankName := strings.ToLower(bank)

    args := [][]byte{[]byte(fcn), []byte(bankAccount), []byte(fmt.Sprintf("%d", amount))}

    response := ctx.GetStub().InvokeChaincode(bankName, args, "")

    if response.GetStatus() != 200 {
        return fmt.Errorf("usd cbnk chaincode receive to add funds invoke returned %d. %s", response.GetStatus(), response.GetMessage())
    }

    return nil
    
}

func (s *SmartContract) PayCentralBnk(ctx contractapi.TransactionContextInterface, currencyFrom string, currencyTo string, amount int, bank string, bankAccount string) error {
    
    toSend, err := s.InvokeForex(ctx, currencyFrom, currencyTo, amount)
    if err != nil {
        return err
    }

    internationalTransferFees := 0.02 // 2%
    feesMultiplier := 1.0 - internationalTransferFees

    fcn := "Receive"
    centralBnk := strings.ToLower(currencyTo)
    args := [][]byte{[]byte(fcn), []byte(bank), []byte(bankAccount), []byte(fmt.Sprintf("%d", int(feesMultiplier * float64(toSend))))}

    response := ctx.GetStub().InvokeChaincode(centralBnk, args, "")

    if response.GetStatus() != 200 {
        return fmt.Errorf("cbnk chaincode to recieve invoke returned %d. %s", response.GetStatus(), response.GetMessage())
    }

    return nil

}