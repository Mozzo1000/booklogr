import { Routes, Route } from "react-router-dom";
import BookDetails from "./pages/BookDetails";
import Home from "./pages/Home";
import SearchBar from "./components/SearchBar";
import NavigationMenu from "./components/Navbar";
import ToastContainer from "./toast/Container";

function App() {

  return (
    <>
    <NavigationMenu />
    <Routes>
      <Route path="/">
        <Route index element={<Home/>} />
        <Route path="books/:id" element={<BookDetails />} />
        <Route path="search" element={<SearchBar />} />
      </Route>
    </Routes>
    <ToastContainer />
    </>
  )
}

export default App
