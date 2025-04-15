import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store.js';
import { SocketProvider } from './hooks/SocketContext.jsx';
import axios from 'axios';

// Configure axios globally
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true; // Important for CORS & cookies

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SocketProvider>
          <App />
        </SocketProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);