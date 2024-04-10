import React, { useState } from 'react';
import axios from 'axios';
import { NewContractUrl } from '../../Util/apiUrls';
import { TextField, Button, Container, Typography } from '@mui/material';

export default function NewContract() {
    const [manager, setManager] = useState('');
    const [contractor, setContractor] = useState('');
    const [duration, setDuration] = useState('');
    const [interval, setInterval] = useState('');
    const [ratePerInterval, setRatePerInterval] = useState('');
    const [rateCurrency, setRateCurrency] = useState('');
    const [natureOfWork, setNatureOfWork] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(NewContractUrl, {
                manager,
                contractor,
                duration,
                interval,
                ratePerInterval,
                rateCurrency,
                natureOfWork,
            });

            console.log(response.data.message);
            // Handle success response
        } catch (error) {
            console.error('Error creating contract asset:', error);
            // Handle error response
        }
    };
    

    return (
        <Container sx={{ mb: 7, mt: 5, minHeight: "100vh"}}>
            <div className="mb-4">
                <Typography variant="h1" align="center">New Contract</Typography>
                <Typography variant="body1" align="center"> Here you can propose a new contract. </Typography>
            </div>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Manager Username"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    placeholder="manager"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Contractor Username"
                    value={contractor}
                    onChange={(e) => setContractor(e.target.value)}
                    placeholder="contractor"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Duration in Days"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="30"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Interval in Days"
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    placeholder="7"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Rate per Interval"
                    value={ratePerInterval}
                    onChange={(e) => setRatePerInterval(e.target.value)}
                    placeholder="200"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Rate Currency"
                    value={rateCurrency}
                    onChange={(e) => setRateCurrency(e.target.value)}
                    placeholder="USD"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Nature of Work"
                    value={natureOfWork}
                    onChange={(e) => setNatureOfWork(e.target.value)}
                    placeholder="SDE"
                    fullWidth
                    margin="normal"
                />
                
                <Button type="submit" variant="contained" color='success' style={{ display: 'block', margin: '0 auto' }}>Create Contract Asset</Button>
            </form>
        </Container>
    );
}