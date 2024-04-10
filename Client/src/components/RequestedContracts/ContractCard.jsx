import { Typography, Button, Grid } from "@mui/material";
import { acceptByContractorURL } from "../../Util/apiUrls";
import axios from 'axios'

export default function ContractCard({ contract }) {
    function handleAccept() {
        axios.post(acceptByContractorURL, {
            contractId: contract.contractId,
            contractor: contract.contractor,
            manager: contract.manager,
            contractorAccount: contract.contractorAccount,
            paymentCurrency: contract.paymentCurrency
        })
        .then(response => {
            alert('Accepted')
            window.location.reload();
        })
        .catch(error => {
            alert('Error')
        });
    }

    function handleReject() {
        console.log("Rejected");
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
                        {contract.natureOfWork}
                    </Typography>
                </Grid>
                <Grid item md={2} lg={2} xl={2} textAlign="end">
                    <Typography variant="subtitle1" color="textPrimary" fontFamily="Arial">
                        <strong>{contract.ratePerInterval} {contract.rateCurrency} / {contract.interval} days</strong>
                    </Typography>
                </Grid>
                <Grid item md={4} lg={4} xl={4} textAlign="end">
                    <Button variant="contained" color="success" onClick={handleAccept}>
                        Accept
                    </Button>
                    <Button variant="contained" color="error" onClick={handleReject} style={{ marginLeft: '8px' }}>
                        Reject
                    </Button>
                </Grid>
            </Grid>

            <hr className="my-4" />
        </>
    );
}