import fs from 'fs';

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
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
    return true;
  } catch (error) {
    // use error store
    return undefined;
  }
};

export const saveSampleState = (state) => {
  const serializedState = JSON.stringify(state);
  try {
    fs.writeFile('sample-state.json', serializedState, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch (error) {
    // use error store
    return undefined;
  }
};