import React, { Component } from 'react';
import InputCustomizado from './componentes/InputCustomizado';
import { addLivro, getLivros, deleteLivro } from './persistence';
import PubSub from 'pubsub-js';
import TratadorErros from  './TratadorErros';

class FormularioLivro extends Component {

    constructor() {
        super();
        this.stateLimpo = {
            nome: ''
        };
        this.state = Object.assign({}, this.stateLimpo);
        this.enviaForm = this.enviaForm.bind(this);
        this.setNome = this.setNome.bind(this);
        // this.setEmail = this.setEmail.bind(this);
        // this.setSenha = this.setSenha.bind(this);
    }

    enviaForm(evento){
        evento.preventDefault();
        const { nome } = this.state;
        const livro = { nome };
        PubSub.publish("limpa-erros",{});
        try {
            const novaLista = addLivro(livro);
            PubSub.publish('atualiza-lista-livros', novaLista);
            this.setState(this.stateLimpo);
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
                    <div className="pure-control-group">
                        <label></label>
                        <button type="submit" className="pure-button pure-button-primary">Gravar</button>
                    </div>
                </form>

            </div>

        );
    }
}

class TabelaLivros extends Component {

    render() {
        return(
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.lista.map((livro) => {
                                return (
                                    <tr key={livro.id}>
                                        <td>{livro.nome}</td>
                                        <td><button onClick={() => this.props.onDeletarLivro(livro.id)}>X</button></td>
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

export default class LivroBox extends Component {

    constructor() {
        super();
        this.state = {
            lista: []
        };
        this.deletarLivro = this.deletarLivro.bind(this);
    }

    componentDidMount(){
        const livros = getLivros();
        if (!livros) {
            console.error('Erro ao pegar livros');
            return;
        }
        this.setState({
            lista: livros
        })

        PubSub.subscribe('atualiza-lista-livros', (topico,novaLista) => {
            this.setState({ lista: novaLista });
        });
    }

    deletarLivro(livroId) {
        try {
            const novaLista = deleteLivro(livroId);
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
                    <h1>Cadastro de livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro />
                    <TabelaLivros lista={this.state.lista} onDeletarLivro={this.deletarLivro}/>
                </div>

            </div>
        );
    }
}

