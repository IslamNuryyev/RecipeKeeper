import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RecipeProvider } from "./RecipeStore";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RecipeProvider currentUserId="user-123">
      <App />
    </RecipeProvider>
  </React.StrictMode>
);

reportWebVitals();
