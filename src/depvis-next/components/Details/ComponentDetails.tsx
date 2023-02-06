import { gql, useQuery } from '@apollo/client';
import { Container } from 'react-bootstrap';
import { GetComponentRepositoryURL } from '../../helpers/WorkspaceHelper';
import Loading from '../Loading/Loading';
import { DL, DLItem } from './DescriptionList';

const getComponentDetailsQuery = gql`
  query componentDetails($componentPurl: String, $projectId: ID) {
    components(where: { purl: $componentPurl, project_SINGLE: { id: $projectId } }) {
      name
      purl
      author
      publisher
      version
      dependsOnCount
      vulnerabilities {
        id
      }
    }
  }
`;
const ComponentDetails = (props) => {
  const { componentId, projectId } = props;
  const { data, loading, error } = useQuery(getComponentDetailsQuery, {
    variables: { componentPurl: componentId, projectId: projectId },
  });

  const renderLink = () => {
    const link = GetComponentRepositoryURL(data.components[0].purl);
    if (!link) return;
    return (
      <a href={link} target="_blank" rel="noreferrer">
        {link}
      </a>
    );
  };
  if (loading) return <Loading />;
  if (!data.components[0]) {
    console.error('No data found when querying backend! Below is Apollo query result');
    console.error({ data: data, error: error });
    return <b>No data found!</b>;
  }
  const component = data.components[0];
  return (
    <Container style={{ wordBreak: 'break-all' }} className="px-0">
      <h4 className="pb-3">
        <b>{component.name}</b>
      </h4>
      <DL>
        <DLItem label="Version" value={component.version} />
        <DLItem label="Author" value={component.author} />
        <DLItem label="Publisher" value={component.publisher} />
        <DLItem label="Purl" value={component.purl} />
        <DLItem label="Number of dependencies" value={component.dependsOnCount} />
        <DLItem
          label="Vulnerabilities"
          value={component.vulnerabilities.map((v) => (
            <p key={v.id}>{v.id}</p>
          ))}
        />
        <DLItem label="External resources" value={renderLink()} />
      </DL>
    </Container>
  );
};

export default ComponentDetails;
