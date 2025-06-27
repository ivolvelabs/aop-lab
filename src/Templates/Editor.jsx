import '@mdxeditor/editor/style.css'
import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  headingsPlugin,
  BlockTypeSelect,
  markdown$,
} from "@mdxeditor/editor";
import "./Editor.css"
import { useState } from 'react';

function Editor({ handleSave }) {
  const [value, setValue] = useState();

  // const handleChange = () => {
  //     setValue(event.target.markdown);
  // };

  console.log(value);
  return (
    <MDXEditor
      contentEditableClassName="editor"
      onChange={() => setValue(markdown$)}
      markdown="Write Here...."
      plugins={[
        toolbarPlugin({
          toolbarContents: () => (
            <>
              {" "}
              {/* <UndoRedo /> */}
              <BoldItalicUnderlineToggles />
              <BlockTypeSelect />
            </>
          ),
        }),
        headingsPlugin({
          allowedHeadingLevels: [1, 2],
        }),
      ]}
    />
  );
}

export default Editor