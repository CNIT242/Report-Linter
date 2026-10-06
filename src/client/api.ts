import {
  createId,
  ensureDocumentShape,
  state,
  type DocumentOperation,
  type InFlightBatch,
  type QueuedOperation
} from "./state.js";

const MAX_RETRY_DELAY =
  30_000;

function emit(
  name: string,
  detail?: unknown
): void {
  window.dispatchEvent(
    new CustomEvent(
      name,
      {
        detail
      }
    )
  );
}

export async function loadDocument(
  force = false
): Promise<void> {
  if (
    !force &&
    (
      state.patchQueue.length > 0 ||
      state.inFlightBatch !== null
    )
  ) {
    return;
  }

  const response =
    await fetch(
      "/api/document",
      {
        method: "GET",
        headers: {
          Accept:
            "application/json"
        }
      }
    );

  if (!response.ok) {
    throw new Error(
      `Failed to load document: ${response.status}`
    );
  }

  const data: unknown =
    await response.json();

  state.document =
    ensureDocumentShape(
      data
    );

  state.synchronizedRevision =
    state.localRevision;

  emit(
    "document-loaded"
  );
}

export function enqueueOperation(
  operation: DocumentOperation
): string {
  const operationId =
    createId(
      "operation"
    );

  const queued: QueuedOperation = {
    operationId,
    operation
  };

  state.patchQueue.push(
    queued
  );

  state.localRevision += 1;

  emit(
    "document-sync-status",
    {
      status: "queued"
    }
  );

  void flushPatchQueue();

  return operationId;
}

export async function flushPatchQueue(): Promise<void> {
  if (
    state.inFlightBatch !== null ||
    state.patchQueue.length === 0
  ) {
    return;
  }

  /*
   * Snapshot the current queue.
   *
   * Anything added while this request is
   * running remains in state.patchQueue.
   */
  const operations =
    [...state.patchQueue];

  if (
    operations.length === 0
  ) {
    return;
  }

  const batch: InFlightBatch = {
    batchId:
      createId("batch"),
    operations
  };

  state.inFlightBatch =
    batch;

  emit(
    "document-sync-status",
    {
      status: "syncing"
    }
  );

  try {
    const response =
      await fetch(
        "/api/document",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",

            "Idempotency-Key":
              batch.batchId
          },

          body:
            JSON.stringify({
              baseVersion:
                state.document.version,

              operations:
                batch.operations
            })
        }
      );

    if (
      response.status === 409
    ) {
      state.inFlightBatch =
        null;

      emit(
        "document-sync-status",
        {
          status: "conflict"
        }
      );

      return;
    }

    if (!response.ok) {
      throw new Error(
        `PATCH failed: ${response.status}`
      );
    }

    const result: unknown =
      await response.json();

    if (
      result &&
      typeof result === "object"
    ) {
      const value =
        result as Record<
          string,
          unknown
        >;

      if (
        typeof value.version ===
        "number"
      ) {
        state.document.version =
          value.version;
      }
    }

    const acknowledgedIds =
      new Set<string>(
        batch.operations.map(
          item =>
            item.operationId
        )
      );

    /*
     * Only remove the operations that
     * belonged to this acknowledged batch.
     *
     * New operations added while the
     * request was running survive.
     */
    state.patchQueue =
      state.patchQueue.filter(
        item =>
          !acknowledgedIds.has(
            item.operationId
          )
      );

    state.inFlightBatch =
      null;

    state.retryDelayMs =
      1000;

    if (
      state.patchQueue.length ===
      0
    ) {
      state.synchronizedRevision =
        state.localRevision;

      emit(
        "document-sync-status",
        {
          status: "saved"
        }
      );

      return;
    }

    emit(
      "document-sync-status",
      {
        status: "queued"
      }
    );

    void flushPatchQueue();
  } catch (error) {
    console.error(
      "Document synchronization failed",
      error
    );

    state.inFlightBatch =
      null;

    emit(
      "document-sync-status",
      {
        status: "retrying",
        error
      }
    );

    scheduleRetry();
  }
}

function scheduleRetry(): void {
  if (
    state.retryTimer !== null
  ) {
    return;
  }

  const delay =
    state.retryDelayMs;

  state.retryDelayMs =
    Math.min(
      state.retryDelayMs * 2,
      MAX_RETRY_DELAY
    );

  state.retryTimer =
    window.setTimeout(
      () => {
        state.retryTimer =
          null;

        void flushPatchQueue();
      },
      delay
    );
}