import { Routes, Route, Navigate, useLocation, useNavigate} from "react-router-dom";
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
import SidebarNav from "./components/SidebarNav";
import Verify from "./pages/Verify";
import Settings from "./pages/Settings";
import globalRouter from "./GlobalRouter";
import { AnimatePresence } from "framer-motion";

function PrivateRoute({ children }) {
  const auth = AuthService.getCurrentUser()
  return auth ? children : <Navigate to="/login" />;
}

function App() {
  const navigate = useNavigate();
  globalRouter.navigate = navigate;

  let location = useLocation();

  return (
    <div className="min-h-screen">
    <div className="flex flex-row">
      {AuthService.getCurrentUser() &&
      <div className="basis-1/12">
        <SidebarNav />
      </div>
      }
      <div className="mx-auto pt-10 basis-full">

        {!AuthService.getCurrentUser() &&
          location.pathname != "/library"  &&
            <NavigationMenu />
        
        }
        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            <Route path="/">
              <Route index element={<Home/>} />
        
              <Route path="library" element={<PrivateRoute><Library /></PrivateRoute>} />
              <Route path="books/:id" element={<BookDetails />} />
              <Route exact path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="profile/:name" element={<Profile />} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="verify" element={<Verify />} />

            </Route>
          </Routes>
        </AnimatePresence>
      </div>
    </div>
    <Footer />
    <ToastContainer />
    </div>
  )
}

export default App
