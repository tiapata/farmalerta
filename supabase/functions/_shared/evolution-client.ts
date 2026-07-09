// Wrapper fino sobre a REST da Evolution API v2. Endpoints confirmados via
// documentação oficial: header de auth `apikey`, envio de texto em
// POST /message/sendText/{instance}. Os demais endpoints (criar instância,
// configurar webhook, status de conexão) seguem o padrão documentado mais
// comum da v2, mas devem ser conferidos contra a instância real na primeira
// integração — Evolution API é um projeto open-source de evolução rápida.

function getConfig() {
  const baseUrl = Deno.env.get("EVOLUTION_API_URL");
  const apiKey = Deno.env.get("EVOLUTION_API_KEY");
  if (!baseUrl || !apiKey) {
    throw new Error("EVOLUTION_API_URL/EVOLUTION_API_KEY não configurados nos secrets da função");
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey };
}

async function evolutionFetch(path: string, init: RequestInit = {}): Promise<any> {
  const { baseUrl, apiKey } = getConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`Evolution API ${path} respondeu ${response.status}: ${text}`);
  }
  return body;
}

export async function createInstance(instanceName: string, webhookUrl: string) {
  return evolutionFetch("/instance/create", {
    method: "POST",
    body: JSON.stringify({
      instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
      webhook: {
        url: webhookUrl,
        events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
      },
    }),
  });
}

export async function getConnectionState(instanceName: string) {
  return evolutionFetch(`/instance/connectionState/${instanceName}`, { method: "GET" });
}

export async function connectInstance(instanceName: string) {
  // Retorna o QR code atual (base64) enquanto o pareamento está pendente.
  return evolutionFetch(`/instance/connect/${instanceName}`, { method: "GET" });
}

export async function sendText(instanceName: string, number: string, text: string) {
  return evolutionFetch(`/message/sendText/${instanceName}`, {
    method: "POST",
    body: JSON.stringify({ number, text }),
  });
}

export async function deleteInstance(instanceName: string) {
  return evolutionFetch(`/instance/delete/${instanceName}`, { method: "DELETE" });
}
