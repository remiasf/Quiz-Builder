'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect } from 'react';
import { useState } from 'react';
import {
	Control,
	FieldErrors,
	UseFormGetValues,
	UseFormRegister,
	UseFormSetValue,
	useFieldArray,
	useForm,
	useWatch,
} from 'react-hook-form';
import { FiX } from 'react-icons/fi';
import { quizSchema } from '../lib/quizSchema';
import { quizService } from '../services/quizService';

const createQuizSchema = quizSchema.pick({
	title: true,
	questions: true,
});

type QuestionForm = import('../lib/quizSchema').QuestionInput;
type QuizFormValues = import('../lib/quizSchema').QuizInput;

const defaultQuestion: QuestionForm = {
	prompt: '',
	type: 'INPUT',
};

type QuestionItemProps = {
	index: number;
	control: Control<QuizFormValues>;
	register: UseFormRegister<QuizFormValues>;
	setValue: UseFormSetValue<QuizFormValues>;
	getValues: UseFormGetValues<QuizFormValues>;
	errors: FieldErrors<QuizFormValues>;
	canRemove: boolean;
	onRemove: () => void;
};

function QuestionItem({
	index,
	control,
	register,
	setValue,
	getValues,
	errors,
	canRemove,
	onRemove,
}: QuestionItemProps) {
	const questionType = useWatch({
		control,
		name: `questions.${index}.type`,
	});

	const options = useWatch({
		control,
		name: `questions.${index}.options`,
	}) ?? [];

	useEffect(() => {
		const path = `questions.${index}.options` as const;

		if (questionType === 'CHECKBOX' && options.length === 0) {
			setValue(path, ['', ''], { shouldValidate: true });
		}

		if (questionType !== 'CHECKBOX' && getValues(path) !== undefined) {
			setValue(path, undefined, { shouldValidate: true });
		}
	}, [getValues, index, options.length, questionType, setValue]);

	const addOption = () => {
		if (options.length < 5) {
			setValue(`questions.${index}.options`, [...options, ''], { shouldValidate: true });
		}
	};

	const removeOption = (optionIndex: number) => {
		setValue(
			`questions.${index}.options`,
			options.filter((_, idx) => idx !== optionIndex),
			{ shouldValidate: true },
		);
	};

	return (
		<div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 font-[family-name:var(--font-nunito)] shadow-sm">
			<div className="flex items-center justify-between">
				<p className="text-sm font-medium text-gray-700">Question {index + 1}</p>
				{canRemove && (
					<button
						type="button"
						onClick={onRemove}
						aria-label={`Remove question ${index + 1}`}
						title="Remove question"
						className="inline-flex h-8 w-8 items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50 hover:text-rose-500"
					>
						<FiX className="h-4 w-4" aria-hidden="true" />
					</button>
				)}
			</div>

			<div>
				<label
					htmlFor={`questions.${index}.prompt`}
					className="mb-2 block text-sm font-medium text-gray-700"
				>
					Prompt
				</label>
				<input
					id={`questions.${index}.prompt`}
					type="text"
					placeholder="Enter question prompt"
					className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-300/40"
					{...register(`questions.${index}.prompt`)}
				/>
				{errors.questions?.[index]?.prompt && (
					<p className="mt-2 text-sm text-rose-400">{errors.questions[index]?.prompt?.message}</p>
				)}
			</div>

			<div>
				<label
					htmlFor={`questions.${index}.type`}
					className="mb-2 block text-sm font-medium text-gray-700"
				>
					Type
				</label>
				<select
					id={`questions.${index}.type`}
					className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-300/40"
					{...register(`questions.${index}.type`)}
				>
					<option value="INPUT">INPUT</option>
					<option value="CHECKBOX">CHECKBOX</option>
					<option value="BOOLEAN">BOOLEAN</option>
				</select>
				{errors.questions?.[index]?.type && (
					<p className="mt-2 text-sm text-rose-400">{errors.questions[index]?.type?.message}</p>
				)}
			</div>

			{questionType === 'CHECKBOX' && (
				<div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium text-gray-700">Possible Answers</p>
						<button
							type="button"
							onClick={addOption}
							disabled={options.length >= 5}
							className="rounded-md border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Add Option
						</button>
					</div>

					{options.map((_, optionIndex) => (
						<div key={`${index}-option-${optionIndex}`} className="flex items-center gap-2">
							<input
								type="text"
								placeholder={`Option ${optionIndex + 1}`}
								className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-300/40"
								{...register(`questions.${index}.options.${optionIndex}`)}
							/>
							<button
								type="button"
								onClick={() => removeOption(optionIndex)}
								aria-label={`Remove option ${optionIndex + 1}`}
								title="Remove option"
								className="inline-flex h-8 w-8 items-center justify-center rounded-full text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
							>
								<FiX className="h-4 w-4" aria-hidden="true" />
							</button>
						</div>
					))}

					{errors.questions?.[index]?.options?.message && (
						<p className="text-sm text-rose-400">{errors.questions[index]?.options?.message}</p>
					)}
				</div>
			)}
		</div>
	);
}

export default function CreateQuizPage() {
	const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [createdQuizTitle, setCreatedQuizTitle] = useState('');
	const [submitError, setSubmitError] = useState('');

	const {
		register,
		control,
		setValue,
		getValues,
		reset,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<QuizFormValues>({
		resolver: zodResolver(createQuizSchema),
		defaultValues: {
			title: '',
			questions: [defaultQuestion],
		},
		mode: 'onSubmit',
		shouldUnregister: true,
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'questions',
	});

	const onSubmit = async (data: QuizFormValues) => {
		try {
			setSubmitError('');
			setSubmitState('loading');

			const created = await quizService.createQuiz(data);

			setCreatedQuizTitle(created.title);
			setSubmitState('success');
		} catch {
			setSubmitError('Failed to create quiz. Please try again.');
			setSubmitState('error');
		}
	};

	const handleCreateAnother = () => {
		reset({
			title: '',
			questions: [defaultQuestion],
		});
		setCreatedQuizTitle('');
		setSubmitError('');
		setSubmitState('idle');
	};

	if (submitState === 'loading') {
		return (
			<main className="flex min-h-screen items-center justify-center bg-white px-6 py-16 font-[family-name:var(--font-nunito)] text-gray-900">
				<div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
					<div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
					<h2 className="mt-5 text-2xl font-semibold text-gray-900">Creating your quiz...</h2>
					<p className="mt-2 text-sm text-gray-600">Please wait while we save everything.</p>
				</div>
			</main>
		);
	}

	if (submitState === 'success') {
		return (
			<main className="flex min-h-screen items-center justify-center bg-white px-6 py-16 font-[family-name:var(--font-nunito)] text-gray-900">
				<section className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg sm:p-10">
					<h1 className="text-3xl font-semibold text-gray-900">Quiz created successfully</h1>
					<p className="mt-3 text-gray-600">
						Your quiz
						<span className="font-semibold text-gray-900"> {createdQuizTitle || 'Untitled Quiz'} </span>
						has been saved.
					</p>

					<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
						<button
							type="button"
							onClick={handleCreateAnother}
							className="rounded-lg border border-cyan-300 bg-cyan-50 px-5 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
						>
							Create New Quiz
						</button>
						<Link
							href="/browse"
							className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
						>
							Browse Other Quizzes
						</Link>
					</div>
				</section>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-white px-6 py-16 font-[family-name:var(--font-nunito)] text-gray-900">
			<section className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
				<h1 className="text-3xl font-semibold tracking-normal text-gray-900">Create Quiz</h1>
				<p className="mt-2 text-sm text-gray-600">Build your quiz with dynamic questions.</p>

				<form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
					{submitState === 'error' && submitError && (
						<p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
							{submitError}
						</p>
					)}

					<div>
						<label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
							Quiz Title
						</label>
						<input
							id="title"
							type="text"
							placeholder="Enter quiz title"
							className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-300/40"
							{...register('title')}
						/>
						{errors.title && (
							<p className="mt-2 text-sm text-rose-400">{errors.title.message}</p>
						)}
					</div>

					<div className="space-y-4">
						<h2 className="text-lg font-semibold text-gray-900">Questions</h2>

						{fields.map((field, index) => (
							<QuestionItem
								key={field.id}
								index={index}
								control={control}
								register={register}
								setValue={setValue}
								getValues={getValues}
								errors={errors}
								canRemove={fields.length > 1}
								onRemove={() => remove(index)}
							/>
						))}

						<div>
							<button
								type="button"
								onClick={() => append(defaultQuestion)}
								className="rounded-lg border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100"
							>
								Add Question
							</button>
						</div>

						{errors.questions?.message && (
							<p className="text-sm text-rose-400">{errors.questions.message}</p>
						)}
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isSubmitting ? 'Submitting...' : 'Create Quiz'}
					</button>
				</form>
			</section>
		</main>
	);
}
