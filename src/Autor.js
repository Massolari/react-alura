import React, { Component } from 'react';
import InputCustomizado from './componentes/InputCustomizado';
import { addAutor, getAutores, deleteAutor } from './persistence';
import PubSub from 'pubsub-js';
import TratadorErros from  './TratadorErros';

class FormularioAutor extends Component {

    constructor() {
        super();
        this.state = { nome:'',email:'',senha:'' };
        this.enviaForm = this.enviaForm.bind(this);
        this.setNome = this.setNome.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setSenha = this.setSenha.bind(this);
    }

    enviaForm(evento){
        evento.preventDefault();
        const { nome, email, senha } = this.state;
        const autor = { nome, email, senha };
        PubSub.publish("limpa-erros",{});
        try {
            const novaLista = addAutor(autor);
            PubSub.publish('atualiza-lista-autores', novaLista);
            this.setState({ nome: '', email: '', senha: '' });
        } catch (e) {
            const erros = JSON.parse(e.message);
            new TratadorErros().publicaErros(erros);
        }
    }

    setNome(evento){
        this.setState({nome:evento.target.value});
    }

    setEmail(evento){
        this.setState({email:evento.target.value});
    }

    setSenha(evento){
        this.setState({senha:evento.target.value});
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="nome" type="text" name="nome" value={this.state.nome} onChange={this.setNome} label="Nome"/>
                    <InputCustomizado id="email" type="email" name="email" value={this.state.email} onChange={this.setEmail} label="Email"/>
                    <InputCustomizado id="senha" type="password" name="senha" value={this.state.senha} onChange={this.setSenha} label="Senha"/>
                    <div className="pure-control-group">
                        <label></label>
                        <button type="submit" className="pure-button pure-button-primary">Gravar</button>
                    </div>
                </form>

            </div>

        );
    }
}

class TabelaAutores extends Component {

    render() {
        return(
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>email</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.lista.map((autor) => {
                                return (
                                    <tr key={autor.id}>
                                        <td>{autor.nome}</td>
                                        <td>{autor.email}</td>
                                        <td><button onClick={() => this.props.onDeletarAutor(autor.id)}>X</button></td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class AutorBox extends Component {

    constructor() {
        super();
        this.state = {
            lista: []
        };
        this.deletarAutor = this.deletarAutor.bind(this);
    }

    componentDidMount(){
        const autores = getAutores();
        if (!autores) {
            console.error('Erro ao pegar autores');
            return;
        }
        this.setState({
            lista: autores
        })

        PubSub.subscribe('atualiza-lista-autores', (topico,novaLista) => {
            this.setState({lista:novaLista});
        });
    }

    deletarAutor(autorId) {
        try {
            const novaLista = deleteAutor(autorId);
            this.setState({
                lista: novaLista
            });
        } catch(e) {
            console.error(e);
        }
    }

    render(){
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de autores</h1>
                </div>
                <div className="content" id="content">
                    <FormularioAutor />
                    <TabelaAutores lista={this.state.lista} onDeletarAutor={this.deletarAutor} />
                </div>

            </div>
        );
    }
}