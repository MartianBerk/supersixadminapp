import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import SupersixAdmin from './components/presentation/SupersixAdmin.js';

import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter basename={"/supersixadmin"}>
        <Route path="/" component={SupersixAdmin} />
      </BrowserRouter>
    </div>
  );
}

export default App;
