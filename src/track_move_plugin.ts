import { InjectSource, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { LabelText, ParamDescriptor, Song, SongAccess } from 'tuneflow';

export class TrackMove extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-move';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '移动轨道',
      en: 'Move Track',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      trackIds: {
        displayName: {
          zh: '轨道',
          en: 'Track',
        },
        defaultValue: [],
        widget: {
          type: WidgetType.MultiTrackSelector,
          config: {},
        },
        hidden: true,
        injectFrom: InjectSource.SelectedTrackIds,
      },
      moveToTrackId: {
        displayName: {
          zh: '移动至轨道',
          en: 'Move to Track',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
      },
    };
  }

  songAccess(): SongAccess {
    return {
      removeTrack: true,
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackIds = this.getParam<string[]>(params, 'trackIds');
    if (trackIds.length === 0) {
      return;
    }
    if (trackIds.length > 1) {
      throw new Error('Currently only supporting moving 1 track.');
    }
    const moveTrackId = trackIds[0];
    const moveToTrackId = this.getParam<string>(params, 'moveToTrackId');
    if (moveTrackId === moveToTrackId) {
      return;
    }
    const moveFromIndex = song.getTrackIndex(moveTrackId);
    let moveToIndex = song.getTrackIndex(moveToTrackId);
    // Keep this check here since moveToIndex will change later.
    const movingDown = moveToIndex > moveFromIndex;
    if (moveFromIndex === -1) {
      throw new Error(`Cannot find track to move, trackId: ${moveTrackId}`);
    }
    if (moveToIndex === -1) {
      throw new Error(`Cannot find the move destination, trying to find trackId: ${moveToTrackId}`);
    }
    const track = song.getTracks().splice(moveFromIndex, 1)[0];
    moveToIndex = song.getTrackIndex(moveToTrackId);
    if (movingDown) {
      // Moving down, insert after the destination track.
      song.getTracks().splice(moveToIndex + 1, 0, track);
    } else {
      // Moving up, insert before the destination track.
      song.getTracks().splice(moveToIndex, 0, track);
    }
  }
}
