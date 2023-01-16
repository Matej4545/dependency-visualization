import { gql, useQuery } from '@apollo/client';
import { Container } from 'react-bootstrap';
import Loading from '../Loading/Loading';

const getComponentDetailsQuery = gql`
query componentDetails($componentPurl: String, $projectId: ID) {
    components (where: {purl: $componentPurl, project_SINGLE: {id: $projectId} }) {
      name,
      author,
      version,
      dependsOnCount
    }
  }`
const ComponentDetails = (props) => {
    const { componentId, projectId } = props;
    const {data, loading} = useQuery(getComponentDetailsQuery, {variables: {componentPurl: componentId, projectId: projectId }})

    if (loading) return <Loading />
    if (!data.components[0]) return <b>No data found!</b>
    return(<Container>
        <h6>Component details</h6>
        <span><b>Name:</b> {data.components[0].name}</span><br/>
        <span><b>Version:</b> {data.components[0].version}</span><br/>
        <span><b>Author:</b> {data.components[0].author}</span><br/>
        <span><b>Number of dependencies:</b> {data.components[0].dependsOnCount}</span><br/>
    </Container>)
}

export default ComponentDetails