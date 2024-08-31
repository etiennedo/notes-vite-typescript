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
  newNote()
  console.log("new note started!");
  });
});

// Create DB
const db = new Dexie("NotesDatabase") as Dexie & {
    notes: EntityTable<
    Note,
    'id'
    >;
};
db.version(1).stores({
  notes: "++id, content"
});

// New note to db
const newNote = async () => {
  noteContent.value = "";
  noteId = null;
  /* const id = await db.notes.add({ content: "" });
  noteId = id;
  getAllNotes(); */
};

// Save note to DB
const saveNote = async (content: string) => {
    if (noteId !== null && noteContent !== null) {
        await db.notes.update(noteId, { content: content });
    } else {
      const id = await db.notes.add({ content: content });
      noteId = id;
    }
    getAllNotes();
};

//delete note
const deleteNote = async (noteContent: number) => {
  if (noteId !== null) {
      await db.notes.delete(noteContent);
      noteId = null;
  }
  getAllNotes();
};

// Generate note list from DB
async function getAllNotes() {
  try {
    const notes = await db.notes.toArray();
    console.log(notes);

    notes.reverse();

    const notesList = document.getElementById("notesList") as HTMLUListElement;
    notesList.innerHTML = '';

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
                li.classList.add("selected")
                li.classList.remove("not-selected")
                noteContent.value = note.content;
                noteId = note.id;
        });
    });
  } catch (error) {
    console.error('Error getting notes:', error);
  }
};

// Selected note functionality
const noteInList = document.querySelectorAll("li.not-selected");

try {
    noteInList.forEach((note) => {
        note.addEventListener("click", () => {
            note.classList.add("selected");
        });
    });
}
catch (error) {
    console.error("Error gathering note list: ", error)
}

getAllNotes();