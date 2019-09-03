import * as uuid from 'uuid/v4';
import { workflowDefinitionStore, workflowInstanceStore } from '../../store';
import { NotFound } from '../../errors';
import { IWorkflow } from '../../workflow';
import { IWorkflowDefinition } from '../../workflowDefinition';

export const startWorkflow = async (
  workflowName: string,
  workflowRef: string,
  input: any,
  childOf?: string,
  transactionId?: string,
): Promise<IWorkflow> => {
  const workflowDefinition: IWorkflowDefinition = await workflowDefinitionStore.get(
    workflowName,
    workflowRef,
  );
  if (!workflowDefinition) {
    throw new NotFound('Workflow not found', 'WORKFLOW_NOT_FOUND');
  }
  return workflowInstanceStore.create(
    transactionId || uuid(),
    workflowDefinition,
    input,
    childOf,
  );
};

export const listRunningWorkflows = async (): Promise<IWorkflow[]> => {
  return [];
};
