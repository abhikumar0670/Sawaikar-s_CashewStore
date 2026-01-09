import { createContext, useContext, useEffect, useReducer } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import reducer from "../Reducer/productReducer";

const AppContext = createContext();

// Backend API endpoint
const API = "http://localhost:5000/api/products";

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
  // Fetches a single product by ID from the backend API
  const getSingleProduct = async (productId) => {
    dispatch({ type: "SET_SINGLE_LOADING" });
    try {
      const res = await axios.get(`${API}/${productId}`);
      const singleProduct = res.data;
      
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
