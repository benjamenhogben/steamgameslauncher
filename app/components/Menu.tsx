import { remote } from 'electron';
import React from 'react';
import styles from './Menu.css';
import constants from '../constants/titles.json';
// import { Link } from 'react-router-dom';
// import styles from './Sync.css';
// import routes from '../../constants/routes.json';

const activeWindow = remote.getCurrentWindow();

function minimize() {
  activeWindow.minimize();
  // BrowserWindow.getFocusedWindow().minimize;
}

function maximize() {
  if (activeWindow.isMaximized()) {
    activeWindow.unmaximize();
  } else {
    activeWindow.maximize();
  }
}

function close() {
  activeWindow.close();
}

export default function Menu() {
  return (
    <div className={styles.menuWrapper}>
      <div className={styles.preferences}>
        <button>Launcher</button>
      </div>
      <div className={styles.draggable} id="title-bar" onDoubleClick={maximize}>
        <div className={styles.noSelect}>{constants.WINDOW_TITLE}</div>
      </div>
      <div className={styles.windowControls}>
        <button
          className={styles.noSelectButton}
          type="button"
          id="min-btn"
          onClick={minimize}
        >
          -
        </button>
        <button
          className={styles.noSelectButton}
          type="button"
          id="max-btn"
          onClick={maximize}
        >
          +
        </button>
        <button
          className={styles.noSelectButton}
          type="button"
          id="close-btn"
          onClick={close}
        >
          x
        </button>
      </div>
    </div>
  );
}
