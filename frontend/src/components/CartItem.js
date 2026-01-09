import React, { useState } from "react";
import styled from "styled-components";
import FormatPrice from "../Helpers/FormatPrice";
import CartAmountToggle from "./CartAmountToggle";
import { FaTrash } from "react-icons/fa";
import { useCartContext } from "../context/cart_context";
import { notifyRemoveFromCart } from "../utils/customToast";

const CartItem = ({ id, name, image, color, price, amount, weight }) => {
  const { removeItem, setDecrease, setIncrement } = useCartContext();

  // Handler to remove item with toast notification
  const handleRemoveItem = () => {
    removeItem(id);
    notifyRemoveFromCart(); // 🔴 Red toast with trash icon
  };

  return (
    <CartItemWrapper className="grid grid-five-column">
      <div className="cart-image--name">
        <div>
          <figure>
            <img src={image} alt={name} />
          </figure>
        </div>
        <div>
          <p>{name}</p>
          {weight && <span className="weight-badge">{weight}</span>}
        </div>
      </div>
      {/* price   */}
      <div className="cart-hide">
        <p>
          <FormatPrice price={price} />
        </p>
      </div>

      {/* Quantity  */}
      <CartAmountToggle
        amount={amount}
        setDecrease={() => setDecrease(id)}
        setIncrease={() => setIncrement(id)}
      />

      {/* //Subtotal */}
      <div className="cart-hide">
        <p>
          <FormatPrice price={price * amount} />
        </p>
      </div>

      <div>
        <FaTrash className="remove_icon" onClick={handleRemoveItem} />
      </div>
    </CartItemWrapper>
  );
};

const CartItemWrapper = styled.div`
  padding: 2rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }

  .cart-image--name {
    display: flex;
    align-items: center;
    gap: 1.5rem;

    figure {
      margin: 0;
    }

    p {
      font-size: 1.5rem;
      font-weight: 500;
      color: #2d2d2d;
      margin: 0;
    }
    
    .weight-badge {
      display: inline-block;
      background: linear-gradient(135deg, #8B4513 0%, #CD853F 100%);
      color: white;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 0.5rem;
    }
  }

  .cart-hide {
    p {
      font-size: 1.5rem;
      font-weight: 600;
      color: #4a4a4a;
      margin: 0;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 0;
  }
`;

export default CartItem;