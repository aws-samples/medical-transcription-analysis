import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import cs from 'clsx';
import styles from './Dropzone.module.css';

class Dropzone extends Component {

  static propTypes = {
    onDrop: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  };

  /* Public */

  pickFile() {
    this.fileInput.value = null;
    this.fileInput.click();
  }


  /* Private */

  constructor(props) {
    super(props);
    this.enterCount = 0;
    this.state = { dragging: false };
  }

  componentDidMount() {
    document.addEventListener('dragenter', this.onDragEnter);
    document.addEventListener('dragover', this.onDragOver);
    document.addEventListener('dragleave', this.onDragLeave);
    document.addEventListener('drop', this.onDocumentDrop);
  }

  componentWillUnmount() {
    document.removeEventListener('dragenter', this.onDragEnter);
    document.removeEventListener('dragover', this.onDragOver);
    document.removeEventListener('dragleave', this.onDragLeave);
    document.removeEventListener('drop', this.onDocumentDrop);
  }

  onDragEnter = (e) => {
    if (
      e.dataTransfer
      && e.dataTransfer.types
      && !e.dataTransfer.types.includes('Files')
    ) return;

    e.preventDefault();
    ++this.enterCount;
    this.setState({ dragging: true });
  }

  onDragLeave = (e) => {
    e.preventDefault();
    if (--this.enterCount > 0) return;
    this.setState({ dragging: false });
  }

  onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    return false;
  }

  onDocumentDrop = (e) => {
    e.preventDefault();
    this.enterCount = 0;
    this.setState({ dragging: false });
  }

  onDrop = (e) => {
    if (this.props.disabled) return;

    const fileList = (
      e.dataTransfer
        ? e.dataTransfer.files
        : e.target.files
    );

    e.preventDefault();

    const files = Array.prototype.slice.call(fileList);
    this.props.onDrop(files);
  }

  render() {
    const { message, disabled } = this.props;
    const { dragging } = this.state;
    // const dragging = true;
    return ReactDOM.createPortal(
      <div
        className={cs(styles.zone, { [styles.dragging]: !disabled && dragging })}
        onDrop={this.onDrop}
      >
        <p className={styles.message}>
          {message}
        </p>
        <input
          ref={el => (this.fileInput = el)}
          className={styles.input}
          type={'file'}
          multiple={true}
          onChange={this.onDrop}
        />
      </div>,
      document.body
    );
  }
}

export default Dropzone;
