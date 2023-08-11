export interface RequestEventMap {
  // [key: string]: unknown[]
  connection: [clientId: string]
  disconnect: [clientId: string]
}
