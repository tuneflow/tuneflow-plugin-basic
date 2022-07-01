import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { LabelText, TrackSelectorWidgetConfig, ParamDescriptor, Song } from 'tuneflow';
import _ from 'underscore';

export class UpdateTrackPluginSettings extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-track-plugin-settings';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '更改轨道插件设置',
      en: 'Update Track Plugin Settings',
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
    const pluginIndex = this.getParam<number>(params, 'pluginIndex');
    const isEnabled = this.getParam<boolean | undefined>(params, 'isEnabled');
    const base64States = this.getParam<string | undefined>(params, 'base64States');
    const updateStates = this.getParam<boolean | undefined>(params, 'updateStates');

    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found.`);
    }
    if (pluginIndex === 0) {
      const samplerPlugin = track.getSamplerPlugin();
      if (!samplerPlugin) {
        throw new Error('Sampler plugin not specified yet.');
      }
      if (_.isBoolean(isEnabled)) {
        samplerPlugin.setIsEnabled(isEnabled);
      }
      if (updateStates) {
        // Set states regardless since the states might be set to empty, which will cause
        // TF-Link to reset the plugin.
        samplerPlugin.setBase64States(base64States);
      }
    } else {
      throw new Error('Updating audio plugin is not supported yet.');
    }
  }
}
