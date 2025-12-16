import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JOKE_API_URL = 'https://official-joke-api.appspot.com/random_joke';
const NOTES_KEY = 'notes';

export default function App() {
  const [joke, setJoke] = useState(null);
  const [jokeError, setJokeError] = useState('');
  const [jokeLoading, setJokeLoading] = useState(false);

  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState([]);
  const [notesError, setNotesError] = useState('');
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const stored = await AsyncStorage.getItem(NOTES_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setNotes(parsed);
          } else {
            setNotesError('Saved notes are corrupted');
            setNotes([]);
          }
        }
      } catch (error) {
        setNotesError('Failed to load notes');
      } finally {
        setNotesLoading(false);
      }
    };

    loadNotes();
  }, []);

  const handleFetchJoke = async () => {
    setJokeError('');
    setJokeLoading(true);
    try {
      const response = await fetch(JOKE_API_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setJoke(data);
    } catch (error) {
      setJokeError('Could not fetch a joke. Please try again.');
    } finally {
      setJokeLoading(false);
    }
  };

  const saveNotes = async (updatedNotes) => {
    try {
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      setNotesError('Failed to save notes');
    }
  };

  const handleAddNote = async () => {
    const trimmed = noteInput.trim();
    if (!trimmed) {
      return;
    }

    const updatedNotes = [...notes, trimmed];
    setNotes(updatedNotes);
    setNoteInput('');
    setNotesError('');

    await saveNotes(updatedNotes);
  };

  const handleClearNotes = async () => {
    setNotes([]);
    setNotesError('');

    try {
      await AsyncStorage.removeItem(NOTES_KEY);
    } catch (error) {
      setNotesError('Failed to clear notes');
    }
  };

  const renderNote = ({ item, index }) => (
    <View style={styles.noteItem}>
      <Text style={styles.noteText}>{`${index + 1}. ${item}`}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Codex Demo: Joke + Notes</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Random Joke</Text>
          <TouchableOpacity style={styles.button} onPress={handleFetchJoke}>
            <Text style={styles.buttonText}>Get joke</Text>
          </TouchableOpacity>
          {jokeLoading && <ActivityIndicator style={styles.spaced} />}
          {jokeError ? <Text style={styles.errorText}>{jokeError}</Text> : null}
          {joke && !jokeLoading ? (
            <View style={styles.jokeCard}>
              <Text style={styles.jokeText}>{joke.setup}</Text>
              <Text style={styles.jokePunchline}>{joke.punchline}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={noteInput}
              onChangeText={setNoteInput}
              placeholder="Write a note"
              style={styles.input}
            />
            <TouchableOpacity style={styles.button} onPress={handleAddNote}>
              <Text style={styles.buttonText}>Add note</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClearNotes}>
            <Text style={styles.buttonText}>Clear notes</Text>
          </TouchableOpacity>
          {notesLoading ? (
            <ActivityIndicator style={styles.spaced} />
          ) : notesError ? (
            <Text style={styles.errorText}>{notesError}</Text>
          ) : (
            <FlatList
              data={notes}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={renderNote}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.emptyText}>No notes yet</Text>}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButton: {
    marginTop: 12,
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  jokeCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e0ecff',
    borderRadius: 10,
  },
  jokeText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
  },
  jokePunchline: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    marginTop: 12,
    gap: 8,
  },
  noteItem: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  noteText: {
    color: '#111827',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    color: '#dc2626',
    marginTop: 8,
  },
  spaced: {
    marginTop: 12,
  },
});
