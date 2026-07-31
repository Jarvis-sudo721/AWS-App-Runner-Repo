# EduMentor AI

An AI-powered academic assistance platform for students, featuring an interactive chat assistant, quiz generator, and study planner — all running as a single-page application.

## Features

- **AI Academic Chat** — Ask questions about course materials and receive grounded, source-attributed responses with suggested prompts.
- **Quiz Generator** — Select a subject and generate a 5-question multiple-choice quiz with instant scoring feedback.
- **Study Planner** — Create personalized 7-day study schedules with priority levels, progress tracking, and motivational prompts.
- **Dashboard** — Overview of completed quizzes, study hours, upcoming deadlines, and AI questions asked.
- **Responsive Design** — Works on desktop and mobile with collapsible sidebar and accessible navigation.

## Technologies

- **Frontend:** Pure HTML5, CSS3, vanilla JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Deployment:** Docker, AWS App Runner
- **Fonts:** Lexend, Inter, JetBrains Mono (via Google Fonts)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd edumentor-ai
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Running Locally

Start the development server:
```bash
npm start
```

Open your browser and navigate to `http://localhost:3000`.

## Deploying to AWS App Runner

### Prerequisites
- AWS CLI configured with appropriate credentials
- An AWS account with App Runner access

### Deployment Steps

1. Build the Docker image locally:
   ```bash
   docker build -t edumentor-ai .
   ```

2. Push to Amazon ECR or use a GitHub repository connected to AWS App Runner.

3. In the AWS Console, create a new **App Runner** service:
   - Connect your source (GitHub repository or ECR image)
   - Set the runtime to **Docker**
   - Configure the service to use port `3000`
   - Set the environment variable `PORT=3000`

4. Deploy and access your application via the provided App Runner URL.

## Project Structure

```
project/
├── index.html
├── package.json
├── package-lock.json
├── server.js
├── Dockerfile
├── .dockerignore
├── .gitignore
├── README.md
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── assets/
    ├── images/
    ├── icons/
    └── fonts/
```