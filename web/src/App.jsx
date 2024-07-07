import { Routes, Route } from "react-router-dom";
import BookDetails from "./pages/BookDetails";
import Home from "./pages/Home";
import SearchBar from "./components/SearchBar";
import ToastContainer from "./toast/Container";
import NavigationMenu from "./components/Navbar"
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen">
    <div className="flex flex-row ">
      <div className="basis-1/12">
        <NavigationMenu />
      </div>
      <div className="container mx-auto pt-10 basis-full	"> 
        <Routes>
          <Route path="/">
            <Route index element={<Home/>} />
            <Route path="books/:id" element={<BookDetails />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:name" element={<Profile />} />

            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </div>
    </div>
    <Footer />
    <ToastContainer />
    </div>
  )
}

export default App
