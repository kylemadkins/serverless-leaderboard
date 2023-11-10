export const recordSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        username: {
          type: "string",
        },
        score: {
          type: "integer",
        },
      },
      required: ["username", "score"],
    },
  },
} as const;
