import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'tailwindcss/tailwind.css';
import 'antd/dist/reset.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Project from './pages/Project.tsx';
import Projects from './pages/Projects.tsx';
import Login from './pages/Login.tsx';
import { AppProvider } from './AppContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/project/:projectId" Component={Project} />
          <Route path="/projects" Component={Projects} />
          <Route path="/login" Component={Login} />
          <Route path="/" Component={App} />
        </Routes>
      </Router>
    </AppProvider>
  </React.StrictMode>,
);
