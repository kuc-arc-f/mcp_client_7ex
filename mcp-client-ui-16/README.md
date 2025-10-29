# mcp-client-ui-16

 Version: 0.9.1

 Author  : 

 date    : 2025/10/28
 
 update  :

***

Rust MCP Server + electron , excel download

* LLM: Gemini use

***
### MCP Server

https://github.com/kuc-arc-f/rust_3pri/tree/main/mcp_7

***
* images

![img1](/image/mcp-client-ui-16-1.png)

***
* excel download

![img1](/image/mcp-client-ui-16-2.png)

***
### setup

* .env
* VITE_TEMPLATE_PURCHASE: template excel file
* VITE_XLS_OUT_DIR: out put excel path
* VITE_MCP_SERVER_PATH: rust MCP Server path

```
VITE_GOOGLE_GENERATIVE_AI_API_KEY="api-key"
VITE_TEMPLATE_PURCHASE="/path/mcp-client-ui-16/input.xlsx"
VITE_XLS_OUT_DIR="/path/mcp-client-ui-16/data"
VITE_MCP_SERVER_PATH="/path/mcp_7/target/release/rust_mcp_server_7.exe"
```
***
* start

```
npm run start
```

***
### blog 

***

