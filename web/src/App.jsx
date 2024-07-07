import { Routes, Route, Navigate } from "react-router-dom";
import BookDetails from "./pages/BookDetails";
import Library from "./pages/Library";
import Home from "./pages/Home";
import SearchBar from "./components/SearchBar";
import ToastContainer from "./toast/Container";
import NavigationMenu from "./components/Navbar"
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Footer from "./components/Footer";
import Register from "./pages/Register";
import AuthService from "./services/auth.service";

function PrivateRoute({ children }) {
  const auth = AuthService.getCurrentUser()
  return auth ? children : <Navigate to="/login" />;
}

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
       
            <Route path="library" element={<PrivateRoute><Library /></PrivateRoute>} />
            <Route path="books/:id" element={<BookDetails />} />
            <Route exact path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="profile/:name" element={<Profile />} />

            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
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
