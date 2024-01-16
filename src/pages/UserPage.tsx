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
    Popover,
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
import PopupState, {anchorRef, bindPopover, bindTrigger} from "material-ui-popup-state";
import {createRequestFromJSON, createResponseToJSON} from "@github/webauthn-json/extended";
import {create as passkeyCreate} from "../webauthn/webauthn";
import {WebAuthnError} from "../webauthn/interfaces";

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
            prop.onConfirm()
        } catch (e) {
            if (e instanceof AxiosError) {
                prop.showAlert("error", e.response?.data || "Enable password failed")
            } else {
                console.log(e)
            }
        }
    }

    useEffect(() => {
        if (!prop.open) {
            setPassword("")
            setConfirmPassword("")
            setIsPasswordValid(true)
            setIsConfirmValid(true)
        }
    }, [prop.open])

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
                        helperText={isConfirmValid ? "" : "Password not match"}
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
                    disabled={password.length === 0 || confirmPassword.length === 0 || !isPasswordValid || !isConfirmValid}
                    onClick={() => enablePassword(password)}
                >Confirm</Button>
            </DialogActions>
        </Dialog>
    )
}

function DisablePasswordDialog(prop: PasswordDialogProps) {
    const [password, setPassword] = React.useState("")
    useEffect(() => {
        if (!prop.open) {
            setPassword("")
        }
    }, [prop.open])
    const disablePassword = async (password: string) => {
        try {
            await axios.post("/api/user/enable_password", {
                enable: false,
                password
            })
            prop.showAlert("success", "Successfully disabled password")
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
                    disabled={password.length === 0}
                    onClick={() => disablePassword(password)}
                >Confirm</Button>
            </DialogActions>
        </Dialog>
    )
}

function ResetPasswordDialog(prop: PasswordDialogProps) {
    const [oldPassword, setOldPassword] = React.useState("")
    const [newPassword, setNewPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")
    const [isNewPasswordValid, setIsNewPasswordValid] = React.useState(true)
    const [isConfirmValid, setIsConfirmValid] = React.useState(true)

    const changePassword = async (oldPassword: string, newPassword: string) => {
        try {
            await axios.post("/api/user/reset_password", {
                oldPassword,
                newPassword
            })
            prop.showAlert("success", "Successfully reset password")
            prop.onConfirm()
        } catch (e) {
            if (e instanceof AxiosError) {
                prop.showAlert("error", e.response?.data || "Reset password failed")
            } else {
                console.log(e)
            }
        }
    }

    useEffect(() => {
        if (!prop.open) {
            setOldPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setIsNewPasswordValid(true)
            setIsConfirmValid(true)
        }
    }, [prop.open])

    return (
        <Dialog
            fullWidth
            open={prop.open}
            onClose={prop.onClose}
        >
            <DialogTitle>"Change Password"</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <DialogContentText>Enter your old and new password</DialogContentText>
                    <TextField
                        label="Old Password"
                        value={oldPassword}
                        onChange={(e) => {
                            setOldPassword(e.target.value)
                        }}
                        type="password"
                    />
                    <TextField
                        label="New Password"
                        value={newPassword}
                        type="password"
                        error={!isNewPasswordValid}
                        helperText={isNewPasswordValid ? "" : "Password must be at least 8 characters"}
                        onChange={(e) => {
                            setNewPassword(e.target.value)
                            setIsNewPasswordValid(e.target.value.length >= 8)
                        }}
                    />
                    <TextField
                        label="Confirm Password"
                        value={confirmPassword}
                        type="password"
                        error={!isConfirmValid}
                        helperText={isConfirmValid ? "" : "Password not match"}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            setIsConfirmValid(newPassword === e.target.value)
                        }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={prop.onClose}>Cancel</Button>
                <Button
                    disabled={newPassword.length === 0 || confirmPassword.length === 0 || !isNewPasswordValid || !isConfirmValid}
                    onClick={() => changePassword(oldPassword, newPassword)}
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


    const updateCredentials = async () => {
        const res = await axios.get("/api/user/credentials")
        setCredentials(res.data)
    }
    const updateUsePassword = async () => {
        const res = await axios.get("/api/user/enable_password")
        setUsePassword(res.data)
    }

    const [credentials, setCredentials] = React.useState<CredentialInfo[]>([])
    const [usePassword, setUsePassword] = React.useState(false)
    useEffect(() => {
        (async () => {
            await updateCredentials()
            await updateUsePassword()
        })()
    }, [])

    const onNewCredential = async (usePlatform: boolean) => {
        try {
            const reqJson = await axios.post('/api/register/create')
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
            showAlert('success', 'Successfully create credentials')
            await updateCredentials()
        } catch (e) {
            if (e instanceof AxiosError) {
                showAlert('error', e.response?.data || 'Register failed')
            } else if (e instanceof WebAuthnError) {
                showAlert('error', e.message)
            }
        }
    }

    const onDeleteCredential = async (credentialId: string) => {
        try {
            await axios.delete("/api/user/credentials", {
                params: {
                    credentialId
                }
            })
            showAlert("success", "Successfully delete credential")
            await updateCredentials()
        } catch (e) {
            if (e instanceof AxiosError) {
                showAlert('error', e.response?.data || 'Delete credential failed')
            } else {
                console.log(e)
            }
        }
    }


    const [openEnablePasswordDialog, setOpenEnablePasswordDialog] = React.useState(false)
    const [openDisablePasswordDialog, setOpenDisablePasswordDialog] = React.useState(false)
    const [openResetPasswordDialog, setOpenResetPasswordDialog] = React.useState(false)
    const [openDeleteCredentialDialog, setOpenDeleteCredentialDialog] = React.useState(false)
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
            <Grid sx={{p: 5, width: "100%"}} container spacing={3}>
                <Grid xs={4}>
                    <Stack spacing={3}>
                        <Button
                            variant="contained"
                            endIcon={<LogoutIcon/>}
                            onClick={async () => {
                                await axios.post("/api/logout")
                                navigate("/login")
                            }}
                        >Logout</Button>
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
                                                if (credentials.length === 0) {
                                                    showAlert("error", "You must have at least one credential to disable password")
                                                    return
                                                }
                                                setOpenDisablePasswordDialog(true)
                                            }
                                        }}
                                    />
                                    <EnablePasswordDialog
                                        showAlert={showAlert}
                                        open={openEnablePasswordDialog}
                                        onClose={() => setOpenEnablePasswordDialog(false)}
                                        onConfirm={async () => {
                                            setOpenEnablePasswordDialog(false)
                                            await updateUsePassword()
                                        }}
                                    />
                                    <DisablePasswordDialog
                                        showAlert={showAlert}
                                        open={openDisablePasswordDialog}
                                        onClose={() => setOpenDisablePasswordDialog(false)}
                                        onConfirm={async () => {
                                            setOpenDisablePasswordDialog(false)
                                            await updateUsePassword()
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
                                {usePassword &&
                                    <Button
                                        variant="outlined"
                                        onClick={() => setOpenResetPasswordDialog(true)}
                                    >Modify Password</Button>
                                }
                                <ResetPasswordDialog
                                    showAlert={showAlert}
                                    open={openResetPasswordDialog}
                                    onConfirm={() => setOpenResetPasswordDialog(false)}
                                    onClose={() => setOpenResetPasswordDialog(false)}
                                />
                            </Stack>
                        </Card>
                    </Stack>
                </Grid>
                <Grid xs={8}>
                    <Card sx={{width: "100%", p: 3}}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="h5">
                                Total {credentials.length} Credential{credentials.length > 1 ? "s" : ""}
                            </Typography>
                            <PopupState variant="popover">
                                {(popupState) => (
                                    <div>
                                        <Button
                                            variant="outlined"
                                            {...bindTrigger(popupState)}
                                        >New Credential</Button>
                                        <Popover
                                            {...bindPopover(popupState)}
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'center',
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'center',
                                            }}
                                        >
                                            <Stack sx={{p: 2}} spacing={2}>
                                                <Button variant="contained" onClick={async () => {
                                                    await onNewCredential(false)
                                                    popupState.close()
                                                }}>Via PasskeySync</Button>
                                                <Button variant="outlined" onClick={async () => {
                                                    await onNewCredential(true)
                                                    popupState.close()
                                                }}>Via Platform</Button>
                                            </Stack>
                                        </Popover>
                                    </div>
                                )}
                            </PopupState>
                        </Stack>

                        <Stack spacing={3} sx={{marginTop: 3}}>
                            {credentials.map((credential) => (
                                <React.Fragment key={credential.credentialId}>
                                    <Card sx={{p: 3, wordBreak: "break-all"}} variant="outlined">
                                        <Stack direction="row-reverse" justifyContent="flex-start">
                                            <PopupState variant="popover">
                                                {(popupState) => (
                                                    <div>
                                                        <Button
                                                            color="error"
                                                            ref={anchorRef(popupState)}
                                                            onClick={() => {
                                                                if (credentials.length === 1 && !usePassword) {
                                                                    showAlert("error", "You must have at least one credential when password login is disabled")
                                                                    return
                                                                }
                                                                popupState.open()
                                                            }}
                                                        >Delete</Button>
                                                        <Popover
                                                            {...bindPopover(popupState)}
                                                            anchorReference="anchorEl"
                                                            anchorOrigin={{
                                                                vertical: 'bottom',
                                                                horizontal: 'center',
                                                            }}
                                                            transformOrigin={{
                                                                vertical: 'top',
                                                                horizontal: 'center',
                                                            }}
                                                        >
                                                            <Stack sx={{p: 2, maxWidth: 300}} spacing={2}>
                                                                <Typography>
                                                                    Are you sure to delete this credential?
                                                                    You will NOT be able to login with this credential
                                                                    anymore.
                                                                </Typography>
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    onClick={() => onDeleteCredential(credential.credentialId)}
                                                                >Confirm Delete</Button>
                                                            </Stack>
                                                        </Popover>
                                                    </div>
                                                )}
                                            </PopupState>
                                        </Stack>
                                        <Dialog open={openDeleteCredentialDialog}>
                                            <DialogTitle>Delete Credential</DialogTitle>
                                            <DialogContent>
                                                <DialogContentText>
                                                    Are you sure to delete this credential?
                                                </DialogContentText>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button
                                                    onClick={() => setOpenDeleteCredentialDialog(false)}>Cancel</Button>
                                                <Button onClick={async () => {
                                                    await onDeleteCredential(credential.credentialId)
                                                    setOpenDeleteCredentialDialog(false)
                                                }}>Confirm</Button>
                                            </DialogActions>
                                        </Dialog>
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