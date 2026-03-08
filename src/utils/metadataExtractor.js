import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';

// Extraire l'image APIC (Album Art) du frame ID3
const extractAPICImage = (frameData) => {
    try {
        if (!frameData || frameData.length < 10) return null;

        const encoding = frameData[0];
        let offset = 1;

        // Lire le mime type (null-terminated string ASCII)
        let mimeEnd = offset;
        while (mimeEnd < frameData.length && frameData[mimeEnd] !== 0) {
            mimeEnd++;
        }

        if (mimeEnd >= frameData.length) return null;

        const mimeType = String.fromCharCode(...frameData.slice(offset, mimeEnd));
        offset = mimeEnd + 1;

        // Sauter le picture type byte
        if (offset >= frameData.length) return null;
        const pictureType = frameData[offset];
        offset += 1;

        // Lire la description (null-terminated string selon encoding)
        let descEnd = offset;
        const descNull = encoding === 1 ? 2 : 1; // UTF-16 = 2 bytes null, sinon 1
        
        while (descEnd < frameData.length - descNull) {
            let isNull = true;
            for (let i = 0; i < descNull; i++) {
                if (frameData[descEnd + i] !== 0) {
                    isNull = false;
                    break;
                }
            }
            if (isNull) break;
            descEnd++;
        }
        
        offset = descEnd + descNull;

        // Les données d'image restantes
        const imageBuffer = frameData.slice(offset);

        if (imageBuffer.length < 10) return null; // Image trop petite

        // Convertir en base64
        let binaryString = '';
        for (let i = 0; i < imageBuffer.length; i++) {
            binaryString += String.fromCharCode(imageBuffer[i]);
        }
        const base64 = btoa(binaryString);

        // Retourner data URI avec le bon MIME type
        const finalMimeType = mimeType.trim() || 'image/jpeg';
        return `data:${finalMimeType};base64,${base64}`;
    } catch (error) {
        console.error('Erreur extraction APIC:', error);
        return null;
    }
};

// Parser ID3 - Version production
const parseID3 = (buffer) => {
    try {
        const tags = {};

        // ===== ID3v2 (début du fichier) =====
        if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) { // "ID3"
            const version = buffer[3];

            // Taille du tag (synchsafe integer)
            const tagSize = ((buffer[6] & 0x7F) << 21) |
                ((buffer[7] & 0x7F) << 14) |
                ((buffer[8] & 0x7F) << 7) |
                (buffer[9] & 0x7F);

            let offset = 10;
            const endOffset = Math.min(10 + tagSize, buffer.length);

            while (offset < endOffset - 10) {
                if (buffer[offset] === 0x00) break;

                const frameId = String.fromCharCode(
                    buffer[offset],
                    buffer[offset + 1],
                    buffer[offset + 2],
                    buffer[offset + 3]
                );

                let frameSize;
                if (version === 4) {
                    frameSize = ((buffer[offset + 4] & 0x7F) << 21) |
                        ((buffer[offset + 5] & 0x7F) << 14) |
                        ((buffer[offset + 6] & 0x7F) << 7) |
                        (buffer[offset + 7] & 0x7F);
                } else {
                    frameSize = (buffer[offset + 4] << 24) |
                        (buffer[offset + 5] << 16) |
                        (buffer[offset + 6] << 8) |
                        buffer[offset + 7];
                }

                if (frameSize <= 0 || frameSize > 1000000 || offset + 10 + frameSize > buffer.length) break;

                const frameDataStart = offset + 10;
                const frameData = buffer.slice(frameDataStart, frameDataStart + frameSize);

                const encoding = frameData[0];
                const text = decodeText(frameData.slice(1), encoding);

                switch (frameId) {
                    case 'TIT2': tags.title = text; break;
                    case 'TPE1': tags.artist = text; break;
                    case 'TALB': tags.album = text; break;
                    case 'TYER': tags.year = text; break;
                    case 'TDRC': tags.year = text; break;
                    case 'TRCK': tags.track = text; break;
                    case 'TCON': tags.genre = text; break;
                    case 'TPE2': tags.albumArtist = text; break;
                    case 'TCOM': tags.composer = text; break;
                    case 'APIC': 
                      // Extraire l'image APIC
                      if (!tags.thumbnail) {
                        const imageData = extractAPICImage(frameData);
                        if (imageData) {
                          tags.thumbnail = imageData;
                          console.log('✅ Image APIC trouvée, taille:', imageData.length);
                        } else {
                          console.log('⚠️ Frame APIC trouvé mais extraction échouée');
                        }
                      }
                      break;
                }

                offset += 10 + frameSize;
            }

            if (tags.title || tags.artist || tags.album) {
                return tags;
            }
        }

        // ===== ID3v1 (fin du fichier, 128 bytes) =====
        if (buffer.length >= 128) {
            const id3v1Start = buffer.length - 128;
            if (buffer[id3v1Start] === 0x54 &&
                buffer[id3v1Start + 1] === 0x41 &&
                buffer[id3v1Start + 2] === 0x47) { // "TAG"

                tags.title = decodeText(buffer.slice(id3v1Start + 3, id3v1Start + 33)).trim();
                tags.artist = decodeText(buffer.slice(id3v1Start + 33, id3v1Start + 63)).trim();
                tags.album = decodeText(buffer.slice(id3v1Start + 63, id3v1Start + 93)).trim();
                tags.year = decodeText(buffer.slice(id3v1Start + 93, id3v1Start + 97)).trim();

                const genreId = buffer[id3v1Start + 127];
                tags.genre = getGenreName(genreId);

                return tags;
            }
        }

        return null;
    } catch (error) {
        return null;
    }
};

// Genres ID3v1
const getGenreName = (id) => {
    const genres = [
        'Blues', 'Classic Rock', 'Country', 'Dance', 'Disco', 'Funk', 'Grunge',
        'Hip-Hop', 'Jazz', 'Metal', 'New Age', 'Oldies', 'Other', 'Pop', 'R&B',
        'Rap', 'Reggae', 'Rock', 'Techno', 'Industrial', 'Alternative', 'Ska',
        'Death Metal', 'Pranks', 'Soundtrack', 'Euro-Techno', 'Ambient',
        'Trip-Hop', 'Vocal', 'Jazz+Funk', 'Fusion', 'Trance', 'Classical',
        'Instrumental', 'Acid', 'House', 'Game', 'Sound Clip', 'Gospel', 'Noise',
        'AlternRock', 'Bass', 'Soul', 'Punk', 'Space', 'Meditative',
        'Instrumental Pop', 'Instrumental Rock', 'Ethnic', 'Gothic', 'Darkwave'
    ];
    return genres[id] || 'Inconnu';
};

// Décoder le texte
const decodeText = (buffer, encoding = 0) => {
    if (!buffer || buffer.length === 0) return '';

    try {
        let text = '';

        if (encoding === 0) {
            text = String.fromCharCode(...Array.from(buffer));
        } else if (encoding === 1) {
            let start = 0;
            if ((buffer[0] === 0xFF && buffer[1] === 0xFE) ||
                (buffer[0] === 0xFE && buffer[1] === 0xFF)) {
                start = 2;
            }
            const chars = [];
            for (let i = start; i < buffer.length - 1; i += 2) {
                const char = buffer[i] | (buffer[i + 1] << 8);
                if (char === 0) break;
                chars.push(char);
            }
            text = String.fromCharCode(...chars);
        } else if (encoding === 2) {
            const chars = [];
            for (let i = 0; i < buffer.length - 1; i += 2) {
                const char = (buffer[i] << 8) | buffer[i + 1];
                if (char === 0) break;
                chars.push(char);
            }
            text = String.fromCharCode(...chars);
        } else if (encoding === 3) {
            text = new TextDecoder('utf-8').decode(buffer);
        }

        return text.replace(/\0/g, '').trim();
    } catch (error) {
        return '';
    }
};

// Charger TOUS les fichiers audio avec callback progressif
export const loadAudioFilesWithMetadata = async (onProgressUpdate) => {
    try {
        const hasPermission = await MediaLibrary.requestPermissionsAsync();
        if (hasPermission.status !== 'granted') {
            console.warn('❌ Permissions refusées');
            return [];
        }

        console.log('📊 Chargement des fichiers audio...');

        const media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
            sortBy: [['modificationTime', false]],
            first: 1000,
        });

        if (!media.assets || media.assets.length === 0) {
            console.warn('⚠️ Aucun fichier audio trouvé');
            return [];
        }

        console.log(`✅ ${media.assets.length} fichiers trouvés`);

        const startTime = Date.now();
        const audioFiles = [];

        // Traiter par batch de 10
        const BATCH_SIZE = 10;
        for (let i = 0; i < media.assets.length; i += BATCH_SIZE) {
            const batch = media.assets.slice(i, i + BATCH_SIZE);

            const results = await Promise.all(
                batch.map(async (asset) => {
                    try {
                        const fileInfo = await FileSystem.getInfoAsync(asset.uri);

                        if (!fileInfo.exists) {
                            throw new Error('Fichier introuvable');
                        }

                        // Lire les premiers 500KB (pour inclure les grosses images APIC)
                        const readSize = Math.min(500000, fileInfo.size);
                        const startData = await FileSystem.readAsStringAsync(asset.uri, {
                            encoding: FileSystem.EncodingType.Base64,
                            length: readSize,
                            position: 0,
                        });

                        // Convertir en Uint8Array
                        const binaryString = atob(startData);
                        let buffer = new Uint8Array(binaryString.length);
                        for (let j = 0; j < binaryString.length; j++) {
                            buffer[j] = binaryString.charCodeAt(j);
                        }

                        let id3Tags = parseID3(buffer);

                        // Tentative ID3v1 si pas de tags v2
                        if (!id3Tags && fileInfo.size > 128) {
                            try {
                                const endData = await FileSystem.readAsStringAsync(asset.uri, {
                                    encoding: FileSystem.EncodingType.Base64,
                                    length: 128,
                                    position: fileInfo.size - 128,
                                });

                                const binaryEnd = atob(endData);
                                const endBuffer = new Uint8Array(128);
                                for (let j = 0; j < 128; j++) {
                                    endBuffer[j] = binaryEnd.charCodeAt(j);
                                }

                                id3Tags = parseID3(endBuffer);
                            } catch (e) {
                                // Ignorer
                            }
                        }

                        const hasImage = !!id3Tags?.thumbnail;
                        if (hasImage) {
                          console.log(`🎵 ${id3Tags.title} - Image trouvée (${(id3Tags.thumbnail.length / 1024).toFixed(1)}KB)`);
                        }

                        return {
                          id: asset.id,
                          uri: asset.uri,
                          path: asset.uri,
                          filename: asset.filename || 'Sans titre',
                          duration: asset.duration || 0,
                          title: id3Tags?.title || asset.filename?.replace(/\.[^/.]+$/, '') || 'Sans titre',
                          artist: id3Tags?.artist || 'Artiste inconnu',
                          album: id3Tags?.album || 'Album inconnu',
                          genre: id3Tags?.genre || 'Inconnu',
                          year: id3Tags?.year || null,
                          track: id3Tags?.track || null,
                          thumbnail: id3Tags?.thumbnail || null,
                          type: 'audio',
                        };
                    } catch (error) {
                        // Fallback
                        return {
                            id: asset.id,
                            uri: asset.uri,
                            path: asset.uri,
                            filename: asset.filename || 'Sans titre',
                            duration: asset.duration || 0,
                            title: asset.filename?.replace(/\.[^/.]+$/, '') || 'Sans titre',
                            artist: 'Artiste inconnu',
                            album: 'Album inconnu',
                            genre: 'Inconnu',
                            thumbnail: null,
                            type: 'audio',
                        };
                    }
                })
            );

            audioFiles.push(...results);

            // Callback pour affichage progressif
            if (onProgressUpdate) {
                onProgressUpdate([...audioFiles], Math.min(i + BATCH_SIZE, media.assets.length), media.assets.length);
            }

            // Log du progrès
            if ((i + BATCH_SIZE) % 50 === 0 || i + BATCH_SIZE >= media.assets.length) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`   ${Math.min(i + BATCH_SIZE, media.assets.length)}/${media.assets.length} (${elapsed}s)`);
            }

            await new Promise(resolve => setTimeout(resolve, 10));
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✅ Terminé en ${elapsed}s`);

        // Statistiques
        const withTags = audioFiles.filter(f => f.artist !== 'Artiste inconnu').length;
        console.log(`📊 ${withTags}/${audioFiles.length} fichiers avec métadonnées\n`);

        return audioFiles;
    } catch (error) {
        console.error('❌ Erreur:', error);
        return [];
    }
};

export const parseArtistTitle = (filename) => {
    if (!filename) {
        return { artist: 'Inconnu', title: 'Sans titre' };
    }
    const name = filename.replace(/\.[^/.]+$/, '');
    return { artist: 'Inconnu', title: name };
};

export const groupByAlbum = (audioFiles) => {
    const albums = new Map();
    audioFiles.forEach(file => {
        const key = `${file.album}-${file.artist}`;
        if (!albums.has(key)) {
            albums.set(key, { id: key, name: file.album, artist: file.artist, tracks: [] });
        }
        albums.get(key).tracks.push(file);
    });
    return Array.from(albums.values());
};

export const groupByArtist = (audioFiles) => {
    const artists = new Map();
    audioFiles.forEach(file => {
        if (!artists.has(file.artist)) {
            artists.set(file.artist, { id: file.artist, name: file.artist, tracks: [], albums: new Set() });
        }
        const artist = artists.get(file.artist);
        artist.tracks.push(file);
        artist.albums.add(file.album);
    });
    const result = Array.from(artists.values());
    result.forEach(artist => { artist.albums = Array.from(artist.albums); });
    return result;
};

export const groupByGenre = (audioFiles) => {
    const genres = new Map();
    audioFiles.forEach(file => {
        if (file.genre && file.genre !== 'Inconnu') {
            if (!genres.has(file.genre)) {
                genres.set(file.genre, { id: file.genre, name: file.genre, tracks: [] });
            }
            genres.get(file.genre).tracks.push(file);
        }
    });
    return Array.from(genres.values());
};