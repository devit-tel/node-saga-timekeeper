import { Timer } from '@melonade/melonade-declaration';
import mongoose from 'mongoose';
import { MongooseStore } from '.';
import { ITimerInstanceStore, ITimerUpdate } from '../../store';

const timerSchama = new mongoose.Schema({
  ackTimeout: Number,
  timeout: Number,
  delay: Number,
  task: {
    taskId: {
      type: String,
      unique: true,
      index: true,
    },
    taskName: String,
    taskReferenceName: String,
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
    createTime: Number, // time that push into Kafka
    startTime: Number, // time that worker ack
    endTime: Number, // time that task finish/failed/cancel
    logs: [String],
    type: String,
    parallelTasks: mongoose.Schema.Types.Mixed,
    workflow: {
      name: String,
      rev: String,
    },
    decisions: mongoose.Schema.Types.Mixed,
    defaultDecision: [mongoose.Schema.Types.Mixed],
    retryDelay: Number,
    ackTimeout: Number,
    timeout: Number,
  },
});

export class TimerInstanceMongooseStore extends MongooseStore
  implements ITimerInstanceStore {
  constructor(uri: string, mongoOption: mongoose.ConnectionOptions) {
    super(uri, mongoOption, 'timer-instance', timerSchama);
  }

  create = async (timerData: Timer.ITimerData): Promise<Timer.ITimerData> => {
    const timer = await this.model.create(timerData);
    return timer;
  };

  get = async (timerId: string): Promise<Timer.ITimerData> => {
    return this.model
      .findOne({
        _id: timerId,
      })
      .lean()
      .exec();
  };

  delete(timerId: string): Promise<any> {
    return this.model
      .deleteOne({
        _id: timerId,
      })
      .lean()
      .exec();
  }

  // Mongoose ack undefined as not set
  update = async (timerUpdate: ITimerUpdate): Promise<Timer.ITimerData> => {
    const timerInstance = await this.model.findOneAndUpdate(
      {
        _id: timerUpdate.timerId,
      },
      {
        ackTimeout: timerUpdate.ackTimeout ? 0 : undefined,
        timeout: timerUpdate.timeout ? 0 : undefined,
        delay: timerUpdate.delay ? 0 : undefined,
      },
    );

    if (timerInstance) {
      if (
        !timerInstance.ackTimeout &&
        !timerInstance.timeout &&
        !timerInstance.delay
      ) {
        await this.delete(timerUpdate.timerId);
      }
    }

    return timerInstance;
  };
}
