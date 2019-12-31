import * as mongoose from 'mongoose';
import * as mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import { MongooseStore } from '.';
import { ITimerInstanceStore, TimerInstance } from '../../store';

const timerSchama = new mongoose.Schema({
  type: String,
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

timerSchama
  .virtual('timerId')
  .get(function() {
    return this._id;
  })
  .set(function() {
    return this._id;
  });

timerSchama.plugin(mongooseLeanVirtuals);

export class TimerInstanceMongooseStore extends MongooseStore
  implements ITimerInstanceStore {
  constructor(uri: string, mongoOption: mongoose.ConnectionOptions) {
    super(uri, mongoOption, 'timer-instance', timerSchama);
  }

  create = async (timerData: TimerInstance): Promise<TimerInstance> => {
    const timer = await this.model.create(timerData);
    return timer;
  };

  get = async (timerId: string): Promise<TimerInstance> => {
    return this.model
      .findOne({
        _id: timerId,
      })
      .lean({ virtuals: true })
      .exec();
  };

  delete(timerId: string): Promise<any> {
    return this.model
      .deleteOne({
        _id: timerId,
      })
      .lean({ virtuals: true })
      .exec();
  }
}
