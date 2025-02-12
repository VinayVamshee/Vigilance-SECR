import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import IndexPage from "./Components/IndexPage";
import Documentation from "./Components/Documentation"; // Import Documentation component
import './Components/style.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/index" element={<IndexPage />} />
          <Route path="/documentation" element={<Documentation />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
