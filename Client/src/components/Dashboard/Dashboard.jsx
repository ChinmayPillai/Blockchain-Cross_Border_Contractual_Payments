import { Typography } from "@mui/material";

export default function Dashboard() {
    const user = localStorage.getItem("user");
    return (
        <div>
            <Typography variant="h1" align="center">Welcome {user}!</Typography>
        </div>
    )
}