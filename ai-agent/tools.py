from typing import List, Dict, Any, Optional
import httpx
from config import config

class GitHubTools:
    """Tools for interacting with GitHub API through Spring Boot backend"""
    
    def __init__(self, backend_url: str = None):
        self.backend_url = backend_url or config.BACKEND_URL
        
    async def fetch_issue_details(self, repo_owner: str, repo_name: str, issue_number: int, token: str) -> Dict[str, Any]:
        """Fetch detailed information about a specific GitHub issue"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.backend_url}/api/issues/{repo_owner}/{repo_name}/{issue_number}",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {"error": f"Failed to fetch issue: {str(e)}"}
    
    async def analyze_issue(self, issue_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze issue using ML classifier"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/issues/analyze",
                    json=issue_data,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {"error": f"Failed to analyze issue: {str(e)}"}
    
    async def search_similar_issues(self, query: str, repo_owner: str, repo_name: str, token: str) -> List[Dict[str, Any]]:
        """Search for similar issues in the repository"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.backend_url}/api/issues/search",
                    params={"q": query, "repo": f"{repo_owner}/{repo_name}"},
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return {"error": f"Failed to search issues: {str(e)}"}

class IssueAnalyzer:
    """Tools for analyzing and solving GitHub issues"""
    
    @staticmethod
    def categorize_issue(title: str, body: str) -> Dict[str, Any]:
        """Categorize issue type (bug, feature, documentation, etc.)"""
        title_lower = title.lower()
        body_lower = body.lower() if body else ""
        
        categories = {
            "bug": ["bug", "error", "crash", "fail", "broken", "issue", "problem"],
            "feature": ["feature", "enhancement", "add", "implement", "support"],
            "documentation": ["doc", "documentation", "readme", "guide", "tutorial"],
            "question": ["question", "how to", "help", "?"],
            "performance": ["slow", "performance", "optimize", "speed"],
            "security": ["security", "vulnerability", "exploit", "cve"]
        }
        
        scores = {}
        for category, keywords in categories.items():
            score = sum(1 for keyword in keywords if keyword in title_lower or keyword in body_lower)
            scores[category] = score
        
        primary_category = max(scores, key=scores.get)
        confidence = scores[primary_category] / max(sum(scores.values()), 1)
        
        return {
            "category": primary_category,
            "confidence": confidence,
            "all_scores": scores
        }
    
    @staticmethod
    def extract_code_snippets(body: str) -> List[str]:
        """Extract code snippets from issue body"""
        if not body:
            return []
        
        snippets = []
        in_code_block = False
        current_snippet = []
        
        for line in body.split('\n'):
            if line.strip().startswith('```'):
                if in_code_block:
                    snippets.append('\n'.join(current_snippet))
                    current_snippet = []
                in_code_block = not in_code_block
            elif in_code_block:
                current_snippet.append(line)
        
        return snippets
    
    @staticmethod
    def suggest_solution(category: str, title: str, body: str, code_snippets: List[str]) -> str:
        """Generate solution suggestions based on issue analysis"""
        solutions = {
            "bug": """
**Suggested Solution Steps:**
1. **Reproduce the issue**: Try to replicate the bug with the provided information
2. **Check error logs**: Review stack traces and error messages
3. **Identify root cause**: Debug the code section mentioned
4. **Fix and test**: Implement fix and add unit tests
5. **Document**: Update comments and documentation if needed
""",
            "feature": """
**Suggested Implementation Steps:**
1. **Clarify requirements**: Ensure feature scope is well-defined
2. **Design approach**: Plan the implementation strategy
3. **Break down tasks**: Divide into smaller, manageable tasks
4. **Implement incrementally**: Build feature step-by-step
5. **Add tests**: Write comprehensive tests for new functionality
6. **Update documentation**: Document the new feature
""",
            "documentation": """
**Suggested Documentation Steps:**
1. **Identify gaps**: Determine what documentation is missing
2. **Research**: Gather accurate information about the topic
3. **Write clearly**: Use simple, clear language
4. **Add examples**: Include code examples where relevant
5. **Review**: Have others review for clarity and accuracy
""",
            "performance": """
**Suggested Optimization Steps:**
1. **Profile the code**: Identify performance bottlenecks
2. **Analyze metrics**: Review memory, CPU, and I/O usage
3. **Optimize algorithms**: Improve algorithmic complexity
4. **Cache strategically**: Add caching where appropriate
5. **Benchmark**: Measure improvements with before/after metrics
""",
            "security": """
**Suggested Security Steps:**
1. **Assess severity**: Determine the security impact level
2. **Isolate vulnerability**: Identify affected code sections
3. **Research best practices**: Review security guidelines
4. **Implement fix**: Apply security patches
5. **Security audit**: Conduct thorough security review
6. **Update dependencies**: Ensure all libraries are up-to-date
"""
        }
        
        base_solution = solutions.get(category, solutions["bug"])
        
        if code_snippets:
            base_solution += f"\n**Code Analysis:**\nFound {len(code_snippets)} code snippet(s) in the issue. Review these carefully for context.\n"
        
        return base_solution

# Tool instances
github_tools = GitHubTools()
issue_analyzer = IssueAnalyzer()
