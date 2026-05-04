import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import ErrorBoundary from './utils/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
