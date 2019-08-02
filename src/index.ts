import * as config from './config';
import * as dispatcher from './dispatcher';
import { KafkaDispatcher } from './dispatcher/kafka';

switch (config.dispatcher.type) {
  case dispatcher.DispatcherType.Kafka:
    dispatcher.dispatcher.setClient(
      new KafkaDispatcher(
        config.dispatcher.kafkaOption.overideProducerConf,
        config.dispatcher.kafkaOption.overideProducerTopicConf,
      ),
    );
    break;

  default:
    throw new Error(`Dispatch: ${config.dispatcher.type} is invalid`);
}
