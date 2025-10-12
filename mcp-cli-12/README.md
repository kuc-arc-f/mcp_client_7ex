# mcp-cli-12

 Version: 0.9.1

 date    : 2025/10/12
 
 update  :

***

AI SDK + Rust MCP Server , Gemini, example

* LLM Gemini use

***
### Setup
* .env

```
GOOGLE_GENERATIVE_AI_API_KEY="api-key"
```

***
* src/tools/addItemPrice.ts
* CMD_PATH: Rust MCP Server path

```
const CMD_PATH = "/path/target/release/rust_mcp_server_4.exe"
```

***
* start
```
npm run dev
```

***
* prompt

```
コーヒー , 230 円, をAPIに 送信して欲しい。
```

***

