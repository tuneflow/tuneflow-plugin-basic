import type { ParamDescriptor, SliderWidgetConfig, Song } from 'tuneflow';
import { TuneflowPlugin, WidgetType } from 'tuneflow';

export class TempoScaler extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'tempo-scaler';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      scale: {
        displayName: {
          zh: '速率',
          en: 'Speed Ratio',
        },
        defaultValue: 100,
        widget: {
          type: WidgetType.Slider,
          config: {
            step: 10,
            minValue: 10,
            maxValue: 500,
            unit: '%',
          } as SliderWidgetConfig,
        },
        adjustableWhenPluginIsApplied: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    for (const tempoEvent of song.getTempoChanges()) {
      song.updateTempo(tempoEvent, (tempoEvent.getBpm() * params.scale) / 100);
    }
  }
}
