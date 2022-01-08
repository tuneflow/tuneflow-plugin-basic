import type {
  LabelText,
  ParamDescriptor,
  PitchWidgetConfig,
  Song,
  TrackSelectorWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TrackDivider extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-divider';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '轨道分割',
      en: 'Track Divider',
    };
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      track: {
        displayName: {
          zh: '轨道',
          en: 'Track',
        },
        widget: {
          type: WidgetType.TrackSelector,
          config: {
            multiSelection: false,
          } as TrackSelectorWidgetConfig,
        },
      },
      pitch: {
        displayName: {
          zh: '分割音高',
          en: 'Dividing Pitch',
        },
        defaultValue: 60,
        widget: {
          type: WidgetType.Pitch,
          config: {} as PitchWidgetConfig,
        },
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(
    song: Song,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inputs: { [inputName: string]: any },
    params: { [paramName: string]: any },
  ): Promise<void | { [artifactId: string]: any }> {
    console.log(params.track);
    console.log(params.pitch);
  }
}
