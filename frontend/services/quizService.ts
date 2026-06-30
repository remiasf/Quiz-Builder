import axios from 'axios';

export type QuestionType = 'BOOLEAN' | 'INPUT' | 'CHECKBOX';

export type CreateQuestionPayload = {
	prompt: string;
	type: QuestionType;
	isRequired?: boolean;
	options?: string[];
};

export type CreateQuizPayload = {
	title: string;
	description?: string;
	questions: CreateQuestionPayload[];
};

export type Question = {
	id: string;
	quizId: string;
	prompt: string;
	type: QuestionType;
	isRequired: boolean;
	options: string[];
	createdAt: string;
	updatedAt: string;
};

export type Quiz = {
	id: string;
	title: string;
	description: string | null;
	attemptsCount: number;
	createdAt: string;
	updatedAt: string;
	questions: Question[];
};

export type QuizSummary = {
	id: string;
	title: string;
	numberOfQuestions: number;
	attemptsCount: number;
};

export type PaginatedQuizzesResponse = {
	page: number;
	perPage: number;
	total: number;
	totalPages: number;
	data: QuizSummary[];
};

export type DeleteQuizResponse = {
	message: string;
};

export const apiClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
	headers: {
		'Content-Type': 'application/json',
	},
});

export const quizService = {
	// GET /
	getHello: async (): Promise<string> => {
		const { data } = await apiClient.get<string>('/');
		return data;
	},

	// POST /quizzes
	createQuiz: async (payload: CreateQuizPayload): Promise<Quiz> => {
		const { data } = await apiClient.post<Quiz>('/quizzes', payload);
		return data;
	},

	// GET /quizzes?page=1
	getQuizzes: async (page = 1): Promise<PaginatedQuizzesResponse> => {
		const { data } = await apiClient.get<PaginatedQuizzesResponse>('/quizzes', {
			params: { page },
		});
		return data;
	},

	// GET /quizzes/most-attempted
	getMostAttemptedQuizzes: async (): Promise<Quiz[]> => {
		const { data } = await apiClient.get<Quiz[]>('/quizzes/most-attempted');
		return data;
	},

	// GET /quizzes/:id
	getQuizById: async (id: string): Promise<Quiz> => {
		const { data } = await apiClient.get<Quiz>(`/quizzes/${id}`);
		return data;
	},

	// DELETE /quizzes/:id
	deleteQuiz: async (id: string): Promise<DeleteQuizResponse> => {
		const { data } = await apiClient.delete<DeleteQuizResponse>(`/quizzes/${id}`);
		return data;
	},

	// PATCH /quizzes/:id/start
	startQuiz: async (id: string): Promise<Quiz> => {
		const { data } = await apiClient.patch<Quiz>(`/quizzes/${id}/start`);
		return data;
	},
};

export default quizService;
