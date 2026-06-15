import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { getToken, clearAuth, fetchUserInfo } from './utils/api';
import './styles/index.css';

function App() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      const token = getToken();
      if (token) {
        // If there is a mock token leftover from old code, remove it immediately
        if (token === 'dummy_token_for_dev' || token === 'mock_token') {
          clearAuth();
          setIsChecking(false);
          return;
        }
        
        try {
          const info = await fetchUserInfo();
          if (info.code !== 200) {
            clearAuth();
          } else {
            localStorage.setItem('user_profile', JSON.stringify(info));
          }
        } catch {
          clearAuth();
        }
      } else {
        clearAuth(); // ensure guest mode
      }
      setIsChecking(false);
    };
    checkAuthState();
  }, []);

  if (isChecking) return null; // Or a minimal loading spinner

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            padding: '1rem 1.25rem',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: 'var(--accent-color)',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#991b1b',
              secondary: '#fff',
            },
            style: {
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b'
            }
          }
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
