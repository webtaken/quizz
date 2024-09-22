import { z } from "zod";

export const questionSchema = z.object({
  question: z.string().describe("The question text"),
  answers: z.array(
    z.object({
      text: z.string().describe("The answer text"),
      correct: z.boolean().describe("Whether the answer is correct"),
    })
  ),
});
export type QuestionSchema = z.infer<typeof questionSchema>;

export const quizSchema = z.object({
  questions: z.array(questionSchema),
});

export type QuizSchema = z.infer<typeof quizSchema>;
