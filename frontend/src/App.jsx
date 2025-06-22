import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { UserProvider } from './Context/user.context'


const App = () => {
  return (

    <UserProvider>

    <AppRoutes/>
    </UserProvider>
  )
}


export default App