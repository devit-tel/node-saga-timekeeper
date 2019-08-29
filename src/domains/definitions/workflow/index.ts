import {
  WorkflowDefinition,
  IWorkflowDefinitionData,
} from '../../../workflowDefinition';
import { workflowDefinitionStore } from '../../../store';

export const createWorkflowDefinition = (
  workflowDefinition: WorkflowDefinition,
): Promise<any> => {
  return workflowDefinitionStore.create(workflowDefinition);
};

export const getWorkflowDefinition = async (
  workflowName: string,
  workflowRev: string,
): Promise<IWorkflowDefinitionData> => {
  return workflowDefinitionStore.get(workflowName, workflowRev);
};

export const listWorkflowDefinition = async (): Promise<any[]> => {
  return workflowDefinitionStore.list();
};
