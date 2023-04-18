const GraphFloatControl = (props) => {
  return (
    <div className="graph-float-container">
      <div className="graph-float-container_button-stack">{props.children}</div>
    </div>
  );
};

export default GraphFloatControl;
