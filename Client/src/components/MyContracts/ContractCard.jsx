import { Typography, Button, Grid, TextField } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { payUrl, revokeURL } from "../../Util/apiUrls";

export default function ContractCard({ contract }) {

    const [redeem, setRedeem] = useState(false);
    const [revoke, setRevoke] = useState(false);
    const [currentDate, setCurrentDate] = useState('');

    function handleRedeem(e) {

        e.preventDefault();

        axios.post(payUrl, {
            currencyFrom: contract.rateCurrency,
            currencyTo: contract.paymentCurrency,
            bankFrom: contract.managerBank,
            bankAccountFrom: contract.managerBankAccountNo, 
            bankTo: contract.contractorBank, 
            bankAccountTo: contract.contractorAccount,
            currentDate: currentDate,
            contractor: contract.contractor,
            manager: contract.manager,
            contractId: contract.contractId,
        }).then(response => {
            console.log(response.data.message);
            alert('Payment Redeemed');
            location.href = '/';
        })
        .catch(error => {
            
            console.error('Error redeeming payment:', error);
            if (error.response && error.response.status === 400) {
                alert('Payment not due or contract ended');
            } else {
                alert('Error');
            }
        });
    }

    function handleReject(e) {

        e.preventDefault();

        console.log("Rejected");
        axios.put(revokeURL, {
            contractId: contract.contractId,
            manager: contract.manager,
            contractor: contract.contractor,
            bankFrom: contract.managerBank,
            bankTo: contract.contractorBank,
            bankAccountFrom: contract.managerBankAccountNo,
            bankAccountTo: contract.contractorAccount,
            currencyFrom: contract.rateCurrency,
            currencyTo: contract.paymentCurrency,
            currentDate: currentDate,
        })
        .then(response => {
            console.log(response.data.message);
            alert('Contract Revoked');
            location.href = '/';
        })
        .catch(error => {
            console.error('Error revoking contract:', error);
            alert('Error');
        });
    }

    return (
        <>
            <Grid container spacing={2} alignItems="center">
                <Grid item md={3} lg={3} xl={3}>
                    <Typography variant="subtitle1" color="textPrimary" fontFamily="Arial">
                        <em>Manager:</em> <strong>{contract.manager}</strong>
                    </Typography>
                    <Typography variant="subtitle1" color="textPrimary" fontFamily="Arial">
                        <em>Contractor:</em> <strong>{contract.contractor}</strong>
                    </Typography>
                    <Typography variant="subtitle1" color="textPrimary" fontFamily="Arial">
                        <strong>{contract.natureOfWork}</strong>
                    </Typography>
                </Grid>
                <Grid item md={3} lg={3} xl={3}>
                    <Typography variant="subtitle1" color="textPrimary" fontFamily="Arial">
                        <strong><em>{contract.duration} days</em></strong>
                    </Typography>
                    <Typography variant="subtitle1" color="textPrimary" fontFamily="Arial">
                        <em>From:</em> {contract.startDate}
                    </Typography>
                    <Typography variant="subtitle1" color="textPrimary" fontFamily="Arial">
                        <em>Last Payment Date:</em> {contract.lastPaymentDate}
                    </Typography>
                </Grid>
                <Grid item md={2} lg={2} xl={2} textAlign="end">
                    <Typography variant="http://localhost:5173/contractssubtitle1" color="textPrimary" fontFamily="Arial">
                        <strong>{contract.ratePerInterval} {contract.rateCurrency} / {contract.interval} days</strong>
                    </Typography>
                </Grid>
                <Grid item md={4} lg={4} xl={4} textAlign="end">
                    {localStorage.getItem("username")!=contract.manager && (
                        <Button variant="contained" color="success" onClick={() => setRedeem(true)}>
                            Redeem Payment
                        </Button>
                    )}
                    <Button variant="contained" color="error" onClick={() => setRevoke(true)} style={{ marginLeft: '8px' }}>
                        Revoke Contract
                    </Button>
                </Grid>
            </Grid>

            {redeem && (
                <form onSubmit={handleRedeem} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <TextField
                        label="Current Date"
                        placeholder="DD-MM-YYYY"
                        value={currentDate}
                        onChange={(e) => setCurrentDate(e.target.value)}
                        required
                        style={{ marginTop: '30px' }}
                    />
                    <Button type="submit" variant="contained" color="success">
                        Redeem Payment
                    </Button>
                </form>
            )}

            {revoke && (
                <form onSubmit={handleReject} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <TextField
                        label="Current Date"
                        placeholder="DD-MM-YYYY"
                        value={currentDate}
                        onChange={(e) => setCurrentDate(e.target.value)}
                        required
                        style={{ marginTop: '30px' }}
                    />
                    <Button type="submit" variant="contained" color="error">
                        Revoke
                    </Button>
                </form>
            )}

            <hr className="my-4" />
        </>
    );
}