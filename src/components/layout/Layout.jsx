import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: ${props => props.theme.colors.background};
`;

const Layout = ({ children }) => {
  return <LayoutContainer>{children}</LayoutContainer>;
};

export default Layout;