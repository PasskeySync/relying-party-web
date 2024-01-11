import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Alert, AlertColor, Box, Button, colors, Snackbar, Tab, Tabs, TextField } from "@mui/material";
import axios, { AxiosError } from "axios";
import { startRegistration } from "@simplewebauthn/browser";
import { parseCreationOptionsFromJSON } from "@github/webauthn-json/browser-ponyfill";
import { create, get } from "@github/webauthn-json";
import { VerticalAlignCenter } from "@mui/icons-material";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';


function App() {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('')
  const [msgType, setMsgType] = React.useState<AlertColor>('success')
  const [tabs, setTabs] = React.useState<'Register' | 'Login'>('Register')
  const [email, setEmail] = React.useState('')
  const [username, setUsername] = React.useState('')

  const showAlert = (type: AlertColor, msg: string) => {
    setMsgType(type)
    setMessage(msg)
    setOpen(true)
  }

  const onRegister = async() => {
    try {
      const req = await axios.post('/api/register/begin', { username, email })
      console.log(req)
      const response = await create(req.data)

      console.log(response)
      const attResult = await axios.post('/api/register/finish', response)
      console.log(attResult)
      showAlert('success', 'Register success')
    } catch (e) {
      if (e instanceof AxiosError) {
        showAlert('error', e.response?.data || 'Register failed')
      }
    }
  }

  const onLogin = async() => {
    try {
      const req = await axios.post('/api/login/begin', { email })
      console.log(req)
      const response = await get(req.data)

      console.log(response)
      const attResult = await axios.post('/api/login/finish', response)
      console.log(attResult)
        showAlert('success', 'Login success')
    } catch (e) {
      if (e instanceof AxiosError) {
        showAlert('error', e.response?.data || 'Login failed')
      }
    }
  }

  const verticalAlignCenter = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  }

  return (
    <div className="App" style={{ backgroundColor: 'white' }}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
      >
        <Alert severity={ msgType }>{ message }</Alert>
      </Snackbar>
      <Box className="App-header">
        <TabContext value={tabs}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={ (_, nv) => setTabs(nv) }>
              <Tab label="Login" value="Login"/>
              <Tab label="Register" value="Register"/>
            </TabList>
          </Box>
          <TabPanel value="Register" sx={verticalAlignCenter}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: 20 }}
            />
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ marginBottom: 20 }}
            />
            <Button
              variant="contained"
              onClick={ onRegister }
            >
              Register
            </Button>
          </TabPanel>
          <TabPanel value="Login" sx={verticalAlignCenter}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ marginBottom: 20 }}
            />
            <Button
              variant="contained"
              onClick={ onLogin }
            >
              Login
            </Button>
          </TabPanel>
        </TabContext>
      </Box>
    </div>
  );
}

export default App;
