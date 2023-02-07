import { TuneflowPlugin, WidgetType, AutomationTarget } from 'tuneflow';
import type { TrackSelectorWidgetConfig, ParamDescriptor, Song } from 'tuneflow';

export class UpdateTrackAutomationParamEnabled extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-track-automation-param-enabled';
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
      isEnabled: {
        displayName: {
          zh: '是否启用',
          en: 'Enabled',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const targetType = this.getParam<number>(params, 'targetType');
    const pluginInstanceId = this.getParam<string | undefined>(params, 'pluginInstanceId');
    const paramId = this.getParam<string | undefined>(params, 'paramId');
    const isEnabled = this.getParam<boolean>(params, 'isEnabled');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found.`);
    }
    if (!(targetType > 0)) {
      throw new Error(`Invalid target type ${targetType}`);
    }
    const tfAutomationTargetId = AutomationTarget.encodeAutomationTarget(
      targetType,
      pluginInstanceId,
      paramId,
    );
    const automationValue = track.getAutomation().getAutomationValueById(tfAutomationTargetId);
    if (!automationValue) {
      throw new Error(`Cannot find automation target ${tfAutomationTargetId} in track ${trackId}`);
    }
    automationValue.setDisabled(!isEnabled);
  }
}
