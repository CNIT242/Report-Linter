export type ParagraphStyle =
  | "NORMAL_TEXT"
  | "TITLE"
  | "HEADING_1"
  | "HEADING_2"
  | "HEADING_3";

export type ProblemSeverity =
  | "error"
  | "warning";

export interface SelectorOption {
  value: string;
  label: string;
}

export interface ParagraphSelector {
  options: SelectorOption[];
  value: string;
}

export interface Paragraph {
  id: string;
  text: string;
  style: ParagraphStyle;
  selector?: ParagraphSelector;
}

export interface Problem {
  id: string;
  paragraphId: string;
  start: number;
  end: number;
  severity: ProblemSeverity;
  message: string;
  ignored: boolean;
}

export interface SectionRules {
  required: boolean;
  allowEmpty: boolean;
  allowSelectors: boolean;
}

export interface Section {
  header: string;
  paragraphs: Paragraph[];
  problems: Problem[];

  /*
   * UI state. These can be omitted from persisted JSON
   * if the backend does not want to store them.
   */
  collapsed?: boolean;
  rules?: SectionRules;
}

export interface DocumentData {
  version: number;
  sections: Section[];
}

export type DocumentOperation =
  | {
      type: "updateParagraph";
      sectionIndex: number;
      paragraphId: string;
      text: string;
    }
  | {
      type: "insertParagraph";
      sectionIndex: number;
      afterParagraphId: string | null;
      paragraph: Paragraph;
    }
  | {
      type: "deleteParagraph";
      sectionIndex: number;
      paragraphId: string;
    }
  | {
      type: "setSelector";
      sectionIndex: number;
      paragraphId: string;
      value: string;
    }
  | {
      type: "insertSection";
      sectionIndex: number;
      section: Section;
    }
  | {
      type: "updateSection";
      sectionIndex: number;
      header?: string;
      rules?: SectionRules;
    }
  | {
      type: "setSectionCollapsed";
      sectionIndex: number;
      collapsed: boolean;
    }
  | {
      type: "dismissProblem";
      sectionIndex: number;
      problemId: string;
    };

export interface QueuedOperation {
  operationId: string;
  operation: DocumentOperation;
}

export interface InFlightBatch {
  batchId: string;
  operations: QueuedOperation[];
}

export interface ParagraphLocation {
  section: Section;
  sectionIndex: number;
  paragraph: Paragraph;
  paragraphIndex: number;
}

export interface State {
  document: DocumentData;

  activeSectionIndex: number | null;
  activeParagraphId: string | null;

  selectedParagraphIds: Set<string>;

  debug: boolean;

  patchQueue: QueuedOperation[];
  inFlightBatch: InFlightBatch | null;

  retryTimer: number | null;
  retryDelayMs: number;

  localRevision: number;
  synchronizedRevision: number;

  highlightedParagraphIds: Set<string>;

  rulesSectionIndex: number | null;
  problemFocusTimer: number | null;
}

export const state: State = {
  document: {
    version: 0,
    sections: []
  },

  activeSectionIndex: null,
  activeParagraphId: null,

  selectedParagraphIds: new Set<string>(),

  debug: false,

  patchQueue: [],
  inFlightBatch: null,

  retryTimer: null,
  retryDelayMs: 1000,

  localRevision: 0,
  synchronizedRevision: 0,

  highlightedParagraphIds:
    new Set<string>(),

  rulesSectionIndex: null,
  problemFocusTimer: null
};

export function createId(
  prefix: string
): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export function getSection(
  sectionIndex: number
): Section | undefined {
  return state.document.sections[
    sectionIndex
  ];
}

export function getParagraph(
  sectionIndex: number,
  paragraphId: string
): Paragraph | undefined {
  const section =
    getSection(sectionIndex);

  if (!section) {
    return undefined;
  }

  return section.paragraphs.find(
    paragraph =>
      paragraph.id === paragraphId
  );
}

export function getProblem(
  sectionIndex: number,
  problemId: string
): Problem | undefined {
  const section =
    getSection(sectionIndex);

  if (!section) {
    return undefined;
  }

  return section.problems.find(
    problem =>
      problem.id === problemId
  );
}

export function findParagraph(
  paragraphId: string
): ParagraphLocation | null {
  for (
    let sectionIndex = 0;
    sectionIndex <
    state.document.sections.length;
    sectionIndex += 1
  ) {
    const section =
      state.document.sections[
        sectionIndex
      ];

    if (!section) {
      continue;
    }

    for (
      let paragraphIndex = 0;
      paragraphIndex <
      section.paragraphs.length;
      paragraphIndex += 1
    ) {
      const paragraph =
        section.paragraphs[
          paragraphIndex
        ];

      if (
        !paragraph ||
        paragraph.id !== paragraphId
      ) {
        continue;
      }

      return {
        section,
        sectionIndex,
        paragraph,
        paragraphIndex
      };
    }
  }

  return null;
}

function normalizeSelector(
  raw: unknown
): ParagraphSelector | undefined {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return undefined;
  }

  const value =
    raw as Record<string, unknown>;

  const rawOptions =
    Array.isArray(value.options)
      ? value.options
      : [];

  const options: SelectorOption[] = [];

  for (
    const rawOption of rawOptions
  ) {
    if (
      typeof rawOption === "string"
    ) {
      options.push({
        value: rawOption,
        label: rawOption
      });

      continue;
    }

    if (
      !rawOption ||
      typeof rawOption !== "object"
    ) {
      continue;
    }

    const option =
      rawOption as Record<
        string,
        unknown
      >;

    const optionValue =
      String(
        option.value ?? ""
      );

    options.push({
      value: optionValue,
      label: String(
        option.label ??
          optionValue
      )
    });
  }

  return {
    options,
    value: String(
      value.value ?? ""
    )
  };
}

function normalizeParagraph(
  raw: unknown,
  index: number
): Paragraph {
  const value =
    raw &&
    typeof raw === "object"
      ? raw as Record<
          string,
          unknown
        >
      : {};

  const selector =
    normalizeSelector(
      value.selector
    );

  return {
    id: String(
      value.id ??
        `paragraph-${index + 1}`
    ),

    text: String(
      value.text ?? ""
    ),

    style:
      String(
        value.style ??
          "NORMAL_TEXT"
      ) as ParagraphStyle,

    ...(selector
      ? { selector }
      : {})
  };
}

function normalizeProblem(
  raw: unknown,
  index: number
): Problem {
  const value =
    raw &&
    typeof raw === "object"
      ? raw as Record<
          string,
          unknown
        >
      : {};

  const rawStart =
    Number(value.start ?? 0);

  const rawEnd =
    Number(value.end ?? rawStart);

  const start =
    Number.isFinite(rawStart)
      ? Math.max(0, rawStart)
      : 0;

  const end =
    Number.isFinite(rawEnd)
      ? Math.max(start, rawEnd)
      : start;

  return {
    id: String(
      value.id ??
        `problem-${index + 1}`
    ),

    paragraphId: String(
      value.paragraphId ?? ""
    ),

    start,
    end,

    severity:
      value.severity === "warning"
        ? "warning"
        : "error",

    message: String(
      value.message ?? ""
    ),

    ignored:
      Boolean(value.ignored)
  };
}

function normalizeRules(
  raw: unknown
): SectionRules {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    return {
      required: false,
      allowEmpty: true,
      allowSelectors: true
    };
  }

  const value =
    raw as Record<
      string,
      unknown
    >;

  return {
    required:
      Boolean(
        value.required
      ),

    allowEmpty:
      value.allowEmpty !== false,

    allowSelectors:
      value.allowSelectors !== false
  };
}

function normalizeSection(
  raw: unknown,
  index: number
): Section {
  const value =
    raw &&
    typeof raw === "object"
      ? raw as Record<
          string,
          unknown
        >
      : {};

  const rawParagraphs =
    Array.isArray(
      value.paragraphs
    )
      ? value.paragraphs
      : [];

  const rawProblems =
    Array.isArray(
      value.problems
    )
      ? value.problems
      : [];

  const paragraphs =
    rawParagraphs.map(
      (paragraph, paragraphIndex) =>
        normalizeParagraph(
          paragraph,
          paragraphIndex
        )
    );

  const problems =
    rawProblems.map(
      (problem, problemIndex) =>
        normalizeProblem(
          problem,
          problemIndex
        )
    );

  const rules =
    normalizeRules(
      value.rules
    );

  return {
    header: String(
      value.header ??
        `Section ${index + 1}`
    ),

    paragraphs,

    problems,

    collapsed:
      Boolean(value.collapsed),

    rules
  };
}

export function ensureDocumentShape(
  raw: unknown
): DocumentData {
  const value =
    raw &&
    typeof raw === "object"
      ? raw as Record<
          string,
          unknown
        >
      : {};

  const rawSections =
    Array.isArray(
      value.sections
    )
      ? value.sections
      : [];

  const sections =
    rawSections.map(
      (section, sectionIndex) =>
        normalizeSection(
          section,
          sectionIndex
        )
    );

  return {
    version: Number(
      value.version ?? 0
    ),

    sections
  };
}