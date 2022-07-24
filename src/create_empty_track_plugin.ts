import type {
  InputNumberWidgetConfig,
  LabelText,
  ParamDescriptor,
  Song,
  SongAccess,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class CreateEmptyTrack extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'create-empty-track';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '创建空白轨道',
      en: 'Create Empty Track',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  // TODO: Support different types of track.
  params(): { [paramName: string]: ParamDescriptor } {
    return {
      insertIndex: {
        displayName: {
          zh: '插入位置',
          en: 'Insert Position',
        },
        defaultValue: -1,
        widget: {
          type: WidgetType.InputNumber,
          config: {} as InputNumberWidgetConfig,
        },
        optional: true,
        hidden: true,
      },
      type: {
        displayName: {
          zh: '轨道类型',
          en: 'Track Type',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
      },
    };
  }

  songAccess(): SongAccess {
    return {
      createTrack: true,
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const type = this.getParam<number>(params, 'type');
    const insertIndex = this.getParam<number>(params, 'insertIndex');
    song.createTrack({ type, index: insertIndex });
  }
}
