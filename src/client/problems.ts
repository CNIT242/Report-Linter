import {
  getProblem,
  getSection,
  state
} from "./state.js";

import {
  enqueueOperation
} from "./api.js";

import {
  selectParagraph,
  selectProblemRange
} from "./selection.js";

interface ProblemLocation {
  sectionIndex: number;
  problemId: string;
}

function collectProblems(): Array<
  ProblemLocation & {
    severity: "error" | "warning";
    message: string;
    paragraphId: string;
    start: number;
    end: number;
  }
> {
  const result: Array<
    ProblemLocation & {
      severity: "error" | "warning";
      message: string;
      paragraphId: string;
      start: number;
      end: number;
    }
  > = [];

  state.document.sections.forEach(
    (section, sectionIndex) => {
      section.problems.forEach(
        problem => {
          if (problem.ignored) {
            return;
          }

          result.push({
            sectionIndex,
            problemId:
              problem.id,

            severity:
              problem.severity,

            message:
              problem.message,

            paragraphId:
              problem.paragraphId,

            start:
              problem.start,

            end:
              problem.end
          });
        }
      );
    }
  );

  return result;
}

export function renderProblemBoard(): void {
  const list =
    document.getElementById(
      "problem-list"
    );

  if (!list) {
    return;
  }

  const problems =
    collectProblems();

  const count =
    document.getElementById(
      "problem-count"
    );

  const summary =
    document.getElementById(
      "problem-summary"
    );

  const errors =
    problems.filter(
      problem =>
        problem.severity ===
        "error"
    ).length;

  const warnings =
    problems.filter(
      problem =>
        problem.severity ===
        "warning"
    ).length;

  if (count) {
    count.textContent =
      String(
        problems.length
      );
  }

  if (summary) {
    summary.textContent =
      `${errors} errors · ${warnings} warnings`;
  }

  list.innerHTML = "";

  if (
    problems.length === 0
  ) {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "problem-empty";

    empty.textContent =
      "No active problems.";

    list.appendChild(
      empty
    );

    return;
  }

  problems.sort(
    (a, b) => {
      if (
        a.sectionIndex !==
        b.sectionIndex
      ) {
        return (
          a.sectionIndex -
          b.sectionIndex
        );
      }

      if (
        a.start !==
        b.start
      ) {
        return (
          a.start -
          b.start
        );
      }

      return a.problemId.localeCompare(
        b.problemId
      );
    }
  );

  problems.forEach(
    problem => {
      list.appendChild(
        renderProblemItem(
          problem
        )
      );
    }
  );
}

function renderProblemItem(
  problem: {
    sectionIndex: number;
    problemId: string;
    severity:
      | "error"
      | "warning";
    message: string;
    paragraphId: string;
    start: number;
    end: number;
  }
): HTMLElement {
  const item =
    document.createElement(
      "article"
    );

  item.className =
    `problem-item ${problem.severity}`;

  const header =
    document.createElement(
      "div"
    );

  header.className =
    "problem-item-header";

  const severity =
    document.createElement(
      "span"
    );

  severity.className =
    "problem-severity";

  severity.textContent =
    problem.severity ===
    "error"
      ? "Error"
      : "Warning";

  const dismiss =
    document.createElement(
      "button"
    );

  dismiss.type = "button";

  dismiss.className =
    "problem-dismiss";

  dismiss.textContent =
    "Dismiss";

  dismiss.addEventListener(
    "click",
    event => {
      event.stopPropagation();

      dismissProblem(
        problem.sectionIndex,
        problem.problemId
      );
    }
  );

  header.append(
    severity,
    dismiss
  );

  const message =
    document.createElement(
      "div"
    );

  message.className =
    "problem-message";

  message.textContent =
    problem.message;

  const location =
    document.createElement(
      "div"
    );

  location.className =
    "problem-location";

  location.textContent =
    `Paragraph: ${problem.paragraphId}`;

  item.append(
    header,
    message,
    location
  );

  item.addEventListener(
    "click",
    () => {
      jumpToProblem(
        problem.sectionIndex,
        problem.problemId
      );
    }
  );

  return item;
}

export function jumpToProblem(
  sectionIndex: number,
  problemId: string
): void {
  const section =
    getSection(
      sectionIndex
    );

  const problem =
    getProblem(
      sectionIndex,
      problemId
    );

  if (
    !section ||
    !problem ||
    problem.ignored
  ) {
    return;
  }

  if (
    section.collapsed
  ) {
    section.collapsed =
      false;

    /*
     * This expansion is intentionally
     * local for the jump. If desired,
     * call setSectionCollapsed() here
     * instead to persist it.
     */
    window.dispatchEvent(
      new CustomEvent(
        "document-structure-changed"
      )
    );
  }

  selectParagraph(
    problem.paragraphId,
    false,
    problem.start
  );

  selectProblemRange(
    problem.paragraphId,
    problem.start,
    problem.end
  );
}

export function dismissProblem(
  sectionIndex: number,
  problemId: string
): void {
  const problem =
    getProblem(
      sectionIndex,
      problemId
    );

  if (!problem) {
    return;
  }

  if (problem.ignored) {
    return;
  }

  /*
   * Optimistically remove it from
   * the visible problem board.
   *
   * The PATCH queue guarantees that
   * the operation survives failures.
   */
  problem.ignored =
    true;

  enqueueOperation({
    type: "dismissProblem",
    sectionIndex,
    problemId
  });

  renderProblemBoard();
}