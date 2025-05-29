import { generateText, tool } from "ai";
import { z } from "zod";

export const getSheetTest = tool({
  description: "スプレッドシートのTODOリスト、markdown記法の表形式で表示します。",
  // ツールを呼び出すパラメータ
  parameters: z.object({}),
  execute: async () => {
    const sheetId = process.env.SPREADSHEET_ID_3;
    const apiKey = process.env.GOOGLE_AUTH_API_KEY;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/シート1!A1:C100?key=${apiKey}`;
    const response = await fetch(url); 
    if(response.ok === false){
      throw new Error("Error, response <> OK:");
    }
    const json = await response.json();
    let rowMd = "";
    console.log(json.values);
    json.values.forEach((row, idx) => {
      if(idx > 0) {
        let target = "| " + row[0];
        if(row[1]){
          target += " | " + row[1];  
        }
        if(row[2]){
          target += " | " + row[2];  
        }
        target += " | " + "\n";
        rowMd += target;
      }
    });
    let text = `| ID  | MEMO | DATE | 
|:----:|
${rowMd}
`;
    console.log(text);
    return text;
  },
});
