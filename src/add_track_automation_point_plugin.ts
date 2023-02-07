import { TuneflowPlugin, WidgetType, AutomationTarget } from 'tuneflow';
import type { TrackSelectorWidgetConfig, ParamDescriptor, Song, AutomationPoint } from 'tuneflow';

export class AddTrackAutomationPoint extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'add-track-automation-point';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      trackId: {
        displayName: {
          zh: '添加到轨道',
          en: 'Insert to Track',
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
      points: {
        displayName: {
          zh: '数据点',
          en: 'Automation Points',
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
    const points = this.getParam<AutomationPoint[]>(params, 'points');
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
    for (const point of points) {
      automationValue.addPoint(point.tick, point.value);
    }
  }
}
