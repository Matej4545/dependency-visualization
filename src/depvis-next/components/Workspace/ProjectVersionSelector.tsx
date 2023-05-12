import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getProjectVersionsQuery } from "../../helpers/GraphHelper";
import Dropdown from "../Dropdown/Dropdown";
import GenericError from "../Error/GenericError";
import NoProjectFoundError from "../Error/NoProjectFoundError";
import Loading from "../Loading/Loading";

type ProjectSelectorProps = {
  onProjectVersionSelect?: (projectVersionId: string) => void;
};
const ProjectVersionSelector = (props: ProjectSelectorProps) => {
  const { onProjectVersionSelect } = props;
  const [projectVersion, setProjectVersion] = useState<any>(undefined);
  const router = useRouter();
  const {
    data: projects,
    loading: projectsLoading,
    error,
  } = useQuery(getProjectVersionsQuery, {
    onCompleted: (data) => {
      selectProjectVersion(data);
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (projectVersion) {
      onProjectVersionSelect(projectVersion);
    }
  }, [projectVersion]);

  const handleProjectVersionSelect = (e: any) => {
    setProjectVersion(e);
  };

  const selectProjectVersion = (data) => {
    const { projectName } = router.query;
    if (
      !projectName ||
      data.projectVersions.filter((p) => p.project.name === projectName)
        .length == 0
    ) {
      setProjectVersion(data.projectVersions[0].id);
      return;
    }
    setProjectVersion(
      data.projectVersions.find((p) => p.project.name === projectName).id
    );
  };

  if (projectsLoading) return <Loading detail="Loading projects" />;
  if (error) return <GenericError error={error} />;

  if (!projectsLoading && projects.projectVersions.length == 0) {
    return <NoProjectFoundError />;
  }
  return (
    <>
      {!projectsLoading && projectVersion && (
        <Dropdown
          options={projects.projectVersions.map((p) => {
            return { id: p.id, displayName: `${p.project.name} v${p.version}` };
          })}
          onChange={(e) => handleProjectVersionSelect(e)}
          defaultValue={projectVersion}
        />
      )}
    </>
  );
};

export default ProjectVersionSelector;
