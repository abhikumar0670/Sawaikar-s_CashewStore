import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * LazyImage - A performant image component with lazy loading
 * 
 * Features:
 * - Intersection Observer for lazy loading
 * - Smooth fade-in animation
 * - Placeholder blur effect
 * - Error handling with fallback
 * - Loading skeleton
 */

const LazyImage = ({ 
  src, 
  alt, 
  className, 
  placeholder,
  fallbackSrc = '/images/placeholder.jpg',
  aspectRatio,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  return (
    <ImageWrapper 
      ref={imgRef} 
      className={className}
      $aspectRatio={aspectRatio}
      {...props}
    >
      {/* Loading Skeleton */}
      {!isLoaded && (
        <Skeleton>
          <SkeletonShimmer />
        </Skeleton>
      )}
      
      {/* Actual Image */}
      {isInView && (
        <StyledImage
          src={error ? fallbackSrc : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          $isLoaded={isLoaded}
          loading="lazy"
          decoding="async"
        />
      )}
    </ImageWrapper>
  );
};

// Animations
const shimmer = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Styled Components
const ImageWrapper = styled.div`
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
  ${props => props.$aspectRatio && `
    aspect-ratio: ${props.$aspectRatio};
  `}
`;

const Skeleton = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  overflow: hidden;
`;

const SkeletonShimmer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: ${shimmer} 1.5s infinite;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: ${props => props.$isLoaded ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
  animation: ${props => props.$isLoaded ? fadeIn : 'none'} 0.3s ease-in-out;
`;

export default LazyImage;
