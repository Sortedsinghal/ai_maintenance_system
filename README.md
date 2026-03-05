# NovaMaint: Intelligent Maintenance System 🚀

An AI-powered full-stack application that acts as an intelligent maintenance agent. It accepts natural language maintenance complaints, automatically classifies them by category, assigns priority levels using Google Gemini, and logs them to a database.

---

## 🏗 Architecture Overview

- **Frontend:** React + Vite (Single Page Application)
- **Backend:** FastAPI + Python
- **AI Engine:** Google Gemini via LangChain (`gemini-2.5-flash`)
- **Database:** SQLite (SQL)

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- A Google Gemini API Key

### 2. Backend Setup
Clone the repository and set up the Python environment:

```bash
git clone https://github.com/Sortedsinghal/ai_maintenance_system.git
cd ai_maintenance_system

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your API Key
export GEMINI_API_KEY="your-api-key-here"
# Alternatively, create a .env file and add: GEMINI_API_KEY=your-api-key-here
```

### 3. Frontend Setup
In a new terminal, build the React frontend:

```bash
cd ai_maintenance_system/frontend
npm install
npm run build
```

### 4. Run the Application
The FastAPI server will serve both the backend API endpoints and the built React frontend.

```bash
cd ai_maintenance_system
source venv/bin/activate
python -m src.api.server
```

Open **http://localhost:8000** in your browser.

---

## 🧪 Sample Inputs and Outputs

The system processes raw, unstructured text and returns a structured, evaluated JSON log.

**Sample Input 1:**
```text
"The main conveyor belt in sector 4 is making a loud grinding noise and there's a strong smell of burning rubber."
```

**Output 1:**
```json
{
  "id": 1,
  "issue_category": "Mechanical",
  "priority": "High",
  "original_complaint": "The main conveyor belt in sector 4 is making a loud grinding noise and there's a strong smell of burning rubber."
}
```

**Sample Input 2:**
```text
"Power outlet in the break room is not working. I tried plugging the microwave in but it doesn't turn on."
```

**Output 2:**
```json
{
  "id": 2,
  "issue_category": "Electrical",
  "priority": "Low",
  "original_complaint": "Power outlet in the break room is not working. I tried plugging the microwave in but it doesn't turn on."
}
```

---

## 📂 Project Structure

- `/src/module_a/llm_processor.py` — The core AI agent that interacts with Gemini.
- `/src/module_a/service.py` — The orchestration layer connecting the LLM to the database.
- `/src/db/` — SQLite database initialization and schemas.
- `/src/api/server.py` — The FastAPI REST endpoints.
- `/frontend/` — The React dashboard application.
