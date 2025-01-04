export type Command = {
  name: string;
  description: string;
  type: number;
};

export const testCommand: Command = {
  name: "test",
  description: "Test command",
  type: 1,
};
