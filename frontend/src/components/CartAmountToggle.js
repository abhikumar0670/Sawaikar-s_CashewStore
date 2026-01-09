import React from "react";
import styled from "styled-components";
import { FaMinus, FaPlus } from "react-icons/fa";

const CartAmountToggle = ({ amount, setDecrease, setIncrease }) => {
  return (
    <QuantityWrapper>
      <button className="minus-btn" onClick={() => setDecrease()}>
        <FaMinus />
      </button>
      <div className="quantity-display">{amount}</div>
      <button className="plus-btn" onClick={() => setIncrease()}>
        <FaPlus />
      </button>
    </QuantityWrapper>
  );
};

const QuantityWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border: 2px solid #d97706;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  width: fit-content;

  button {
    width: 50px;
    height: 45px;
    border: none;
    background: white;
    color: #d97706;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    font-weight: 600;
    transition: all 0.2s ease;

    &:hover {
      background: #fef3e2;
    }

    &:active {
      background: #fde8cc;
    }
  }

  .minus-btn {
    border-right: 2px solid #d97706;
  }

  .plus-btn {
    border-left: 2px solid #d97706;
  }

  .quantity-display {
    width: 50px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    font-weight: 600;
    color: #2d2d2d;
    background: white;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;

    button {
      width: 42px;
      height: 40px;
      font-size: 1.4rem;
    }

    .quantity-display {
      width: 42px;
      height: 40px;
      font-size: 1.4rem;
    }
  }
`;

export default CartAmountToggle;