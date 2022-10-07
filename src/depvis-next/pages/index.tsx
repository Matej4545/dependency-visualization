import dynamic from 'next/dynamic';
import { Alert, Container } from 'react-bootstrap';
import NoSSRGraph from '../components/Graph/NoSSRGraph';

function HomePage() {
  return (
    <>
      <NoSSRGraph background={'#0d0b0b'} />
    </>
  );
}

export default HomePage;
