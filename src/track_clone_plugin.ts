import type { ParamDescriptor, Song } from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TrackClone extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-clone';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      trackIds: {
        displayName: {
          zh: '原轨道',
          en: 'Track to clone',
        },
        defaultValue: [],
        widget: {
          type: WidgetType.MultiTrackSelector,
          config: {},
        },
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackIds = this.getParam<string[]>(params, 'trackIds');
    for (const trackId of trackIds) {
      const track = song.getTrackById(trackId);
      if (!track) {
        throw new Error(`Track ${trackId} not ready`);
      }
      song.cloneTrack(track);
    }
  }
}
