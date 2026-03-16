# GitHub Issue AI Agent

AI-powered chatbot for analyzing and solving GitHub issues using LangGraph and Groq.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env` file

3. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `POST /chat` - Chat with the AI agent
- `POST /analyze-issue` - Analyze a GitHub issue
- `POST /suggest-solution` - Get solution suggestions
- `GET /health` - Health check

## Documentation

Interactive API documentation: `http://localhost:8000/docs`
