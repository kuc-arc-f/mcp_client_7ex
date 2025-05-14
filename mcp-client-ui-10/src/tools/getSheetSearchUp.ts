import { generateText, tool } from "ai";
import { z } from "zod";

// getSheetSearchUp を使って、価格 100 JPY以上のリストを。markdown記法の表形式で表示して欲しい。
export const getSheetSearchUp = tool({
  description: "購入品リスト、markdown記法の表形式で表示します。",
  parameters: z.object({
    price: z.number().min(1).describe("価格の範囲値の最小値").optional().default(6),
  }),
  execute: async ({ price }) => {
    const sheetId = import.meta.env.VITE_SPREADSHEET_ID_2;
    const apiKey = import.meta.env.VITE_GOOGLE_AUTH_API_KEY;

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/シート1!A1:B100?key=${apiKey}`;
    const response = await fetch(url); 
    if(response.ok === false){
      throw new Error("Error, response <> OK:");
    }
    const json = await response.json();
    let rowMd = "";
    json.values.forEach((row, idx) => {
      let rowPrice = Number(row[1]);
      if(idx > 0 && rowPrice >= price) {
        let target = "| " + row[0] + " | " + row[1] + " | " + "\n";
        rowMd += target;
      }
    });
    let text = `***
| NAME | PRICE |
|:----:|:----:|
${rowMd}
***
`;
    console.log(text);
    return text;
  },
});
