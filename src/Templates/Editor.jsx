import '@mdxeditor/editor/style.css'
import {
  MDXEditor,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  headingsPlugin,
  BlockTypeSelect,
} from "@mdxeditor/editor";
import "./Editor.css"
import { useState } from 'react';

function Editor({ handleSave }) {
  const [value, setValue] = useState();

  // const handleChange = () => {
  //     setValue(event.target.markdown);
  // };

  return (
    <MDXEditor
      contentEditableClassName="editor"
      onChange={(nextValue) => {
        setValue(nextValue);
        if (handleSave) {
          handleSave(nextValue);
        }
      }}
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
