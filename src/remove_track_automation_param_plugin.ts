import { TuneflowPlugin, WidgetType, AutomationTarget } from 'tuneflow';
import type { LabelText, TrackSelectorWidgetConfig, ParamDescriptor, Song } from 'tuneflow';

export class RemoveTrackAutomationParam extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'remove-track-automation-param';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '删除轨道自动化',
      en: 'Remove Track Automation',
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
      targetType: {
        displayName: {
          zh: '目标类型',
          en: 'Target Type',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      pluginInstanceId: {
        displayName: {
          zh: '插件实例Id',
          en: 'Plugin Instance Id',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
        optional: true,
      },
      paramId: {
        displayName: {
          zh: '自动化参数Id',
          en: 'Automation Parameter Id',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
        optional: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const targetType = this.getParam<number>(params, 'targetType');
    const pluginInstanceId = this.getParam<string | undefined>(params, 'pluginInstanceId');
    const paramId = this.getParam<string | undefined>(params, 'paramId');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found.`);
    }
    if (!(targetType > 0)) {
      throw new Error(`Invalid target type ${targetType}`);
    }
    track
      .getAutomation()
      .removeAutomation(new AutomationTarget(targetType, pluginInstanceId, paramId));
  }
}
