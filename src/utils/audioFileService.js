import * as MediaLibrary from 'expo-media-library';

export const audioFileService = {
  // Demander les permissions
  async requestPermissions() {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erreur permissions:', error);
      return false;
    }
  },

  // Charger tous les fichiers audio
  async loadAudioFiles() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Permissions refusées');
        return [];
      }

      // Charger les fichiers audio
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        sortBy: [['modificationTime', false]], // Plus récents en premier
        first: 1000, // Charger jusqu'à 1000 fichiers
      });

      // Debug: voir ce que MediaLibrary retourne
      if (media.assets.length > 0) {
        console.log('📊 Exemple de métadonnées reçues:', {
          filename: media.assets[0].filename,
          album: media.assets[0].album,
          duration: media.assets[0].duration,
          width: media.assets[0].width,
          height: media.assets[0].height,
        });
      }

      // Transformer les données et extraire les métadonnées
      const audioFiles = media.assets.map((asset) => {
        const filename = asset.filename || 'Sans titre';
        const nameWithoutExt = filename.replace(/\.[^.]+$/, ''); // Retirer l'extension
        
        let title = nameWithoutExt;
        let artist = 'Artiste inconnu';
        let album = 'Album inconnu';
        
        // Nettoyer le nom: remplacer underscores par espaces et normaliser
        let cleanName = nameWithoutExt
          .replace(/_/g, ' ')           // Remplacer _ par espace
          .replace(/\s+/g, ' ')         // Normaliser espaces multiples
          .replace(/\(256k\)|\(999998\)/gi, '') // Retirer bitrate
          .replace(/Official_Lyrics_Vidéo|Official_Lyrics_Video|Clip_officiel|Visualizer_officiel|Clip_Officiel/gi, '') // Retirer descriptions
          .trim();
        
        // Essayer de parser "Artiste - Titre"
        const simpleSplit = cleanName.split(' - ');
        
        if (simpleSplit.length === 2) {
          artist = simpleSplit[0].trim();
          title = simpleSplit[1].trim();
        } else if (simpleSplit.length > 2) {
          artist = simpleSplit[0].trim();
          album = simpleSplit[1].trim();
          title = simpleSplit.slice(2).join(' - ').trim();
        } else {
          // Si pas de tiret, utiliser le nom nettoyé
          title = cleanName;
        }
        
        // Priorité: Utiliser les métadonnées de MediaLibrary si disponibles
        if (asset.album && asset.album.length > 0) {
          album = asset.album;
        }
        
        return {
          id: asset.id,
          title: title || 'Sans titre',
          artist: artist,
          album: album,
          duration: asset.duration || 0,
          uri: asset.uri,
          thumbnail: null,
          type: asset.mediaType,
        };
      });

      console.log(`✅ ${audioFiles.length} fichiers audio trouvés`);
      audioFiles.slice(0, 30).forEach(f => 
        console.log(`   - ${f.artist} | ${f.album} | ${f.title}`)
      );
      return audioFiles;
    } catch (error) {
      console.error('Erreur chargement fichiers audio:', error);
      return [];
    }
  },

  // Charger les fichiers par album
  async loadAlbums() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return [];

      const albums = await MediaLibrary.getAlbumsAsync({
        mediaType: 'audio',
      });

      return albums.map((album) => ({
        id: album.id,
        title: album.title,
        assetCount: album.assetCount,
      }));
    } catch (error) {
      console.error('Erreur chargement albums:', error);
      return [];
    }
  },

  // Charger les fichiers d'un album
  async loadAlbumTracks(albumId) {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        album: albumId,
        mediaType: 'audio',
      });

      return media.assets.map((asset) => ({
        id: asset.id,
        title: asset.filename || 'Sans titre',
        artist: asset.album || 'Artiste inconnu',
        album: asset.album || 'Album inconnu',
        duration: asset.duration || 0,
        uri: asset.uri,
        thumbnail: null,
      }));
    } catch (error) {
      console.error('Erreur chargement pistes album:', error);
      return [];
    }
  },

  // Rechercher des fichiers
  searchAudioFiles(query, audioFiles = []) {
    try {
      if (!query || query.trim() === '') {
        return audioFiles;
      }

      const lowerQuery = query.toLowerCase();

      return audioFiles.filter(
        (file) =>
          file.title.toLowerCase().includes(lowerQuery) ||
          file.artist.toLowerCase().includes(lowerQuery) ||
          file.album.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Erreur recherche:', error);
      return audioFiles;
    }
  },

  // Grouper par artiste
  groupByArtist(audioFiles) {
    const grouped = {};
    audioFiles.forEach((file) => {
      const artist = file.artist || 'Artiste inconnu';
      if (!grouped[artist]) {
        grouped[artist] = [];
      }
      grouped[artist].push(file);
    });
    return grouped;
  },

  // Grouper par album
  groupByAlbum(audioFiles) {
    const grouped = {};
    audioFiles.forEach((file) => {
      const album = file.album || 'Album inconnu';
      if (!grouped[album]) {
        grouped[album] = [];
      }
      grouped[album].push(file);
    });
    return grouped;
  },

  // Formater durée
  formatDuration(ms) {
    if (!ms) return '0:00';
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 1000 / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },
};
