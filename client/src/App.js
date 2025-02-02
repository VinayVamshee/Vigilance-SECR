import { useState } from "react";
import Home from "./Components/Home";
import IndexPage from "./Components/IndexPage";
import './Components/style.css';

function App() {
  const [page, setPage] = useState(localStorage.getItem("selectedPage") || "home");
  return (
    <div className="App">
      {page === "home" && <Home setPage={setPage} />}
      {page === "index" && <IndexPage setPage={setPage}/>}
    </div>
  );
}

export default App;
