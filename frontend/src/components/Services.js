import React from "react";
import styled from "styled-components";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

const Services = () => {
  const features = [
    {
      icon: Truck,
      title: "Free Delivery",
      description: "Orders above ₹2000"
    },
    {
      icon: RotateCcw,
      title: "30 Days Return",
      description: "Easy returns"
    },
    {
      icon: ShieldCheck,
      title: "Secure Payment",
      description: "100% protected"
    }
  ];

  return (
    <Wrapper>
      <div className="container">
        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FeatureCard key={index} delay={index * 100}>
                <IconCircle>
                  <Icon size={36} strokeWidth={1.5} />
                </IconCircle>
                <ContentBox>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </ContentBox>
              </FeatureCard>
            );
          })}
        </div>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 4rem 0;
  background: #FFF9F0;
  position: relative;

  .container {
    max-width: 120rem;
    margin: 0 auto;
    padding: 0 3rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
  }

  @media (max-width: 968px) {
    padding: 3rem 0;
    
    .features-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .container {
      padding: 0 2rem;
    }
  }
`;

const FeatureCard = styled.div`
  background: #FFFFFF;
  border-radius: 16px;
  padding: 3rem 2.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  
  /* Fade-in animation */
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: ${props => props.delay}ms;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 968px) {
    padding: 2.5rem 2rem;
  }
`;

const IconCircle = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #FFF3E6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: #F7931E;
  transition: all 0.3s ease;
  
  ${FeatureCard}:hover & {
    transform: scale(1.05);
    background: #FFE8CC;
  }

  svg {
    stroke-width: 1.5;
  }
`;

const ContentBox = styled.div`
  h3 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #2D2D2D;
    margin: 0 0 0.8rem 0;
    transition: color 0.3s ease;
    font-family: 'Playfair Display', serif;
  }

  p {
    font-size: 1.4rem;
    color: #888888;
    margin: 0;
    line-height: 1.6;
    font-weight: 400;
  }

  ${FeatureCard}:hover h3 {
    color: #F7931E;
  }
`;

export default Services;