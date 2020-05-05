import React, { Component } from 'react';

import Dropzone from './Dropzone';

import s from './FilePicker.module.css';

class FilePicker extends Component {
  state = {};

  onSubmit = (files) => {
    this.props.onSubmit([].slice.call(files));
  }

  onFilePicked = e => {
    this.onSubmit(e.target.files);
    e.target.value = null;
  }

  render() {
    return (
      <div className={s.base}>
        <span>Drop an audio file here</span>
        <span>or</span>
        <label>
          Choose an audio file

          <input
            type="file"
            accept={[ '.mp3', '.ogg', '.wav', '.m4a', '.mp4' ]}
            onChange={this.onFilePicked}
          />
        </label>
        <Dropzone
          message={"Drop files here..."}
          onDrop={this.onSubmit}
        />
      </div>
    )
  }
}

export default FilePicker;
