import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { login, loginWithGoogle, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);

      if (!isLogin && password !== confirmPassword) {
        throw new Error('Le password non coincidono');
      }

      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      
      navigate('/dashboard');
    } catch (error) {
      setError(isLogin ? 'Credenziali non valide. Riprova.' : 'Errore durante la registrazione. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    try {
      setError('');
      setLoading(true);
      const result = await loginWithGoogle();
      
      // Se è una nuova registrazione, possiamo fare operazioni aggiuntive qui
      if (!isLogin) {
        // TODO: Aggiungere dati aggiuntivi dell'utente se necessario
        console.log('Nuovo utente registrato con Google:', result.user);
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Errore durante l\'autenticazione con Google:', error);
      setError('Errore durante l\'autenticazione con Google. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          {isLogin ? 'Accedi a Eddy Style' : 'Registrati su Eddy Style'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <TextField
              label="Conferma Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : (isLogin ? 'Accedi' : 'Registrati')}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>oppure</Divider>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          {isLogin ? 'Accedi con Google' : 'Registrati con Google'}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={toggleMode}
          sx={{ mt: 1 }}
        >
          {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
        </Button>
      </Paper>
    </Box>
  );
};

export default Login; 