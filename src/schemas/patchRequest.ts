import {type JSONSchemaType} from "ajv";

export interface paragraph
{
    id: string;
    style: "NORMAL_TEXT" | "TITLE" | "HEADING_1"
            | "HEADING_2" | "HEADING_3";
    text: string;
}

export interface operation 
{
    paragraphId?: string;
    afterParagraphId?: string;
    paragraph? : paragraph;
    sectionIndex: number;
    text?: string | undefined;
    type: "updateParagraph" | "insertParagraph" | "setSectionCollapsed" | "deleteParagraph";    
}

export interface opWrapper
{
    operation: operation;
    operationId? : string;
}

export interface patchRequest 
{
    baseVersion?: number | undefined;
    operations: opWrapper[];
}

export const schema : JSONSchemaType<patchRequest> = 
{
  type: "object",
  properties: 
  {
    baseVersion: {"type": "integer", nullable: true},
    operations: {"type": "array", items: 
    {
        type: "object",
        properties:
        {
            operationId: {type: "string", nullable: true},
            operation: {
                type: "object",
                properties: 
                {
                    sectionIndex: {type: "integer"},
                    type: {type: "string", enum: [
                        "updateParagraph",
                        "insertParagraph",
                        "setSectionCollapsed",
                        "deleteParagraph"
                    ]},

                    text: {type: "string", nullable: true},
                    paragraphId: {type: "string", nullable: true},
                    afterParagraphId: {type: "string", nullable: true},
                    paragraph: {
                        type: "object",
                        properties:
                        {
                            id: {type: "string"},
                            style: {type: "string", enum: [
                                "NORMAL_TEXT", "TITLE", "HEADING_1",
                                "HEADING_2","HEADING_3"
                            ]},
                            text: {type: "string"}
                        },
                        required: ["id","style","text"],
                        nullable: true
                    }
                },
                required: ["sectionIndex", "type"],
                if: {properties: {type: {const: "insertParagraph"}}}, 
                then: {required: ["paragraph","afterParagraphId"]},
                else: {
                    if: {properties: {type: {const: "updateParagraph"}}}, 
                    then: {required: ["paragraphId", "text"]}
                },
                additionalProperties: false
            }, 
        },
        required: ["operation"],
        additionalProperties: false,
        minItems: 1,
    }}
  },
  required: ["operations"],
  additionalProperties: false,
};