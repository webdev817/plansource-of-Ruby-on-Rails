import React, {useMemo} from 'react';
import {useDropzone} from 'react-dropzone';
import { Icon } from 'semantic-ui-react'

import './StyledDropzone.css';

const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  outline: 'none',
};

const activeStyle = {
};

const acceptStyle = {
};

const rejectStyle = {
};

function StyledDropzone(props) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    ...props
  });

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject
  ]);

  return (
    <div className="styled-dropzone" {...getRootProps({style})}>
      <input {...getInputProps()} />
      <p className="dz-message"><Icon name="upload" /> Drop files here, or click to select.</p>
    </div>
  );
}

export default StyledDropzone;
