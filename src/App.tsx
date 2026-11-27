import { lazy, Suspense, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router";
import Header from "./components/Header/Header";
import HomePage from "./pages/home/home";
import SearchBar from "./components/SearchBar/SearchBar";
import BackButton from "./components/BackButton/BackButton";

// Home is the landing route and stays in the main bundle; the rest are split.
const ProductDetailsPage = lazy(
  () => import("./pages/product-details/product-details"),
);
const CartPage = lazy(() => import("./pages/cart/cart"));

const NotFoundPage = () => (
  <section>
    <title>Page not found | Mobile Shop</title>
    <h2>Page not found</h2>
    <p>
      <Link to='/'>Back to the catalog</Link>
    </p>
  </section>
);

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const { pathname } = useLocation();

  return (
    <>
      <Header />
      {pathname === "/" ? (
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      ) : (
        <BackButton />
      )}
      <main>
        <Suspense fallback={<section>Loading...</section>}>
          <Routes>
            <Route path='/' element={<HomePage searchTerm={searchTerm} />} />
            <Route path='/details/:id' element={<ProductDetailsPage />} />
            <Route path='/cart' element={<CartPage />} />
            <Route path='*' element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
    </>
  );
}

export default App;
