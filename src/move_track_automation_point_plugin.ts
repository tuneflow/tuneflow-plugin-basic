import { TuneflowPlugin, WidgetType, AutomationTarget } from 'tuneflow';
import type { LabelText, TrackSelectorWidgetConfig, ParamDescriptor, Song } from 'tuneflow';

export class MoveTrackAutomationPoints extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'move-track-automation-points';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '移动轨道自动化数据点',
      en: 'Move Track Automation Points',
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
      pointIds: {
        displayName: {
          zh: '数据点',
          en: 'Automation Point Ids',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      offsetTick: {
        displayName: {
          zh: '时间偏移量',
          en: 'Offset Tick',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
        },
        adjustable: false,
        hidden: true,
      },
      offsetValue: {
        displayName: {
          zh: '值偏移量 (-1 ~ 1)',
          en: 'Offset Value (-1 ~ 1)',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
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
    const pointIds = this.getParam<number[]>(params, 'pointIds');
    const offsetTick = this.getParam<number>(params, 'offsetTick');
    const offsetValue = this.getParam<number>(params, 'offsetValue');

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
    automationValue.movePoints(pointIds, offsetTick, offsetValue);
  }
}
