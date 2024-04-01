import {Route, Routes, BrowserRouter} from 'react-router-dom'
import './App.css'
import Test from './components/Test'
import Navbar from './components/NavBar/NavBar'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route  path="/" element={<Test />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
