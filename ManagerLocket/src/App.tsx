import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState('')

  const handleLogin = (username: string, password: string) => {
    setCurrentUser(username)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setCurrentUser('')
    setIsLoggedIn(false)
  }

  return (
    <div className="app">
      {isLoggedIn ? (
        <Dashboard username={currentUser} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
