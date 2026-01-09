import { NavLink } from "react-router-dom";
import styled from "styled-components";
import FormatPrice from "../Helpers/FormatPrice";
import { Button } from "../styles/Button";

const ListView = ({ products }) => {
  return (
    <Wrapper className="section">
      <div className="container grid">
        {products.map((curElem) => {
          const { id, name, image, price, description } = curElem;
          // Get the first image if it's an array, otherwise use the image directly
          const displayImage = Array.isArray(image) ? image[0] : image;
          return (
            <div className="card grid grid-two-column" key={id}>
              <figure>
                <img src={displayImage} alt={name} />
              </figure>

              <div className="card-data">
                <h3>{name}</h3>
                <p>
                  <FormatPrice price={price} />
                </p>
                <p>{description.slice(0, 90)}...</p>

                <NavLink to={`/singleproduct/${id}`} className="btn-main">
                  <Button className="btn">Read More</Button>
                </NavLink>
              </div>
            </div>
          );
        })}
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 3rem 0;
  background: transparent;

  .container {
    max-width: 120rem;
    margin: 0 auto;
  }

  .grid {
    gap: 2.5rem;
  }

  .card {
    background: #fff;
    border-radius: 1.2rem;
    overflow: hidden;
    border: 1px solid rgba(139, 69, 19, 0.08);
    display: grid;
    grid-template-columns: 30rem 1fr;
    transition: all 0.35s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 28px rgba(139, 69, 19, 0.12);
      border-color: rgba(139, 69, 19, 0.15);

      figure img {
        transform: scale(1.05);
      }
    }
  }

  figure {
    width: 100%;
    height: 20rem;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #FFF8DC 0%, #f5f0e1 100%);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
  }

  .card-data {
    padding: 2rem 2.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;

    h3 {
      margin: 0 0 1rem 0;
      font-weight: 600;
      font-size: 2rem;
      text-transform: capitalize;
      color: ${({ theme }) => theme.colors.heading};
    }

    p {
      font-size: 1.5rem;
      line-height: 1.6;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 0.8rem;

      &:first-of-type {
        font-size: 1.8rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.helper};
      }
    }
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 2.5rem;
    background: transparent;
    border: 2px solid ${({ theme }) => theme.colors.btn};
    color: ${({ theme }) => theme.colors.btn};
    border-radius: 0.6rem;
    font-size: 1.4rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05rem;
    transition: all 0.3s ease;
    width: fit-content;
    margin-top: 1rem;

    &:hover {
      background: ${({ theme }) => theme.colors.btn};
      color: #fff;
      transform: translateY(-2px);
    }
  }

  @media (max-width: 768px) {
    padding: 2rem 0;

    .card {
      grid-template-columns: 1fr;
    }

    figure {
      height: 18rem;
    }

    .card-data {
      padding: 1.5rem 2rem;
    }
  }
`;

export default ListView;