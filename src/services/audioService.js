import { Audio } from 'expo-av';
import { useMusicStore } from '../store/musicStore';

class AudioService {
  constructor() {
    this.sound = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
      });
      this.isInitialized = true;
      console.log('✅ Audio initialized');
    } catch (error) {
      console.error('Erreur initialisation Audio:', error);
      // Continuez même si l'initialisation échoue
      this.isInitialized = true;
    }
  }

  async loadTrack(track) {
    try {
      // Unload previous track
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      // Load new track
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.path },
        { shouldPlay: false }
      );

      this.sound = sound;

      // Set up onPlaybackStatusUpdate
      this.sound.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate);

      return this.sound;
    } catch (error) {
      console.error('Erreur chargement piste:', error);
      throw error;
    }
  }

  onPlaybackStatusUpdate = (status) => {
    const { setPosition, setDuration, setIsPlaying } = useMusicStore.getState();

    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);

      // Auto-play next when current finishes
      if (status.didJustFinish && !status.isLooping) {
        const { playNext } = useMusicStore.getState();
        playNext();
      }
    } else if (status.error) {
      console.error('Erreur lecture audio:', status.error);
    }
  };

  async play() {
    try {
      if (this.sound) {
        await this.sound.playAsync();
        useMusicStore.setState({ isPlaying: true });
      }
    } catch (error) {
      console.error('Erreur démarrage lecture:', error);
    }
  }

  async pause() {
    try {
      if (this.sound) {
        await this.sound.pauseAsync();
        useMusicStore.setState({ isPlaying: false });
      }
    } catch (error) {
      console.error('Erreur pause:', error);
    }
  }

  async stop() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        useMusicStore.setState({ isPlaying: false });
      }
    } catch (error) {
      console.error('Erreur arrêt:', error);
    }
  }

  async setPosition(positionMillis) {
    try {
      if (this.sound) {
        await this.sound.setPositionAsync(positionMillis);
      }
    } catch (error) {
      console.error('Erreur changement position:', error);
    }
  }

  async setVolume(volume) {
    try {
      if (this.sound) {
        await this.sound.setVolumeAsync(volume);
      }
    } catch (error) {
      console.error('Erreur changement volume:', error);
    }
  }

  async unload() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Erreur déchargement:', error);
    }
  }
}

export const audioService = new AudioService();
