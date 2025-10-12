import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContexts';
import { Snackbar } from '@mui/material';

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        const result = await handleRegister(name, username, password);
        setUsername('');
        setMessage(result);
        setOpen(true);
        setError('');
        setFormState(0);
        setPassword('');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error occurred';
      setError(msg);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      {/* 🔹 Fullscreen Background Video */}
      <Box
        component="video"
        autoPlay
        loop
        muted
        playsInline
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      >
        <source src="/video1.mp4" type="video/mp4" />
      </Box>

      {/* 🔹 Main Content */}
      <Grid
        container
        component="main"
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CssBaseline />

        {/* 🔸 Transparent Form */}
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={0}
          square
          sx={{
            backgroundColor: 'transparent', // ✅ fully transparent
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '15px',
            color: 'white',
            p: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80vh",
              mx: 4,
              backgroundColor: "rgba(0,0,0,0.3)", // halka dark transparent layer for contrast
              borderRadius: "15px",
              p: 4,
              backdropFilter: "blur(2px)", // halka blur readability ke liye
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "#ef5350" }}> {/* Red tone avatar */}
              <LockOutlinedIcon />
            </Avatar>

            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Button
                variant={formState === 0 ? "contained" : "outlined"}
                color="primary"
                onClick={() => setFormState(0)}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  bgcolor: formState === 0 ? "#91c4c3" : "rgba(255,255,255,0.3)",
                  color: formState === 0 ? "#fff" : "#f5f5f5",
                  "&:hover": { bgcolor: "#b4debd" },
                  borderColor: "#e0e0e0",
                }}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? "contained" : "outlined"}
                color="secondary"
                onClick={() => setFormState(1)}
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  bgcolor: formState === 1 ? "#80a1ba" : "rgba(255,255,255,0.3)",
                  color: formState === 1 ? "#fff" : "#f5f5f5",
                  "&:hover": { bgcolor: "#b4debd" },
                  borderColor: "#e0e0e0",
                }}
              >
                Sign Up
              </Button>
            </Box>

            <Box component="form" noValidate sx={{ width: "100%" }}>
              {formState === 1 && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="fullname"
                  label="Full Name"
                  name="fullname"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                  InputLabelProps={{ style: { color: "#fff" } }}
                  InputProps={{
                    style: {
                      color: "#fff",
                      backgroundColor: "#b6ae9f",
                      borderRadius: "5px",
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#fff9f8ff" },
                      "&:hover fieldset": { borderColor: "#95b0f4ff" },
                      "&.Mui-focused fieldset": { borderColor: "#f2eff0ff" },
                    },
                  }}
                />
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoFocus={formState === 0}
                onChange={(e) => setUsername(e.target.value)}  // ✅ fixed
                InputLabelProps={{ style: { color: "#fff" } }}
                InputProps={{
                  style: {
                    color: "#fff",
                    backgroundColor: "#b6ae9f",
                    borderRadius: "5px",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#fff9f8ff" },
                    "&:hover fieldset": { borderColor: "#95b0f4ff" },
                    "&.Mui-focused fieldset": { borderColor: "#f2eff0ff" },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}  // ✅ fixed
                InputLabelProps={{ style: { color: "#fff" } }}
                InputProps={{
                  style: {
                    color: "#fff",
                    backgroundColor: "#c5c7bc",
                    borderRadius: "5px",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#fff9f8ff" },
                    "&:hover fieldset": { borderColor: "#95b0f4ff" },
                    "&.Mui-focused fieldset": { borderColor: "#f2eff0ff" },
                  },
                }}
              />

              <Typography sx={{ color: "#ffcccb", mt: 1, fontWeight: "bold" }}>
                {error}
              </Typography>

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: "bold",
                  bgcolor: "#5d866c",
                  color: "#fff",
                  "&:hover": { bgcolor: "#c2a68c" },
                }}
                onClick={handleAuth}
              >
                {formState === 0 ? "Login" : "Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            bgcolor: 'success.main',
            color: 'white',
          },
        }}
      />
    </ThemeProvider>
  );
}
