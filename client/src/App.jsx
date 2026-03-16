import  {BrowserRouter as Router,Routes,Route,Navigate} from "react-router-dom";
import Login from "./pages/login/Login"
import Register from "./pages/register/Register"
// import { Route } from 're';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" /> }/>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />

      </Routes>
    </Router>
  )
}

export default App