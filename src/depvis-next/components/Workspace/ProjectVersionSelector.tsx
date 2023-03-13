import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { getProjectVersionsQuery } from "../../helpers/GraphHelper";
import Dropdown, { DropdownItem } from "../Dropdown/Dropdown";

type ProjectSelectorProps = {
  onProjectVersionSelect?: (projectVersionId: string) => void;
};
const ProjectVersionSelector = (props: ProjectSelectorProps) => {
  const { onProjectVersionSelect } = props;
  const [projectVersion, setProjectVersion] = useState<any>();
  const router = useRouter();
  const { data: projects, loading: projectsLoading } = useQuery(
    getProjectVersionsQuery,
    {
      onCompleted: (data) => {
        setProjectVersion(data.projectVersions[0].id);
      },
    }
  );

  useEffect(() => {
    if (projectVersion) {
      console.log("Fire");
      onProjectVersionSelect(projectVersion);
    }
  }, [projectVersion]);

  const handleProjectVersionSelect = (e: any) => {
    setProjectVersion(e);
  };

  const transformDefault = () => {
    const pv = projects.projectVersions.find((pv) => pv.id == projectVersion);
    console.log({ projV: projectVersion, pv: pv });
    return {
      id: projectVersion,
      displayName: `${pv.name} v${pv.version}`,
    };
  };
  return (
    <Container>
      {!projectsLoading && (
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

export default ProjectVersionSelector;
