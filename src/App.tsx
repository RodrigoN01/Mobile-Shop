import { useState } from "react";
import { Route, Routes } from "react-router";
import Header from "./components/Header/Header";
import HomePage from "./pages/home/home";
import ProductDetailsPage from "./pages/product-details/product-details";
import CartPage from "./pages/cart/cart";
import SearchBar from "./components/SearchBar/SearchBar";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <Header />
      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <main>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/details/:id' element={<ProductDetailsPage />} />
          <Route path='/cart' element={<CartPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
