import { workflowDefinitionStore } from '../../store';
import { NotFound } from '../../errors';

export const startWorkflow = async (
  workflowName: string,
  workflowRef: number,
): Promise<string> => {
  const workflowData = await workflowDefinitionStore.getValue(
    `${workflowName}.${workflowRef}`,
  );
  if (!workflowData) {
    throw new NotFound('Workflow not found', 'WORKFLOW_NOT_FOUND');
  }
  return '';
};
