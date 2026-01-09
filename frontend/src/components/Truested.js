import React from 'react'
import styled, { keyframes } from "styled-components";

// Company logos array - Certifications + Partner companies
const companyLogos = [
  // Certification & Quality Badges
  {
    src: "https://raw.githubusercontent.com/abhikumar0670/trusted-brand-logos/main/t1.png",
    alt: "FSSAI Certified"
  },
  {
    src: "https://raw.githubusercontent.com/abhikumar0670/trusted-brand-logos/main/t2.png",
    alt: "USDA Organic"
  },
  {
    src: "https://raw.githubusercontent.com/abhikumar0670/trusted-brand-logos/main/t3.png",
    alt: "ISO Certified"
  },
  {
    src: "https://raw.githubusercontent.com/abhikumar0670/trusted-brand-logos/main/t4.png",
    alt: "GMP Certified"
  },
  {
    src: "https://raw.githubusercontent.com/abhikumar0670/trusted-brand-logos/main/t5.png",
    alt: "Nutco Premium Nuts"
  },
  // Partner Companies
  {
    src: "https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image1.png",
    alt: "DevTech"
  },
  {
    src: "https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image2.png",
    alt: "Starter Labs"
  },
  {
    src: "https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image3.png",
    alt: "Codeberry"
  },
  {
    src: "https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image4.png",
    alt: "Thunderbolt"
  },
  {
    src: "https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image5.png",
    alt: "Suspended"
  },
  {
    src: "https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image6.png",
    alt: "Suspended Media"
  },
  {
    src: "https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image7.png",
    alt: "Starter Labs Pro"
  },
  {
    src: "https://raw.githubusercontent.com/solodev/infinite-logo-carousel/master/images/image8.png",
    alt: "DevTech Pro"
  }
];

const Truested = () => {
  return (
    <Wrapper className="brand-section">
      <div className="container">
        <h3>Trusted By 1000+ Companies</h3>
        <MarqueeWrapper>
          <MarqueeTrack>
            {/* First copy of logos */}
            {companyLogos.map((logo, index) => (
              <LogoSlide key={`logo-1-${index}`}>
                <img src={logo.src} alt={logo.alt} />
              </LogoSlide>
            ))}
            {/* Second copy for seamless loop */}
            {companyLogos.map((logo, index) => (
              <LogoSlide key={`logo-2-${index}`}>
                <img src={logo.src} alt={logo.alt} />
              </LogoSlide>
            ))}
          </MarqueeTrack>
        </MarqueeWrapper>
      </div>
    </Wrapper>
  )
}

// Keyframes for infinite scroll animation
const scroll = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const Wrapper = styled.section`
  padding: 9rem 0;
  background-color: ${({ theme }) => theme.colors.bg};
  
  .container {
    max-width: 120rem;
    margin: 0 auto;
    padding: 0 2rem;
  }
  
  h3 {
    text-align: center;
    text-transform: capitalize;
    color: ${({ theme }) => theme.colors.text};
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 3rem;
  }
`;

const MarqueeWrapper = styled.div`
  overflow: hidden;
  display: flex;
  width: 100%;
  margin-top: 3.2rem;
  
  /* Gradient fade effect on edges */
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 10%,
    black 90%,
    transparent
  );
  mask-image: linear-gradient(
    to right,
    transparent,
    black 10%,
    black 90%,
    transparent
  );
`;

const MarqueeTrack = styled.div`
  display: flex;
  align-items: center;
  animation: ${scroll} 40s linear infinite;
  
  &:hover {
    animation-play-state: paused;
  }
`;

const LogoSlide = styled.div`
  flex-shrink: 0;
  width: 10rem;
  height: 10rem;
  margin: 0 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    filter: grayscale(100%);
    opacity: 0.7;
    transition: all 0.3s ease;
    
    &:hover {
      filter: grayscale(0%);
      opacity: 1;
      transform: scale(1.1);
    }
  }
  
  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    width: 8rem;
    height: 8rem;
    margin: 0 2rem;
  }
`;

export default Truested
