/**
 * Responsible for the position of graph overlay control button stack
 * @param props children
 * @returns
 */
const GraphFloatControl = (props) => {
  return (
    <div className="graph-float-container">
      <div className="graph-float-container_button-stack">{props.children}</div>
    </div>
  );
};

export default GraphFloatControl;
