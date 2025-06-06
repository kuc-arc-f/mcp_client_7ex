import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
const fs = require('fs');
const fsPromises = require('fs').promises;

import { getNumber } from "./tools/getNumber";
import { addTodo } from "./tools/addTodo";
import { getTodoList } from "./tools/getTodoList";
import { saveWorkHour } from "./tools/saveWorkHour";
import { getWorkList } from "./tools/getWorkList";
import { addTask } from "./tools/addTask";
import { addItemPrice } from "./tools/addItemPrice";
import { sendMail } from "./tools/sendMail";
import { addItemMail } from "./tools/addItemMail";
import { fileWriteCsv } from "./tools/fileWriteCsv";
import { addItemCsv } from "./tools/addItemCsv";
import { getWeatherInfo } from "./tools/getWeatherInfo";
import { getSpreadSheet } from "./tools/getSpreadSheet";
import { getSpreadSheet } from "./tools/getSpreadSheet";
// RAG
import { searchRag } from "./tools/searchRag";

import { generateText, tool } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";

console.log("VITE_API_URL=", import.meta.env.VITE_API_URL);
console.log("VITE_VECTOR_DB_PATH=", import.meta.env.VITE_VECTOR_DB_PATH);
console.log(import.meta.env);
process.env = import.meta.env
console.log("ENV:");
process.env.GOOGLE_GENERATIVE_AI_API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY;
process.env.GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
console.log(process.env);

const MODEL_NAME = "gemini-2.0-flash";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  ipcMain.handle('send-mcp', async (_e, input) => {
    const retObj = {ret: 500, data: null};
    try {
      const result = await generateText({
        model: google(MODEL_NAME),
        tools: {
          getNumber , addTodo, saveWorkHour , getWorkList , addTask , getTodoList ,
          addItemPrice , sendMail , addItemMail , fileWriteCsv ,
          addItemCsv , getWeatherInfo , getSpreadSheet , getSheetSearchUp , 
        },
        maxSteps: 5,
        messages: [{ role: "user", content: input }],
      });
      console.log("artifact:");
      console.log(result.text);
      return result.text;
    } catch (error) {
      console.error(error);
      console.error("エラーが発生しました:", error.message);
      return retObj;
    }
  }); 

  ipcMain.handle('send-rag', async (_e, input) => {
    const retObj = {ret: 500, data: null};
    try {
      const result = await searchRag(input, "sess1")
      return result;
    } catch (error) {
      console.error(error);
      console.error("エラーが発生しました:", error.message);
      return retObj;
    }
  }); 

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
