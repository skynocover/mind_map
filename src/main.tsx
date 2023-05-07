import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'tailwindcss/tailwind.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Project from './pages/Project.tsx';
import Projects from './pages/Projects.tsx';
import { AppProvider } from './AppContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/project/:projectId" Component={Project} />
          <Route path="/projects" Component={Projects} />
          <Route path="/" Component={App} />
        </Routes>
      </Router>
    </AppProvider>
  </React.StrictMode>,
);
