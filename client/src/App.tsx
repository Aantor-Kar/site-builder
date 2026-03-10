import Home from "./pages/Home";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Pricing from "./pages/Pricing";
import Projects from "./pages/Projects";
import MyProjects from "./pages/MyProjects";
import Preview from "./pages/Preview";
import Community from "./pages/Community";
import View from "./pages/View";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import AuthPage from "./pages/auth/AuthPage"
import Settings from "./pages/Settings"

const App = () => {
  const { pathname } = useLocation();
  const hideNavbar =
    (pathname.startsWith("/projects/") && pathname !== "/projects") ||
    pathname.startsWith("/view/") ||
    pathname.startsWith("/preview/");
  return (
    <div>
      <Toaster />
      <div className="routes">
        {!hideNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/projects/:projectId" element={<Projects />} />
          <Route path="/projects" element={<MyProjects />} />
          <Route path="/preview/:projectId" element={<Preview />} />
          <Route path="/preview/:projectId/:versionId" element={<Preview />} />
          <Route path="/community" element={<Community />} />
          <Route path="/view/:projectId" element={<View />} />
          <Route path="/auth/:pathname" element={<AuthPage />} />
          <Route path="/account/settings" element={<Settings />} />
        </Routes>
      </div>
      <hr className="text-[#4e059b] opacity-60" />
      <Footer />
    </div>
  );
};

export default App;
