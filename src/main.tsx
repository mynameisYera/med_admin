import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './presentation/routes/AppRouter';
import './presentation/styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
