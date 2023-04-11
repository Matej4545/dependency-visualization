import { Button, Container, OverlayTrigger, Tooltip } from "react-bootstrap";
import { DL, DLItem } from "../Details/DescriptionList";
import { Component } from "../../types/component";

const ProjectStatistics = (props) => {
  const projectInfo = createProjectInfo(props.data);

  const getCVSSScoresAsArray = (vulnerableComponents) => {
    const c = vulnerableComponents
      .map((c) => c.vulnerabilities.map((v) => v.cvssScore))
      .flat();
    return c;
  };

  const getCVSSAvg = (vulnerableComponents) => {
    const res = getCVSSScoresAsArray(vulnerableComponents);
    if (!res || res.length == 0) return;
    return Math.round(res.reduce((p, c) => p + c, 0) / res.length).toPrecision(
      2
    );
  };
  if (!projectInfo) return <></>;
  return (
    <Container>
      <DL>
        <DLItem label="Total components" value={projectInfo.componentsCount} />
        <DLItem
          label="Vulnerable components"
          value={projectInfo.vulnerableComponents.length}
          tooltipText="Components that depends on vulnerable component or contain vulnerability"
        />
        <DLItem
          label="Vulnerabilities"
          value={getCVSSScoresAsArray(projectInfo.vulnerableComponents).length}
        />
        <DLItem
          label="Impact factor"
          value={`${Math.round(
            (projectInfo.vulnerableComponents.length /
              projectInfo.componentsCount) *
              100
          ).toPrecision(1)} %`}
          tooltipText="Specify how many % of project use components with at least 1 vulnerability"
        />
        <DLItem
          label="Average CVSS score"
          value={getCVSSAvg(projectInfo.vulnerableComponents)}
        />
      </DL>
    </Container>
  );
};
export default ProjectStatistics;

type projectInfo = {
  name: string;
  version: string;
  componentsCount: number;
  vulnerableComponents: Component[];
};

const createProjectInfo = (data): projectInfo | undefined => {
  if (!data || !data.projectVersions) return undefined;
  const projectVersion = data.projectVersions[0];
  return {
    name: projectVersion.project.name,
    version: projectVersion.version,
    componentsCount: projectVersion.allComponents.length,
    vulnerableComponents: projectVersion.allVulnerableComponents,
  };
};
