import type { Query, World } from "miniplex";

import type { ISystem } from "../../interfaces/system.interface";
import type { IEntity, IEvent, ISpectatorEntity, IThreeSingletonEntity } from "../../entities";
import { EventType } from "../../constants/event-type";

/**
 * @sideEffect Side Effects:
 * - Remove `ISpectatorEntity`
 * - Remove `ISpectatorDeleteEvent`
 */
export class PoolCleanSystem implements ISystem {
  private queryEvent!: Query<IEvent>;

  private querySpectator!: Query<ISpectatorEntity>;


  private queryThree!: Query<IThreeSingletonEntity>;

  public async init(world: World<IEntity>): Promise<void> {
    const queryEvent = world.with('eventType', 'payload');
    const querySpectator = world.with('id', 'camera', 'renderTarget', 'source', 'controller', 'renderObjects');
    const queryThree = world.with('threeComponent');

    this.queryEvent = queryEvent;
    this.querySpectator = querySpectator;
    this.queryThree = queryThree;
  }

  public tick(world: World<IEntity>, queries: unknown): void {
    const { threeComponent } = this.queryThree.first!;

    for (const spectator of this.querySpectator) {
      for (const event of this.queryEvent) {
        if (
          event.eventType === EventType.SpectatorDelete &&
          event.payload.id === spectator.id
        ) {
          for (const object of spectator.renderObjects) {
            threeComponent.scene.remove(object);
          }
          world.remove(spectator);
          world.remove(event);
        }
      }
    }
  }

  public dispose(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
