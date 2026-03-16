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

export interface Project {
    id: number;
    name: string;
    description: string;
    status: 'ACTIVE' | 'ARCHIVED';
    githubRepoUrl?: string;
    owner: User;
    inviteToken: string;
    createdAt: string;
}

export interface ProjectMember {
    id: number;
    user: User;
    role: 'ADMIN' | 'MANAGER' | 'CONTRIBUTOR';
    joinedAt: string;
}

export interface ProjectTask {
    id: number;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_REVIEW' | 'COMPLETE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    branch?: string;
    dueDate?: string;
    assignedTo?: User;
    createdBy: User;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectActivity {
    id: number;
    user: User;
    action: 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'MEMBER_JOINED';
    message: string;
    createdAt: string;
}
