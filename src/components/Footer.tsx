import React, { useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import EventIcon from '@mui/icons-material/Event';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MemoryIcon from '@mui/icons-material/Memory';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import { auth, db } from '../firebase/firebase'; // Firestoreインスタンスのインポート
import { doc, getDoc } from 'firebase/firestore';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState(0);

  useEffect(() => {
    switch (location.pathname) {
      case '/home':
        setValue(0);
        break;
      case '/calendar':
        setValue(1);
        break;
      case '/todo':
        setValue(2);
        break;
      case '/memories':
        setValue(3);
        break;
      case '/profile':
        setValue(4);
        break;
      default:
        setValue(0);
        break;
    }
  }, [location.pathname]);

  const getCurrentDateFormatted = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`; // 'YYYYMMDD'形式で日付を返す
  };

  const handleChange = async (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (newValue === 0) {
      // Firebase Firestoreで今日のスケジュールを確認する
      const currentUser = auth.currentUser;
      if (currentUser) {
        const today = new Date().toISOString().split('T')[0];
        const docRef = doc(db, 'users', currentUser.uid, 'schedule', today);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          navigate('/homme');
        } else {
          navigate('/modeselector');
        }
      } else {
        navigate('/homme');
      }
    } else {
      switch (newValue) {
        case 1:
          navigate('/calendar');
          break;
        case 2:
          navigate('/todo');
          break;
        case 3:
          navigate('/memories');
          break;
        case 4:
          navigate('/profile');
          break;
        default:
          navigate('/home');
          break;
      }
    }
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleChange}
      showLabels
      style={{ width: '100%', height: '60px', backgroundColor: '#fff' }}
      className="bottom-navigation"
    >
      <BottomNavigationAction
        label="Home"
        icon={value === 0 ? <HomeIcon /> : <HomeOutlinedIcon />}
        className={`nav-action ${value === 0 ? 'selected' : ''}`}
      />
      <BottomNavigationAction
        label="Calendar"
        icon={value === 1 ? <EventIcon /> : <EventOutlinedIcon />}
        className={`nav-action ${value === 1 ? 'selected' : ''}`}
      />
      <BottomNavigationAction
        label="ToDo"
        icon={value === 2 ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
        className={`nav-action ${value === 2 ? 'selected' : ''}`}
      />
      <BottomNavigationAction
        label="Memories"
        icon={value === 3 ? <MemoryIcon /> : <MemoryOutlinedIcon />}
        className={`nav-action ${value === 3 ? 'selected' : ''}`}
      />
      <BottomNavigationAction
        label="MyPage"
        icon={<span role="img" aria-label="burger">🍔</span>}
        className={`nav-action ${value === 4 ? 'selected' : ''}`}
      />
    </BottomNavigation>
  );
};

export default Footer;
