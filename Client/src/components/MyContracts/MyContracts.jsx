import {Typography, Container} from '@mui/material'
import ContractCard from './ContractCard'
import axios from 'axios'
import { ContractsUrlBase } from '../../Util/apiUrls'

const contracts = [
    {
        manager: "Manager 1",
        contractor: "Contractor 1",
        duration: 30,
        natureOfWork: "Software Development",
        ratePerInterval: 100,
        rateCurrency: "USD",
        interval: 30
    },
    {
        manager: "Manager 2",
        contractor: "Contractor 2",
        duration: 60,
        natureOfWork: "Web Development",
        ratePerInterval: 15000,
        rateCurrency: "INR",
        interval: 30
    },
    {
        manager: "Manager 3",
        contractor: "Contractor 3",
        duration: 90,
        natureOfWork: "Mobile Development",
        ratePerInterval: 200,
        rateCurrency: "EUR",
        interval: 30
    }
]

export default function MyContracts() {

    if(!localStorage.getItem("username")){
        location.href = "/login"
    }

    url = ContractsUrlBase + localStorage.getItem("username")

    axios.get(url, async (response) => {
        contracts = response.data
    })

    return (
        <Container sx={{ mb: 7, mt: 5, minHeight: "100vh"}}>
            <div className="mb-8">
                <Typography variant="h1" align="center">My Contracts</Typography>
                <Typography variant="body1" align="center"> Here you can create and view your active contracts. </Typography>
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