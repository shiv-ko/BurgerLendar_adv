import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  InputAdornment,
  IconButton
} from "@mui/material";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../../firebase/firebase"; // authだけをインポートする
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Authun = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const register = async () => {
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    try {
      // Firebase Authenticationでユーザー登録
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Firestoreにユーザー情報を保存
      const db = getFirestore();
      const userRef = doc(db, "Users", userCredential.user.uid);
      await setDoc(userRef, {
        email: email,
        displayName: displayName,
        isAdmin: false,
      });

      // Users_Burgerコレクションにサブコレクションを作成
      const userBurgerRef = collection(db, "Users_Burger", userCredential.user.uid, "BurgerData");
      const date = new Date();
      const YYMMDD = `${date.getFullYear().toString().slice(2)}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

      await setDoc(doc(userBurgerRef, YYMMDD), {
        "T/F": true,
        CREATED_AT: serverTimestamp(),
        UPDATED_AT: serverTimestamp()
      });

      // Users_AkiコレクションにユーザーのUIDをドキュメントIDとして作成
      const userAkiRef = doc(db, "Users_Aki", userCredential.user.uid);
      await setDoc(userAkiRef, {
        created_at: serverTimestamp()
      });

      console.log("User registered successfully");

      // 登録成功後にホームページにリダイレクト
      navigate("/bath");
    } catch (error: any) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.currentTarget.value);
  };

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
  };

  const handleChangeConfirmPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.currentTarget.value);
  };

  const handleChangeDisplayName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(event.currentTarget.value);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Container>
      <Grid container justifyContent="center" alignItems="center" style={{ height: "100vh" }}>
        <Grid item xs={12} md={6}>
          <Box p={3} boxShadow={2} borderRadius={2}>
            <h2>新規登録</h2>
            <TextField
              style={{ marginBottom: "0.5em" }}
              label="E-mail"
              fullWidth
              variant="outlined"
              value={email}
              onChange={handleChangeEmail}
            />
            <TextField
              style={{ marginBottom: "0.5em" }}
              label="Password"
              fullWidth
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handleChangePassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              style={{ marginBottom: "0.5em" }}
              label="Confirm Password"
              fullWidth
              variant="outlined"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleChangeConfirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              style={{ marginBottom: "0.5em" }}
              label="Display Name"
              fullWidth
              variant="outlined"
              value={displayName}
              onChange={handleChangeDisplayName}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button
              fullWidth
              style={{ marginBottom: "0.5em" }}
              onClick={register}
            >
              新規登録
            </Button>
            <Typography variant="caption" display="block">
              アカウントを持っていますか？
              <Link to="/">ログイン</Link>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Authun;
