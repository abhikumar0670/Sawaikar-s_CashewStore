import styled from "styled-components";

export const Button = styled.button`
  text-decoration: none;
  max-width: auto;
  background-color: ${({ theme }) => theme.colors.btn};
  color: rgb(255 255 255);
  padding: 1.4rem 2.4rem;
  border: none;
  text-transform: uppercase;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-transition: all 0.3s ease 0s;
  -moz-transition: all 0.3s ease 0s;
  -o-transition: all 0.3s ease 0s;
  /* Softer, organic rounded corners */
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;

  &:hover,
  &:active {
    box-shadow: 0 8px 25px rgba(139, 69, 19, 0.25);
    transform: scale(0.96);
    background-color: #7A3D10;
  }

  a {
    text-decoration: none;
    color: rgb(255 255 255);
    font-size: 1.8rem;
  }
`;
