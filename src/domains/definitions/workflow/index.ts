import { WorkflowDefinition } from '../../../workflowDefinition';
import { workflowDefinitionStore } from '../../../store';

export const createWorkflowDefinition = async (
  workflowDefinition: WorkflowDefinition,
): Promise<any> => {
  await workflowDefinitionStore.setValue(
    `${workflowDefinition.name}.${workflowDefinition.rev}`,
    new WorkflowDefinition(workflowDefinition).toJSON(),
  );
};

export const getWorkflowDefinition = (
  workflowName: string,
  workflowRev: string,
): Promise<WorkflowDefinition> => {
  return workflowDefinitionStore.getValue(`${workflowName}.${workflowRev}`);
};

export const listWorkflowDefinition = (
  limit: number = Number.MAX_SAFE_INTEGER,
  offset: number = 0,
): Promise<WorkflowDefinition[]> => {
  return workflowDefinitionStore.list(limit, offset);
};
