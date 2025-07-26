import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { FaPen } from "react-icons/fa";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        return;
      }

      try {
        const token = await currentUser.getIdToken(true);
        const res = await axios.get(
          "https://aljazeera-web-my5l.onrender.com/api/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user from backend:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    { path: "/home", label: "الرئيسية" },
    { path: "/blogs", label: "المقالات" },
    { path: "/community-points", label: "نقاط المجتمعات" },
    {
      path: "/submit",
      label: "أضف مقالتك",
      isButton: true,
      icon: <FaPen className="inline-block mr-1" />,
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link
            to="/home"
            className="text-2xl font-bold hover:text-green-200 transition-all duration-300"
          >
            <span className="inline-block hover:rotate-1 transition-transform duration-200">
              القرطاسية
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            {navItems.map((item, index) =>
              item.isButton ? (
                <Link
                  key={index}
                  to={item.path}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                  {item.label}
                  {item.icon}
                </Link>
              ) : (
                <Link
                  key={index}
                  to={item.path}
                  className="relative group px-3 py-2 hover:text-green-200 transition-all duration-300 whitespace-nowrap"
                >
                  {item.label}
                  <span className="absolute left-1/2 bottom-0 w-0 h-0.5 bg-green-200 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
                </Link>
              )
            )}

            {!user ? (
              <Link
                to="/login"
                className="px-4 py-2 bg-white text-green-700 hover:bg-gray-100 rounded-lg transition duration-300"
              >
                تسجيل الدخول
              </Link>
            ) : (
              <Link
                to="/dashboard"
                title={user.name || user.email}
                className="w-9 h-9 rounded-full overflow-hidden bg-white flex items-center justify-center hover:ring-2 hover:ring-green-600 transition"
              >
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt="User"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-green-700 font-bold">
                    {user.name
                      ? user.name.charAt(0)
                      : user.email.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-xl p-2 rounded-md hover:bg-green-600 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 bg-green-700 rounded-lg shadow-xl py-2 animate-fadeIn">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`block py-3 px-4 transition-all duration-300 ${
                  item.isButton
                    ? "bg-green-600 hover:bg-green-500 text-center mx-4 my-2 rounded-lg"
                    : "hover:bg-green-600 hover:pl-6"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {!user ? (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 px-4 hover:bg-green-600 hover:pl-6 transition-all duration-300"
              >
                تسجيل الدخول
              </Link>
            ) : (
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 hover:bg-green-600 transition"
              >
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-white text-green-700 font-bold rounded-full flex items-center justify-center">
                    {user.name
                      ? user.name.charAt(0)
                      : user.email.charAt(0).toUpperCase()}
                  </div>
                )}
                <p className="text-sm truncate max-w-[130px]">
                  {user.name || user.email}
                </p>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
