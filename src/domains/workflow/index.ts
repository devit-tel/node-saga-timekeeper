import {
  workflowDefinitionStore,
  workflowInstanceStore,
  taskInstanceStore,
} from '../../store';
import { NotFound } from '../../errors';
import { IWorkflow } from '../../workflow';
import { IWorkflowDefinition } from '../../workflowDefinition';

export const startWorkflow = async (
  workflowName: string,
  workflowRef: string,
  input: any,
  childOf?: string,
): Promise<IWorkflow> => {
  const workflowDefinition: IWorkflowDefinition = await workflowDefinitionStore.get(
    workflowName,
    workflowRef,
  );
  if (!workflowDefinition) {
    throw new NotFound('Workflow not found', 'WORKFLOW_NOT_FOUND');
  }

  const workflow = await workflowInstanceStore.create(
    workflowDefinition,
    input,
    childOf,
  );
  await taskInstanceStore.create(
    workflow,
    workflowDefinition.tasks[0],
    {},
    true,
  );
  return workflow;
};

export const listRunningWorkflows = async (): Promise<IWorkflow[]> => {
  return [];
};
