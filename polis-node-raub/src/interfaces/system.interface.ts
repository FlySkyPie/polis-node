export interface ISystem {
    /**
     * Initialize the system.
     */
    init(): Promise<void>;

    /**
     * Process a tick of the game. 
     */
    tick(world: unknown, queries: unknown): void;

    /**
     * Release resource from the system.
     */
    dispose(): Promise<void>;
}