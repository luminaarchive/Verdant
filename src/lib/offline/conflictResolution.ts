// NaLI Offline Engine: Conflict Resolution
// Handles scenarios where local offline edits conflict with server state.

export class ConflictResolution {
  
  // Example: Client wins for field data (since field ranger is the ground truth)
  // Server wins for taxonomic reference data (since researchers manage global taxonomy)
  
  resolveObservationConflict(clientState: any, serverState: any) {
    // Basic merge strategy: Client edits take precedence for observations
    // if the client timestamp is newer.
    const clientTime = new Date(clientState.updated_at).getTime();
    const serverTime = new Date(serverState.updated_at).getTime();
    
    return clientTime > serverTime ? clientState : serverState;
  }
}

export const conflictResolution = new ConflictResolution();
