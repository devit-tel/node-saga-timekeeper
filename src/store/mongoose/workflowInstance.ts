import * as mongoose from 'mongoose';
import * as mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import { MongooseStore } from '../mongoose';
import { IWorkflow, Workflow } from '../../workflow';
import { IWorkflowInstanceStore } from '../../store';
import { WorkflowNextStates } from '../../constants/workflow';

const workflowSchema = new mongoose.Schema(
  {
    workflowName: {
      type: String,
      index: true,
    },
    workflowRev: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      index: true,
    },
    retryCount: Number,
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    createTime: Date,
    startTime: Date,
    endTime: Date,
    childOf: {
      type: String,
      index: true,
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  },
);

workflowSchema
  .virtual('workflowId')
  .get(function() {
    return this._id;
  })
  .set(function() {
    return this._id;
  });

workflowSchema.plugin(mongooseLeanVirtuals);

export class WorkflowInstanceMongoseStore extends MongooseStore
  implements IWorkflowInstanceStore {
  constructor(uri: string, mongoOption: mongoose.ConnectionOptions) {
    super(uri, mongoOption, 'workflow-instance', workflowSchema);
  }

  get = async (workflowId: string): Promise<Workflow> => {
    const workflowData: IWorkflow = await this.model
      .findOne({ workflowId })
      .lean({ virtuals: true })
      .exec();

    if (workflowData) return new Workflow(workflowData);
    return null;
  };

  create = async (workflowData: IWorkflow): Promise<Workflow> => {
    await this.model.create(workflowData);
    return new Workflow(workflowData);
  };

  update = async (workflow: IWorkflow): Promise<Workflow> => {
    const workflowUpdated = await this.model
      .update(
        {
          _id: workflow.workflowId,
          status: WorkflowNextStates[workflow.status],
        },
        {
          status: workflow.status,
          retryCount: workflow.retryCount,
          input: workflow.input,
          output: workflow.output,
          startTime: workflow.startTime,
          endTime: workflow.endTime,
        },
      )
      .lean({ virtuals: true })
      .exec();

    if (workflowUpdated) return new Workflow(workflowUpdated);
    return null;
  };

  delete = (workflowId: string): Promise<any> =>
    this.model
      .deleteOne({ _id: workflowId })
      .lean({ virtuals: true })
      .exec();
}
