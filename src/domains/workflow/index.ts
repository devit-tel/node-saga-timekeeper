import { workflowDefinitionStore } from '../../store';
import { NotFound } from '../../errors';
import { Workflow } from '../../workflow';

export const startWorkflow = async (
  workflowName: string,
  workflowRef: number,
  input: any,
): Promise<Workflow> => {
  const workflowDefinition = await workflowDefinitionStore.getValue(
    `${workflowName}.${workflowRef}`,
  );
  if (!workflowDefinition) {
    throw new NotFound('Workflow not found', 'WORKFLOW_NOT_FOUND');
  }
  return new Workflow(workflowDefinition, input, {});
};
