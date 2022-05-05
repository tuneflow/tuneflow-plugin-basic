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
      playheadTick: {
        displayName: {
          zh: '当前指针位置',
          en: 'Playhead Position',
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
          zh: '原轨道',
          en: 'Track to layer',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.TrackSelector,
          config: {
            alwaysShowTrackInfo: true,
          } as TrackSelectorWidgetConfig,
        },
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
    const playheadTick = this.getParam<number>(params, 'playheadTick');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found.`);
    }
    track.createClip({
      clipStartTick: playheadTick,
      clipEndTick: playheadTick + song.getTicksPerBar(),
    });
  }
}
