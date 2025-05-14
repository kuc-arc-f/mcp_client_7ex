
***
### MCPで、Googleスプレッドシートのデータ表示

* 前回同様、Vercel AI SDK の例になります。
* LLM = Gemini の構成になります。

***
### 構成
* Googleスプレッドシート
* Vercel AI SDK
* LLM: gemini
* node20

***
### 書いたコード

* https://github.com/kuc-arc-f/mcp_client_1ex/tree/main/mcp-cli-3

***
### API_KEY 等取得方法

* google Cloud　開く。
* https://console.cloud.google.com/apis/dashboard

***
### 関連

* https://developers.google.com/workspace/sheets/api/quickstart/nodejs?hl=ja
* https://developers.google.com/workspace/sheets/api/samples/reading?hl=ja
* https://qiita.com/tatsuya1970/items/25005befab6d7ba9805e

***
* 左のライブラリ、選択
* google sheets api で、検索

***
* API_KEY を、メモします。

***
* Google Drive 開き
* スプレッドシート作成
* 右プルダウン＞　共有おす
* 一般的なアクセス＞ リンクを知っている全員　に変更する。

***
* SPREADSHEET_ID
* スプレッドシート を開いているパス内に、SPREADSHEET_ID あり。

```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit?gid=0#gid=0
```
***
* GET　通信で、取得
* SPREADSHEET_ID で、置き換える
* key=　の後に、上記のAPI_KEY　を追加
* curl の参考は、下記

```
curl https://sheets.googleapis.com/v4/spreadsheets/SPREADSHEET_ID/values/シート1!A1:B100?key=api-akey
```

***
* プロンプト参考

```
getSpreadSheet を使って、スプレッドシートのTODOリストを、markdown記法の表形式で表示して欲しい
```

***
* .env

* SPREADSHEET_ID , GOOGLE_AUTH_API_KEY: 認証情報 > API_KEY

```
GOOGLE_GENERATIVE_AI_API_KEY="api-key"
#Google-Drive
SPREADSHEET_ID=""
GOOGLE_AUTH_API_KEY=""

```

***
* tool
* mcp-cli-3/src/tools/getSpreadSheet.ts

https://github.com/kuc-arc-f/mcp_client_7ex/blob/main/mcp-cli-3/src/tools/getSpreadSheet.ts


***
* CLI-log

```
>yarn dev
yarn run v1.22.22
$ tsx src
input:getSpreadSheet を使って、スプレッドシートのTODOリストを、markdown記法の表形式で表示して欲しい
input= getSpreadSheet を使って、スプレッドシートのTODOリストを、markdown記法の表形式で表示して欲しい
| TODO  |
|:----:|
| 技術系ブログを書く|
| コーヒー購入|
| 散歩に行く|


artifact:
スプレッドシートのTODOリストは以下の通りです。

| TODO  |
|:----:|
| 技術系ブログを書く|
| コーヒー購入|
| 散歩に行く|
```

***