import { createSlice } from '@reduxjs/toolkit';
import { saveState, loadSampleState } from '../../utils/localStorage';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';
import authSteam from '../steamApi/Auth';
// eslint-disable-next-line import/no-cycle
import {
  setInstallLocation,
  setInstalledGames,
  setLibraryFolders,
} from './libraryActions';

const syncSlice = createSlice({
  name: 'syncedData',
  initialState: {
    games: <any[]>[],
    installLocation: <string>'',
    libraryFolders: <string[]>[],
    loading: <boolean>false,
    userId: <string>'',
  },
  reducers: {
    loading(state) {
      if (state.loading === true) {
        state.loading = false;
      } else {
        state.loading = true;
      }
    },
    addInstallLocation: (state, action) => {
      state.installLocation = action.payload;
    },
    addLibraryFolder: (state, action) => {
      state.libraryFolders.push(action.payload);
    },
    addGame: (state, action) => {
      state.games.push(action.payload);
    },
    deleteLibrary: (state) => {
      state.games = [];
      state.installLocation = '';
      state.libraryFolders = [];
    },
    forceLoadState: (state, action) => {
      state.games = action.payload.games;
      state.installLocation = action.payload.installLocation;
      state.libraryFolders = action.payload.libraryFolders;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
  },
});

export const {
  loading,
  addInstallLocation,
  addLibraryFolder,
  addGame,
  deleteLibrary,
  forceLoadState,
  setUserId,
} = syncSlice.actions;

export const syncLibrary = (): AppThunk => (dispatch, getState) => {
  dispatch(loading());
  authSteam()
    .then((data: SteamAuth) => {
      dispatch(setUserId(data.id));
      if (process.platform !== 'win32') {
        dispatch(forceLoadState(loadSampleState()));
        throw new Error(
          "Your platform isn't supported yet! Stay tuned for more info."
        );
      }
      return true;
    })
    .then(() => {
      if (getState().sync.userId) {
        return true;
      }
      throw new Error(
        'Something went wrong authorising with Steam, please try again!'
      );
    })
    .then(() => {
      return setInstallLocation(dispatch, getState);
    })
    .then((data: string) => {
      return setLibraryFolders(dispatch, getState, data);
    })
    .then((data: string[]) => {
      return setInstalledGames(dispatch, getState, data);
    })
    .then(() => {
      /**
       * TODO: Get Steam Api user and game data
       */
      return true;
    })
    .then(() => {
      dispatch(loading());
      saveState(getState().sync);
      return true;
    })
    .catch((e) => {
      console.error(e);
      dispatch(loading());
      return false;
    });
};

export const deleteAppData = (): AppThunk => (dispatch) => {
  dispatch(loading());
  try {
    dispatch(deleteLibrary());
  } catch (error) {
    console.error(error);
  }
  dispatch(loading());
};

export default syncSlice.reducer;

export const gamesCount = (state: RootState) =>
  state.sync.games ? state.sync.games.length : 0;

export const gamesList = (state: RootState, sortOrder = undefined) => {
  try {
    const sortedGames = state.sync.games
      .slice()
      .sort((a, b) => (a.name > b.name ? 1 : -1));
    return sortedGames;
  } catch (error) {
    console.error(error);
    return false;
  }
};
