import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';

export class UpdateStructure extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-structure';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      newType: {
        displayName: {
          zh: '结构类型',
          en: 'Structure Type',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.Select,
        },
        hidden: true,
      },
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
    const newType = this.getParam<number>(params, 'newType');
    const tick = this.getParam<number>(params, 'structureTick');
    song.updateStructureAtTick(tick, newType);
  }
}
