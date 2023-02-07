import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { TrackSelectorWidgetConfig, Song, ParamDescriptor } from 'tuneflow';

export class UpdateTrackOutput extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-track-output';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      trackId: {
        displayName: {
          zh: '轨道',
          en: 'Track',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.TrackSelector,
          config: {} as TrackSelectorWidgetConfig,
        },
        hidden: true,
      },
      output: {
        displayName: {
          zh: '输出',
          en: 'Output',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        optional: true,
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    const output = this.getParam<any>(params, 'output');
    if (!output) {
      track.removeOutput();
    } else {
      track.setOutput({
        type: output.type,
        trackId: output.trackId,
      });
    }
  }
}
