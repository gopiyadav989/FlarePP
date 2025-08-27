import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store.js';
import axios from 'axios';
import { TooltipProvider } from '@/components/ui/tooltip';

// Configure axios globally
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true; // Important for CORS & cookies

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);