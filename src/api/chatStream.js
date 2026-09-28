const RAG_CHAT_BASE_URL = "http://localhost:8004/api/v1";

/**
 * Stream chat completions using standard Fetch API + ReadableStream for SSE events.
 * Supports AbortSignal for user cancellation or page navigation.
 */
export async function streamChatResponse({
  message,
  conversationId = null,
  attachmentText = null,
  attachmentFile = null,
  onMeta = () => {},
  onToken = () => {},
  onDone = () => {},
  onError = () => {},
  signal = null,
}) {
  const token = localStorage.getItem("access_token");
  if (!token) {
    onError(new Error("You must be logged in to send chat messages."));
    return;
  }

  const formData = new FormData();
  formData.append("message", message);
  if (conversationId) {
    formData.append("conversation_id", conversationId);
  }
  if (attachmentText && attachmentText.trim()) {
    formData.append("attachment_text", attachmentText.trim());
  }
  if (attachmentFile) {
    formData.append("attachment_file", attachmentFile);
  }

  try {
    const response = await fetch(`${RAG_CHAT_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      signal,
    });

    if (!response.ok) {
      let errorMessage = `Server responded with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.detail) {
          errorMessage = typeof errorData.detail === "string" 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to status text
      }
      throw new Error(errorMessage);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let currentEvent = "";
    let hasCompleted = false;

    const safeDone = (payload = { status: "complete" }) => {
      if (!hasCompleted) {
        hasCompleted = true;
        onDone(payload);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep unfinished line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          currentEvent = "";
          continue;
        }

        if (trimmed.startsWith("event:")) {
          currentEvent = trimmed.replace("event:", "").trim();
        } else if (trimmed.startsWith("data:")) {
          const rawData = trimmed.replace("data:", "").trim();
          if (rawData === "[DONE]") {
            safeDone({ status: "complete" });
            continue;
          }

          try {
            const parsed = JSON.parse(rawData);
            if (currentEvent === "meta" || parsed.top_score !== undefined) {
              onMeta(parsed);
            } else if (currentEvent === "token" || parsed.token !== undefined) {
              onToken(parsed.token);
            } else if (currentEvent === "done" || parsed.status === "complete") {
              safeDone(parsed);
            } else {
              // General payload
              if (parsed.token) onToken(parsed.token);
            }
          } catch {
            // Raw text fallback
            if (rawData) onToken(rawData);
          }
        }
      }
    }

    safeDone({ status: "complete" });
  } catch (err) {
    if (err.name === "AbortError") {
      // Intentional user cancellation
      if (!hasCompleted) {
        hasCompleted = true;
        onDone({ status: "aborted" });
      }
      return;
    }
    onError(err);
  }
}
