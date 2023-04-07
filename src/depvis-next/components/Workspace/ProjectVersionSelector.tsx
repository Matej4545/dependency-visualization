import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { getProjectVersionsQuery } from "../../helpers/GraphHelper";
import Dropdown, { DropdownItem } from "../Dropdown/Dropdown";
import NoProjectFoundError from "../Error/NoProjectFoundError";

type ProjectSelectorProps = {
  onProjectVersionSelect?: (projectVersionId: string) => void;
};
const ProjectVersionSelector = (props: ProjectSelectorProps) => {
  const { onProjectVersionSelect } = props;
  const [projectVersion, setProjectVersion] = useState<any>(undefined);
  const router = useRouter();
  const { data: projects, loading: projectsLoading } = useQuery(
    getProjectVersionsQuery,
    {
      onCompleted: (data) => {
        selectProjectVersion(data);
      },
    }
  );

  useEffect(() => {
    if (projectVersion) {
      console.log({ event: "callback", data: projectVersion });
      onProjectVersionSelect(projectVersion);
    }
  }, [projectVersion]);

  const handleProjectVersionSelect = (e: any) => {
    setProjectVersion(e);
  };

  const selectProjectVersion = (data) => {
    const { projectName, projectVersion } = router.query;
    console.log({ pn: projectName, pv: projectVersion, data: data });
    if (
      !projectName ||
      data.projectVersions.filter((p) => p.project.name === projectName)
        .length == 0
    ) {
      console.log("Nope");
      setProjectVersion(data.projectVersions[0].id);
      return;
    }
    const project = data.projectVersions.find(
      (p) => p.project.name === projectName
    );
    console.log(project);
    setProjectVersion(
      data.projectVersions.find((p) => p.project.name === projectName).id
    );
  };

  if (!projectsLoading && projects.projectVersions.length == 0) {
    return <NoProjectFoundError />;
  }
  return (
    <Container>
      {!projectsLoading && projectVersion && (
        <Dropdown
          title="Select project"
          options={projects.projectVersions.map((p) => {
            return { id: p.id, displayName: `${p.project.name} v${p.version}` };
          })}
          onChange={(e) => handleProjectVersionSelect(e)}
          defaultValue={projectVersion}
        />
      )}
    </Container>
  );
};

const selectVersion = (project, queryProjectVersion) => {
  if (project.versions.length == 0) {
    console.log("Project %s does not have any versions", project.id);
    return;
  }
  if (
    !queryProjectVersion ||
    project.versions.filter((v) => v.version === queryProjectVersion).length ==
      0
  ) {
    return project.versions[0];
  }
  return project.versions.filter((v) => v.version === queryProjectVersion)[0];
};

export default ProjectVersionSelector;
