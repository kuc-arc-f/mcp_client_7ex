// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('mySendMcp', {
  sendMcp: (input) => ipcRenderer.invoke('send-mcp', input),
});
contextBridge.exposeInMainWorld('mySendRag', {
  sendRag: (input) => ipcRenderer.invoke('send-rag', input),
});
