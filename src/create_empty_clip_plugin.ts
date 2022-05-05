import { InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';
import type {
  LabelText,
  TrackSelectorWidgetConfig,
  ParamDescriptor,
  Song,
  SongAccess,
} from 'tuneflow';

export class CreateEmptyClip extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'create-empty-clip';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '创建空白片段',
      en: 'Create Empty Clip',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  // TODO: Support different types of clips.
  params(): { [paramName: string]: ParamDescriptor } {
    return {
      insertAtTick: {
        displayName: {
          zh: '添加位置',
          en: 'Insert Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
        },
        hidden: true,
        injectFrom: InjectSource.TickAtPlayhead,
      },
      trackId: {
        displayName: {
          zh: '添加到轨道',
          en: 'Insert to Track',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.TrackSelector,
          config: {
            alwaysShowTrackInfo: true,
          } as TrackSelectorWidgetConfig,
        },
        adjustable: false,
      },
    };
  }

  songAccess(): SongAccess {
    return {
      createTrack: true,
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const insertAtTick = this.getParam<number>(params, 'insertAtTick');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found.`);
    }
    track.createClip({
      clipStartTick: insertAtTick,
      clipEndTick: insertAtTick + 4 * song.getTicksPerBar(),
    });
  }
}
