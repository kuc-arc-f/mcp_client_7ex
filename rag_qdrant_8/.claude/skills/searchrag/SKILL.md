---
name: searchrag-skill
description: 検索クエリーを Scripts送信、Scripts searchrag から 対象RAG文章を受信し、概要文章を作成します。 

---

# SearchRag Skill

このスキルは、入力メッセージを送信し、値を返却します

### Parameters
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "送信メッセージ (例: 'hello')"
    },
  },
  "required": ["message"]
}

### Command
node scripts/dist/searchrag.js  --message {{message}}

