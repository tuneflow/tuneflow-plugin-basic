import { AutomationTarget, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { TrackSelectorWidgetConfig, ParamDescriptor, Song } from 'tuneflow';

export class UpdateTrackAutomationTarget extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-track-automation-target';
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
      targetIndex: {
        displayName: {
          zh: '参数位置',
          en: 'Parameter Index',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
          config: {},
        },
        adjustable: false,
        hidden: true,
      },
      newTargetType: {
        displayName: {
          zh: '新目标类型',
          en: 'New Target Type',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      newPluginInstanceId: {
        displayName: {
          zh: '新插件实例Id',
          en: 'New Plugin Instance Id',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
        optional: true,
      },
      newParamId: {
        displayName: {
          zh: '新自动化参数Id',
          en: 'New Automation Parameter Id',
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
    const targetIndex = this.getParam<number>(params, 'targetIndex');
    const newTargetType = this.getParam<number>(params, 'newTargetType');
    const newPluginInstanceId = this.getParam<string | undefined>(params, 'newPluginInstanceId');
    const newParamId = this.getParam<string | undefined>(params, 'newParamId');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found.`);
    }
    const target = track.getAutomation().getAutomationTargets()[targetIndex];
    if (!target) {
      throw new Error(`Track param @${targetIndex} of track ${trackId} does not exist`);
    }
    track.getAutomation().getAutomationTargets().splice(targetIndex, 1);
    track
      .getAutomation()
      .addAutomation(
        new AutomationTarget(newTargetType, newPluginInstanceId, newParamId),
        targetIndex,
      );
  }
}
