import React from "react";
import { Handle, useNodeConnections } from "@xyflow/react";

const StackItemHandle = (props: any) => {
  const connections = useNodeConnections({
    handleType: props.type,
  });

  return (
    <Handle
      {...props}
      isConnectable={connections.length < props.connectionCount}
    />
  );
};

export default StackItemHandle;
