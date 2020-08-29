import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import { gamesList, gamesCount } from '../features/sync/syncSlice';

/**
// sort by name
items.sort(function(a, b) {
  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }

  // names must be equal
  return 0;
});
 */

export default function Home(): JSX.Element {
  const listItems = useSelector(gamesList).map((game) => (
    <div className={styles.gameTile} key={game.appid}>
      <a href={`steam://run/${game.appid}`}>{game.name}</a>
    </div>
  ));
  return (
    <div className={styles.container} data-tid="container">
      <h2>Home</h2>
      <Link to={routes.SYNC}>to Sync</Link>
      <div className={styles.gamesWrapper}>{listItems}</div>
    </div>
  );
}
