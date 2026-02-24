from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
import operator
from config import config
from tools import github_tools, issue_analyzer

# Define the agent state
class AgentState(TypedDict):
    """State of the chatbot agent"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    user_token: str
    current_repo: str
    issue_context: dict

class GitHubIssueAgent:
    """LangGraph agent for GitHub issue analysis and resolution"""
    
    def __init__(self):
        # Initialize Groq LLM
        self.llm = ChatGroq(
            api_key=config.GROQ_API_KEY,
            model=config.GROQ_MODEL,
            temperature=config.TEMPERATURE
        )
        
        # Build the agent graph
        self.graph = self._build_graph()
        
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph state graph"""
        
        # Create workflow
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("agent", self._agent_node)
        workflow.add_node("analyze_issue", self._analyze_issue_node)
        workflow.add_node("suggest_solution", self._suggest_solution_node)
        
        # Set entry point
        workflow.set_entry_point("agent")
        
        # Add edges
        workflow.add_conditional_edges(
            "agent",
            self._should_continue,
            {
                "analyze": "analyze_issue",
                "suggest": "suggest_solution",
                "end": END
            }
        )
        
        workflow.add_edge("analyze_issue", "agent")
        workflow.add_edge("suggest_solution", "agent")
        
        return workflow.compile()
    
    def _agent_node(self, state: AgentState) -> AgentState:
        """Main agent reasoning node"""
        messages = state["messages"]
        
        # System prompt for the agent
        system_prompt = """You are an intelligent GitHub Issue Assistant powered by AI. Your role is to:

1. **Analyze GitHub issues** - Understand issue content, categorize them, and extract key information
2. **Suggest solutions** - Provide actionable steps to resolve issues based on their type
3. **Answer questions** - Help users understand their repositories and issues
4. **Be conversational** - Engage naturally with users while being helpful

When a user asks about an issue:
- Ask for issue number and repository if not provided
- Analyze the issue content
- Categorize it (bug, feature, documentation, etc.)
- Suggest concrete solution steps

Be concise, helpful, and professional. Use markdown formatting for better readability."""

        # Add system message if not present
        if not any(isinstance(msg, SystemMessage) for msg in messages):
            messages = [SystemMessage(content=system_prompt)] + list(messages)
        
        # Get LLM response
        response = self.llm.invoke(messages)
        
        return {
            **state,
            "messages": [response]
        }
    
    def _analyze_issue_node(self, state: AgentState) -> AgentState:
        """Node for analyzing GitHub issues"""
        issue_context = state.get("issue_context", {})
        
        if not issue_context:
            return {
                **state,
                "messages": [AIMessage(content="Please provide issue details to analyze.")]
            }
        
        # Categorize the issue
        category_result = issue_analyzer.categorize_issue(
            issue_context.get("title", ""),
            issue_context.get("body", "")
        )
        
        # Extract code snippets
        code_snippets = issue_analyzer.extract_code_snippets(
            issue_context.get("body", "")
        )
        
        analysis = f"""**Issue Analysis:**

**Category:** {category_result['category'].title()} (Confidence: {category_result['confidence']:.0%})

**Title:** {issue_context.get('title', 'N/A')}

**Status:** {issue_context.get('state', 'N/A')}

**Labels:** {', '.join(issue_context.get('labels', [])) or 'None'}

**Code Snippets Found:** {len(code_snippets)}

**Priority Score:** {category_result['all_scores']}
"""
        
        return {
            **state,
            "messages": [AIMessage(content=analysis)]
        }
    
    def _suggest_solution_node(self, state: AgentState) -> AgentState:
        """Node for suggesting solutions"""
        issue_context = state.get("issue_context", {})
        
        if not issue_context:
            return {
                **state,
                "messages": [AIMessage(content="Please provide issue details to suggest a solution.")]
            }
        
        # Get category
        category_result = issue_analyzer.categorize_issue(
            issue_context.get("title", ""),
            issue_context.get("body", "")
        )
        
        # Extract code snippets
        code_snippets = issue_analyzer.extract_code_snippets(
            issue_context.get("body", "")
        )
        
        # Generate solution
        solution = issue_analyzer.suggest_solution(
            category_result['category'],
            issue_context.get("title", ""),
            issue_context.get("body", ""),
            code_snippets
        )
        
        return {
            **state,
            "messages": [AIMessage(content=solution)]
        }
    
    def _should_continue(self, state: AgentState) -> str:
        """Determine next action based on conversation"""
        messages = state["messages"]
        last_message = messages[-1]
        
        if isinstance(last_message, HumanMessage):
            content = last_message.content.lower()
            
            # Check for analysis request
            if any(word in content for word in ["analyze", "analysis", "categorize", "what type"]):
                return "analyze"
            
            # Check for solution request
            if any(word in content for word in ["solve", "solution", "fix", "how to", "suggest"]):
                return "suggest"
        
        return "end"
    
    async def chat(self, message: str, user_token: str = "", repo: str = "", issue_context: dict = None) -> str:
        """Process a chat message and return response"""
        
        # Initialize state
        initial_state = {
            "messages": [HumanMessage(content=message)],
            "user_token": user_token,
            "current_repo": repo,
            "issue_context": issue_context or {}
        }
        
        # Run the graph
        result = self.graph.invoke(initial_state)
        
        # Extract the last AI message
        ai_messages = [msg for msg in result["messages"] if isinstance(msg, AIMessage)]
        
        if ai_messages:
            return ai_messages[-1].content
        
        return "I'm sorry, I couldn't process that request. Please try again."

# Create agent instance
agent = GitHubIssueAgent()
