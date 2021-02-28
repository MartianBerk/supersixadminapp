import React from 'react';
import { Route, Router } from 'react-router-dom';

import SupersixAdmin from './components/presentation/SupersixAdmin.js';

import './App.css';

function App() {
  return (
    <div className="App">
      <Router basename="/supersixadmin">
        <Route path="/" component={SupersixAdmin} />
      </Router>
    </div>
  );
}

export default App;
