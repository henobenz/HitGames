import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

window.__PLAYVAULT_MOUNTED__ = true;
createRoot(document.getElementById('root')).render(<App />);
