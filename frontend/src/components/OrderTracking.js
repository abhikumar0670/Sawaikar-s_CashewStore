import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPackage, FiCheck, FiTruck, FiHome, FiClock, FiAlertCircle, FiMapPin, FiRefreshCw } from 'react-icons/fi';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const OrderTracking = ({ orderId, onReorder }) => {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusConfig = {
    placed: { icon: FiPackage, color: '#6366f1', label: 'Order Placed' },
    confirmed: { icon: FiCheck, color: '#8b5cf6', label: 'Confirmed' },
    processing: { icon: FiClock, color: '#f59e0b', label: 'Processing' },
    shipped: { icon: FiTruck, color: '#3b82f6', label: 'Shipped' },
    out_for_delivery: { icon: FiMapPin, color: '#10b981', label: 'Out for Delivery' },
    delivered: { icon: FiHome, color: '#22c55e', label: 'Delivered' },
    cancelled: { icon: FiAlertCircle, color: '#ef4444', label: 'Cancelled' },
    returned: { icon: FiRefreshCw, color: '#f97316', label: 'Returned' }
  };

  const statusOrder = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

  useEffect(() => {
    if (orderId) {
      fetchTimeline();
    }
  }, [orderId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/orders/${orderId}/timeline`);
      const data = await res.json();
      
      if (res.ok) {
        setTimeline(data);
      } else {
        setError(data.message || 'Failed to fetch tracking info');
      }
    } catch (err) {
      setError('Error loading tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatusIndex = () => {
    if (!timeline) return -1;
    if (timeline.currentStatus === 'cancelled' || timeline.currentStatus === 'returned') {
      return -2; // Special case
    }
    return statusOrder.indexOf(timeline.currentStatus);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <FiTruck className="spin" />
        <span>Loading tracking info...</span>
      </LoadingWrapper>
    );
  }

  if (error) {
    return (
      <ErrorWrapper>
        <FiAlertCircle />
        <span>{error}</span>
      </ErrorWrapper>
    );
  }

  const currentIndex = getCurrentStatusIndex();
  const isCancelled = timeline?.currentStatus === 'cancelled';
  const isReturned = timeline?.currentStatus === 'returned';

  return (
    <TrackingWrapper>
      <TrackingHeader>
        <h3>Order Tracking</h3>
        <OrderId>Order #{orderId}</OrderId>
      </TrackingHeader>

      {/* Tracking Info Bar */}
      {timeline?.trackingNumber && (
        <TrackingInfo>
          <div>
            <label>Tracking Number:</label>
            <span>{timeline.trackingNumber}</span>
          </div>
          {timeline.shippingCarrier && (
            <div>
              <label>Carrier:</label>
              <span>{timeline.shippingCarrier.toUpperCase()}</span>
            </div>
          )}
        </TrackingInfo>
      )}

      {/* Estimated Delivery */}
      {timeline?.estimatedDelivery && !isCancelled && (
        <EstimatedDelivery>
          <FiClock />
          <span>
            Estimated Delivery: <strong>{formatDate(timeline.estimatedDelivery)}</strong>
          </span>
        </EstimatedDelivery>
      )}

      {/* Progress Steps */}
      {!isCancelled && !isReturned ? (
        <ProgressSteps>
          {statusOrder.map((status, index) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <ProgressStep key={status} $completed={isCompleted} $current={isCurrent}>
                <StepIcon $completed={isCompleted} $current={isCurrent} $color={config.color}>
                  <Icon />
                </StepIcon>
                <StepLabel $completed={isCompleted}>{config.label}</StepLabel>
                {index < statusOrder.length - 1 && (
                  <StepLine $completed={index < currentIndex} />
                )}
              </ProgressStep>
            );
          })}
        </ProgressSteps>
      ) : (
        <CancelledBanner $returned={isReturned}>
          {isCancelled ? <FiAlertCircle /> : <FiRefreshCw />}
          <span>Order {isCancelled ? 'Cancelled' : 'Returned'}</span>
        </CancelledBanner>
      )}

      {/* Detailed Timeline */}
      {timeline?.timeline && timeline.timeline.length > 0 && (
        <DetailedTimeline>
          <h4>Status History</h4>
          {timeline.timeline.map((entry, index) => {
            const config = statusConfig[entry.status] || statusConfig.processing;
            const Icon = config.icon;

            return (
              <TimelineEntry key={index}>
                <TimelineIcon $color={config.color}>
                  <Icon />
                </TimelineIcon>
                <TimelineContent>
                  <TimelineStatus>{config.label}</TimelineStatus>
                  {entry.message && <TimelineMessage>{entry.message}</TimelineMessage>}
                  {entry.location && (
                    <TimelineLocation>
                      <FiMapPin /> {entry.location}
                    </TimelineLocation>
                  )}
                  <TimelineDate>{formatDate(entry.timestamp)}</TimelineDate>
                </TimelineContent>
              </TimelineEntry>
            );
          })}
        </DetailedTimeline>
      )}

      {/* Reorder Button */}
      {(timeline?.currentStatus === 'delivered' || isCancelled) && onReorder && (
        <ReorderButton onClick={() => onReorder(orderId)}>
          <FiRefreshCw />
          Reorder
        </ReorderButton>
      )}
    </TrackingWrapper>
  );
};

const TrackingWrapper = styled.div`
  background: linear-gradient(135deg, #fdfcfb 0%, #f8f6f3 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(139, 90, 43, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

const TrackingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    color: #8b5a2b;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }
`;

const OrderId = styled.span`
  background: rgba(139, 90, 43, 0.1);
  color: #8b5a2b;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
`;

const TrackingInfo = styled.div`
  display: flex;
  gap: 24px;
  background: white;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;

  div {
    display: flex;
    gap: 8px;

    label {
      color: #666;
      font-size: 0.85rem;
    }

    span {
      color: #333;
      font-weight: 600;
      font-size: 0.85rem;
    }
  }
`;

const EstimatedDelivery = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 24px;

  svg {
    width: 18px;
    height: 18px;
  }

  strong {
    margin-left: 4px;
  }
`;

const ProgressSteps = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-bottom: 32px;
  padding: 0 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 0;
  }
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: row;
    gap: 16px;
  }
`;

const StepIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$completed ? props.$color : '#e5e7eb'};
  color: ${props => props.$completed ? 'white' : '#9ca3af'};
  border: 3px solid ${props => props.$current ? props.$color : 'transparent'};
  transition: all 0.3s ease;
  z-index: 1;

  svg {
    width: 22px;
    height: 22px;
  }

  ${props => props.$current && `
    box-shadow: 0 0 0 4px rgba(139, 90, 43, 0.2);
    animation: pulse 2s infinite;
  `}

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 4px rgba(139, 90, 43, 0.2); }
    50% { box-shadow: 0 0 0 8px rgba(139, 90, 43, 0.1); }
  }
`;

const StepLabel = styled.span`
  margin-top: 8px;
  font-size: 0.75rem;
  color: ${props => props.$completed ? '#374151' : '#9ca3af'};
  font-weight: ${props => props.$completed ? '600' : '400'};
  text-align: center;
  white-space: nowrap;

  @media (max-width: 768px) {
    margin-top: 0;
    font-size: 0.9rem;
  }
`;

const StepLine = styled.div`
  position: absolute;
  top: 24px;
  left: calc(50% + 24px);
  width: calc(100% - 48px);
  height: 3px;
  background: ${props => props.$completed ? '#8b5a2b' : '#e5e7eb'};
  transition: background 0.3s ease;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CancelledBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background: ${props => props.$returned ? '#fff7ed' : '#fef2f2'};
  border: 1px solid ${props => props.$returned ? '#fed7aa' : '#fecaca'};
  border-radius: 12px;
  margin-bottom: 24px;

  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.$returned ? '#f97316' : '#ef4444'};
  }

  span {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => props.$returned ? '#c2410c' : '#dc2626'};
  }
`;

const DetailedTimeline = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;

  h4 {
    color: #374151;
    font-size: 1rem;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }
`;

const TimelineEntry = styled.div`
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px dashed #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const TimelineIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineStatus = styled.div`
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
`;

const TimelineMessage = styled.div`
  color: #6b7280;
  font-size: 0.85rem;
  margin-top: 4px;
`;

const TimelineLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #9ca3af;
  font-size: 0.8rem;
  margin-top: 4px;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const TimelineDate = styled.div`
  color: #9ca3af;
  font-size: 0.75rem;
  margin-top: 6px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #8b5a2b;

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: #fef2f2;
  border-radius: 10px;
  color: #ef4444;
`;

const ReorderButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  margin-top: 20px;
  background: linear-gradient(135deg, #8b5a2b 0%, #a0522d 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(139, 90, 43, 0.4);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export default OrderTracking;
