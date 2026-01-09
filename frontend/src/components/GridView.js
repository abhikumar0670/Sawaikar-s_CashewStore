import React from "react";
import styled from "styled-components";
import Product from "./Product";

const GridView = ({ products }) => {
  return (
    <Wrapper className="section">
      <div className="container grid grid-three-column">
        {products.map((curElem) => {
          return <Product key={curElem.id} {...curElem} />;
        })}
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 3rem 0;
  background: transparent;
  width: 100%;
  overflow: hidden;

  .container {
    max-width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .grid {
    gap: 2rem;
  }

  .grid-three-column {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(26rem, 1fr));
    width: 100%;
  }

  @media (max-width: 768px) {
    padding: 2rem 0;
    
    .grid {
      gap: 2rem;
    }
    
    .grid-three-column {
      grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr));
    }
  }
      a {
        color: rgb(98 84 243);
        font-size: 1.4rem;
      }
    }
  }
`;

export default GridView;