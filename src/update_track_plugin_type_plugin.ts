import {
  AudioPlugin,
  decodeAudioPluginTuneflowId,
  TrackType,
  TuneflowPlugin,
  WidgetType,
} from 'tuneflow';
import type {
  SwitchWidgetConfig,
  LabelText,
  TrackSelectorWidgetConfig,
  ParamDescriptor,
  Song,
} from 'tuneflow';
import _ from 'underscore';

export class UpdateTrackPluginType extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-track-plugin-type';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '更改轨道插件',
      en: 'Change Track Plugin',
    };
  }

  static allowReset(): boolean {
    return false;
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
          config: {
            alwaysShowTrackInfo: true,
          } as TrackSelectorWidgetConfig,
        },
        adjustable: false,
        hidden: true,
      },
      isSamplerPlugin: {
        displayName: {
          zh: '是否为音源插件',
          en: 'Is Sampler Plugin',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.Switch,
          config: {} as SwitchWidgetConfig,
        },
        adjustable: false,
        hidden: true,
      },
      pluginIndex: {
        displayName: {
          zh: '插件序号',
          en: 'Plugin Index',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
          config: {},
        },
        adjustable: false,
        hidden: true,
      },
      newPluginTfId: {
        displayName: {
          zh: '更改为',
          en: 'Change to',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
          config: {},
        },
        adjustable: false,
        hidden: true,
      },
      base64States: {
        displayName: {
          zh: '插件状态',
          en: 'Plugin States',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
          config: {},
        },
        adjustable: false,
        optional: true,
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const isSamplerPlugin = this.getParam<boolean>(params, 'isSamplerPlugin');
    const pluginIndex = this.getParam<number>(params, 'pluginIndex');
    const newPluginTfId = this.getParam<string>(params, 'newPluginTfId');
    const base64States = this.getParam<string | undefined>(params, 'base64States');

    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found.`);
    }
    if (isSamplerPlugin && track.getType() !== TrackType.MIDI_TRACK) {
      throw new Error('Sampler plugin can only be set on MIDI tracks.');
    }
    const audioPluginInfo = decodeAudioPluginTuneflowId(newPluginTfId);
    // Plugin instance id will be re-generated.
    const newPlugin = new AudioPlugin(
      audioPluginInfo.name,
      audioPluginInfo.manufacturerName,
      audioPluginInfo.pluginFormatName,
      audioPluginInfo.pluginVersion,
    );
    if (_.isString(base64States) && base64States !== '') {
      newPlugin.setBase64States(base64States);
    }
    if (isSamplerPlugin) {
      track.setSamplerPlugin(newPlugin, /* clearAutomation= */ true);
    } else {
      track.setAudioPluginAt(pluginIndex, newPlugin, /* clearAutomation= */ true);
    }
  }
}
