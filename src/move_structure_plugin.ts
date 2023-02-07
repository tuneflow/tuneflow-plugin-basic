import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';

export class MoveStructure extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'structure-move';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      structureIndex: {
        displayName: {
          zh: '结构序号',
          en: 'Structure Index',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      moveToTick: {
        displayName: {
          zh: '移动至',
          en: 'Move to',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const structureIndex = this.getParam<number>(params, 'structureIndex');
    const moveToTick = this.getParam<number>(params, 'moveToTick');
    song.moveStructure(structureIndex, moveToTick);
  }
}
