import {useLoaderData, useNavigate, useNavigation} from "react-router-dom";
import {UserInfo} from "../api/api_user";
import {Box, Button, Card, Divider, LinearProgress, List, ListItemText, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import "./global.css"
import Stack from "@mui/material/Stack";
import LogoutIcon from "@mui/icons-material/Logout";
import React from "react";
import axios from "axios";

function UserPage() {
    const navigate = useNavigate()
    const navigation = useNavigation()
    const user = useLoaderData() as UserInfo

    return (
        <Box className="GradientBackground">
            {navigation.state === "loading" && <LinearProgress sx={{width: "100%", position: "absolute"}}/>}
            <Grid sx={{p: 5, width: "100% "}} container spacing={3}>
                <Grid xs={4}>
                    <Stack spacing={3}>
                        <Button
                            variant="contained"
                            endIcon={<LogoutIcon/>}
                            onClick={async () => {
                                await axios.post("/api/logout")
                                navigate("/login")
                            }}
                        >
                            Logout
                        </Button>
                        <Card sx={{minWidth: 100, minHeight: 100, p: 3}}>
                            <Typography variant="body1">
                                Welcome,
                            </Typography>
                            <Typography variant="h5">
                                {user.username}
                            </Typography>

                            <List>
                                <Divider/>
                                <ListItemText primary="Email" secondary={user.email}/>
                                <Divider/>
                                <ListItemText primary="ID" secondary={user.id}/>
                                <Divider/>
                                <ListItemText
                                    sx={{wordBreak: "break-all"}}
                                    primary="UserHandle"
                                    secondary={user.userHandle}
                                />
                            </List>
                        </Card>
                    </Stack>
                </Grid>
                <Grid xs={8}>
                    <Card sx={{minHeight: 100, width: "100%"}}>

                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default UserPage;