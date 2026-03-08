// Service pour gérer la logique métier de la musique

export const musicService = {
  // Chargement des fichiers musicaux
  async loadMusicFiles() {
    try {
      // À implémenter: charger les fichiers musicaux du système
      return [];
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      return [];
    }
  },

  // Filtrer les pistes
  filterTracks(tracks, searchQuery, sortBy = 'title') {
    let filtered = tracks;

    if (searchQuery) {
      filtered = filtered.filter(
        (track) =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tri
    switch (sortBy) {
      case 'artist':
        return filtered.sort((a, b) =>
          a.artist.localeCompare(b.artist)
        );
      case 'duration':
        return filtered.sort((a, b) => a.duration - b.duration);
      case 'date':
        return filtered.sort(
          (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
        );
      default:
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
  },

  // Grouper les pistes par artiste
  groupByArtist(tracks) {
    const grouped = {};
    tracks.forEach((track) => {
      if (!grouped[track.artist]) {
        grouped[track.artist] = [];
      }
      grouped[track.artist].push(track);
    });
    return grouped;
  },

  // Grouper les pistes par album
  groupByAlbum(tracks) {
    const grouped = {};
    tracks.forEach((track) => {
      if (!grouped[track.album]) {
        grouped[track.album] = [];
      }
      grouped[track.album].push(track);
    });
    return grouped;
  },

  // Grouper les pistes par genre
  groupByGenre(tracks) {
    const grouped = {};
    tracks.forEach((track) => {
      if (!grouped[track.genre]) {
        grouped[track.genre] = [];
      }
      grouped[track.genre].push(track);
    });
    return grouped;
  },

  // Calculer la durée totale
  calculateTotalDuration(tracks) {
    return tracks.reduce((total, track) => total + (track.duration || 0), 0);
  },

  // Formater la durée en mm:ss
  formatDuration(ms) {
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
