import {
  state,
  type Section,
  type SectionRules
} from "./state.js";

import {
  enqueueOperation
} from "./api.js";

import {
  selectParagraph
} from "./selection.js";

export function renderSectionSidebar(): void {
  const sidebar =
    document.getElementById(
      "section-sidebar"
    );

  if (!sidebar) {
    return;
  }

  sidebar.innerHTML = "";

  const header =
    document.createElement(
      "div"
    );

  header.className =
    "section-sidebar-header";

  const title =
    document.createElement(
      "h2"
    );

  title.textContent =
    "Sections";

  const add =
    document.createElement(
      "button"
    );

  add.type = "button";
  add.className =
    "toolbar-button";

  add.textContent =
    "+ Section";

  add.addEventListener(
    "click",
    addSection
  );

  header.append(
    title,
    add
  );

  sidebar.appendChild(
    header
  );

  const list =
    document.createElement(
      "div"
    );

  list.className =
    "section-list";

  state.document.sections.forEach(
    (
      section,
      sectionIndex
    ) => {
      list.appendChild(
        renderSectionMenuItem(
          section,
          sectionIndex
        )
      );
    }
  );

  sidebar.appendChild(
    list
  );
}

function renderSectionMenuItem(
  section: Section,
  sectionIndex: number
): HTMLElement {
  const container =
    document.createElement(
      "section"
    );

  container.className =
    "section-menu-item";

  if (
    state.activeSectionIndex ===
    sectionIndex
  ) {
    container.classList.add(
      "active"
    );
  }

  const header =
    document.createElement(
      "div"
    );

  header.className =
    "section-menu-header";

  const collapse =
    document.createElement(
      "button"
    );

  collapse.type = "button";

  collapse.className =
    "section-collapse-button";

  collapse.textContent =
    section.collapsed
      ? "▶"
      : "▼";

  collapse.addEventListener(
    "click",
    event => {
      event.stopPropagation();

      setSectionCollapsed(
        sectionIndex,
        !Boolean(
          section.collapsed
        )
      );
    }
  );

  const name =
    document.createElement(
      "input"
    );

  name.type = "text";

  name.className =
    "section-name";

  name.value =
    section.header;

  name.addEventListener(
    "click",
    event => {
      event.stopPropagation();
    }
  );

  name.addEventListener(
    "change",
    () => {
      renameSection(
        sectionIndex,
        name.value
      );
    }
  );

  name.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Enter"
      ) {
        event.preventDefault();
        name.blur();
      }
    }
  );

  const rules =
    document.createElement(
      "button"
    );

  rules.type = "button";

  rules.className =
    "section-rules-button";

  rules.textContent =
    "Rules";

  rules.addEventListener(
    "click",
    event => {
      event.stopPropagation();

      openRulesEditor(
        sectionIndex
      );
    }
  );

  header.append(
    collapse,
    name,
    rules
  );

  header.addEventListener(
    "click",
    () => {
      state.activeSectionIndex =
        sectionIndex;

      renderSectionSidebar();
    }
  );

  container.appendChild(
    header
  );

  if (
    !section.collapsed
  ) {
    const paragraphList =
      document.createElement(
        "div"
      );

    paragraphList.className =
      "section-paragraph-list";

    section.paragraphs.forEach(
      paragraph => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";

        button.className =
          "section-paragraph-link";

        button.textContent =
          paragraph.text.trim() ||
          "(empty paragraph)";

        if (
          state.activeParagraphId ===
          paragraph.id
        ) {
          button.classList.add(
            "active"
          );
        }

        button.addEventListener(
          "click",
          () => {
            state.activeSectionIndex =
              sectionIndex;

            selectParagraph(
              paragraph.id
            );

            renderSectionSidebar();
          }
        );

        paragraphList.appendChild(
          button
        );
      }
    );

    container.appendChild(
      paragraphList
    );
  }

  return container;
}

export function addSection(): void {
  const section: Section = {
    header:
      "New Section",

    paragraphs: [],

    problems: [],

    collapsed: false,

    rules: {
      required: false,
      allowEmpty: true,
      allowSelectors: true
    }
  };

  const sectionIndex =
    state.document.sections.length;

  state.document.sections.push(
    section
  );

  state.activeSectionIndex =
    sectionIndex;

  enqueueOperation({
    type: "insertSection",
    sectionIndex,
    section
  });

  window.dispatchEvent(
    new CustomEvent(
      "document-structure-changed"
    )
  );

  window.setTimeout(
    () => {
      const inputs =
        document.querySelectorAll<HTMLInputElement>(
          ".section-name"
        );

      const input =
        inputs[
          sectionIndex
        ];

      if (!input) {
        return;
      }

      input.focus();
      input.select();
    },
    0
  );
}

export function renameSection(
  sectionIndex: number,
  header: string
): void {
  const section =
    state.document.sections[
      sectionIndex
    ];

  if (!section) {
    return;
  }

  const normalized =
    header.trim() ||
    "Untitled Section";

  section.header =
    normalized;

  enqueueOperation({
    type: "updateSection",
    sectionIndex,
    header:
      normalized
  });

  window.dispatchEvent(
    new CustomEvent(
      "document-structure-changed"
    )
  );
}

export function setSectionCollapsed(
  sectionIndex: number,
  collapsed: boolean
): void {
  const section =
    state.document.sections[
      sectionIndex
    ];

  if (!section) {
    return;
  }

  if (
    Boolean(section.collapsed) ===
    collapsed
  ) {
    return;
  }

  section.collapsed =
    collapsed;

  enqueueOperation({
    type: "setSectionCollapsed",
    sectionIndex,
    collapsed
  });

  window.dispatchEvent(
    new CustomEvent(
      "document-structure-changed"
    )
  );
}

export function openRulesEditor(
  sectionIndex: number
): void {
  const section =
    state.document.sections[
      sectionIndex
    ];

  if (!section) {
    return;
  }

  const modal =
    document.getElementById(
      "rules-modal"
    );

  if (!modal) {
    return;
  }

  state.rulesSectionIndex =
    sectionIndex;

  const rules =
    section.rules ?? {
      required: false,
      allowEmpty: true,
      allowSelectors: true
    };

  const required =
    modal.querySelector<HTMLInputElement>(
      "#rule-required"
    );

  const allowEmpty =
    modal.querySelector<HTMLInputElement>(
      "#rule-allow-empty"
    );

  const allowSelectors =
    modal.querySelector<HTMLInputElement>(
      "#rule-allow-selectors"
    );

  if (required) {
    required.checked =
      rules.required;
  }

  if (allowEmpty) {
    allowEmpty.checked =
      rules.allowEmpty;
  }

  if (allowSelectors) {
    allowSelectors.checked =
      rules.allowSelectors;
  }

  modal.classList.remove(
    "hidden"
  );
}

export function closeRulesEditor(): void {
  state.rulesSectionIndex =
    null;

  document
    .getElementById(
      "rules-modal"
    )
    ?.classList.add(
      "hidden"
    );
}

export function saveRulesEditor(): void {
  const sectionIndex =
    state.rulesSectionIndex;

  if (
    sectionIndex === null
  ) {
    return;
  }

  const section =
    state.document.sections[
      sectionIndex
    ];

  if (!section) {
    return;
  }

  const required =
    document.querySelector<HTMLInputElement>(
      "#rule-required"
    );

  const allowEmpty =
    document.querySelector<HTMLInputElement>(
      "#rule-allow-empty"
    );

  const allowSelectors =
    document.querySelector<HTMLInputElement>(
      "#rule-allow-selectors"
    );

  const rules: SectionRules = {
    required:
      required?.checked ??
      false,

    allowEmpty:
      allowEmpty?.checked ??
      true,

    allowSelectors:
      allowSelectors?.checked ??
      true
  };

  section.rules =
    rules;

  enqueueOperation({
    type: "updateSection",
    sectionIndex,
    rules
  });

  closeRulesEditor();

  window.dispatchEvent(
    new CustomEvent(
      "document-structure-changed"
    )
  );
}