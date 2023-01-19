import { gql, useQuery } from '@apollo/client';
import { Container } from 'react-bootstrap';
import { GetComponentRepositoryURL } from '../../helpers/WorkspaceHelper';
import Loading from '../Loading/Loading';

const getComponentDetailsQuery = gql`
  query componentDetails($componentPurl: String, $projectId: ID) {
    components(where: { purl: $componentPurl, project_SINGLE: { id: $projectId } }) {
      name
      purl
      author
      version
      dependsOnCount
    }
  }
`;
const ComponentDetails = (props) => {
  const { componentId, projectId } = props;
  const { data, loading } = useQuery(getComponentDetailsQuery, {
    variables: { componentPurl: componentId, projectId: projectId },
  });

  if (loading) return <Loading />;
  if (!data.components[0]) return <b>No data found!</b>;
  return (
    <Container style={{ wordBreak: 'break-all' }} className="px-0">
      <h5>Component details</h5>
      <span>
        <b>Name:</b> {data.components[0].name}
      </span>
      <br />
      <span>
        <b>PURL:</b> {data.components[0].purl}
      </span>
      <br />
      <span>
        <b>Version:</b> {data.components[0].version}
      </span>
      <br />
      <span>
        <b>Author:</b> {data.components[0].author}
      </span>
      <br />
      <span>
        <b>Dependencies:</b> {data.components[0].dependsOnCount}
      </span>
      <br />
        <span>
            Link: <a href={GetComponentRepositoryURL(data.components[0].purl)} target="_blank">Repository</a>
        </span>
      <br />
    </Container>
  );
};

export default ComponentDetails;
