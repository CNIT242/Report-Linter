import {
  state
} from "./state.js";

export type SyncStatus =
  | "saved"
  | "queued"
  | "syncing"
  | "retrying"
  | "conflict";

export function initializeToolbar(): void {
  document
    .getElementById("highlight")
    ?.addEventListener(
      "click",
      highlightSelection
    );

  document
    .getElementById("clear-highlight")
    ?.addEventListener(
      "click",
      clearHighlight
    );

  document
    .getElementById("debug")
    ?.addEventListener(
      "click",
      toggleDebug
    );

  document
    .getElementById("refresh")
    ?.addEventListener(
      "click",
      () => {
        window.dispatchEvent(
          new CustomEvent(
            "refresh-document"
          )
        );
      }
    );

  window.addEventListener(
    "document-sync-status",
    event => {
      const customEvent =
        event as CustomEvent<{
          status: SyncStatus;
        }>;

      renderSyncStatus(
        customEvent.detail.status
      );
    }
  );
}

function highlightSelection(): void {
  if (
    state.activeParagraphId === null
  ) {
    return;
  }

  state.highlightedParagraphIds.add(
    state.activeParagraphId
  );

  const element =
    document.querySelector<HTMLElement>(
      `[data-paragraph-id="${CSS.escape(
        state.activeParagraphId
      )}"]`
    );

  element?.classList.add(
    "manual-highlight"
  );
}

function clearHighlight(): void {
  state.highlightedParagraphIds.clear();

  document
    .querySelectorAll<HTMLElement>(
      ".manual-highlight"
    )
    .forEach(element => {
      element.classList.remove(
        "manual-highlight"
      );
    });
}

function toggleDebug(): void {
  state.debug =
    !state.debug;

  window.dispatchEvent(
    new CustomEvent(
      "render-document"
    )
  );
}

export function renderSyncStatus(
  status: SyncStatus
): void {
  const element =
    document.getElementById(
      "sync-status"
    );

  if (!element) {
    return;
  }

  element.className =
    "sync-status";

  switch (status) {
    case "saved":
      element.textContent =
        "Saved";
      element.classList.add(
        "status-saved"
      );
      break;

    case "queued":
      element.textContent =
        "Changes queued";
      element.classList.add(
        "status-queued"
      );
      break;

    case "syncing":
      element.textContent =
        "Saving…";
      element.classList.add(
        "status-syncing"
      );
      break;

    case "retrying":
      element.textContent =
        "Retrying…";
      element.classList.add(
        "status-retrying"
      );
      break;

    case "conflict":
      element.textContent =
        "Conflict — refresh required";
      element.classList.add(
        "status-conflict"
      );
      break;
  }
}