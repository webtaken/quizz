"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { readStreamableValue } from "ai/rsc";
import { generateQuestions } from "@/lib/actions";
import { useState, useTransition } from "react";
import { z } from "zod";
import { QuestionSchema } from "@/validations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import confetti from "canvas-confetti";
import {
  GitHubLogoIcon,
  LinkedInLogoIcon,
  SymbolIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import Account from "@/components/Account";

const tenses = [
  { value: "present-simple", label: "Present Simple" },
  { value: "present-continuous", label: "Present Continuous" },
  { value: "present-perfect", label: "Present Perfect" },
  { value: "present-perfect-continuous", label: "Present Perfect Continuous" },
  { value: "past-simple", label: "Past Simple" },
  { value: "past-continuous", label: "Past Continuous" },
  { value: "past-perfect", label: "Past Perfect" },
  { value: "past-perfect-continuous", label: "Past Perfect Continuous" },
  { value: "future-simple", label: "Future Simple" },
  { value: "future-continuous", label: "Future Continuous" },
  { value: "future-perfect", label: "Future Perfect" },
  { value: "future-perfect-continuous", label: "Future Perfect Continuous" },
  { value: "conditional-simple", label: "Conditional Simple" },
  { value: "conditional-continuous", label: "Conditional Continuous" },
  { value: "conditional-perfect", label: "Conditional Perfect" },
  {
    value: "conditional-perfect-continuous",
    label: "Conditional Perfect Continuous",
  },
];

const enumsTenses = tenses.map((tense) => tense.value);
const formSchema = z.object({
  tense: z.enum([...(enumsTenses as [string, ...string[]])]),
  questionCount: z.number().min(1).max(10),
});

export default function Home() {
  const [questions, setQuestions] = useState<QuestionSchema[]>([]);
  const [isPending, startTransition] = useTransition();
  const [userAnswers, setUserAnswers] = useState<{
    [key: number]: { text: string; correct: boolean };
  }>({});
  const [quizResult, setQuizResult] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tense: undefined,
      questionCount: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const instruction = `Generate ${values.questionCount} questions about ${values.tense} tense`;
    setUserAnswers({});
    setQuizResult(null);
    startTransition(async () => {
      const { object } = await generateQuestions(instruction);
      for await (const partialObject of readStreamableValue(object)) {
        if (partialObject && partialObject.questions) {
          setQuestions(partialObject.questions);
        }
      }
    });
  }

  const handleAnswerChange = (qIndex: number, answer: string) => {
    const ansObj = JSON.parse(answer);
    setUserAnswers((prev) => ({ ...prev, [qIndex]: ansObj }));
  };

  const handleVerifyAnswers = () => {
    if (Object.keys(userAnswers).length !== questions.length) {
      alert("Please answer all questions");
      return;
    }
    const correctAnswers = questions.filter(
      (q, qIndex) => userAnswers[qIndex].correct
    ).length;
    setQuizResult(
      `You got ${correctAnswers} out of ${questions.length} correct!`
    );
    if (correctAnswers === questions.length) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="absolute top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] items-center justify-items-center min-h-screen pb-20 gap-6 sm:p-16 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold text-center">*Quizz</h1>
      <div className="flex items-center justify-center gap-x-2 my-2">
        <Account
          logo={<TwitterLogoIcon className="size-4" />}
          text="snode_rojas"
          link="https://x.com/node_srojas1"
        />
        <Account
          logo={<GitHubLogoIcon className="size-4" />}
          text="webtaken"
          link="https://github.com/webtaken"
        />
        <Account
          logo={<LinkedInLogoIcon className="size-4" />}
          text="saul_rojas"
          link="https://www.linkedin.com/in/saul-rojas-c-6885b1188/"
        />
      </div>
      <main className="flex gap-2 items-center justify-center sm:items-start w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 bg-white p-4 rounded-lg shadow-lg w-[600px]"
          >
            <FormField
              control={form.control}
              name="tense"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-gray-700">
                    English Tense
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tense" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tenses.map((tense) => (
                        <SelectItem key={tense.value} value={tense.value}>
                          {tense.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select a tense to practice.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium text-gray-700">
                    Questions Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1 - 10"
                      type="number"
                      min="1"
                      max="10"
                      className="w-full"
                      {...field}
                      onChange={(event) =>
                        field.onChange(parseInt(event.currentTarget.value, 10))
                      }
                    />
                  </FormControl>
                  <FormDescription>Number of questions.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full text-lg py-6 flex items-center gap-x-2"
              disabled={isPending}
            >
              {isPending && <SymbolIcon className="size-4 animate-spin" />}
              Generate Quiz
            </Button>
          </form>
        </Form>

        {questions.length > 0 && (
          <div className="bg-white p-8 rounded-lg shadow-lg space-y-6 w-full">
            <h2 className="text-2xl font-bold text-center mb-4">Your Quiz</h2>
            {questions.map((q, qIndex) => (
              <div key={`question-${qIndex}`} className="space-y-2">
                {q.question && (
                  <p className="font-medium">
                    {qIndex + 1}. {q.question}
                  </p>
                )}
                <RadioGroup
                  onValueChange={(value) => handleAnswerChange(qIndex, value)}
                  value={
                    !isPending && JSON.stringify(userAnswers) !== "{}"
                      ? JSON.stringify(userAnswers[qIndex])
                      : undefined
                  }
                >
                  {q.answers &&
                    q.answers.map((ans, ansIndex) => (
                      <div
                        key={`answer-${qIndex}-${ansIndex}`}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={JSON.stringify(ans)}
                          id={`answer-${qIndex}-${ansIndex}`}
                        />
                        <Label htmlFor={`answer-${qIndex}-${ansIndex}`}>
                          {ans.text}
                        </Label>
                      </div>
                    ))}
                </RadioGroup>
              </div>
            ))}
            {!isPending && (
              <Button className="w-full mt-4" onClick={handleVerifyAnswers}>
                Verify Answers
              </Button>
            )}
            {quizResult && (
              <Alert>
                <AlertTitle>Quiz Result</AlertTitle>
                <AlertDescription>{quizResult}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
