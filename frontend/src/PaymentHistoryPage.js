import React from 'react';
import styled from 'styled-components';
import PaymentHistory from './components/PaymentHistory';
import PageNavigation from './components/PageNavigation';

const PaymentHistoryPage = () => {
  return (
    <Wrapper>
      <PageNavigation title="Payment History" />
      <div className="container">
        <PaymentHistory />
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  .container {
    max-width: 120rem;
    margin: 0 auto;
    padding: 4rem 2rem;
  }
`;

export default PaymentHistoryPage;
