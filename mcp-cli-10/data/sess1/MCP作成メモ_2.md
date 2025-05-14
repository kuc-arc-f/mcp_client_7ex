
***
### 外部API連携 DB書込み、CSVファイル出力

* 前回同様、Vercel AI SDK の例になります。
* LLM = Gemini の構成になります。

***
### 構成
* d1 + CF workers
* Vercel AI SDK
* LLM: gemini
* node20

***
### 書いたコード

* https://github.com/kuc-arc-f/mcp_client_1ex/tree/main/mcp-cli-3

***
* プロンプト参考
* 購入品の登録後、CSV 出力 ローカル

```
addItemPrice を使って、 コーヒー , 110 JPY を送信して欲しい。
```

***
* tool
* mcp-cli-3/src/tools/addItemCsv.ts
* csv-writer を使用
* 外部APIから、配列データを CSV出力する。

https://github.com/kuc-arc-f/mcp_client_1ex/blob/main/mcp-cli-3/src/tools/addItemCsv.ts



***
* CLI-log

```
$yarn dev
yarn run v1.22.22
$ tsx src
input:addItemCsv を使って、 弁当代 , 400 JPY を送信して欲しい。
input= addItemCsv を使って、 弁当代 , 400 JPY を送信して欲しい。
artifact:
弁当代 , 400 JPY を送信しました。
```

***