import { AudioPlugin, TrackType, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { InputNumberWidgetConfig, ParamDescriptor, Song } from 'tuneflow';

export class CreateEmptyTrack extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'create-empty-track';
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

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const type = this.getParam<number>(params, 'type');
    const insertIndex = this.getParam<number>(params, 'insertIndex');
    const newTrack = song.createTrack({
      type,
      index: insertIndex,
      assignDefaultSamplerPlugin: true,
    });
    if (type === TrackType.MIDI_TRACK) {
      newTrack.setSamplerPlugin(newTrack.createAudioPlugin(AudioPlugin.DEFAULT_SYNTH_TFID));
    }
  }
}
