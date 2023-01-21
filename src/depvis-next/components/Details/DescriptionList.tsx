const DL = (props) => {
  return <dl>{props.children}</dl>;
};

const DLItem = (props) => {
  const { label, value, alwaysShow } = props;
  if (!label || (!alwaysShow && !value)) return;
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
};

export { DL, DLItem };
