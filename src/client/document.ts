import {
  state
} from "./state.js";

import {
  renderParagraph
} from "./paragraphs.js";

export function renderDocument(): void {
  const container =
    document.getElementById(
      "document"
    );

  if (!container) {
    return;
  }

  container.innerHTML = "";

  state.document.sections.forEach(
    (
      section,
      sectionIndex
    ) => {
      const sectionElement =
        document.createElement(
          "section"
        );

      sectionElement.className =
        "document-section";

      sectionElement.dataset.sectionIndex =
        String(
          sectionIndex
        );

      const heading =
        document.createElement(
          "div"
        );

      heading.className =
        "document-section-heading";

      const toggle =
        document.createElement(
          "button"
        );

      toggle.type = "button";

      toggle.className =
        "document-section-toggle";

      toggle.textContent =
        section.collapsed
          ? "▶"
          : "▼";

      toggle.addEventListener(
        "click",
        () => {
          window.dispatchEvent(
            new CustomEvent(
              "toggle-section",
              {
                detail: {
                  sectionIndex
                }
              }
            )
          );
        }
      );

      const title =
        document.createElement(
          "h2"
        );

      title.textContent =
        section.header;

      heading.append(
        toggle,
        title
      );

      sectionElement.appendChild(
        heading
      );

      if (
        !section.collapsed
      ) {
        const content =
          document.createElement(
            "div"
          );

        content.className =
          "document-section-content";

        section.paragraphs.forEach(
          paragraph => {
            content.appendChild(
              renderParagraph(
                sectionIndex,
                paragraph
              )
            );
          }
        );

        sectionElement.appendChild(
          content
        );
      }

      container.appendChild(
        sectionElement
      );
    }
  );
}