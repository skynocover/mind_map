import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';

import App from './App.tsx';
import './index.css';
import 'tailwindcss/tailwind.css';
import 'antd/dist/reset.css';
import 'reactflow/dist/style.css';

import Project from './pages/Project.tsx';
import Projects from './pages/Projects.tsx';
import Login from './pages/Login.tsx';
import { AppProvider } from './AppContext';
import { FlowProvider } from './components/FlowContext.tsx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <ReactFlowProvider>
        <FlowProvider>
          <Router>
            <Routes>
              <Route path="/project/:projectId" Component={Project} />
              <Route path="/projects" Component={Projects} />
              <Route path="/login" Component={Login} />
              <Route path="/" Component={App} />
            </Routes>
          </Router>
        </FlowProvider>
      </ReactFlowProvider>
    </AppProvider>
  </React.StrictMode>,
);
