import { workflowDefinitionStore, workflowInstanceStore } from '../../store';
import { NotFound } from '../../errors';
import { Workflow, IWorkflow } from '../../workflow';

export const startWorkflow = async (
  workflowName: string,
  workflowRef: string,
  input: any,
): Promise<IWorkflow> => {
  const workflowDefinition = await workflowDefinitionStore.getWorkflowDefinition(
    workflowName,
    workflowRef,
  );
  if (!workflowDefinition) {
    throw new NotFound('Workflow not found', 'WORKFLOW_NOT_FOUND');
  }
  const workflow = new Workflow(workflowDefinition, input, {});
  await workflowInstanceStore.setValue(workflow.workflowId, workflow);
  await workflow.startNextTask();
  return workflow.toObject();
};

export const listRunningWorkflows = async (): Promise<IWorkflow[]> => {
  return (await workflowInstanceStore.list()).map((workflow: Workflow) =>
    workflow.toObject(),
  );
};
