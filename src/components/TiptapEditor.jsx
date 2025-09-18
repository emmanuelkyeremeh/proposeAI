import React from "react";
import { Color } from "@tiptap/extension-color";
import { ListItem } from "@tiptap/extension-list-item";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import "./TiptapEditor.css";

const MenuBar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-menu-bar">
      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
      </div>

      <div className="menu-group">
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
          title="Heading 3"
        >
          H3
        </button>
      </div>

      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
          title="Bullet List"
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
          title="Quote"
        >
          "
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          —
        </button>
      </div>

      <div className="menu-group">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo"
        >
          ↶
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo"
        >
          ↷
        </button>
      </div>
    </div>
  );
};

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
];

// Inner component that has access to the editor
const EditorContent = ({ onUpdate, onSelectionChange, onEditorReady }) => {
  const { editor } = useCurrentEditor();

  React.useEffect(() => {
    if (editor && onEditorReady) {
      // Expose replaceText method to parent component
      onEditorReady({
        replaceText: (newText) => {
          if (editor) {
            const { from, to } = editor.state.selection;
            editor
              .chain()
              .focus()
              .deleteRange({ from, to })
              .insertContent(newText)
              .run();
          }
        },
      });
    }
  }, [editor, onEditorReady]);

  React.useEffect(() => {
    if (editor && onUpdate) {
      const handleUpdate = () => {
        onUpdate(editor.getHTML());
      };

      editor.on("update", handleUpdate);
      return () => editor.off("update", handleUpdate);
    }
  }, [editor, onUpdate]);

  React.useEffect(() => {
    if (editor && onSelectionChange) {
      const handleSelectionUpdate = () => {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to);
        onSelectionChange(selectedText);
      };

      editor.on("selectionUpdate", handleSelectionUpdate);
      return () => editor.off("selectionUpdate", handleSelectionUpdate);
    }
  }, [editor, onSelectionChange]);

  return null; // This component doesn't render anything
};

const TiptapEditor = React.forwardRef(
  ({ content, onUpdate, onSelectionChange }, ref) => {
    const [editorInstance, setEditorInstance] = React.useState(null);

    const handleEditorReady = React.useCallback((instance) => {
      setEditorInstance(instance);
    }, []);

    const handleUpdate = React.useCallback(
      (newContent) => {
        if (onUpdate) {
          onUpdate(newContent);
        }
      },
      [onUpdate]
    );

    const handleSelectionChange = React.useCallback(
      (selectedText) => {
        if (onSelectionChange) {
          onSelectionChange(selectedText);
        }
      },
      [onSelectionChange]
    );

    React.useEffect(() => {
      if (ref) {
        ref.current = editorInstance;
      }
    }, [ref, editorInstance]);

    return (
      <div className="tiptap-editor-container">
        <EditorProvider
          slotBefore={<MenuBar />}
          extensions={extensions}
          content={content}
          editorProps={{
            attributes: {
              class: "tiptap-editor-content",
            },
          }}
        >
          <EditorContent
            onUpdate={handleUpdate}
            onSelectionChange={handleSelectionChange}
            onEditorReady={handleEditorReady}
          />
        </EditorProvider>
      </div>
    );
  }
);

export default TiptapEditor;
