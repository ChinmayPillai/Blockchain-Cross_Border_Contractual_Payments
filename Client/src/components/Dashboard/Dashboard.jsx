import { Typography, Container } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { dashboardUrlBase, bankAccountUrlBase } from "../../Util/apiUrls";

export default function Dashboard() {
    const user = localStorage.getItem("username");

    if(!user){
        location.href = "/login"
    }

    const [userAsset, setUserAsset] = useState(null);
    const [funds, setFunds] = useState(0);

    const userAsseturl = dashboardUrlBase + user;

    useEffect(() => {
        axios.get(userAsseturl)
        .then((response) => {
            setUserAsset(response.data)
            axios.get(bankAccountUrlBase + response.data.bankAccountNo, {
                bank: response.data.bank
            })
            .then((response) => {
                setFunds(response.data.balance)
            })
            .catch((error) => console.error(error));
        })
        .catch((error) => console.error(error));

    }, []);



    return (
        <Container sx={{ mb: 7, mt: 5, minHeight: "100vh" }}>
            <Typography variant="h1" align="center">
                Welcome {user}!
            </Typography>

            {userAsset && (
                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                    <Typography variant="h4" style={{ marginBottom: "1rem" }}>
                        Username: <strong>{userAsset.username}</strong>
                    </Typography>
                    <Typography variant="h4" style={{ marginBottom: "1rem" }}>
                        Name: <strong>{userAsset.name}</strong>
                    </Typography>
                    <Typography variant="h4" style={{ marginBottom: "1rem" }}>
                        Funds: <strong>{funds}</strong>
                    </Typography>
                    <Typography variant="h4" style={{ marginBottom: "1rem" }}>
                        Bank Account No: <strong>{userAsset.bankAccountNo}</strong>
                    </Typography>
                    <Typography variant="h4" style={{ marginBottom: "1rem" }}>
                        Central Bank: <strong>{userAsset.centralBankID}</strong>
                    </Typography>
                    <Typography variant="h4" style={{ marginBottom: "1rem" }}>
                        Company: <strong>{userAsset.company}</strong>
                    </Typography>
                </div>
            )}
        </Container>
    );
}