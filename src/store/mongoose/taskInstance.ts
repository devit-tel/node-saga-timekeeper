import * as mongoose from 'mongoose';
import * as mongooseLeanVirtuals from 'mongoose-lean-virtuals';
import { MongooseStore } from '../mongoose';
import { ITaskInstanceStore } from '../../store';
import { ITask, Task } from '../../task';
import { ITaskUpdate } from '../../state';
import { TaskPrevStates } from '../../constants/task';

const taskSchema = new mongoose.Schema(
  {
    taskName: String,
    taskReferenceName: String,
    workflowId: {
      type: String,
      index: true,
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
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  },
);

taskSchema
  .virtual('taskId')
  .get(function() {
    return this._id;
  })
  .set(function() {
    return this._id;
  });

taskSchema.plugin(mongooseLeanVirtuals);

export class TaskInstanceMongooseStore extends MongooseStore
  implements ITaskInstanceStore {
  constructor(uri: string, mongoOption: mongoose.ConnectionOptions) {
    super(uri, mongoOption, 'task-instance', taskSchema);
  }

  create = async (taskData: ITask): Promise<Task> => {
    const task = (await this.model.create(taskData)).toObject();
    return new Task({
      ...taskData,
      ...task,
    });
  };

  update = async (taskUpdate: ITaskUpdate): Promise<Task> => {
    const task = await this.model
      .findOneAndUpdate(
        {
          _id: taskUpdate.taskId,
          status: TaskPrevStates[taskUpdate.status],
        },
        {
          output: taskUpdate.output,
          status: taskUpdate.status,
          $push: {
            logs: taskUpdate.logs,
          },
        },
      )
      .lean({ virtuals: true })
      .exec();
    if (task) return new Task(task);
    return null;
  };

  get = async (taskId: string): Promise<Task> => {
    const taskData = await this.model
      .findOne({ _id: taskId })
      .lean({ virtuals: true })
      .exec();

    if (taskData) return new Task(taskData);
    return null;
  };

  getAll = async (workflowId: string): Promise<Task[]> => {
    const tasksData = await this.model
      .find({ workflowId })
      .lean({ virtuals: true })
      .exec();

    return tasksData.map((taskData: ITask) => new Task(taskData));
  };

  delete(taskId: string): Promise<any> {
    return this.model
      .deleteOne({ _id: taskId })
      .lean({ virtuals: true })
      .exec();
  }

  deleteAll(workflowId: string): Promise<any> {
    return this.model
      .deleteMany({ workflowId })
      .lean({ virtuals: true })
      .exec();
  }
}
