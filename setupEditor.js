import { EditorState, basicSetup } from "@codemirror/basic-setup";
import { defaultTabBinding } from "@codemirror/commands"
import { EditorView, keymap } from "@codemirror/view";
import { json } from "@codemirror/lang-json";

export default function setupEditor(){
    const jsonRequestBody = document.querySelector('[data-json-request-body]')
    const jsonResponseBody = document.querySelector('[data-json-response-body]')

    const basicExtantions = [
        basicSetup,
        keymap.of([defaultTabBinding]),
        json(),
        EditorState.tabSize.of(2)
    ]

    const requestEditor = new EditorView({
        state: EditorState.create({
          doc: "{\n\t\n}",
          extensions: basicExtantions,
        }),
        parent: jsonRequestBody,
      })

    const responsetEditor = new EditorView({
        state : EditorState.create({
            doc : "{}",
            extensions : [...basicExtantions, EditorView.editable.of(false)]
        }),
        parent : jsonResponseBody,
    })

    function updateResponseEditor(value) {
        responsetEditor.dispatch({
            changes : {
                from : 0,
                to : responsetEditor.state.doc.length,
                insert : JSON.stringify(value, null, 2)
            }
        })
    }

    return { requestEditor, updateResponseEditor }
}