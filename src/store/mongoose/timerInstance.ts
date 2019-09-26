import * as mongoose from 'mongoose';
import { MongooseStore } from '.';
import { ITimerInstanceStore } from '..';
import { ITimerUpdate, ITimerData } from '../../timer';

const taskSchema = new mongoose.Schema({
  ackTimeout: Boolean,
  timeout: Boolean,
  retry: Boolean,
  task: {
    taskName: String,
    taskReferenceName: String,
    taskId: {
      type: String,
      index: true,
    },
    workflowId: {
      type: String,
    },
    transactionId: {
      index: true,
      type: String,
    },
    status: {
      type: String,
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
      },
      rev: {
        type: String,
      },
    },
    decisions: mongoose.Schema.Types.Mixed,
    defaultDecision: [mongoose.Schema.Types.Mixed],
  },
});

export class TimerInstanceMongooseStore extends MongooseStore
  implements ITimerInstanceStore {
  constructor(uri: string, mongoOption: mongoose.ConnectionOptions) {
    super(uri, mongoOption, 'timer-instance', taskSchema);
  }

  create = async (timerData: ITimerData): Promise<ITimerData> => {
    console.log(timerData);
    return (await this.model.create(timerData)).toObject();
  };

  get = async (taskId: string): Promise<ITimerData> => {
    const taskData = await this.model
      .findOne({ 'task.taskId': taskId })
      .lean({})
      .exec();

    if (taskData) return taskData;
    return null;
  };

  getAll = (partitionId: string): Promise<ITimerData[]> => {
    return this.model
      .find({ partitionId })
      .lean({})
      .exec();
  };

  delete(taskId: string): Promise<any> {
    return this.model
      .deleteOne({ 'task.taskId': taskId })
      .lean({})
      .exec();
  }

  update(timerUpdate: ITimerUpdate): Promise<any> {
    return this.model
      .findOneAndUpdate(
        { 'task.taskId': timerUpdate.taskId },
        { ackTimeout: timerUpdate.ackTimeout, timeout: timerUpdate.timeout },
      )
      .lean({})
      .exec();
  }
}
