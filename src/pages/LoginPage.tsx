import "./global.css";
import {
    Alert,
    AlertColor,
    Box,
    Button,
    Card,
    Divider,
    LinearProgress,
    Snackbar,
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
import axios, {AxiosError} from "axios";
import {useNavigate, useNavigation} from "react-router-dom";
import {get} from "@github/webauthn-json";
import {createRequestFromJSON, createResponseToJSON} from "@github/webauthn-json/extended";
import {create as passkeyCreate} from "../webauthn/webauthn";

function LoginPanel() {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [msgType, setMsgType] = useState<AlertColor>('success')

    const [tabs, setTabs] = useState<'Passkey' | 'Password'>('Passkey')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const showAlert = (type: AlertColor, msg: string) => {
        setMsgType(type)
        setMessage(msg)
        setOpen(true)
    }

    const onPasskeyLogin = async (email: string, usePlatform: boolean) => {
        try {
            const req = await axios.post('/api/login/begin', {email})
            console.log(req)
            const response = await get(req.data)

            console.log(response)
            const attResult = await axios.post('/api/login/finish', response)
            console.log(attResult)
            showAlert('success', 'Login success')
            navigate('/user')
        } catch (e) {
            if (e instanceof AxiosError) {
                showAlert('error', e.response?.data || 'Login failed')
            }
            return null
        }
    }

    const onPasswordLogin = async (email: string, password: string) => {
        try {
            await axios.post('/api/login/plain', {email, password})
            showAlert('success', 'Login success')
            navigate('/user')
        } catch (e) {
            if (e instanceof AxiosError) {
                showAlert('error', e.response?.data || 'Login failed')
            }
        }
    }


    return (
        <TabContext value={tabs}>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={open}
                autoHideDuration={6000}
                onClose={() => setOpen(false)}
            >
                <Alert severity={msgType}>{message}</Alert>
            </Snackbar>
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
                    <Button variant="contained" onClick={() => onPasskeyLogin(email, false)}>
                        Via PasskeySync
                    </Button>
                    <Button variant="outlined" onClick={() => onPasskeyLogin(email, true)}>
                        Via Platform
                    </Button>
                </Stack>
            </TabPanel>
            <TabPanel value="Password">
                <Stack spacing={2}>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        value={password}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button variant="contained" onClick={() => onPasswordLogin(email, password)}>
                        Login
                    </Button>
                </Stack>
            </TabPanel>
        </TabContext>
    )
}

function RegisterPanel() {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [msgType, setMsgType] = useState<AlertColor>('success')

    const [tabs, setTabs] = useState<'Passkey' | 'Password'>('Passkey')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isPasswordValid, setIsPasswordValid] = useState(true)
    const [isConfirmValid, setIsConfirmValid] = useState(true)

    const showAlert = (type: AlertColor, msg: string) => {
        setMsgType(type)
        setMessage(msg)
        setOpen(true)
    }

    const onPasskeyRegister = async (email: string, username: string, usePlatform: boolean) => {
        try {
            const reqJson = await axios.post('/api/register/begin', {username, email})
            console.log(reqJson)
            const req = createRequestFromJSON(reqJson.data)
            console.log(req)
            const credential = usePlatform ?
                await navigator.credentials.create(req) as PublicKeyCredential :
                await passkeyCreate(req)

            console.log(credential)
            const response = createResponseToJSON(credential)
            console.log(response)
            const attResult = await axios.post('/api/register/finish', response)
            console.log(attResult)
            showAlert('success', 'Register success')
            navigate('/user')
        } catch (e) {
            if (e instanceof AxiosError) {
                showAlert('error', e.response?.data || 'Register failed')
            }
        }
    }

    const onPasswordRegister = async (email: string, username: string, password: string) => {
        try {
            await axios.post('/api/register/plain', {email, username, password})
            showAlert('success', 'Register success')
            navigate('/user')
        } catch (e) {
            if (e instanceof AxiosError) {
                showAlert('error', e.response?.data || 'Register failed')
            }
        }
    }

    return (
        <TabContext value={tabs}>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={open}
                autoHideDuration={6000}
                onClose={() => setOpen(false)}
            >
                <Alert severity={msgType}>{message}</Alert>
            </Snackbar>
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
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="User Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button variant="contained" onClick={() => onPasskeyRegister(email, username, false)}>
                        Via PasskeySync
                    </Button>
                    <Button variant="outlined" onClick={() => onPasskeyRegister(email, username, true)}>
                        Via Platform
                    </Button>
                </Stack>
            </TabPanel>
            <TabPanel value="Password">
                <Stack spacing={2}>
                    <TextField
                        label="Email"
                        type="email"
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
                        error={!isPasswordValid}
                        helperText={isPasswordValid ? '' : 'Password must be at least 8 characters'}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setIsPasswordValid(e.target.value.length >= 8)
                        }}
                    />
                    <TextField
                        label="Confirm Password"
                        value={confirmPassword}
                        type="password"
                        error={!isConfirmValid}
                        helperText={isConfirmValid ? '' : 'Password not match'}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            setIsConfirmValid(password === e.target.value)
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => onPasswordRegister(email, username, password)}
                        disabled={password.length === 0 || confirmPassword.length === 0 || !isPasswordValid || !isConfirmValid}
                    >
                        Register
                    </Button>
                </Stack>
            </TabPanel>
        </TabContext>
    )
}

function LoginPage() {
    const navigation = useNavigation()
    const [isLogin, setIsLogin] = useState(true)

    return (
        <Box className="GradientBackground" width="100%" height="100vh" display="flex">
            {navigation.state === "loading" && <LinearProgress sx={{width: "100%", position: "absolute"}}/>}
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