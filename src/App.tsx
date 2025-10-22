import { useState } from "react";
import { Route, Routes, useLocation } from "react-router";
import Header from "./components/Header/Header";
import HomePage from "./pages/home/home";
import ProductDetailsPage from "./pages/product-details/product-details";
import CartPage from "./pages/cart/cart";
import SearchBar from "./components/SearchBar/SearchBar";
import BackButton from "./components/BackButton/BackButton";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const { pathname } = useLocation();

  return (
    <>
      <Header />
      {pathname === "/" && (
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}
      {pathname.includes("/details/") && <BackButton />}
      <main>
        <Routes>
          <Route path='/' element={<HomePage searchTerm={searchTerm} />} />
          <Route path='/details/:id' element={<ProductDetailsPage />} />
          <Route path='/cart' element={<CartPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
