import Dexie, { type EntityTable } from 'dexie';

interface Note {
    id: number;
    content: string;
}

class Note {
    id: number
    content: string
    constructor(id: number, content: string) {
        this.id = id;
        this.content = content;
    }
}

const noteContent = document.getElementById("noteContent") as HTMLTextAreaElement;
let noteId: number | null = null;

// Save and delete buttons
document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript is working!');

    const saveButton: HTMLElement = document.getElementById("save") as HTMLButtonElement;
    saveButton.addEventListener("click", () => {
        saveNote(noteContent.value);
        console.log("note saved with button!");
    });

    document.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "s") {
            event.preventDefault(); // Prevent the default "Save Page" action
            saveNote(noteContent.value);
            console.log("note saved with Cmd + S / Ctrl + S!");
        }
    });

    const deleteButton: HTMLElement = document.getElementById("delete") as HTMLButtonElement;
    deleteButton.addEventListener("click", () => {
        if (noteId !== null) {
            deleteNote(noteId);
        }
        noteContent.value = "";
        console.log("note deleted with button!");
    });

    const newButton: HTMLElement = document.getElementById("new") as HTMLButtonElement;
    newButton.addEventListener("click", () => {
        newNote();
        console.log("new note started!");
    });

    const searchBar = document.getElementById("search") as HTMLInputElement;
    searchBar?.addEventListener("input", () => {
            const searchTerm = searchBar.value.trim();
            searchNotes(searchTerm);
    });
});

// Create DB
const db = new Dexie("NotesDatabase") as Dexie & {
    notes: EntityTable<Note, 'id'>;
};
db.version(1).stores({
    notes: "++id, content"
});

// New note to db
const newNote = async () => {
    noteContent.value = "";
    noteId = null;
    await getAllNotes(); // Update the list of all notes
};

// Save note to DB
const saveNote = async (content: string) => {
    if (noteId !== null && noteContent !== null) {
        await db.notes.update(noteId, { content: content });
    } else {
        const id = await db.notes.add({ content: content });
        noteId = id;
    }
    await getAllNotes(); // Update the list of all notes
};

// Delete note
const deleteNote = async (id: number) => {
    if (noteId !== null) {
        noteId = id
        await db.notes.delete(id);
        noteId = null;
    }
    await getAllNotes(); // Update the list of all notes
};

// Render notes list
async function renderNotes(notes: Note[]) {
    const notesList = document.getElementById("notesList") as HTMLUListElement;
    notesList.innerHTML = '';

    notes.reverse();

    notes.forEach((note: Note) => {
        const li = document.createElement("li");
        li.textContent = note.content;
        notesList.appendChild(li);
        li.classList.add("not-selected");

        if (note.id === noteId) {
            li.classList.add("selected");
            li.classList.remove("not-selected");
            noteContent.value = note.content;
        }

        li.addEventListener("click", () => {
            notesList.querySelectorAll("li").forEach((item) => {
                item.classList.remove("selected");
                item.classList.add("not-selected");
            });
            li.classList.add("selected");
            li.classList.remove("not-selected");
            noteContent.value = note.content;
            noteId = note.id;
        });
    });
}

// Get all notes
async function getAllNotes() {
    try {
        const notes = await db.notes.toArray();
        await renderNotes(notes);
    } catch (error) {
        console.error('Error getting notes:', error);
    }
}

// Search notes and render results
async function searchNotes(keyword: string) {
    try {
        const searchResults = await db.notes
            .filter(note => note.content.includes(keyword))
            .toArray();
        await renderNotes(searchResults);
    } catch (error) {
        console.error("Error querying the database:", error);
    }
}

getAllNotes(); // Initial call to populate notes list