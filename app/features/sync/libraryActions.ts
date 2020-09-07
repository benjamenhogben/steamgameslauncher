import * as child from 'child_process';
import * as VDF from '@node-steam/vdf';
import fs from 'fs';
import { History } from 'history';
import { RouterState } from 'connected-react-router';
import { CombinedState, Dispatch } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { addGame, addLibraryFolder, addInstallLocation } from './syncSlice';

export const setInstalledGames = (
  dispatch: Dispatch,
  getState: () => CombinedState<{
    router: RouterState<History.UnknownFacade>;
    counter: {
      value: number;
    };
    sync: {
      loading: boolean;
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
              for (i = 0; i < list.length; i += 1) {
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

export const setLibraryFolders = (
  dispatch: Dispatch,
  getState: () => CombinedState<{
    router: RouterState<History.UnknownFacade>;
    counter: {
      value: number;
    };
    sync: {
      loading: boolean;
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

export const setInstallLocation = (
  dispatch: Dispatch,
  getState: () => CombinedState<{
    router: RouterState<History.UnknownFacade>;
    counter: {
      value: number;
    };
    sync: {
      loading: boolean;
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
          dispatch(addInstallLocation(dataFormatted[3]));
        }
        resolve(getState().sync.installLocation);
      }
    } catch (error) {
      reject(error);
    }
  });
};
