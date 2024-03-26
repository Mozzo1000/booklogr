import { Routes, Route } from "react-router-dom";
import BookDetails from "./pages/BookDetails";
import Home from "./pages/Home";
import SearchBar from "./components/SearchBar";

function App() {

  return (
    <>
    <Routes>
      <Route path="/">
        <Route index element={<Home/>} />
        <Route path="books/:id" element={<BookDetails />} />
        <Route path="search" element={<SearchBar />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
