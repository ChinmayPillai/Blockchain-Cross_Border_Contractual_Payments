import { Typography, Button, Grid, TextField, MenuItem } from "@mui/material";
import { acceptByContractorURL, removeRequestedURL } from "../../Util/apiUrls";
import axios from 'axios'
import { useState } from "react";

export default function ContractCard({ contract }) {

    const [accepted, setAccepted] = useState(false);
    const [contractorAccount, setContractorAccount] = useState('');
    const [paymentCurrency, setPaymentCurrency] = useState('');

    function handleAccept() {
        axios.post(acceptByContractorURL, {
            contractId: contract.contractId,
            contractor: contract.contractor,
            manager: contract.manager,
            contractorAccount: contractorAccount,
            paymentCurrency: paymentCurrency
        })
        .then((response) => {
            alert('Accepted');
            window.location.reload();
        })
        .catch(error => {
            alert('Error')
        });
    }

    function handleReject() {
        // console.log("Rejected");
        axios.put(removeRequestedURL,{
            contractId: contract.contractId,
            contractor: contract.contractor
        })
        .then(response => {
            alert('Contract Removed from Requested List')
            window.location.reload();
        })
        .catch(error => {
            alert('Error')
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
                </Grid>
                <Grid item md={3} lg={3} xl={3}>
                    <Typography variant="subtitle1" color="textPrimary" fontFamily="Arial">
                        <strong><em>{contract.duration} days</em></strong>
                    </Typography>
                    <Typography variant="subtitle1" color="textPrimary" fontFamily="Arial">
                        From: {contract.startDate}
                    </Typography>
                </Grid>
                <Grid item md={2} lg={2} xl={2} textAlign="end">
                    <Typography variant="subtitle1" color="textPrimary" fontFamily="Arial">
                        <strong>{contract.ratePerInterval} {contract.rateCurrency} / {contract.interval} days</strong>
                    </Typography>
                    <Typography variant="subtitle1" color="textPrimary" fontFamily="Arial">
                        {contract.natureOfWork}
                    </Typography>
                </Grid>
                <Grid item md={4} lg={4} xl={4} textAlign="end">
                    <Button variant="contained" color="success" onClick={() => setAccepted(true)}>
                        Accept
                    </Button>
                    <Button variant="contained" color="error" onClick={handleReject} style={{ marginLeft: '8px' }}>
                        Reject
                    </Button>
                </Grid>
            </Grid>

            {accepted && (
                <form onSubmit={handleAccept} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <TextField
                        label="Contractor Account"
                        value={contractorAccount}
                        onChange={(e) => setContractorAccount(e.target.value)}
                        required
                        sx={{ width: '20%', marginTop: '30px' }}
                    />
                    <br />
                    <TextField
                        select
                        label="Payment Currency"
                        value={paymentCurrency}
                        onChange={(e) => setPaymentCurrency(e.target.value)}
                        required
                        sx={{ width: '20%' }}
                    >
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="INR">INR</MenuItem>
                    </TextField>
                    <br />
                    <Button type="submit" variant="contained" color="success">
                        Confirm Accept
                    </Button>
                </form>
            )}

            <hr className="my-4" />
        </>
    );
}