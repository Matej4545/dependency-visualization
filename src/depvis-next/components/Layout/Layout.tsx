import { Container } from 'react-bootstrap';
import MainNavBar from '../NavBar/MainNavBar';

export const Layout = (props: any) => {
  return (
    <div>
      <MainNavBar />
      <main>{props.children}</main>
    </div>
  );
};
