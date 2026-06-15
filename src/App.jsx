import { useState, useEffect } from "react";

import MenuPage from "./pages/MenuPage";


export default function App() {
  const [activePage, setActivePage] = useState("#menu");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || "#menu";
      setActivePage(hash);
    };

    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "#menu":
        return <MenuPage />;
      default:
        return <MenuPage />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <main>{renderPage()}</main>
    </div>
  );
}