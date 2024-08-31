import Dexie, { type EntityTable } from "dexie";

interface Note {
  id: number;
  content: string;
}

// Save button
document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript is working!');

    const saveButton = document.getElementById("save") as HTMLButtonElement
    saveButton.addEventListener("click", function() {
        let noteContent = document.getElementById("noteContent") as HTMLInputElement
        let content = noteContent.value;
        
        saveNote(content);
        
        console.log("note saved!");

    });
});

// Create DB
const db = new Dexie("NotesDatabase") as Dexie & {
  notes: EntityTable<
  Note,
  "id"
  >;
};
db.version(1).stores({
    notes: "++id, content"
});

function saveNote(noteContent: string) {
    db.notes.add({
        content: `${noteContent}`
    });
};

// Show notes from DB in sidebar
async function getAllNotes() {
    try {
        const notes = await db.notes.toArray();
        console.log(notes);

        notes.reverse();

        const notesList = document.getElementById("notesList") as HTMLUListElement;

        let selectedNote: HTMLLIElement | null = null;

        notes.forEach((note: Note) => {
            const li = document.createElement("li");
            li.textContent = note.content;

            li.addEventListener("click", () => {
                if (selectedNote) {
                    selectedNote
                }
                
            });
            notesList.appendChild(li);
        });
    } catch (error) {
        console.error('Error getting notes: ', error);
    }
}

getAllNotes();