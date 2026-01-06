export interface User {
    id: number;
    email: string;
    name: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    name: string;
}

export interface VerifySignupOtpRequest {
    email: string;
    otp: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface PublicRepoRequest {
    repoUrl: string;
}

export interface PublicRepoResponse {
    repoId: number;
    repoName: string;
    owner: string;
    openIssuesCount: number;
}

export interface IssueAnalysisResponse {
    issueId: number;
    title: string;
    score: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    summary: string;
    riskScore: number;
    riskLevel: string;
}

export interface GithubUser {
    githubUsername: string;
    avatarUrl: string;
    githubEmail: string;
    connected: boolean;
}

export interface GithubRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string;
    owner: {
        login: string;
        avatar_url: string;
    };
}
