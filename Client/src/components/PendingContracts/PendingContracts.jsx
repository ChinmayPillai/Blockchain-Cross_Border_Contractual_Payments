import {Typography, Container} from '@mui/material'
import ContractCard from './ContractCard'
import axios from 'axios'
import { PendingContractsUrlBase } from '../../Util/apiUrls'
import { useEffect } from 'react'

let contracts = []

export default function PendingContracts() {

    if(!localStorage.getItem("username")){
        location.href = "/login"
    }

    const url = PendingContractsUrlBase + localStorage.getItem("username")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(url);
                console.log(response.data);
                contracts = response.data;
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    
    return (
        <Container sx={{ mb: 7, mt: 5, minHeight: "100vh"}}>
            <div className="mb-8" >
                <Typography variant="h1" align="center">Pending Contracts</Typography>
                <Typography variant="body1" align="center"> Here you can view and manage your pending contracts. </Typography>
            </div>
            <hr className="mb-4" />
            <div>
                {contracts.map((contract, index) => (
                    <ContractCard key={index} contract={contract} />
                ))}
            </div>
        </Container>
    )
}