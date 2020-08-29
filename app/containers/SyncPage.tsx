import React from 'react';
import Sync from '../features/sync/Sync';
import Menu from '../components/Menu';
import styles from './Container.css';

export default function SyncPage() {
  return (
    <div className={styles.container}>
      <Menu />
      <Sync />
    </div>
  );
}
