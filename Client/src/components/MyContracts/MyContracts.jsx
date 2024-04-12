import {Typography, Container, Button} from '@mui/material'
import ContractCard from './ContractCard'
import axios from 'axios'
import { ContractsUrlBase } from '../../Util/apiUrls'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'


export default function MyContracts() {

    const [contracts, setContracts] = useState([])

    if(!localStorage.getItem("username")){
        location.href = "/login"
    }

    const url = ContractsUrlBase + localStorage.getItem("username")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(url);
                console.log(response.data);
                setContracts(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    return (
        <Container sx={{ mb: 7, mt: 5, minHeight: "100vh"}}>
            <div className="mb-8">
                <Typography variant="h1" align="center">My Contracts</Typography>
                <Typography variant="body1" align="center"> Here you can create and view your active contracts. </Typography>
            </div>
            <Link to="/newcontract" className="mb-4">
                <Button variant="contained" color="success" fullWidth>+ Create New Contract</Button>
            </Link>
            <hr className="mb-4" />
            <div>
                {contracts.map((contract, index) => (
                    <ContractCard key={index} contract={contract} />
                ))}
            </div>
        </Container>
    )
}