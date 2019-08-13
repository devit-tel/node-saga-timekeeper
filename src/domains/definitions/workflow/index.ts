import * as R from 'ramda';
import {
  WorkflowDefinition,
  IWorkflowDefinitionData,
} from '../../../workflowDefinition';
import { workflowDefinitionStore } from '../../../store';

export const createWorkflowDefinition = async (
  workflowDefinition: WorkflowDefinition,
): Promise<any> => {
  await workflowDefinitionStore.setWorkflowDefinition(
    workflowDefinition.name,
    workflowDefinition.rev,
    new WorkflowDefinition(workflowDefinition).toJSON(),
  );
};

export const getWorkflowDefinition = async (
  workflowName: string,
  workflowRev: string,
): Promise<IWorkflowDefinitionData> => {
  return (await workflowDefinitionStore.getWorkflowDefinition(
    workflowName,
    workflowRev,
  )).toObject();
};

export const listWorkflowDefinition = async (
  limit: number = Number.MAX_SAFE_INTEGER,
  offset: number = 0,
): Promise<{ [rev: string]: IWorkflowDefinitionData }[]> => {
  return (await workflowDefinitionStore.list(limit, offset)).map(
    (workflow: { [rev: string]: WorkflowDefinition }) =>
      R.map((rev: WorkflowDefinition) => rev.toObject(), workflow),
  );
};
