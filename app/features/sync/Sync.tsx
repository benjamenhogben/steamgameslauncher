import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Sync.css';
import routes from '../../constants/routes.json';
import {
  syncLibrary,
  deleteAppData,
  gamesCount as gamesCounter,
} from './syncSlice';

export default function Sync() {
  const dispatch = useDispatch();
  const gamesCount = useSelector(gamesCounter);
  return (
    <div>
      <div className={styles.backButton} data-tid="backButton">
        <Link to={routes.HOME}>
          <i className="fa fa-arrow-left fa-3x" />
        </Link>
      </div>
      <h1>Sync Page</h1>
      <button
        className={styles.btn}
        onClick={() => {
          dispatch(syncLibrary());
        }}
        data-tclass="btn"
        type="button"
        aria-label="Sync Steam Library"
      >
        Sync Steam Library
      </button>
      {gamesCount}
      <br />
      <button
        className={styles.btn}
        onClick={() => {
          dispatch(deleteAppData());
        }}
        data-tclass="btn"
        type="button"
        aria-label="Sync Steam Library"
      >
        Delete Synced data
      </button>
    </div>
  );
}
