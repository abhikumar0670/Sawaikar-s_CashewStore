import { createContext, useContext, useEffect, useReducer } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import reducer from "../Reducer/productReducer";

const AppContext = createContext();

// Backend API endpoint - uses environment variable for production
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API = `${API_BASE}/products`;

const initialState = {
  isLoading: false,
  isError: false,
  products: [],
  featureProducts: [],
  isSingleLoading: false,
  singleProduct: {},
};

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch all products from the backend
  const getProducts = async (url) => {
    dispatch({ type: "SET_LOADING" });
    try {
      const res = await axios.get(url);
      const products = res.data;
      
      console.log('Products fetched from backend:', products.length);
      
      if (!Array.isArray(products)) {
        console.error('API did not return an array:', products);
        dispatch({ type: "API_ERROR" });
        toast.error('Failed to fetch products');
        return;
      }
      
      dispatch({ type: "SET_API_DATA", payload: products });
    } catch (error) {
      console.error('API Error:', error);
      dispatch({ type: "API_ERROR" });
      toast.error('Failed to fetch products. Please try again.');
    }
  };

  // Fetch a single product by ID from the backend
  const getSingleProduct = async (productId) => {
    console.log('getSingleProduct called with productId:', productId);
    dispatch({ type: "SET_SINGLE_LOADING" });
    try {
      const res = await axios.get(`${API}/${productId}`);
      const singleProduct = res.data;
      
      console.log('Single product fetched:', singleProduct);
      
      if (singleProduct) {
        dispatch({ type: "SET_SINGLE_PRODUCT", payload: singleProduct });
      } else {
        dispatch({ type: "SET_SINGLE_ERROR" });
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching single product:', error);
      dispatch({ type: "SET_SINGLE_ERROR" });
      toast.error('Failed to fetch product details');
    }
  };

  useEffect(() => {
    getProducts(API);
  }, []);

  return (
    <AppContext.Provider value={{ ...state, getSingleProduct }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hooks
const useProductContext = () => {
  return useContext(AppContext);
};

export { AppProvider, AppContext, useProductContext };
