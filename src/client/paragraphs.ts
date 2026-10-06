import {
  createId,
  getParagraph,
  getSection,
  state,
  type Paragraph
} from "./state.js";

import {
  enqueueOperation
} from "./api.js";

import {
  selectParagraph
} from "./selection.js";

export function renderParagraph(
  sectionIndex: number,
  paragraph: Paragraph
): HTMLElement {
  const element =
    document.createElement(
      "div"
    );

  element.className =
    `paragraph-block ${paragraphClass(
      paragraph.style
    )}`;

  element.dataset.paragraphId =
    paragraph.id;

  element.dataset.sectionIndex =
    String(sectionIndex);

  if (
    state.activeParagraphId ===
    paragraph.id
  ) {
    element.classList.add(
      "paragraph-selected"
    );
  }

  if (
    state.highlightedParagraphIds.has(
      paragraph.id
    )
  ) {
    element.classList.add(
      "manual-highlight"
    );
  }

  const section =
    getSection(
      sectionIndex
    );

  const problems =
    section?.problems.filter(
      problem =>
        !problem.ignored &&
        problem.paragraphId ===
          paragraph.id
    ) ?? [];

  if (
    problems.length > 0
  ) {
    element.classList.add(
      "has-problems"
    );
  }

  if (
    paragraph.selector
  ) {
    renderSelector(
      element,
      sectionIndex,
      paragraph
    );
  } else {
    element.contentEditable =
      "true";

    element.spellcheck =
      false;

    element.textContent =
      paragraph.text;

    attachEditableEvents(
      element,
      sectionIndex,
      paragraph
    );
  }

  if (state.debug) {
    appendDebugId(
      element,
      paragraph.id
    );
  }

  return element;
}

function paragraphClass(
  style: Paragraph["style"]
): string {
  switch (style) {
    case "TITLE":
      return "title";

    case "HEADING_1":
      return "heading-1";

    case "HEADING_2":
      return "heading-2";

    case "HEADING_3":
      return "heading-3";

    case "NORMAL_TEXT":
    default:
      return "normal-text";
  }
}

function appendDebugId(
  element: HTMLElement,
  id: string
): void {
  const debug =
    document.createElement(
      "span"
    );

  debug.className =
    "paragraph-debug";

  debug.textContent =
    ` [${id}]`;

  element.appendChild(
    debug
  );
}

function renderSelector(
  element: HTMLElement,
  sectionIndex: number,
  paragraph: Paragraph
): void {
  const selector =
    paragraph.selector;

  if (!selector) {
    return;
  }

  const select =
    document.createElement(
      "select"
    );

  select.className =
    "paragraph-selector";

  for (
    const option
    of selector.options
  ) {
    const optionElement =
      document.createElement(
        "option"
      );

    optionElement.value =
      option.value;

    optionElement.textContent =
      option.label;

    optionElement.selected =
      option.value ===
      selector.value;

    select.appendChild(
      optionElement
    );
  }

  select.addEventListener(
    "change",
    () => {
      selector.value =
        select.value;

      enqueueOperation({
        type: "setSelector",
        sectionIndex,
        paragraphId:
          paragraph.id,
        value:
          select.value
      });
    }
  );

  /*
   * Selector navigation belongs to
   * the select itself.
   *
   * Arrow keys must not become
   * paragraph navigation events.
   */
  select.addEventListener(
    "keydown",
    event => {
      if (
        event.key ===
          "ArrowUp" ||
        event.key ===
          "ArrowDown" ||
        event.key === "Home" ||
        event.key === "End"
      ) {
        event.stopPropagation();
      }
    }
  );

  element.appendChild(
    select
  );
}

function attachEditableEvents(
  element: HTMLElement,
  sectionIndex: number,
  paragraph: Paragraph
): void {
  element.addEventListener(
    "focus",
    () => {
      state.activeSectionIndex =
        sectionIndex;

      state.activeParagraphId =
        paragraph.id;
    }
  );

  element.addEventListener(
    "click",
    () => {
      state.activeSectionIndex =
        sectionIndex;

      state.activeParagraphId =
        paragraph.id;
    }
  );

  element.addEventListener(
    "input",
    () => {
      const text =
        getEditableText(
          element
        );

      if (
        text ===
        paragraph.text
      ) {
        return;
      }

      paragraph.text =
        text;

      enqueueOperation({
        type: "updateParagraph",
        sectionIndex,
        paragraphId:
          paragraph.id,
        text
      });
    }
  );

  element.addEventListener(
    "keydown",
    event => {
      handleParagraphKeydown(
        event,
        element,
        sectionIndex,
        paragraph
      );
    }
  );
}

export function getEditableText(
  element: HTMLElement
): string {
  const clone =
    element.cloneNode(
      true
    ) as HTMLElement;

  clone
    .querySelectorAll(
      ".paragraph-debug"
    )
    .forEach(
      node => node.remove()
    );

  return clone.textContent ?? "";
}

function getCaretOffset(
  element: HTMLElement
): number {
  const selection =
    window.getSelection();

  if (
    selection === null ||
    selection.rangeCount === 0
  ) {
    return 0;
  }

  const range =
    selection.getRangeAt(0);

  const prefix =
    range.cloneRange();

  prefix.selectNodeContents(
    element
  );

  prefix.setEnd(
    range.startContainer,
    range.startOffset
  );

  return prefix
    .toString()
    .length;
}

function handleParagraphKeydown(
  event: KeyboardEvent,
  element: HTMLElement,
  sectionIndex: number,
  paragraph: Paragraph
): void {
  const offset =
    getCaretOffset(
      element
    );

  if (
    event.key === "Enter"
  ) {
    event.preventDefault();

    splitParagraph(
      sectionIndex,
      paragraph.id,
      offset
    );

    return;
  }

  if (
    event.key === "Backspace" &&
    offset === 0
  ) {
    event.preventDefault();

    mergeWithPrevious(
      sectionIndex,
      paragraph.id
    );

    return;
  }

  if (
    event.key === "Delete" &&
    offset ===
      paragraph.text.length
  ) {
    event.preventDefault();

    mergeWithNext(
      sectionIndex,
      paragraph.id
    );

    return;
  }

  if (
    event.key === "ArrowUp"
  ) {
    navigateParagraph(
      sectionIndex,
      paragraph.id,
      -1
    );

    return;
  }

  if (
    event.key === "ArrowDown"
  ) {
    navigateParagraph(
      sectionIndex,
      paragraph.id,
      1
    );

    return;
  }

  if (
    event.key === "Tab"
  ) {
    event.preventDefault();

    navigateParagraph(
      sectionIndex,
      paragraph.id,
      event.shiftKey
        ? -1
        : 1
    );
  }
}

function navigateParagraph(
  sectionIndex: number,
  paragraphId: string,
  direction: number
): void {
  const section =
    getSection(
      sectionIndex
    );

  if (!section) {
    return;
  }

  const index =
    section.paragraphs.findIndex(
      paragraph =>
        paragraph.id ===
        paragraphId
    );

  if (index < 0) {
    return;
  }

  const targetIndex =
    index + direction;

  if (
    targetIndex < 0 ||
    targetIndex >=
      section.paragraphs.length
  ) {
    return;
  }

  const target =
    section.paragraphs[
      targetIndex
    ];

  if (!target) {
    return;
  }

  selectParagraph(
    target.id
  );
}

function splitParagraph(
  sectionIndex: number,
  paragraphId: string,
  offset: number
): void {
  const section =
    getSection(
      sectionIndex
    );

  if (!section) {
    return;
  }

  const paragraph =
    getParagraph(
      sectionIndex,
      paragraphId
    );

  if (!paragraph) {
    return;
  }

  const safeOffset =
    Math.max(
      0,
      Math.min(
        offset,
        paragraph.text.length
      )
    );

  const before =
    paragraph.text.slice(
      0,
      safeOffset
    );

  const after =
    paragraph.text.slice(
      safeOffset
    );

  paragraph.text =
    before;

  const newParagraph: Paragraph = {
    id: createId(
      "paragraph"
    ),
    text: after,
    style:
      paragraph.style
  };

  const paragraphIndex =
    section.paragraphs.findIndex(
      item =>
        item.id ===
        paragraphId
    );

  if (
    paragraphIndex < 0
  ) {
    return;
  }

  section.paragraphs.splice(
    paragraphIndex + 1,
    0,
    newParagraph
  );

  /*
   * Problems attached to the old
   * text are no longer trustworthy
   * because their offsets may have
   * moved.
   */
  section.problems =
    section.problems.filter(
      problem =>
        problem.paragraphId !==
        paragraphId
    );

  enqueueOperation({
    type: "updateParagraph",
    sectionIndex,
    paragraphId,
    text: before
  });

  enqueueOperation({
    type: "insertParagraph",
    sectionIndex,
    afterParagraphId:
      paragraphId,
    paragraph:
      newParagraph
  });

  window.dispatchEvent(
    new CustomEvent(
      "document-structure-changed"
    )
  );

  window.setTimeout(
    () => {
      selectParagraph(
        newParagraph.id,
        false,
        0
      );
    },
    0
  );
}

function mergeWithPrevious(
  sectionIndex: number,
  paragraphId: string
): void {
  const section =
    getSection(
      sectionIndex
    );

  if (!section) {
    return;
  }

  const index =
    section.paragraphs.findIndex(
      paragraph =>
        paragraph.id ===
        paragraphId
    );

  if (index <= 0) {
    return;
  }

  const current =
    section.paragraphs[
      index
    ];

  if (!current) {
    return;
  }

  const previous =
    section.paragraphs[
      index - 1
    ];

  if (!previous) {
    return;
  }

  const caretOffset =
    previous.text.length;

  previous.text +=
    current.text;

  section.paragraphs.splice(
    index,
    1
  );

  /*
   * Both sets of old problems
   * are invalid after merging.
   */
  section.problems =
    section.problems.filter(
      problem =>
        problem.paragraphId !==
          current.id &&
        problem.paragraphId !==
          previous.id
    );

  enqueueOperation({
    type: "updateParagraph",
    sectionIndex,
    paragraphId:
      previous.id,
    text:
      previous.text
  });

  enqueueOperation({
    type: "deleteParagraph",
    sectionIndex,
    paragraphId:
      current.id
  });

  window.dispatchEvent(
    new CustomEvent(
      "document-structure-changed"
    )
  );

  window.setTimeout(
    () => {
      selectParagraph(
        previous.id,
        false,
        caretOffset
      );
    },
    0
  );
}

function mergeWithNext(
  sectionIndex: number,
  paragraphId: string
): void {
  const section =
    getSection(
      sectionIndex
    );

  if (!section) {
    return;
  }

  const index =
    section.paragraphs.findIndex(
      paragraph =>
        paragraph.id ===
        paragraphId
    );

  if (
    index < 0 ||
    index >=
      section.paragraphs.length - 1
  ) {
    return;
  }

  const current =
    section.paragraphs[
      index
    ];

  if (!current) {
    return;
  }

  const next =
    section.paragraphs[
      index + 1
    ];

  if (!next) {
    return;
  }

  const caretOffset =
    current.text.length;

  current.text +=
    next.text;

  section.paragraphs.splice(
    index + 1,
    1
  );

  section.problems =
    section.problems.filter(
      problem =>
        problem.paragraphId !==
          current.id &&
        problem.paragraphId !==
          next.id
    );

  enqueueOperation({
    type: "updateParagraph",
    sectionIndex,
    paragraphId:
      current.id,
    text:
      current.text
  });

  enqueueOperation({
    type: "deleteParagraph",
    sectionIndex,
    paragraphId:
      next.id
  });

  window.dispatchEvent(
    new CustomEvent(
      "document-structure-changed"
    )
  );

  window.setTimeout(
    () => {
      selectParagraph(
        current.id,
        false,
        caretOffset
      );
    },
    0
  );
}