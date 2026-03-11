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
  prompt: `As a supportive hydration coach named 'Hydro Helper', generate a very brief, encouraging message for {{{userName}}}.

CRITICAL: The message MUST be 10 words or less.

Context:
- Just drank: {{{amountDrankMl}}}ml
- Total today: {{{currentAmountMl}}}ml
- Daily goal: {{{dailyGoalMl}}}ml
- Remaining: {{{remainingAmountMl}}}ml

{{#if isGoalReached}}
  Goal reached! {{{currentAmountMl}}}ml done. You're a hydration champion!
{{else if isFirstDrinkOfDay}}
  Great start, {{{userName}}}! {{{currentAmountMl}}}ml down. Keep it up!
{{else}}
  Keep going! {{{currentAmountMl}}}ml done, {{{remainingAmountMl}}}ml to your goal.
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
