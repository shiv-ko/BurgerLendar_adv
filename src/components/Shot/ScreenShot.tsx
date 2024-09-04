import React from 'react';

interface ScreenShotProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: () => void;
}

const ScreenShot: React.FC<ScreenShotProps> = ({ isOpen, onClose, onCapture }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>スクリーンショットを取りますか？</h2>
        <img src='/image/poteto_icon.png' alt="カメラポテトのイラスト" />
        <div className="buttons">
          <button onClick={onCapture}>スクリーンショットを取る</button>
          <button onClick={onClose}>キャンセル</button>
        </div>
      </div>
      <style>
        {`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          z-index: 1001;
        }
        .buttons {
          margin-top: 20px;
        }
        button {
          margin: 0 10px;
        }
      `}
      </style>
    </div>
  );
};

export default ScreenShot;
