import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // React RouterのuseNavigateフックをインポート
import { auth } from '../../firebase/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgetPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate(); // useNavigateフックを使用

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('パスワードリセットメールを送信しました。');
      setTimeout(() => {
        navigate('/'); // リダイレクト
      }, 2000); // メッセージ表示のため2秒待機
    } catch (error) {
      setError('パスワードリセットメールの送信に失敗しました。');
    }
  };

  return (
    <div className="password-reset-container">
      <style>{`
        .password-reset-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          background-color: #fff;
        }
        .password-reset-form .form-group {
          margin-bottom: 20px;
        }
        .password-reset-form label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
        }
        .password-reset-form input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        .reset-button {
          width: 100%;
          padding: 10px;
          background-color: #007bff;
          border: none;
          border-radius: 4px;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
        }
        .reset-button:hover {
          background-color: #0056b3;
        }
        .success-message {
          color: #28a745;
          margin-top: 20px;
        }
        .error-message {
          color: #dc3545;
          margin-top: 20px;
        }
      `}</style>
      <h1>パスワードを忘れた場合</h1>
      <form onSubmit={handlePasswordReset} className="password-reset-form">
        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="reset-button">リセットリンクを送信</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ForgetPassword;
