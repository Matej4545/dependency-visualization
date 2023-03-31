import Workspace from "../components/Workspace/Workspace";
process.on("warning", (e) => console.warn(e.stack));

const index = () => {
  return <Workspace />;
};

export default index;
