import { Routes, Route, Navigate, useLocation, useNavigate} from "react-router-dom";
import BookDetails from "./pages/BookDetails";
import Library from "./pages/Library";
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
import { useEffect } from "react";
import { useThemeMode } from "flowbite-react";
import i18n from "./i18n";

function PrivateRoute({ children }) {
  const auth = AuthService.getCurrentUser()
  return auth ? children : <Navigate to="/login" />;
}

function App() {
  const navigate = useNavigate();
  globalRouter.navigate = navigate;
  const mode = useThemeMode();

  let location = useLocation();

  // Set the theme based on localStorage if it exists.
  useEffect(() => {
    if(localStorage.getItem("flowbite-theme-mode") === "dark") {
      mode.setMode("dark");
    } else if(localStorage.getItem("flowbite-theme-mode") === "light") {
      mode.setMode("light");
    }

    if(!localStorage.getItem("flowbite-theme-mode")) {
      localStorage.setItem("flowbite-theme-mode", "light");
    }
  }, []);

  // Change dir of the document when the language updates
  useEffect(() => {
    const setDir = () => {
      document.documentElement.setAttribute(
        "dir",
        i18n.language === "ar" ? "rtl" : "ltr"
      );
    };

    setDir(); // Set initial direction

    i18n.on("languageChanged", setDir); // Listen for language changes

    return () => {
      i18n.off("languageChanged", setDir); // Clean up the listener
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount


  return (
    <div className="min-h-screen">
    <div className="flex flex-row">
      {AuthService.getCurrentUser() &&
        <SidebarNav />
      }
      <div className="container mx-auto p-4 sm:p-8 md:p-16">

        {!AuthService.getCurrentUser() &&
          location.pathname != "/library"  &&
            <NavigationMenu />
        
        }
        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            <Route path="/">
              <Route index element={<Login />} />
        
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
