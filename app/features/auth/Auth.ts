import { ipcRenderer } from 'electron';

const authWindow: BrowserWindow | null = null;

export default function AuthSteam() {
  ipcRenderer.sendSync('newAuthWindow', { type: 'beginAuth' });
}
