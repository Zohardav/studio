'use server';
/**
 * @fileOverview A Genkit flow for generating personalized hydration encouragement messages.
 *
 * - generateHydrationEncouragement - A function that generates an encouraging message.
 * - HydrationEncouragementGeneratorInput - The input type for the generateHydrationEncouragement function.
 * - HydrationEncouragementGeneratorOutput - The return type for the generateHydrationEncouragement function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const HydrationEncouragementGeneratorInputSchema = z.object({
  userName: z.string().describe("The user's display name."),
  amountDrankMl: z.number().describe('The amount of water (in ml) just consumed.'),
  currentAmountMl: z.number().describe('The total amount of water (in ml) consumed so far today.'),
  dailyGoalMl: z.number().describe('The daily hydration goal (in ml).'),
  isFirstDrinkOfDay: z.boolean().describe('True if this is the first drink logged today.'),
  isGoalReached: z.boolean().describe('True if the daily goal has been reached with this drink.'),
  remainingAmountMl: z.number().describe('The amount of water (in ml) remaining to reach the daily goal.'),
});
export type HydrationEncouragementGeneratorInput = z.infer<typeof HydrationEncouragementGeneratorInputSchema>;

const HydrationEncouragementGeneratorOutputSchema = z.object({
  message: z.string().describe('An encouraging message for the user.'),
});
export type HydrationEncouragementGeneratorOutput = z.infer<typeof HydrationEncouragementGeneratorOutputSchema>;

export async function generateHydrationEncouragement(
  input: HydrationEncouragementGeneratorInput
): Promise<HydrationEncouragementGeneratorOutput> {
  return hydrationEncouragementGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hydrationEncouragementPrompt',
  input: { schema: HydrationEncouragementGeneratorInputSchema },
  output: { schema: HydrationEncouragementGeneratorOutputSchema },
  prompt: `As a supportive hydration coach named 'Hydro Helper', generate a warm and encouraging message for the user, {{{userName}}}.

Context:
- You just logged {{{amountDrankMl}}}ml of water.
- Your total intake for today is now {{{currentAmountMl}}}ml.
- Your daily hydration goal is {{{dailyGoalMl}}}ml.
- You have {{{remainingAmountMl}}}ml left to reach your goal.

Instructions:
1. Acknowledge the amount of water just consumed.
2. Provide an update on the current progress towards the daily goal.
3. Keep the message positive, supportive, and motivating.

{{#if isGoalReached}}
  Fantastic, {{{userName}}}! You just drank {{{amountDrankMl}}}ml and have officially reached your daily goal of {{{dailyGoalMl}}}ml! You're a hydration champion! Keep that amazing momentum going!
{{else if isFirstDrinkOfDay}}
  What a refreshing start to your day, {{{userName}}}! That {{{amountDrankMl}}}ml is a great first step. You've now had {{{currentAmountMl}}}ml. Keep sipping, you're on your way to {{{dailyGoalMl}}}ml!
{{else}}
  Excellent work, {{{userName}}}! You just added another {{{amountDrankMl}}}ml. You're now at {{{currentAmountMl}}}ml towards your {{{dailyGoalMl}}}ml goal. You're doing great, just {{{remainingAmountMl}}}ml more to go!
{{/if}}
`,
});

const hydrationEncouragementGeneratorFlow = ai.defineFlow(
  {
    name: 'hydrationEncouragementGeneratorFlow',
    inputSchema: HydrationEncouragementGeneratorInputSchema,
    outputSchema: HydrationEncouragementGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
