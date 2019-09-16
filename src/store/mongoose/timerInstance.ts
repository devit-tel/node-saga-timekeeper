import * as mongoose from 'mongoose';
import { MongooseStore } from '.';
import { ITimerInstanceStore } from '..';
import { ITimerUpdate, ITimerData } from '../../timer';

const taskSchema = new mongoose.Schema(
  {
    ackTimeout: Boolean,
    timeout: Boolean,
    task: {
      taskName: String,
      taskReferenceName: String,
      taskId: {
        type: String,
        index: true,
      },
      workflowId: {
        type: String,
        index: true,
      },
      transactionId: {
        index: true,
        type: String,
      },
      status: {
        type: String,
        index: true,
      },
      retries: Number,
      isRetried: Boolean,
      input: mongoose.Schema.Types.Mixed,
      output: mongoose.Schema.Types.Mixed,
      createTime: Date, // time that push into Kafka
      startTime: Date, // time that worker ack
      endTime: Date, // time that task finish/failed/cancel
      logs: [String],
      type: String,
      parallelTasks: mongoose.Schema.Types.Mixed,
      workflow: {
        name: {
          type: String,
          index: true,
        },
        rev: {
          type: String,
          index: true,
        },
      },
      decisions: mongoose.Schema.Types.Mixed,
      defaultDecision: [mongoose.Schema.Types.Mixed],
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

export class TimerInstanceMongooseStore extends MongooseStore
  implements ITimerInstanceStore {
  constructor(uri: string, mongoOption: mongoose.ConnectionOptions) {
    super(uri, mongoOption, 'timer-instance', taskSchema);
  }

  create = async (taskData: ITimerData): Promise<ITimerData> => {
    return (await this.model.create(taskData)).toObject();
  };

  get = async (taskId: string): Promise<ITimerData> => {
    const taskData = await this.model
      .findOne({ _id: taskId })
      .lean({ virtuals: true })
      .exec();

    if (taskData) return taskData;
    return null;
  };

  getAll = (partitionId: string): Promise<ITimerData[]> => {
    return this.model
      .find({ partitionId })
      .lean({ virtuals: true })
      .exec();
  };

  delete(taskId: string): Promise<any> {
    return this.model
      .deleteOne({ taskId })
      .lean({ virtuals: true })
      .exec();
  }

  update(timerUpdate: ITimerUpdate): Promise<any> {
    return this.model
      .findOneAndUpdate({ taskId: timerUpdate.taskId }, timerUpdate)
      .lean({ virtuals: true })
      .exec();
  }
}
