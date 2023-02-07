import type { InputWidgetConfig, ParamDescriptor, Song, TrackSelectorWidgetConfig } from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TrackAudioPluginAdjust extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-audio-plugin-adjust';
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
        adjustable: false,
        hidden: true,
      },
      samplerPlugin: {
        displayName: {
          zh: '音源插件',
          en: 'Sampler Plugin',
        },
        defaultValue: null,
        widget: {
          type: WidgetType.Input,
          config: {} as InputWidgetConfig,
        },
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const samplerPlugin = this.getParam<any>(params, 'samplerPlugin');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    if (samplerPlugin && samplerPlugin.tfId) {
      let samplerPluginInstance = track.getSamplerPlugin();
      if (!samplerPluginInstance || !samplerPluginInstance.matchesTfId(samplerPlugin.tfId)) {
        samplerPluginInstance = track.createAudioPlugin(samplerPlugin.tfId);
        track.setSamplerPlugin(samplerPluginInstance);
      }
      samplerPluginInstance.setIsEnabled(samplerPlugin.isEnabled);
    }
  }
}
