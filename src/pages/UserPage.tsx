import {useLoaderData, useNavigate, useNavigation} from "react-router-dom";
import {CredentialInfo, UserInfo} from "../api/api_user";
import {
    Alert,
    AlertColor,
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    LinearProgress,
    List,
    ListItemText,
    Snackbar,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import "./global.css"
import Stack from "@mui/material/Stack";
import LogoutIcon from "@mui/icons-material/Logout";
import React, {useEffect, useState} from "react";
import axios, {AxiosError} from "axios";
import {ModalProps} from "@mui/material/Modal";

interface PasswordDialogProps {
    showAlert: (type: AlertColor, msg: string) => void
    onConfirm: () => void
    open: ModalProps['open']
    onClose: () => void
}


function EnablePasswordDialog(prop: PasswordDialogProps) {
    const [password, setPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")
    const [isPasswordValid, setIsPasswordValid] = React.useState(true)
    const [isConfirmValid, setIsConfirmValid] = React.useState(true)

    const enablePassword = async (password: string) => {
        try {
            await axios.post("/api/user/enable_password", {
                enable: true,
                password
            })
            prop.showAlert("success", "Successfully enabled password")
            setPassword("")
            setConfirmPassword("")
            setIsPasswordValid(true)
            setIsConfirmValid(true)
            prop.onConfirm()
        } catch (e) {
            if (e instanceof AxiosError) {
                prop.showAlert("error", e.response?.data || "Enable password failed")
            } else {
                console.log(e)
            }
        }
    }

    return (
        <Dialog
            fullWidth
            open={prop.open}
            onClose={prop.onClose}
        >
            <DialogTitle>Enable Password</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <DialogContentText>Enter your new password for login</DialogContentText>
                    <TextField
                        label="Password"
                        value={password}
                        type="password"
                        error={!isPasswordValid}
                        helperText={isPasswordValid ? "" : "Password must be at least 8 characters"}
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
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={prop.onClose}>Cancel</Button>
                <Button
                    disabled={password.length == 0 || !isPasswordValid || !isConfirmValid}
                    onClick={() => enablePassword(password)}
                >Confirm</Button>
            </DialogActions>
        </Dialog>
    )
}

function DisablePasswordDialog(prop: PasswordDialogProps) {
    const [password, setPassword] = React.useState("")
    const disablePassword = async (password: string) => {
        try {
            await axios.post("/api/user/enable_password", {
                enable: false,
                password
            })
            prop.showAlert("success", "Successfully disabled password")
            setPassword("")
            prop.onConfirm()
        } catch (e) {
            if (e instanceof AxiosError) {
                prop.showAlert("error", e.response?.data || "Disable password failed")
            } else {
                console.log(e)
            }
        }
    }
    return (
        <Dialog
            fullWidth
            open={prop.open}
            onClose={prop.onClose}
        >
            <DialogTitle>"Disable Password"</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <DialogContentText>Confirm your current password to disable password login</DialogContentText>
                    <TextField
                        content={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                        type="password"
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={prop.onClose}>Cancel</Button>
                <Button
                    disabled={password.length == 0}
                    onClick={() => disablePassword(password)}
                >Confirm</Button>
            </DialogActions>
        </Dialog>
    )
}


function UserPage() {
    const navigate = useNavigate()
    const navigation = useNavigation()
    const user = useLoaderData() as UserInfo

    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [msgType, setMsgType] = useState<AlertColor>('success')
    const showAlert = (type: AlertColor, msg: string) => {
        setMsgType(type)
        setMessage(msg)
        setOpen(true)
    }

    const [credentials, setCredentials] = React.useState<CredentialInfo[]>([])
    const [usePassword, setUsePassword] = React.useState(false)
    useEffect(() => {
        (async () => {
            const res = await axios.get("/api/user/credentials")
            setCredentials(res.data)
            const usePassword = await axios.get("/api/user/enable_password")
            setUsePassword(usePassword.data)
        })()
    }, [])

    const [openEnablePasswordDialog, setOpenEnablePasswordDialog] = React.useState(false)
    const [openDisablePasswordDialog, setOpenDisablePasswordDialog] = React.useState(false)
    return (
        <>
            <Box className="GradientBackground" width="100%" height="105vh" position="fixed" zIndex={-1}/>
            {navigation.state === "loading" && <LinearProgress sx={{width: "100%", position: "absolute"}}/>}
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={open}
                autoHideDuration={6000}
                onClose={() => setOpen(false)}
            >
                <Alert severity={msgType}>{message}</Alert>
            </Snackbar>
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
                        <Card sx={{p: 3, wordBreak: "break-all"}}>
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
                                <ListItemText primary="User Handle" secondary={user.userHandle}/>
                            </List>
                        </Card>
                        <Card sx={{p: 3, minHeight: 50}}>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="h6" gutterBottom>
                                        Password
                                    </Typography>
                                    <Switch
                                        checked={usePassword}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setOpenEnablePasswordDialog(true)
                                            } else {
                                                setOpenDisablePasswordDialog(true)
                                            }
                                        }}
                                    />
                                    <EnablePasswordDialog
                                        showAlert={showAlert}
                                        open={openEnablePasswordDialog}
                                        onClose={() => setOpenEnablePasswordDialog(false)}
                                        onConfirm={() => {
                                            setOpenEnablePasswordDialog(false)
                                            setUsePassword(true)
                                        }}
                                    />
                                    <DisablePasswordDialog
                                        showAlert={showAlert}
                                        open={openDisablePasswordDialog}
                                        onClose={() => setOpenDisablePasswordDialog(false)}
                                        onConfirm={() => {
                                            setOpenDisablePasswordDialog(false)
                                            setUsePassword(false)
                                        }}
                                    />
                                </Stack>
                                <Divider/>
                                <Typography variant="caption">
                                    {usePassword ?
                                        "You are using a password to login, which may led to vulnerability to your account" :
                                        "Password login is DISABLED for your account"
                                    }
                                </Typography>
                                {usePassword && <Button variant="outlined">Modify Password</Button>}
                            </Stack>
                        </Card>
                    </Stack>
                </Grid>
                <Grid xs={8}>
                    <Card sx={{width: "100%", p: 3}}>
                        <Typography variant="h5">
                            Total {credentials.length} Credential{credentials.length > 1 ? "s" : ""}
                        </Typography>
                        <Stack spacing={3} sx={{marginTop: 3}}>
                            {credentials.map((credential) => (
                                <React.Fragment key={credential.credentialId}>
                                    <Card sx={{p: 3, wordBreak: "break-all"}} variant="outlined">
                                        <List disablePadding>
                                            <ListItemText primary="Credential ID" secondary={credential.credentialId}/>
                                            <Divider/>
                                            <ListItemText primary="Public Key" secondary={credential.publicKeyCose}/>
                                            <Divider/>
                                            <ListItemText primary="Signature Count"
                                                          secondary={credential.signatureCount}/>
                                        </List>
                                    </Card>
                                </React.Fragment>
                            ))}
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
}

export default UserPage;