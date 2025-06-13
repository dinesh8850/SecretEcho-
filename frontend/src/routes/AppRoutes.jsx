import React from 'react'
import { BrowserRouter , Routes, Route } from 'react-router-dom'
import Login from '../Screens/Login'
import Register from '../Screens/Register'
import Home from '../Screens/Home'
import ChatPage from '../Screens/ChatPage'

export const AppRoutes = () => {
  return (
    <BrowserRouter>
    <Routes>
        
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/" element={<Home/>} />
        {/* <Route path="/chat" element={<ChatPage />} /> */}



    </Routes>





    </BrowserRouter>
  )
}

export default AppRoutes