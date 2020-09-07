import { ipcRenderer } from 'electron';

export default function authSteam() {
  return new Promise<SteamAuth>((resolve, reject) => {
    ipcRenderer.send('newAuthWindow', { type: 'beginAuth' });
    ipcRenderer.on('auth-window-closed', (_event, data: SteamAuth) => {
      if (data.err === false) {
        resolve(data);
        return true;
      }
      reject(data);
      return false;
    });
  });
}
