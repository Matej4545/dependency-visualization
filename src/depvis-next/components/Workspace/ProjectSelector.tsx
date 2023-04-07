import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Container } from "react-bootstrap";
import { getProjectsQuery } from "../../helpers/GraphHelper";
import Dropdown, { DropdownItem } from "../Dropdown/Dropdown";

type ProjectSelectorProps = {
  onProjectVersionSelect?: (projectVersionId: DropdownItem) => void;
};
const ProjectSelector = (props: ProjectSelectorProps) => {
  const { onProjectVersionSelect } = props;
  const [project, setProject] = useState<any>();
  const [projectVersion, setProjectVersion] = useState<any>();
  const router = useRouter();
  const { data: projects, loading: projectsLoading } = useQuery(
    getProjectsQuery,
    {
      onCompleted: (data) => {
        const project = selectProject(data.projects, router.query.projectName);
        console.log("Selected project %s", project.id);
        setProject({ id: project.id, displayName: project.name });
        const version = selectVersion(project, router.query.projectVersion);
        console.log("Selected version %s", version.id);

        setProjectVersion(version);
      },
    }
  );

  // useEffect(() => {
  //   if (projectVersion) {
  //     onProjectVersionSelect(projectVersion);
  //   }
  // }, [projectVersion]);
  const getProjectVersions = (project) => {
    const projectObj = projects.projects.filter((p) => p.id === project.id)[0];
    return projectObj.versions.map((v) => {
      return { id: v.id, displayName: v.version };
    });
  };

  const handleProjectVersionSelect = (e: any) => {
    console.log({ selectedVersion: e });
    onProjectVersionSelect && onProjectVersionSelect(e.id);
    setProjectVersion(e);
  };
  return (
    <Container>
      {!projectsLoading && (
        <>
          <Dropdown
            title="Select project"
            options={projects.projects.map((p) => {
              return { id: p.id, displayName: p.name };
            })}
            onChange={(e) => {
              setProjectVersion(undefined);
              setProject(e);
            }}
            default={project}
          />
          <Dropdown
            title="Select version"
            options={getProjectVersions(project)}
            onChange={(e) => handleProjectVersionSelect(e)}
            default={projectVersion}
          />
        </>
      )}
    </Container>
  );
};

const selectProject = (projects, queryProjectName) => {
  console.log({ projects: projects, query: queryProjectName });
  if (
    !queryProjectName ||
    projects.filter((p) => p.name === queryProjectName).length == 0
  ) {
    return projects[0];
  }
  return projects.find((p) => p.name === queryProjectName);
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
export default ProjectSelector;
