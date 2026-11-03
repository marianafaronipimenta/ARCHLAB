import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ProgressProvider } from './state/store';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/home.css';
import './styles/module.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </StrictMode>,
);
