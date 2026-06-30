import { z } from 'zod';

export const questionTypeSchema = z.enum(['BOOLEAN', 'INPUT', 'CHECKBOX']);

export const questionSchema = z
	.object({
		prompt: z
			.string()
			.min(5, 'Question prompt must be at least 5 characters')
			.max(100, 'Question prompt must be at most 100 characters'),
		type: questionTypeSchema,
		isRequired: z.boolean().optional(),
		options: z.array(z.string().max(40, 'Each option must be at most 40 characters')).optional(),
	})
	.strict()
	.superRefine((question, ctx) => {
		if (question.type === 'CHECKBOX') {
			if (!question.options) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['options'],
					message: 'options is required when type is CHECKBOX',
				});
				return;
			}

			if (question.options.length < 2 || question.options.length > 5) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['options'],
					message: 'options must contain between 2 and 5 items when type is CHECKBOX',
				});
			}
		}

		if ((question.type === 'INPUT' || question.type === 'BOOLEAN') && question.options !== undefined) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['options'],
				message: 'options is not allowed when type is INPUT or BOOLEAN',
			});
		}
	});

export const quizSchema = z
	.object({
		title: z
			.string()
			.min(5, 'Quiz title must be at least 5 characters')
			.max(50, 'Quiz title must be at most 50 characters'),
		description: z
			.string()
			.max(400, 'Quiz description must be at most 400 characters')
			.optional(),
		questions: z
			.array(questionSchema)
			.min(1, 'Quiz must contain at least 1 question')
			.max(20, 'Quiz must contain at most 20 questions'),
	})
	.strict();

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
