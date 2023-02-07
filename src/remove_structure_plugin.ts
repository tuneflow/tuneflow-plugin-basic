import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';

export class RemoveStructure extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'structure-remove';
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
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const structureIndex = this.getParam<number>(params, 'structureIndex');
    song.removeStructure(structureIndex);
  }
}
