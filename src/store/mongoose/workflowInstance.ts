import * as mongoose from 'mongoose';
import * as mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import { MongooseStore } from '../mongoose';
import { IWorkflow, Workflow } from '../../workflow';
import { IWorkflowInstanceStore } from '../../store';
import { WorkflowNextStates, WorkflowStates } from '../../constants/workflow';
import { IWorkflowUpdate } from '../../state';

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
      .findOne({ _id: workflowId })
      .lean({ virtuals: true })
      .exec();

    if (workflowData) return new Workflow(workflowData);
    return null;
  };

  create = async (workflowData: IWorkflow): Promise<Workflow> => {
    const workflow = (await this.model.create(workflowData)).toObject();
    return new Workflow({ ...workflowData, ...workflow });
  };

  update = async (workflowUpdate: IWorkflowUpdate): Promise<Workflow> => {
    if (
      [
        WorkflowStates.Failed,
        WorkflowStates.Completed,
        WorkflowStates.Timeout,
      ].includes(workflowUpdate.status)
    ) {
      // Final state just remove them from cache state
      const workflowDeleted = await this.model
        .findOneAndDelete({
          _id: workflowUpdate.workflowId,
          status: WorkflowNextStates[workflowUpdate.status],
        })
        .lean({ virtuals: true })
        .exec();

      if (workflowDeleted) return new Workflow(workflowDeleted);
      return null;
    } else {
      const workflowUpdated = await this.model
        .update(
          {
            _id: workflowUpdate.workflowId,
            status: WorkflowNextStates[workflowUpdate.status],
          },
          {
            status: workflowUpdate.status,
            output: workflowUpdate.output,
          },
        )
        .lean({ virtuals: true })
        .exec();

      if (workflowUpdated) return new Workflow(workflowUpdated);
      return null;
    }
  };

  delete = (workflowId: string): Promise<any> =>
    this.model
      .deleteOne({ _id: workflowId })
      .lean({ virtuals: true })
      .exec();
}
