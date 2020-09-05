import { remote } from 'electron';
import fs from 'fs';
import sampleData from '../../sample-state.json';

const appDataPath = remote.app.getPath('appData');
const appData = `${appDataPath}/state.json`;

export const loadState = () => {
  try {
    const localState = localStorage.getItem('state');
    let serializedState = '';
    fs.readFile(appData, 'utf8', (error, data) => {
      if (error) {
        throw error;
      }
      serializedState = data;
    });
    if (localState) {
      return JSON.parse(localState);
    }
    return JSON.parse(serializedState);
  } catch (error) {
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
    fs.writeFile(`${appData}`, serializedState, (err) => {
      if (err) {
        console.log(err);
      }
    });
    return true;
  } catch (error) {
    // use error store
    return undefined;
  }
};

export const saveSampleState = (state) => {
  const serializedState = JSON.stringify(state);
  try {
    fs.writeFile(`${appData}`, serializedState, (err) => {
      if (err) {
        console.log(err);
      }
    });
    return JSON.parse(serializedState);
  } catch (error) {
    // use error store
    return undefined;
  }
};

export const loadSampleState = () => {
  return sampleData;
};
