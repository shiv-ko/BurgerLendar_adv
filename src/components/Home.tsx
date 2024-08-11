import React from 'react';
import { Button, Typography, Grid, Paper } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth'; // カスタムフックをインポート

const Home = () => {
  const { user, isAdmin, userData, isLoading, handleLogout } = useAuth();
  const navigate = useNavigate(); // useNavigateフックを使用してページ遷移を行う

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  const handleLogoutClick = async () => {
    await handleLogout(); // ログアウト処理を実行
    navigate('/'); // ログアウト後にルート('/')に遷移する
  };

  return (
    <Grid container justifyContent="center" alignItems="center" height="100vh">
      <Paper elevation={3} sx={{ p: 4, width: '280px' }}>
        <Typography variant="h5">Welcome to Home Page</Typography>
        {user && (
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Display Name: {userData?.displayName}
          </Typography>
        )}
        {isAdmin ? (
          <Button
            component={RouterLink}
            to="/admin"
            color="primary"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Go to Admin Panel
          </Button>
        ) : (
          <Button
            component={RouterLink}
            to="/task"
            color="primary"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Go to ToDo Page
          </Button>
        )}
        <Button onClick={handleLogoutClick} color="secondary" variant="contained" fullWidth sx={{ mt: 2 }}>
          Logout
        </Button>
      </Paper>
    </Grid>
  );
};

export default Home;
