import { Routes, Route } from "react-router-dom";
import BookDetails from "./pages/BookDetails";
import Home from "./pages/Home";
import SearchBar from "./components/SearchBar";
import ToastContainer from "./toast/Container";
import NavigationMenu from "./components/Navbar"

function App() {
  return (
    <>
    <div className="flex flex-row ">
      <div className="basis-1/12">
        <NavigationMenu />
      </div>
      <div className="container mx-auto pt-10 basis-full	"> 
        <Routes>
          <Route path="/">
            <Route index element={<Home/>} />
            <Route path="books/:id" element={<BookDetails />} />
            <Route path="search" element={<SearchBar />} />
          </Route>
        </Routes>
      </div>
    </div>
    <ToastContainer />
    </>
  )
}

export default App
