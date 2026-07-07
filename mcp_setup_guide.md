# Supabase MCP Setup Guide

I have set up the Model Context Protocol (MCP) configuration for your project. This allows your AI-assistant/agent to securely access your Supabase database schema, query records, check database advisors, and search documentation directly.

---

## 🛠️ What has been configured

1. **Config File Created:** A local [`.mcp.json`](file:///F:/Projects/zahau-music/.mcp.json) configuration has been created at the root of your project:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "type": "http",
         "url": "https://mcp.supabase.com/mcp?project_ref=srxogdtbokmlfibjkvcw"
       }
     }
   }
   ```
   > [!NOTE]
   > The URL is automatically scoped to your project reference (`srxogdtbokmlfibjkvcw`) extracted from your [.env](file:///F:/Projects/zahau-music/.env) file.

2. **Network Connection Verified:** We successfully pinged `https://mcp.supabase.com/mcp` and verified that the remote MCP host is online and reachable from your machine.

---

## 🔑 How to complete the Authentication

Because the Supabase MCP server connects directly to your live database instance, you must authenticate it via OAuth:

1. **Trigger Auth Flow:** If your AI client/IDE (such as Claude Code or Cursor) supports workspace-level MCP configurations, it should automatically detect the `.mcp.json` file.
   - In **Claude Code**, run:
     ```bash
     claude mcp reload
     ```
     or trigger authentication by interacting with any database tool.
   - A browser window will open asking you to log in to your Supabase account and authorize access to the **`srxogdtbokmlfibjkvcw`** project.
2. **Reload Session:** Once authorized in the browser, return to your editor and reload the agent/session if prompted.

---

## 🧰 Available MCP Tools

Once authenticated, your agent will gain access to these powerful tools:

*   **`execute_sql`**: Safely execute SQL statements against your database (ideal for schema creation and verification).
*   **`get_schema`**: Retrieve database schema diagrams, table structures, relationships, and metadata.
*   **`get_advisors`**: Run Supabase database advisors to audit your database configuration, security, RLS, and indexes.
*   **`search_docs`**: Fetch official, up-to-date documentation on Supabase auth, storage, database practices, and client SDKs.
