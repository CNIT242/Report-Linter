import {
  findParagraph,
  state
} from "./state.js";

function getParagraphElement(
  paragraphId: string
): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `[data-paragraph-id="${CSS.escape(
      paragraphId
    )}"]`
  );
}

function getTextNodes(
  element: Node
): Text[] {
  const result: Text[] = [];

  const walker =
    document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT
    );

  let node: Node | null;

  while (
    (node = walker.nextNode())
  ) {
    if (
      (
        node.parentElement
          ?.classList
          .contains(
            "paragraph-debug"
          )
      )
    ) {
      continue;
    }

    result.push(
      node as Text
    );
  }

  return result;
}

export function placeCaret(
  element: HTMLElement,
  offset: number
): void {
  if (
    element.childNodes.length === 0
  ) {
    element.appendChild(
      document.createTextNode("")
    );
  }

  const nodes =
    getTextNodes(element);

  if (nodes.length === 0) {
    const textNode =
      document.createTextNode("");

    element.appendChild(
      textNode
    );

    nodes.push(
      textNode
    );
  }

  let remaining =
    Math.max(
      0,
      offset
    );

  for (
    const node of nodes
  ) {
    const length =
      node.textContent?.length ??
      0;

    if (
      remaining <= length
    ) {
      const range =
        document.createRange();

      range.setStart(
        node,
        remaining
      );

      range.collapse(
        true
      );

      const selection =
        window.getSelection();

      selection?.removeAllRanges();
      selection?.addRange(
        range
      );

      return;
    }

    remaining -= length;
  }

  const last =
    nodes[nodes.length - 1];

  const range =
    document.createRange();

    if(last)
  range.selectNodeContents(
    last
  );

  range.collapse(
    false
  );

  const selection =
    window.getSelection();

  selection?.removeAllRanges();
  selection?.addRange(
    range
  );
}

export function selectParagraph(
  paragraphId: string,
  extend = false,
  caretOffset: number | null = null
): void {
  const element =
    getParagraphElement(
      paragraphId
    );

  if (!element) {
    return;
  }

  const location =
    findParagraph(
      paragraphId
    );

  if (location) {
    state.activeSectionIndex =
      location.sectionIndex;
  }

  state.activeParagraphId =
    paragraphId;

  if (!extend) {
    state.selectedParagraphIds.clear();
  }

  state.selectedParagraphIds.add(
    paragraphId
  );

  document
    .querySelectorAll<HTMLElement>(
      ".paragraph-block"
    )
    .forEach(
      block => {
        block.classList.toggle(
          "paragraph-selected",
          state.selectedParagraphIds.has(
            block.dataset
              .paragraphId ?? ""
          )
        );
      }
    );

  element.focus();

  placeCaret(
    element,
    caretOffset ??
      location?.paragraph.text.length ??
      0
  );

  element.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

export function selectProblemRange(
  paragraphId: string,
  start: number,
  end: number
): void {
  const element =
    getParagraphElement(
      paragraphId
    );

  if (!element) {
    return;
  }

  const nodes =
    getTextNodes(element);

  let currentOffset = 0;

  let startPoint:
    | {
        node: Text;
        offset: number;
      }
    | null = null;

  let endPoint:
    | {
        node: Text;
        offset: number;
      }
    | null = null;

  for (
    const node of nodes
  ) {
    const length =
      node.textContent?.length ??
      0;

    const nodeStart =
      currentOffset;

    const nodeEnd =
      nodeStart + length;

    if (
      startPoint === null &&
      start >= nodeStart &&
      start <= nodeEnd
    ) {
      startPoint = {
        node,
        offset:
          start - nodeStart
      };
    }

    if (
      end >= nodeStart &&
      end <= nodeEnd
    ) {
      endPoint = {
        node,
        offset:
          end - nodeStart
      };

      break;
    }

    currentOffset =
      nodeEnd;
  }

  if (
    !startPoint ||
    !endPoint
  ) {
    return;
  }

  element.focus();

  const range =
    document.createRange();

  range.setStart(
    startPoint.node,
    startPoint.offset
  );

  range.setEnd(
    endPoint.node,
    endPoint.offset
  );

  const selection =
    window.getSelection();

  selection?.removeAllRanges();
  selection?.addRange(
    range
  );

  element.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}