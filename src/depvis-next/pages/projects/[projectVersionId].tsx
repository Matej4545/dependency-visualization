import { useRouter } from "next/router";

const ProjectVersion = () => {
  const router = useRouter();
  return <div>{router.query.projectVersionId}</div>;
};
export default ProjectVersion;
