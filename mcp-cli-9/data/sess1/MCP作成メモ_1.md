
# MCP作成メモ、メール ファイル書込など

***
### 概要

* MCP 作例メモになります。
* LLMは、Gemini, Ollama等を使用予定。
* MCP Client, Serverは自作、OSS参考予定してます。

***
### 外部API連携 DB書込み、メール送信

* 前回同様、Vercel AI SDK の例になります。
* LLM = Gemini の構成になります。
* nodemailerの　gmailサービスを使用し。メール配信

***
### 構成
* d1 + CF workers
* Vercel AI SDK
* LLM: gemini
* node20
* nodemailer

***
### 書いたコード

* https://github.com/kuc-arc-f/mcp_client_1ex/tree/main/mcp-cli-3

* gmail経由する為、googleアカウント、アプリ パスワード必要です。
* アプリ パスワードの調査は、gimini質問して参考にしました。

***
* アプリ パスワード発行
* アプリパスワード設定する例です (下記の手順)
* Googleアカウントの画面を開く
* セキュリティ＞2 段階認証プロセス　をクリックする。
* 下方向の、アプリ パスワードのリンクおす。
* アプリ名を追加。パスワード発行される(１６桁)

***
* プロンプト参考
* 購入品の登録後、メール配信する処理

```
addItemMail を使って、 バス代 , 210 JPY を送信して欲しい。
```

***
* .env
* API_URL: 外部連携API
* GOOGLE_MAIL_USER: メール送信元
* GOOGLE_MAIL_PASSWORD:アプリ パスワード
* GOOGLE_MAIL_SENDTO: 送信先

```
GOOGLE_GENERATIVE_AI_API_KEY="key"
API_URL="https://hoge"
#MAIl
GOOGLE_MAIL_USER="taro@gmail.com"
GOOGLE_MAIL_PASSWORD=""
GOOGLE_MAIL_SENDTO="hoge@example.com"

```

***
* tool
* mcp-cli-3/src/tools/addItemMail.ts

https://github.com/kuc-arc-f/mcp_client_1ex/blob/main/mcp-cli-3/src/tools/addItemMail.ts

***
* CLI-log

```
>yarn dev
yarn run v1.22.22
$ tsx src
input:addItemMail を使って、 バス代 , 210 JPY を送信して欲しい。
input= addItemMail を使って、 バス代 , 210 JPY を送信して欲しい。
Email sent: 250 2.0.0 OK  1746242106 d9443c01a7336-22e151e079fsm15407775ad.4 - gsmtp
artifact:
OK。送信しました。
Done in 6.16s.
```

***
