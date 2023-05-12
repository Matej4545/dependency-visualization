import Workspace from "../components/Workspace/Workspace";
process.on("warning", (e) => console.warn(e.stack));

/**
 * Default page containing the workspace with visualization
 */
const index = () => {
  return <Workspace />;
};

export default index;
