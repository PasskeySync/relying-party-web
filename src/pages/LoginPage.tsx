import "./LoginPage.css";
import {
    Alert,
    AlertColor,
    Box,
    Button,
    Card,
    Divider,
    Snackbar,
    Switch,
    Tab,
    TextField,
    Typography
} from "@mui/material";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Stack from "@mui/material/Stack";
import TabContext from "@mui/lab/TabContext";
import React, {useState} from "react";
import {blueGrey} from "@mui/material/colors";
import {Route} from "react-router-dom";

function LoginPage() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('')
    const [msgType, setMsgType] = useState<AlertColor>('success')
    const [isLogin, setIsLogin] = useState(true)

    const showAlert = (type: AlertColor, msg: string) => {
        setMsgType(type)
        setMessage(msg)
        setOpen(true)
    }


    const LoginPanel = () => {
        const [tabs, setTabs] = useState<'Passkey' | 'Password'>('Passkey')
        const [email, setEmail] = useState('')
        const [password, setPassword] = useState('')

        const onLogin = async () => {

        }

        return (
            <TabContext value={tabs}>
                <Box sx={{backgroundColor: blueGrey[50]}}>
                    <TabList
                        onChange={(_, nv) => setTabs(nv)}
                        variant="fullWidth"
                    >
                        <Tab label="Passkey" value="Passkey"/>
                        <Tab label="Password" value="Password"/>
                    </TabList>
                </Box>
                <TabPanel value="Passkey">
                    <Stack spacing={2}>
                        <TextField
                            label="Email"
                            value={email}
                            type="search"
                            helperText="Leaving bank for credential discovery"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button variant="contained" onClick={onLogin}>
                            Via PasskeySync
                        </Button>
                        <Button variant="outlined" onClick={onLogin}>
                            Via Platform
                        </Button>
                    </Stack>
                </TabPanel>
                <TabPanel value="Password">
                    <Stack spacing={2}>
                        <TextField
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            label="Password"
                            value={password}
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button variant="contained" onClick={onLogin}>
                            Login
                        </Button>
                    </Stack>
                </TabPanel>
            </TabContext>
        )
    }

    const RegisterPanel = () => {
        const [tabs, setTabs] = useState<'Passkey' | 'Password'>('Passkey')
        const [email, setEmail] = useState('')
        const [username, setUsername] = useState('')
        const [password, setPassword] = useState('')
        const [confirmPassword, setConfirmPassword] = useState('')
        const onLogin = async () => {

        }

        return (
            <TabContext value={tabs}>
                <Box sx={{backgroundColor: blueGrey[50]}}>
                    <TabList
                        onChange={(_, nv) => setTabs(nv)}
                        variant="fullWidth"
                    >
                        <Tab label="Passkey" value="Passkey"/>
                        <Tab label="Password" value="Password"/>
                    </TabList>
                </Box>
                <TabPanel value="Passkey">
                    <Stack spacing={2}>
                        <TextField
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            label="User Name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Button variant="contained" onClick={onLogin}>
                            Via PasskeySync
                        </Button>
                        <Button variant="outlined" onClick={onLogin}>
                            Via Platform
                        </Button>
                    </Stack>
                </TabPanel>
                <TabPanel value="Password">
                    <Stack spacing={2}>
                        <TextField
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            label="User Name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            label="Password"
                            value={password}
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <TextField
                            label="Confirm Password"
                            value={confirmPassword}
                            type="password"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button variant="contained" onClick={onLogin}>
                            Register
                        </Button>
                    </Stack>
                </TabPanel>
            </TabContext>
        )
    };

    return (
        <Box className="LoginPage">
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={open}
                autoHideDuration={6000}
                onClose={() => setOpen(false)}
            >
                <Alert severity={ msgType }>{ message }</Alert>
            </Snackbar>
            <Card sx={{ margin: "auto 50px auto auto", minWidth: 400, minHeight: 400 }}>
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5" component="div">
                            { isLogin ? "LOGIN" : "REGISTER" }
                        </Typography>
                        <Button onClick={() => setIsLogin(!isLogin)}>
                            {"To " + (isLogin ? "Register" : "Login") }
                        </Button>
                    </Stack>
                </Box>
                <Divider />
                { isLogin ? <LoginPanel/> : <RegisterPanel/> }
            </Card>
        </Box>
    );
}

export default LoginPage;