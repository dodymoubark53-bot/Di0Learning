import JSZip from 'jszip';
import { decompress } from 'fzstd';

export async function parseAnkiApkg(file) {
  try {
    console.log('Step 1: Loading JSZip...');
    const zip = await JSZip.loadAsync(file);
    console.log('ZIP files:', Object.keys(zip.files));

    console.log('Step 2: Finding and decompressing database...');
    let dbUint8Array = null;

    // Priority 1: collection.anki21b (Anki 23.10+ format — zstd compressed SQLite)
    const anki21b = zip.file('collection.anki21b');
    if (anki21b) {
      console.log('Found collection.anki21b — decompressing zstandard...');
      const compressed = await anki21b.async('uint8array');
      dbUint8Array = decompress(compressed); // fzstd decompresses to Uint8Array
      console.log('Decompressed size:', dbUint8Array.length, 'bytes');
    }

    // Priority 2: collection.anki21 (plain SQLite, Anki 2.1.x)
    if (!dbUint8Array) {
      const anki21 = zip.file('collection.anki21');
      if (anki21) {
        console.log('Found collection.anki21 — reading plain SQLite...');
        dbUint8Array = await anki21.async('uint8array');
      }
    }

    // Priority 3: collection.anki2 (legacy plain SQLite)
    if (!dbUint8Array) {
      const anki2 = zip.file('collection.anki2');
      if (anki2) {
        console.log('Found collection.anki2 — reading plain SQLite...');
        dbUint8Array = await anki2.async('uint8array');
      }
    }

    if (!dbUint8Array) {
      throw new Error('No valid Anki database found in this file (.anki2, .anki21, or .anki21b).');
    }

    console.log('Step 3: Loading sql.js WASM...');
    let initSqlJs = window.initSqlJs;
    if (!initSqlJs) {
      // In case index.html script load is delayed, wait up to 5 seconds
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (window.initSqlJs) {
            clearInterval(interval);
            initSqlJs = window.initSqlJs;
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(interval);
          resolve();
        }, 5000);
      });
    }

    if (!initSqlJs) {
      throw new Error('sql.js library is not available. Please verify the CDN script tag in index.html');
    }

    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
    });
    console.log('sql.js initialized successfully');

    console.log('Step 4: Opening database...');
    const db = new SQL.Database(dbUint8Array);
    console.log('Database opened successfully');

    // Extract Decks mapping from col table
    console.log('Step 5: Extracting deck names...');
    let decksMap = {};
    try {
      const colRes = db.exec("SELECT decks FROM col LIMIT 1");
      if (colRes && colRes[0] && colRes[0].values[0]) {
        const decksJson = JSON.parse(colRes[0].values[0][0]);
        Object.values(decksJson).forEach(deck => {
          decksMap[deck.id.toString()] = deck;
        });
        console.log('Parsed decks mapping:', decksMap);
      }
    } catch (e) {
      console.warn('Could not parse decks JSON from col table, using fallback.', e);
      decksMap = { "1": { name: "Imported Deck" } };
    }

    // Get cards to map note -> deck (nid -> did)
    console.log('Step 6: Querying cards to map notes to decks...');
    let noteDeckMap = {};
    try {
      const cardsResult = db.exec("SELECT nid, did FROM cards");
      if (cardsResult && cardsResult[0]) {
        cardsResult[0].values.forEach(([nid, did]) => {
          noteDeckMap[nid.toString()] = did.toString();
        });
      }
    } catch (e) {
      console.warn('Could not map cards to decks:', e);
    }

    // Query notes table
    console.log('Step 7: Querying notes...');
    const notesResult = db.exec("SELECT id, flds, tags FROM notes");
    if (!notesResult.length || !notesResult[0].values.length) {
      throw new Error('No notes found in this Anki file.');
    }

    const importedCards = [];
    const deckNamesSet = new Set();

    const notesValues = notesResult[0].values;
    console.log('Raw notes retrieved count:', notesValues.length);

    for (const row of notesValues) {
      const noteId = row[0];
      const fieldsStr = row[1];
      const tagsStr = row[2];

      // Anki fields are split by the unit separator \x1f (\u001f)
      const fields = fieldsStr.split('\u001f');
      const front = fields[0] || '';
      const back = fields[1] || '';

      // Resolve deck ID and deck name
      const deckIdVal = noteDeckMap[noteId.toString()] || "1";
      let deckName = decksMap[deckIdVal.toString()]?.name || decksMap[deckIdVal]?.name || 'Imported Deck';
      
      // Clean Anki sub-decks formatting (e.g. parent::child)
      deckName = deckName.replace(/::/g, ' - ');
      deckNamesSet.add(deckName);

      importedCards.push({
        id: noteId,
        deckId: deckName,
        question: front,
        answer: back,
        tags: tagsStr ? tagsStr.split(' ').filter(Boolean) : []
      });
    }

    // Extract media mapping JSON
    console.log('Step 8: Extracting media assets...');
    let mediaMapping = {};
    const mediaFile = zip.file('media');
    if (mediaFile) {
      const mediaText = await mediaFile.async('text');
      mediaMapping = JSON.parse(mediaText);
    }

    // Extract media binary Blobs
    const mediaBlobs = {};
    for (const [zipKey, filename] of Object.entries(mediaMapping)) {
      const zipMediaFile = zip.file(zipKey);
      if (zipMediaFile) {
        const blob = await zipMediaFile.async('blob');
        mediaBlobs[filename] = blob;
      }
    }
    console.log('Media assets loaded count:', Object.keys(mediaBlobs).length);

    db.close();

    return {
      cards: importedCards,
      decks: Array.from(deckNamesSet),
      media: mediaBlobs
    };
  } catch (error) {
    console.error('Import failed at step:', error);
    throw error;
  }
}
