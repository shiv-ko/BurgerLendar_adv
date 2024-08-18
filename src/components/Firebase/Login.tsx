import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { teal } from "@mui/material/colors";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleShowPasswordChange = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleLogin = async () => {
    const auth = getAuth();
    try {
      console.log("Attempting to sign in...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed in:", user);

      // カレンダーの存在を確認するロジックを追加
      const today = new Date();
      const yy = String(today.getFullYear()).slice(-2);
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const yymmdd = `${yy}${mm}${dd}`;
      console.log("Checking for document with date:", yymmdd);

      const docRef = doc(db, 'scehdule', user.uid, 'dates', yymmdd);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Document exists, navigating to /home");
        navigate("/home");
      } else {
        console.log("Document does not exist, navigating to /modeselector");
        navigate("/modeselector");
      }
    } catch (error) {
      console.error("Error during login or checking document existence:", error);
      setError("Failed to log in. Please check your credentials and try again.");
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" height="calc(100vh - 120px)">
      <Paper elevation={3} sx={{ p: 4, width: "280px" }}>
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="flex-start"
          spacing={2}
        >
          <Avatar sx={{ bgcolor: teal[400] }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h5">Log In</Typography>
        </Grid>
        <TextField
          label="Email"
          variant="standard"
          fullWidth
          required
          sx={{ mt: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          type={showPassword ? "text" : "password"}
          label="Password"
          variant="standard"
          fullWidth
          required
          sx={{ mt: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showPassword}
              onChange={handleShowPasswordChange}
              size="small"
              color="primary"
            />
          }
          label="Show Password"
          sx={{ mt: 1 }}
        />
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        <Box mt={2}>
          <Button
            onClick={handleLogin}
            color="primary"
            variant="contained"
            fullWidth
          >
            Sign In
          </Button>
          <Typography variant="caption">
            <Link href="forgetpass">Forgot Password?</Link>
          </Typography>
          <Typography variant="caption" display="block">
            Don't have an account?
            <Link component={RouterLink} to="/signup">
              Create an Account
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Grid>
  );
};

export default Login;