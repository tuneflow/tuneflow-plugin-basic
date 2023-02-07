import { Song, StructureType, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor } from 'tuneflow';

export class CreateStructure extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'create-structure';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      structureTick: {
        displayName: {
          zh: '位置',
          en: 'Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
        },
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const tick = this.getParam<number>(params, 'structureTick');
    const barBeats = song.getBarBeats(tick + 1);
    const leadingBeat = Song.getLeadingBeat(tick, barBeats);
    if (!leadingBeat) {
      throw new Error('Cannot find leading beat');
    }
    const leadingStructure = song.getStructureAtTick(tick);
    if (leadingStructure && tick === leadingStructure.getTick()) {
      return;
    }
    const prevType = leadingStructure ? leadingStructure.getType() : undefined;
    song.createStructure({
      tick: leadingBeat.tick,
      type: this.getNextStructureType(prevType),
    });
  }

  private getNextStructureType(currentType?: StructureType) {
    switch (currentType) {
      case StructureType.INTRO:
        return StructureType.VERSE;
      case StructureType.VERSE:
        return StructureType.CHORUS;
      case StructureType.CHORUS:
        return StructureType.BRIDGE;
      case StructureType.BRIDGE:
        return StructureType.OUTRO;
      default:
        return StructureType.INTRO;
    }
  }
}
