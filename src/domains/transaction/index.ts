import * as uuid from 'uuid/v4';
import { workflowDefinitionStore, transactionInstanceStore } from '../../store';
import { NotFound } from '../../errors';
import { IWorkflowDefinition } from '../../workflowDefinition';
import { ITransaction } from '../../transaction';

export const startTransaction = async (
  workflowName: string,
  workflowRef: string,
  input: any,
  transactionId?: string,
): Promise<ITransaction> => {
  const workflowDefinition: IWorkflowDefinition = await workflowDefinitionStore.get(
    workflowName,
    workflowRef,
  );
  if (!workflowDefinition) {
    throw new NotFound('Workflow not found', 'WORKFLOW_NOT_FOUND');
  }
  return transactionInstanceStore.create(
    transactionId || uuid(),
    workflowDefinition,
    input,
  );
};
