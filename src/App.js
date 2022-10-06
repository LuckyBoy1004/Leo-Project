import React from 'react'
import './App.css';
import RouteProvider from "./components/RouteProvider"
import { UserProvider } from './context/userContext';

import Firebase from "./assets/base";
import { FirebaseContext } from "./assets/base-context";



const App = () => {
  require('dotenv').config()

  return (
    <FirebaseContext.Provider value={new Firebase()}>
    <UserProvider>
      <RouteProvider />
    </UserProvider>
    </FirebaseContext.Provider>
  );
}

export default App;