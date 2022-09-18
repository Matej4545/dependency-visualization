import React from 'react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainNavbar from './components/MainNavbar/MainNavbar';
import ImportForm from './components/ImportForm/ImportForm';
import PageNotFound from './components/Error/PageNotFound';
import { SbomProvider } from './providers/SbomProvider';
import { NotificationProvider } from './providers/NotificationProvider';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <SbomProvider>
        <BrowserRouter>
          <MainNavbar></MainNavbar>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="upload" element={<ImportForm />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </SbomProvider>
      </NotificationProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
