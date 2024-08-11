import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import useAuth from '../hooks/useAuth'; // Firebase Authenticationを使用するカスタムフック

const AddTobacco = () => {
  const { user, isAdmin } = useAuth(); // ログインユーザーとそのADMIN権限を取得するカスタムフック
  const [error, setError] = useState<string | null>(null);
  const [tobaccoName, setTobaccoName] = useState<string>('');
  const [tobaccoPrice, setTobaccoPrice] = useState<number>(0);
  const [imagePath, setImagePath] = useState<string>('');

  const handleAddTobacco = async () => {
    if (!isAdmin) {
      setError('You do not have permission to add tobacco.');
      return;
    }

    try {
      const db = getFirestore();
      
      // タバコの情報を追加する
      await addDoc(collection(db, 'Tabacco'), {
        name: tobaccoName,
        price: tobaccoPrice,
        imagePath: imagePath
      });

      console.log('タバコを追加しました');
      setError(null);
      setTobaccoName('');
      setTobaccoPrice(0);
      setImagePath('');
    } catch (error) {
      setError('Failed to add tobacco.');
      console.error('タバコの追加に失敗しました', error);
    }
  };

  return (
    <div>
      <TextField
        label="タバコ名"
        value={tobaccoName}
        onChange={(e) => setTobaccoName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        type="number"
        label="価格"
        value={tobaccoPrice}
        onChange={(e) => setTobaccoPrice(Number(e.target.value))}
        fullWidth
        margin="normal"
      />
      <TextField
        label="画像パス"
        value={imagePath}
        onChange={(e) => setImagePath(e.target.value)}
        fullWidth
        margin="normal"
      />
      {user && isAdmin && (
        <Button variant="contained" onClick={handleAddTobacco}>
          タバコを追加する
        </Button>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};

export default AddTobacco;
