/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
 
import Agent, {
  type StepHandler,
  type StepInput,
  type StepResult,
  type TaskInput,
} from 'agent-protocol'

async function taskHandler(taskInput: TaskInput | null): Promise<StepHandler> {
  console.log(`task: ${taskInput}`)

  async function stepHandler(stepInput: StepInput | null): Promise<StepResult> {
    console.log(`step: ${stepInput}`)
    return {
      output: stepInput,
    }
  }

  return stepHandler
}

Agent.handleTask(taskHandler, {
  port: 3333,
}).start()

 
 