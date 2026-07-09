/** Extrai só os dígitos de um número — usado tanto pra JIDs do WhatsApp
 * ("5511999998888@s.whatsapp.net") quanto pra telefones cadastrados em
 * customers.phone (texto livre, sem formato canônico). */
export function digitsOnly(value: string | null | undefined): string {
  return (value ?? "").replace(/\D/g, "");
}

/** JID do WhatsApp -> número em dígitos. */
export function phoneFromJid(jid: string): string {
  return digitsOnly(jid.split("@")[0]);
}
