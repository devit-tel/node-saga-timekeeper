import * as R from 'ramda';
import { WorkflowStates } from './constants/workflow';

export interface IWorkflow {
  transactionId: string;
  workflowName: string;
  workflowRev: string;
  workflowId: string;
  status: WorkflowStates;
  retries: number;
  input: {
    [key: string]: any;
  };
  output: any;
  createTime: number;
  startTime: number;
  endTime: number;
  childOf?: string;
}

export class Workflow implements IWorkflow {
  transactionId: string;
  workflowName: string;
  workflowRev: string;
  workflowId: string;
  status: WorkflowStates;
  retries: number;
  input: {
    [key: string]: any;
  };
  output: any;
  createTime: number;
  startTime: number;
  endTime: number;
  childOf?: string;

  constructor(workflow: IWorkflow) {
    Object.assign(this, workflow);
  }

  toObject = (): any => {
    return R.pick(
      [
        'transactionId',
        'workflowName',
        'workflowRev',
        'workflowId',
        'status',
        'retryCount',
        'input',
        'output',
        'createTime',
        'startTime',
        'endTime',
        'taskRefs',
        'childOf',
      ],
      this,
    );
  };

  toJSON = (): string => {
    return JSON.stringify(this.toObject());
  };
}
