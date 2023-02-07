import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { TrackSelectorWidgetConfig, ParamDescriptor, Song } from 'tuneflow';
import _ from 'underscore';

export class UpdateTrackPluginSettings extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-track-plugin-settings';
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
          zh: '是否是音源插件',
          en: 'Is Sampler Plugin',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
          config: {},
        },
        adjustable: false,
        hidden: true,
      },
      pluginId: {
        displayName: {
          zh: '插件ID',
          en: 'Plugin ID',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
          config: {},
        },
        adjustable: false,
        hidden: true,
      },
      isEnabled: {
        displayName: {
          zh: '是否启用',
          en: 'Enabled',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
          config: {},
        },
        adjustable: false,
        hidden: true,
        optional: true,
      },
      base64States: {
        displayName: {
          zh: 'Base64格式插件状态',
          en: 'Base64-encoded Plugin States',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
          config: {},
        },
        adjustable: false,
        hidden: true,
        optional: true,
      },
      updateStates: {
        displayName: {
          zh: '是否更新状态',
          en: 'Whether to Update Plugin States',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
          config: {},
        },
        adjustable: false,
        hidden: true,
        optional: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const isSamplerPlugin = this.getParam<boolean | undefined>(params, 'isSamplerPlugin');
    const pluginId = this.getParam<string>(params, 'pluginId');
    const isEnabled = this.getParam<boolean | undefined>(params, 'isEnabled');
    const base64States = this.getParam<string | undefined>(params, 'base64States');
    const updateStates = this.getParam<boolean | undefined>(params, 'updateStates');

    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found.`);
    }
    if (!_.isBoolean(isSamplerPlugin)) {
      throw new Error(`isSamplerPlugin not specified`);
    }
    let plugin;
    if (isSamplerPlugin) {
      plugin = track.getSamplerPlugin();
    } else {
      plugin = track.getPluginByInstanceId(pluginId);
    }
    if (!plugin) {
      throw new Error('Plugin not specified yet.');
    }
    if (_.isBoolean(isEnabled)) {
      plugin.setIsEnabled(isEnabled);
    }
    if (updateStates) {
      // Set states regardless since the states might be set to empty, which will cause
      // TF-Link to reset the plugin.
      plugin.setBase64States(base64States);
    }
  }
}
