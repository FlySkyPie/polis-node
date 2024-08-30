import type { World } from "miniplex";

import type { IEntity } from "../entities";

export interface ISystem {
    /**
     * Initialize the system.
     */
    init(world: World<IEntity>): Promise<void>;

    /**
     * Process a tick of the game. 
     */
    tick(world: unknown, queries: unknown): void;

    /**
     * Release resource from the system.
     */
    dispose(): Promise<void>;
}