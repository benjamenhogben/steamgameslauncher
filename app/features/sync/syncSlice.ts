import { createSlice, CombinedState, Dispatch } from '@reduxjs/toolkit';
import * as child from 'child_process';
import * as VDF from '@node-steam/vdf';
import fs from 'fs';
import { History } from 'history';
import { RouterState } from 'connected-react-router';
import { saveSampleState } from '../../utils/localStorage';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';

const syncSlice = createSlice({
  name: 'syncedData',
  initialState: {
    games: <any[]>[],
    installLocation: <string>'',
    libraryFolders: <string[]>[],
    loading: <string>'idle',
  },
  reducers: {
    loading(state) {
      if (state.loading === 'idle') {
        state.loading = 'pending';
      } else {
        state.loading = 'idle';
      }
    },
    setInstallLocation: (state, action) => {
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
  },
});

export const {
  loading,
  setInstallLocation,
  addLibraryFolder,
  addGame,
  deleteLibrary,
} = syncSlice.actions;

const getInstalledGames = (
  dispatch: Dispatch,
  getState: () => CombinedState<{
    router: RouterState<History.UnknownFacade>;
    counter: {
      value: number;
    };
    sync: {
      loading: string;
      installLocation: string;
      libraryFolders: string[];
      games: string[];
    };
  }>,
  paths: string[]
) => {
  return new Promise((resolve, reject) => {
    const fnregex = /appmanifest_[0-9]*.acf/g;
    try {
      paths.forEach((installLocation) => {
        let games = fs.readdirSync(`${installLocation}/SteamApps`);
        games = games.filter((fn) => fn.match(fnregex));
        games.forEach((file) => {
          try {
            const str = VDF.parse(
              fs
                .readFileSync(`${installLocation}/SteamApps/${file}`)
                .toString('utf-8')
            ).AppState;
            const exists = (list: any[], obj: any) => {
              let i: number;
              for (i = 0; i < list.length; i++) {
                if (list[i].appid === obj.appid) {
                  return true;
                }
              }

              return false;
            };
            if (
              !exists(getState().sync.games, str) &&
              Object.keys(str).length > 0 &&
              str.installdir !== 'Steamworks Shared'
            ) {
              dispatch(addGame(str));
            }
          } catch (error) {
            console.error(`${file}: ${error}`);
          }
        });
      });
      resolve(getState().sync.games);
    } catch (error) {
      reject(error);
    }
  });
};

const getLibraryFolders = (
  dispatch: Dispatch,
  getState: () => CombinedState<{
    router: RouterState<History.UnknownFacade>;
    counter: {
      value: number;
    };
    sync: {
      loading: string;
      installLocation: string;
      libraryFolders: string[];
      games: string[];
    };
  }>,
  path: string
) => {
  return new Promise<string[]>((resolve, reject) => {
    try {
      dispatch(addLibraryFolder(`${path}`));
      const libraries = VDF.parse(
        fs
          .readFileSync(`${path}\\steamapps\\libraryfolders.vdf`)
          .toString('utf-8')
      );
      Object.values<string>(libraries.LibraryFolders).forEach((lib) => {
        const regex = /[a-z]:\\\\/gis;
        if (
          regex.test(lib) &&
          getState().sync.libraryFolders.indexOf(lib) < 0
        ) {
          dispatch(addLibraryFolder(lib));
        }
      });
      resolve(getState().sync.libraryFolders);
    } catch (error) {
      reject(error);
    }
  });
};

const getInstallLocation = (
  dispatch: Dispatch,
  getState: () => CombinedState<{
    router: RouterState<History.UnknownFacade>;
    counter: {
      value: number;
    };
    sync: {
      loading: string;
      installLocation: string;
      libraryFolders: string[];
      games: string[];
    };
  }>
) => {
  return new Promise((resolve: (value: string) => void, reject) => {
    try {
      const registryQuery = child.execSync(
        'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Valve\\Steam" /v InstallPath'
      );
      const dataFormatted = registryQuery.toString().trim().split('    ');
      const regex = /[a-z]:\\Steam/gis;
      if (
        dataFormatted.length >= 4 &&
        dataFormatted[2] === 'REG_SZ' &&
        regex.test(dataFormatted[3])
      ) {
        if (getState().sync.installLocation.indexOf(dataFormatted[3]) < 0) {
          dispatch(setInstallLocation(dataFormatted[3]));
        }
        resolve(getState().sync.installLocation);
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const syncLibrary = (): AppThunk => (dispatch, getState) => {
  dispatch(loading());
  getInstallLocation(dispatch, getState)
    .then((data: string) => {
      return getLibraryFolders(dispatch, getState, data);
    })
    .then((data: string[]) => {
      return getInstalledGames(dispatch, getState, data);
    })
    .then(() => {
      dispatch(loading());
      saveSampleState(getState().sync);
      return true;
    })
    .catch((e) => {
      dispatch(loading());
      console.error(e);
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

export const gamesCount = (state: RootState) => state.sync.games.length;

export const gamesList = (state: RootState, sortOrder = undefined) => {
  const sortedGames = state.sync.games
    .slice()
    .sort((a, b) => (a.name > b.name ? 1 : -1));
  return sortedGames;
};
