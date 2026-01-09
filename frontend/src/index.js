import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AppProvider } from "./context/productContext";
import { FilterContextProvider } from "./context/filter_context";
import { CartProvider } from "./context/cart_context";
import { WishlistProvider } from "./context/wishlist_context";
import { AuthProvider } from "./context/auth_context";
import { ClerkProvider } from "@clerk/clerk-react";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Get Clerk publishable key from environment variable
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || "pk_test_c2VjdXJlLWJ1cnJvLTQuY2xlcmsuYWNjb3VudHMuZGV2JA";

root.render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <AuthProvider>
      <AppProvider>
        <FilterContextProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </CartProvider>
        </FilterContextProvider>
      </AppProvider>
    </AuthProvider>
  </ClerkProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();