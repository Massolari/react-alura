import PubSub from 'pubsub-js';

export default class TratadorErros {
	publicaErros(erros){
        erros.forEach(e => PubSub.publish("erro-validacao", e));
	}
}