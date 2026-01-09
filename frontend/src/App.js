import React, { useEffect, useRef } from "react";
import {BrowserRouter,Routes,Route,useLocation} from 'react-router-dom'
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast';
import About from "./About";
import Home from "./Home";
import Products from "./Products";
import Contact from './Contact'
import Cart from "./Cart";
import OrderConfirmation from './OrderConfirmation';
import SingleProduct from './SingleProduct'
import Orders from './Orders';
import Wishlist from './Wishlist';
import FAQ from './FAQ';
import Payment from './Payment';
import OrderSuccess from './OrderSuccess';
import Error from "./Error";
import Profile from './Profile';
import PaymentHistoryPage from './PaymentHistoryPage';
import AdminProduct from './AdminProduct';
import { GlobalStyle } from "./GlobalStyle";
import { ThemeProvider } from "styled-components";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GoToTop from "./components/GoToTop";
import TawkToChat from "./components/TawkToChat";
import "./styles/WidgetPositioning.css";

// User sync component - syncs Clerk user to MongoDB (only once per session)
const UserSync = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && isSignedIn && user && !hasSynced.current) {
        hasSynced.current = true;
        try {
          await axios.post('http://localhost:5000/api/users/sync', {
            clerkId: user.id,
            name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.primaryEmailAddress?.emailAddress || ''
          });
          console.log('✅ User synced to MongoDB');
        } catch (error) {
          console.error('❌ User sync error:', error);
          toast.error('Failed to sync user data');
        }
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user]);

  return null;
};

// Layout wrapper to conditionally show header/footer
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Header />}
      {children}
      {!isAdminPage && <GoToTop />}
      {!isAdminPage && <TawkToChat />}
      {!isAdminPage && <Footer />}
    </>
  );
};

const App = () => {
  const theme = {
    colors: {
      heading: "rgb(24 24 29)",
      text: "rgba(29 ,29, 29, .8)",
      white: "#fff",
      black: " #212529",
      helper: "#D2691E", // Warm cashew orange

      bg: "#FFF8DC", // Cornsilk - warm cream color like cashews
      footer_bg: "#8B4513", // Saddle brown - earthy cashew brown
      btn: "#CD853F", // Peru - warm cashew color
      border: "rgba(205, 133, 63, 0.5)", // Peru with transparency
      hr: "#ffffff",
      gradient:
        "linear-gradient(0deg, rgb(210, 180, 140) 0%, rgb(245, 222, 179) 100%)", // Cashew gradient
      shadow:
        "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;",
      shadowSupport: " rgba(0, 0, 0, 0.16) 0px 1px 4px",
    },
    media: {
      mobile: "768px",
      tab: "998px",
    },
  };
  return (
    <ThemeProvider theme={theme}>
    <BrowserRouter>
    <GlobalStyle/>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
    <Toaster position="top-right" />
    <UserSync />
    <Layout>
      {/* Protected Routes - Only visible if logged in */}
      <SignedIn>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/about" element={<About/>}/>
          <Route path="/products" element={<Products/>}/>
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/orders" element={<Orders/>}/>
          <Route path="/wishlist" element={<Wishlist/>}/>
          <Route path="/faq" element={<FAQ/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/payment-history" element={<PaymentHistoryPage/>}/>
          <Route path="/admin" element={<AdminProduct/>}/>
          <Route path="/admin/products" element={<AdminProduct/>}/>
          <Route path="/singleproduct/:id" element={<SingleProduct />} />
          <Route path="/cart" element={<Cart/>}/>
          <Route path="/payment" element={<Payment/>}/>
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="*" element={<Error/>}/>
        </Routes>
      </SignedIn>
      
      {/* Redirect to Clerk Sign In if not logged in */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </Layout>
    </BrowserRouter>
    </ThemeProvider>
  );
}; 

export default App;
