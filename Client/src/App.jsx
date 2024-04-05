import {Route, Routes, BrowserRouter} from 'react-router-dom'
import './App.css'
import Navbar from './components/NavBar/NavBar'
import Home from './components/Home/Home'
import MyContracts from './components/MyContracts/MyContracts'
import RequestedContracts from './components/RequestedContracts/RequestedContracts'
import PendingContracts from './components/PendingContracts/PendingContracts'
import Dashboard from './components/Dashboard/Dashboard'
import Login from './components/Login/Login'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route  index element={<Home />} />
          <Route  path="/contracts" element={<MyContracts />} />
          <Route  path="/requests" element={<RequestedContracts />} />
          <Route  path="/pending" element={<PendingContracts />} />
          <Route  path="/dashboard" element={<Dashboard />} />
          <Route  path="/login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
