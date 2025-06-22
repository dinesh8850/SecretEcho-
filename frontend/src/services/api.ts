// api.ts
export const sendMessageToAI = async (message: string, token: string) => {
  const res = await fetch("/api/chat/grok", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  return res.json();
};
