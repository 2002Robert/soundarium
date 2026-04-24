import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import Login from './pages/Login'
import PublicTank from './pages/PublicTank'
import Explore from './pages/Explore'
import Shop from './pages/Shop'
import SetupProfile from './pages/SetupProfile'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/setup-profile"  element={<SetupProfile />} />
        <Route path="/u/:username"    element={<PublicTank />} />
        <Route path="/explore"        element={<Explore />} />
        <Route path="/shop"           element={<Shop />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
