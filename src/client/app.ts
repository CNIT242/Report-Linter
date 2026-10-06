import {
  loadDocument
} from "./api.js";

import {
  renderDocument
} from "./document.js";

import {
  renderSectionSidebar,
  setSectionCollapsed,
  openRulesEditor,
  closeRulesEditor,
  saveRulesEditor
} from "./sections.js";

import {
  renderProblemBoard
} from "./problems.js";

import {
  initializeToolbar,
  renderSyncStatus
} from "./toolbar.js";

import {
  state
} from "./state.js";

function renderApp(): void {
  renderSectionSidebar();
  renderDocument();
  renderProblemBoard();
}

function initializeRulesModal(): void {
  document
    .getElementById(
      "rules-cancel"
    )
    ?.addEventListener(
      "click",
      closeRulesEditor
    );

  document
    .getElementById(
      "rules-save"
    )
    ?.addEventListener(
      "click",
      saveRulesEditor
    );
}

function initializeEvents(): void {
  window.addEventListener(
    "document-loaded",
    () => {
      renderApp();

      renderSyncStatus(
        "saved"
      );
    }
  );

  window.addEventListener(
    "document-structure-changed",
    () => {
      renderApp();
    }
  );

  window.addEventListener(
    "render-document",
    () => {
      renderDocument();
    }
  );

  window.addEventListener(
    "refresh-document",
    () => {
      void loadDocument(
        true
      ).catch(
        error => {
          console.error(
            "Unable to refresh document",
            error
          );

          renderSyncStatus(
            "retrying"
          );
        }
      );
    }
  );

  window.addEventListener(
    "toggle-section",
    event => {
      if (
        !(event instanceof CustomEvent)
      ) {
        return;
      }

      const detail =
        event.detail as
          | {
              sectionIndex?: number;
            }
          | undefined;

      const sectionIndex =
        detail?.sectionIndex;

      if (
        typeof sectionIndex !==
        "number"
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

      setSectionCollapsed(
        sectionIndex,
        !Boolean(
          section.collapsed
        )
      );
    }
  );

  window.addEventListener(
    "open-rules",
    event => {
      if (
        !(event instanceof CustomEvent)
      ) {
        return;
      }

      const detail =
        event.detail as
          | {
              sectionIndex?: number;
            }
          | undefined;

      if (
        typeof detail?.sectionIndex !==
        "number"
      ) {
        return;
      }

      openRulesEditor(
        detail.sectionIndex
      );
    }
  );
}

async function initialize(): Promise<void> {
  initializeToolbar();
  initializeRulesModal();
  initializeEvents();

  try {
    await loadDocument(
      true
    );
  } catch (error) {
    console.error(
      "Unable to initialize document",
      error
    );

    renderSyncStatus(
      "retrying"
    );
  }
}

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      void initialize();
    }
  );
} else {
  void initialize();
}