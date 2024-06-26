import React, { ReactNode } from "react";
import styled, { css } from "styled-components";

type StyledContainerProps = {
  inIframe?: boolean;
  children: ReactNode;
};

// export const ContainerWrapper = styled.div`
//   width: 100%;
//   height: 100vh;
//   background-color: #f2f1ea;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 0 16px;
//   padding-bottom: 60px;

//   header {
//     text-align: center;
//     margin-top: 1em;
//   }
// `;

const ContainerWrapper = styled.div<{ inIframe?: boolean }>`
  width: 100%;
  height: 100vh;
  background-color: #15121b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  padding-bottom: 60px;
  ${({ inIframe }) =>
    inIframe &&
    css`
      height: auto; /* Adjust styles for iframe mode as needed */
      background-color: transparent; /* Example adjustment */
    `}

  header {
    text-align: center;
    margin-top: 1em;
  }
`;

function StyledContainer({ inIframe, children }: StyledContainerProps) {
  // return inIframe ? children : <ContainerWrapper>{children}</ContainerWrapper>;
  return <ContainerWrapper inIframe={inIframe}>{children}</ContainerWrapper>;
  // return (
  //   <ContainerWrapper>
  //     {inIframe ? <>{children}</> : children}
  //   </ContainerWrapper>
  // );
}

export default StyledContainer;
