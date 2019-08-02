import * as dotenv from 'dotenv';
import { DispatcherType } from './dispatcher';

dotenv.config();

const pickAndReplaceFromENV = (template: string) =>
  Object.keys(process.env).reduce((result: any, key: string) => {
    if (new RegExp(template).test(key)) {
      return {
        ...result,
        [key.replace(new RegExp(template), '')]: process.env[key],
      };
    }
    return result;
  }, {});

export const dispatcher = {
  type: DispatcherType.Kafka,
  kafkaOption: {
    overideProducerConf: pickAndReplaceFromENV('^dispatcher\\.kafka\\.conf'),
    overideProducerTopicConf: pickAndReplaceFromENV(
      '^dispatcher\\.kafka\\.topicconf',
    ),
  },
};
