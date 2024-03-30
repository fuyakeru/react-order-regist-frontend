import React from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import OrderRegistrationPage from './components/pages/OrderRegistrationPage';
import ItemManagementPage from './components/pages/ItemManagementPage';
import ItemCategoryManagementPage from './components/pages/ItemCategoryManagementPage';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={OrderRegistrationPage} exact />
        <Route path="/itemManagement" component={ItemManagementPage} exact />
        <Route path="/itemCategoryManagement" component={ItemCategoryManagementPage} exact />
      </Switch>
    </Router>
  )
}

export default App
