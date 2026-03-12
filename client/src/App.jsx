import { useState } from "react"
import "./index.css"

function App() {

  const [role, setRole] = useState("frontend")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [score, setScore] = useState(null)

  const [screen, setScreen] = useState("start")
  // start | question | result

  const startInterview = async () => {

    const res = await fetch(`http://localhost:5000/api/question?role=${role}`)
    const data = await res.json()

    setQuestion(data.question)
    setScreen("question")
  }

  const submitAnswer = async () => {

    const res = await fetch("http://localhost:5000/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question,
        answer
      })
    })

    const data = await res.json()

    setScore(data.score)
    setFeedback(data.feedback)
    setScreen("result")
  }

  const restart = () => {
    setAnswer("")
    setQuestion("")
    setFeedback("")
    setScore(null)
    setScreen("start")
  }

  return (
    <div className="container">

      <h1>MockMate Pro</h1>
      <p className="subtitle">AI Mock Interview Practice</p>

      <div className="card">

        {/* START SCREEN */}

        {screen === "start" && (
          <>
            <label>Select Domain</label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="ai">AI</option>
            </select>

            <button onClick={startInterview}>
              Start Interview
            </button>
          </>
        )}

        {/* QUESTION SCREEN */}

        {screen === "question" && (
          <>
            <div className="question">
              <h3>Interview Question</h3>
              <p>{question}</p>
            </div>

            <textarea
              placeholder="Write your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />

            <button className="submit" onClick={submitAnswer}>
              Submit Answer
            </button>
          </>
        )}

        {/* RESULT SCREEN */}

        {screen === "result" && (
          <div className="result">
            <h3>Your Score: {score}/10</h3>
            <p>{feedback}</p>

            <button onClick={restart}>
              Try Another Question
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default App