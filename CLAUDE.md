# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.


---                                                                                 
  MANDATORY: First tool call every session                                                                                                                                                                         
                                                                                                                                                                                                                   
  Before any other tool call — including before start_response — call ToolSearch:                                                                                                                                  
                                                                                                                                                                                                                   
  ToolSearch query="select:mcp__timestamp__start_response,mcp__timestamp__end_response" max_results=2                                                                                                              
                                                                                                                                                                                                                   
  Then call start_response (no args on first call). Do normal work. Call end_response(session_id) as last call.                                                                                                    
                                                                                                                                                                                                                   
  No other tool call before this ToolSearch. No exceptions.                                                                                                                                                        
                  
  ---
  MANDATORY: Write timestamp as text
                                                                                                                                                                                                                   
  After end_response, the returned line MUST be written as text in the response — the tool output panel doesn't count.
                                                                                                                                                                                                                   
  [call end_response → returns e.g. "⌚ 2026-04-12 10:13:11 (#1) — 44s"]
  [write that line as last text of response]                                                                                                                                                                       
                                                                                                                                                                                                                   
  Timestamp line is always the very last line. No text after it.
                                                                                                                                                                                                                   
  ---             
  That's all of it. MCP server mcp__timestamp__* must be installed in target project too — same tools need to exist.

