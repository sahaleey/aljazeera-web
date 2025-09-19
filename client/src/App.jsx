import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import IntroScreen from "./components/IntroScreen";
import Home from "./pages/Home";
import BlogList from "./pages/BlogList";
import SubmitBlog from "./pages/SubmitBlog";
import ArticlePage from "./pages/ArticlePage";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import AuthenticatorDashboard from "./pages/AuthenticatorDashboard";
import Signup from "./components/Signup";
import CommunityPoints from "./pages/CommunityPointsPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  const [userEmail, setUserEmail] = useState("");
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email || "");
    });

    return () => unsubscribe();
  }, []);

  // Hide Navbar and Footer on the IntroScreen route
  const hideLayout = location.pathname === "/";

  return (
    <div className="">
      <Toaster position="top-left" reverseOrder={false} />
      {!hideLayout && <Navbar userEmail={userEmail} />}

      <Routes>
        <Route path="/" element={<IntroScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/blogs" element={<BlogList userEmail={userEmail} />} />
        <Route path="/submit" element={<SubmitBlog userEmail={userEmail} />} />
        <Route path="admin-dashboard" element={<AuthenticatorDashboard />} />
        <Route
          path="/community-points"
          element={<CommunityPoints userEmail={userEmail} />}
        />
        <Route
          path="/blog/:slug"
          element={<ArticlePage userEmail={userEmail} />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={<Dashboard userEmail={userEmail} />}
        />
        <Route path="/profile/:email" element={<ProfilePage />} />
      </Routes>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
