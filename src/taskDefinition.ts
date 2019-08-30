import * as R from 'ramda';
import { isValidName } from './utils/common';

interface IDocIO {
  [key: string]: {
    type: 'string' | 'number' | 'mixed';
    description: string;
    required?: boolean;
  };
}

export interface ITaskDefinitionData {
  name: string;
  description?: string;
  ackTimeout?: number;
  timeout?: number;
  retry?: {
    limit: number;
    delay: number;
  };
  document?: {
    inputs?: IDocIO[];
    output?: IDocIO[];
  };
}

export interface ITaskDefinition extends ITaskDefinitionData {
  toObject(): any;
  toJSON(): string;
}

const taskValidation = (taskDefinition: ITaskDefinitionData): string[] => {
  const errors = [];
  if (!isValidName(taskDefinition.name))
    errors.push('taskDefinition.name is invalid');

  return errors;
};

export class TaskDefinition implements ITaskDefinition {
  name: string;
  description: string = 'No description';
  partitionsCount: number = 10;
  responseTimeoutSecond: number = 5;
  timeoutSecond: number = 30;

  constructor(taskDefinition: ITaskDefinitionData) {
    const taskValidationErrors = taskValidation(taskDefinition);

    if (taskValidationErrors.length)
      throw new Error(taskValidationErrors.join('\n'));

    Object.assign(this, taskDefinition);
  }

  toObject = (): any => {
    return R.pick(
      [
        'name',
        'description',
        'partitionsCount',
        'responseTimeoutSecond',
        'timeoutSecond',
        'timeoutStrategy',
        'failureStrategy',
        'retry',
        'recoveryWorkflow',
        'inputParameters',
      ],
      this,
    );
  };

  toJSON = (): string => {
    return JSON.stringify(this.toObject());
  };
}
